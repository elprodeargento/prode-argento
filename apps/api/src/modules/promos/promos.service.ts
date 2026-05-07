import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';
import { CreatePromoDto } from './dto/create-promo.dto';

@Injectable()
export class PromosService {
  constructor(private readonly supabase: SupabaseService) {}

  async findByAdminUserId(adminUserId: string) {
    const { data, error } = await this.supabase.client
      .from('promos')
      .select('*, businesses!inner(admin_user_id)')
      .eq('businesses.admin_user_id', adminUserId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async create(adminUserId: string, dto: CreatePromoDto) {
    const { data: biz, error: bizErr } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single();
    if (bizErr || !biz) throw new NotFoundException('Business not found');

    const { data, error } = await this.supabase.client
      .from('promos')
      .insert({
        business_id:  biz.id,
        name:         dto.name,
        category:     dto.category,
        description:  dto.description,
        image_url:    dto.image_url ?? null,
        radius_km:    dto.radius_km ?? 1,
        valid_from:   dto.valid_from ?? new Date().toISOString(),
        valid_until:  dto.valid_until,
        lat:          0,
        lon:          0,
        active:       true,
        views:        0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
