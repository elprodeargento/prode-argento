import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessesService {
  constructor(private readonly supabase: SupabaseService) {}

  async createForOAuthUser(userId: string, email: string, displayName: string) {
    // Return existing business if already created (idempotent)
    const { data: existing } = await this.supabase.client
      .from('businesses')
      .select('*')
      .eq('admin_user_id', userId)
      .maybeSingle()
    if (existing) return existing

    const base = displayName
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'comercio'

    let slug = base
    const { data: existingSlug } = await this.supabase.client
      .from('businesses').select('slug').eq('slug', base).maybeSingle()
    if (existingSlug) {
      const { data: siblings } = await this.supabase.client
        .from('businesses').select('slug').like('slug', `${base}-%`)
      const taken = new Set([base, ...(siblings ?? []).map((r: any) => r.slug)])
      let i = 2
      while (taken.has(`${base}-${i}`)) i++
      slug = `${base}-${i}`
    }

    const { data, error } = await this.supabase.client
      .from('businesses')
      .insert({ name: displayName, slug, admin_user_id: userId, admin_email: email })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async create(createBusinessDto: CreateBusinessDto) {
    const { data, error } = await this.supabase.client
      .from('businesses')
      .insert(createBusinessDto)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('businesses')
      .select('*');

    if (error) throw new Error(error.message);
    return data;
  }

  async findOneBySlug(slug: string) {
    const { data, error } = await this.supabase.client
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) throw new NotFoundException('Business not found');
    return data;
  }

  async findOneByAdminId(adminId: string) {
    const { data, error } = await this.supabase.client
      .from('businesses')
      .select('*')
      .eq('admin_user_id', adminId)
      .single();

    if (error || !data) throw new NotFoundException('Business not found for this user');
    return data;
  }

  async updateByAdminId(adminId: string, updateBusinessDto: UpdateBusinessDto) {
    const business = await this.findOneByAdminId(adminId);

    const payload: Record<string, unknown> = { ...updateBusinessDto }

    // ig_hashtags is stored as text[] in the DB — always send as array
    if (typeof payload['ig_hashtags'] === 'string') {
      payload['ig_hashtags'] = (payload['ig_hashtags'] as string)
        .split(/[\s,]+/)
        .map(t => t.trim())
        .filter(Boolean)
    }

    // registration_deadline: date string "YYYY-MM-DD" or "" → timestamptz or null
    if ('registration_deadline' in payload) {
      const d = payload['registration_deadline']
      payload['registration_deadline'] = (d && typeof d === 'string' && d.length > 0)
        ? new Date(d).toISOString()
        : null
    }

    const { data, error } = await this.supabase.client
      .from('businesses')
      .update(payload)
      .eq('id', business.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    const { data, error } = await this.supabase.client
      .from('businesses')
      .update(updateBusinessDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.client
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }
}
