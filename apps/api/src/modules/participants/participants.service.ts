import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { normalizeE164AR } from '../../shared/utils/phone';

@Injectable()
export class ParticipantsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(createParticipantDto: CreateParticipantDto) {
    // Basic limit check - assumes checking business plan limits is required here.
    // We get the business plan.
    const { data: business, error: bizError } = await this.supabase.client
      .from('businesses')
      .select('plan')
      .eq('id', createParticipantDto.business_id)
      .single();

    if (bizError || !business) {
      throw new BadRequestException('Business not found');
    }

    if (business.plan === 'free') {
      const { count, error: countError } = await this.supabase.client
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', createParticipantDto.business_id);

      if (countError) throw new Error(countError.message);
      
      if (count && count >= 5) {
        throw new BadRequestException('Free plan limit reached (max 5 participants). Please upgrade.');
      }
    }

    const { data, error } = await this.supabase.client
      .from('participants')
      .insert(createParticipantDto)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already registered for this business');
      }
      throw new Error(error.message);
    }
    
    return data;
  }

  async joinBySlug(slug: string, name: string, email: string, phone?: string) {
    const { data: business, error: bizError } = await this.supabase.client
      .from('businesses')
      .select('id, name, primary_color, logo_url, plan')
      .eq('slug', slug)
      .single();

    if (bizError || !business) throw new BadRequestException('Prode no encontrado');

    if (business.plan === 'free') {
      const { count } = await this.supabase.client
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id);
      if (count && count >= 5) throw new BadRequestException('Límite del plan gratuito alcanzado');
    }

    // Upsert: if email already registered, return existing participant
    const { data: existing } = await this.supabase.client
      .from('participants')
      .select('*')
      .eq('business_id', business.id)
      .eq('email', email)
      .single();

    if (existing) return { participant: existing, business };

    const normalizedPhone = normalizeE164AR(phone) ?? phone ?? ''

    const { data, error } = await this.supabase.client
      .from('participants')
      .insert({ business_id: business.id, name, email, phone: normalizedPhone, accepted_terms: true })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Fire-and-forget: notify admin of new participant
    this.notifications
      .sendPushToAdmin(business.id, '🎉 Nuevo participante', `${name} se unió a tu prode`)
      .catch(() => {})

    return { participant: data, business };
  }

  async update(id: string, data: { name?: string; email?: string; phone?: string }) {
    const { data: updated, error } = await this.supabase.client
      .from('participants')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return updated
  }

  async findAllByBusiness(businessId: string) {
    const { data, error } = await this.supabase.client
      .from('participants')
      .select('*')
      .eq('business_id', businessId);

    if (error) throw new Error(error.message);
    return data;
  }

  async findByAdminUserId(adminUserId: string, search?: string, page = 1, limit = 10) {
    const { data: business, error: bizErr } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single();
    if (bizErr || !business) throw new Error('Business not found');

    // Total matches for this business (denominator for predictions progress)
    const { count: totalMatches } = await this.supabase.client
      .from('matches')
      .select('*', { count: 'exact', head: true });

    let query = this.supabase.client
      .from('participants')
      .select('*, predictions(count)', { count: 'exact' })
      .eq('business_id', business.id)
      .order('total_points', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    const enriched = (data ?? []).map((p: any) => ({
      ...p,
      predictions_count: p.predictions?.[0]?.count ?? 0,
      total_matches: totalMatches ?? 0,
      predictions: undefined,
    }));

    return { data: enriched, total: count ?? 0, page, limit };
  }
}
