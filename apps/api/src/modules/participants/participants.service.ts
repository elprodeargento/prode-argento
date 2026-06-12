import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { normalizeE164AR } from '../../shared/utils/phone';

@Injectable()
export class ParticipantsService {
  private readonly logger = new Logger(ParticipantsService.name);

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
      .insert({ ...createParticipantDto, email: createParticipantDto.email.toLowerCase() })
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

  async lookup(slug: string, email?: string, phone?: string) {
    const { data: business, error: bizError } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single();

    if (bizError || !business) throw new BadRequestException('Prode no encontrado');

    let query = this.supabase.client
      .from('participants')
      .select('*')
      .eq('business_id', business.id);

    if (email) {
      const { data: participant } = await query.eq('email', email.toLowerCase()).maybeSingle();
      if (participant?.is_disabled) throw new ForbiddenException('Tu acceso fue deshabilitado por el administrador del prode.');
      return { found: !!participant, participant: participant ?? undefined };
    } else if (phone) {
      const normalizedPhone = normalizeE164AR(phone) ?? phone;
      const { data } = await query.eq('phone', normalizedPhone).limit(1);
      const participant = data?.[0] ?? null;
      if (participant?.is_disabled) throw new ForbiddenException('Tu acceso fue deshabilitado por el administrador del prode.');
      return { found: !!participant, participant: participant ?? undefined };
    } else {
      throw new BadRequestException('Se requiere email o celular');
    }
  }

  async joinBySlug(slug: string, name: string, email?: string, phone?: string, referrerParticipantId?: string) {
    const normalizedEmail = email ? email.toLowerCase() : undefined;
    this.logger.log(`joinBySlug — slug="${slug}" email="${normalizedEmail}" name="${name}" phone="${phone}"`);

    const { data: business, error: bizError } = await this.supabase.client
      .from('businesses')
      .select('id, name, primary_color, logo_url, plan, require_email, require_phone')
      .eq('slug', slug)
      .single();

    if (bizError || !business) {
      this.logger.warn(`Business not found for slug="${slug}" — ${bizError?.message}`);
      throw new BadRequestException('Prode no encontrado');
    }

    const requireEmail = business.require_email !== false;
    const requirePhone = business.require_phone !== false;

    if (requireEmail && !normalizedEmail) throw new BadRequestException('Email requerido');
    if (requirePhone && !phone) throw new BadRequestException('Celular requerido');

    if (business.plan === 'free') {
      const { count } = await this.supabase.client
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id);
      this.logger.log(`Free plan check: count=${count}`);
      if (count && count >= 5) throw new BadRequestException('Límite del plan gratuito alcanzado');
    }

    const normalizedPhone = normalizeE164AR(phone) ?? phone ?? null;

    // Determine identifier for upsert: email if required, otherwise phone
    let existing: any = null;
    if (requireEmail && normalizedEmail) {
      const { data } = await this.supabase.client
        .from('participants')
        .select('*')
        .eq('business_id', business.id)
        .eq('email', normalizedEmail)
        .maybeSingle();
      existing = data;
    } else if (normalizedPhone) {
      const { data } = await this.supabase.client
        .from('participants')
        .select('*')
        .eq('business_id', business.id)
        .eq('phone', normalizedPhone)
        .limit(1);
      existing = data?.[0] ?? null;
    }

    if (existing) {
      this.logger.log(`Participant already exists id="${existing.id}"`);
      if (existing.is_disabled) throw new ForbiddenException('Tu acceso fue deshabilitado por el administrador del prode.');
      return { participant: existing, business };
    }

    // Self-referral check: nullify referrer if they share the same email or phone
    let validatedReferrerId = referrerParticipantId ?? null
    if (validatedReferrerId) {
      const { data: referrer } = await this.supabase.client
        .from('participants')
        .select('email, phone')
        .eq('id', validatedReferrerId)
        .eq('business_id', business.id)
        .maybeSingle()
      if (
        !referrer ||
        (normalizedEmail && referrer.email?.toLowerCase() === normalizedEmail) ||
        (normalizedPhone && referrer.phone === normalizedPhone)
      ) {
        validatedReferrerId = null
      }
    }

    this.logger.log(`Inserting new participant`);
    const { data, error } = await this.supabase.client
      .from('participants')
      .insert({
        business_id: business.id,
        name,
        email: normalizedEmail ?? null,
        phone: normalizedPhone ?? '',
        accepted_terms: true,
        referred_by_participant_id: validatedReferrerId,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Insert failed — code="${error.code}" message="${error.message}"`);
      throw new Error(error.message);
    }

    this.logger.log(`Participant inserted id="${data.id}"`);
    this.notifications
      .sendPushToAdmin(business.id, '🎉 Nuevo participante', `${name} se unió a tu prode`)
      .catch(() => {});

    return { participant: data, business };
  }

  async update(id: string, data: { name?: string; email?: string; phone?: string }) {
    const updateData: any = { ...data }
    if (data.email) {
      updateData.email = data.email.toLowerCase()
    }
    if (data.phone) {
      updateData.phone = normalizeE164AR(data.phone) ?? data.phone
    }

    const { data: updated, error } = await this.supabase.client
      .from('participants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return updated
  }

  async getStats(adminUserId: string) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single()
    if (!business) throw new Error('Business not found')

    const { data: participants } = await this.supabase.client
      .from('participants')
      .select('id')
      .eq('business_id', business.id)

    const total = participants?.length ?? 0
    if (total === 0) return { total: 0, with_predictions: 0, without_predictions: 0 }

    const { data: withPreds } = await this.supabase.client
      .from('predictions')
      .select('participant_id')
      .eq('business_id', business.id)

    const withPredictions = new Set(withPreds?.map((p: any) => p.participant_id) ?? []).size

    return {
      total,
      with_predictions: withPredictions,
      without_predictions: total - withPredictions,
    }
  }

  async getGrowth(adminUserId: string) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single()
    if (!business) throw new Error('Business not found')

    // Usar timezone de Argentina (UTC-3, sin DST)
    const TZ = 'America/Argentina/Buenos_Aires'
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

    // Función que convierte un Date a "YYYY-MM-DD" en TZ de Argentina
    const toLocalDate = (d: Date): string =>
      d.toLocaleDateString('en-CA', { timeZone: TZ }) // en-CA produce YYYY-MM-DD

    // Función para el label de una fecha local
    const toLabel = (localDate: string): string => {
      const [, m, dd] = localDate.split('-')
      return `${parseInt(dd)} ${months[parseInt(m) - 1]}`
    }

    // Construir los 7 días basados en la fecha local de Argentina
    const days: { date: string; label: string; count: number }[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = toLocalDate(d)
      const label = i === 0 ? 'Hoy' : toLabel(dateStr)
      days.push({ date: dateStr, label, count: 0 })
    }

    // "since" = inicio del primer día en Argentina = medianoche ART del día más antiguo
    // Ej: "2026-05-30" → "2026-05-30T03:00:00Z" (ART = UTC-3)
    const sinceLocal = days[0].date + 'T00:00:00'
    const sinceUTC   = new Date(sinceLocal + '-03:00').toISOString()

    const { data: rows } = await this.supabase.client
      .from('participants')
      .select('registered_at')
      .eq('business_id', business.id)
      .gte('registered_at', sinceUTC)

    for (const row of rows ?? []) {
      // Convertir el timestamp a fecha local Argentina para agrupar
      const localDate = toLocalDate(new Date(row.registered_at as string))
      const found = days.find(d => d.date === localDate)
      if (found) found.count++
    }

    return days.map(({ date: _date, label, count }) => ({ label, count }))
  }

  async setDisabled(adminUserId: string, participantId: string, is_disabled: boolean) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id, plan')
      .eq('admin_user_id', adminUserId)
      .maybeSingle()
    if (!business) throw new BadRequestException('Business not found')
    if (business.plan !== 'premium' && business.plan !== 'pro') throw new ForbiddenException('Solo los planes Pro y Premium pueden deshabilitar participantes')

    const { data: participant } = await this.supabase.client
      .from('participants')
      .select('id')
      .eq('id', participantId)
      .eq('business_id', business.id)
      .maybeSingle()
    if (!participant) throw new BadRequestException('Participante no encontrado')

    const { data, error } = await this.supabase.client
      .from('participants')
      .update({ is_disabled })
      .eq('id', participantId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async findAllByBusiness(businessId: string) {
    const { data, error } = await this.supabase.client
      .from('participants')
      .select('*')
      .eq('business_id', businessId);

    if (error) throw new Error(error.message);
    return data;
  }

  async findByAdminUserId(
    adminUserId: string,
    search?: string,
    page = 1,
    limit = 10,
    sortBy = 'total_points',
    sortDir: 'asc' | 'desc' = 'desc',
  ) {
    const { data: business, error: bizErr } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single();
    if (bizErr || !business) throw new Error('Business not found');

    const { count: totalMatches } = await this.supabase.client
      .from('matches')
      .select('*', { count: 'exact', head: true });

    const ALLOWED_SORT = ['total_points', 'rank', 'name', 'registered_at']
    const col = ALLOWED_SORT.includes(sortBy) ? sortBy : 'total_points'
    const asc = sortDir === 'asc'

    let query = this.supabase.client
      .from('participants')
      .select('*, predictions(count)', { count: 'exact' })
      .eq('business_id', business.id)
      .order(col, { ascending: asc })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    const ids = (data ?? []).map((p: any) => p.id);
    const { data: subs } = await this.supabase.client
      .from('push_subscriptions')
      .select('participant_id')
      .in('participant_id', ids.length > 0 ? ids : ['']);
    const withPush = new Set((subs ?? []).map((s: any) => s.participant_id));

    const enriched = (data ?? []).map((p: any) => ({
      ...p,
      predictions_count: p.predictions?.[0]?.count ?? 0,
      total_matches: totalMatches ?? 0,
      predictions: undefined,
      has_push_subscription: withPush.has(p.id),
    }));

    return { data: enriched, total: count ?? 0, page, limit };
  }
}
