import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';
import { CreatePromoDto } from './dto/create-promo.dto';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

  async findNearby(userLat: number, userLon: number) {
    const { data, error } = await this.supabase.client
      .from('promos')
      .select('*')
      .eq('active', true)
      .gt('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return (data ?? []).filter((promo) => {
      // lat=0 lon=0 significa sin ubicación configurada → mostrar siempre
      if (promo.lat === 0 && promo.lon === 0) return true;
      const dist = haversineKm(userLat, userLon, Number(promo.lat), Number(promo.lon));
      return dist <= Number(promo.radius_km);
    }).sort((a, b) => {
      if (a.lat === 0 && a.lon === 0) return 1;
      if (b.lat === 0 && b.lon === 0) return -1;
      const da = haversineKm(userLat, userLon, Number(a.lat), Number(a.lon));
      const db = haversineKm(userLat, userLon, Number(b.lat), Number(b.lon));
      return da - db;
    });
  }

  async create(adminUserId: string, dto: CreatePromoDto) {
    const { data: biz, error: bizErr } = await this.supabase.client
      .from('businesses')
      .select('id, plan')
      .eq('admin_user_id', adminUserId)
      .single();
    if (bizErr || !biz) throw new NotFoundException('Business not found');
    if (biz.plan !== 'premium') throw new ForbiddenException('Se requiere Plan Premium para crear promos');

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
        lat:          dto.lat ?? 0,
        lon:          dto.lon ?? 0,
        link_url:     dto.link_url ?? null,
        active:       true,
        views:        0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(adminUserId: string, id: string, dto: Partial<CreatePromoDto>) {
    const { data: promo, error: findErr } = await this.supabase.client
      .from('promos')
      .select('*, businesses!inner(admin_user_id)')
      .eq('id', id)
      .single();

    if (findErr || !promo) throw new NotFoundException('Promo not found');
    if ((promo.businesses as any).admin_user_id !== adminUserId) throw new ForbiddenException();

    const { data, error } = await this.supabase.client
      .from('promos')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(adminUserId: string, id: string) {
    const { data: promo, error: findErr } = await this.supabase.client
      .from('promos')
      .select('*, businesses!inner(admin_user_id)')
      .eq('id', id)
      .single();

    if (findErr || !promo) throw new NotFoundException('Promo not found');
    if ((promo.businesses as any).admin_user_id !== adminUserId) throw new ForbiddenException();

    const { error } = await this.supabase.client
      .from('promos')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }
}
