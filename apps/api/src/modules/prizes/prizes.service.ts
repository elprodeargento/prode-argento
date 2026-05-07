import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';

@Injectable()
export class PrizesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findByAdminUserId(adminUserId: string) {
    const { data, error } = await this.supabase.client
      .from('prizes')
      .select('*, businesses!inner(admin_user_id)')
      .eq('businesses.admin_user_id', adminUserId)
      .order('rank', { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async findByBusinessId(businessId: string) {
    const { data, error } = await this.supabase.client
      .from('prizes')
      .select('*')
      .eq('business_id', businessId)
      .order('rank', { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  // Trae todos los premios semanales agrupados por week_index
  async findWeeklyByAdminUserId(adminUserId: string): Promise<Record<string, Array<{rank: number, description: string}>>> {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single()
    if (!business) return {}

    const { data, error } = await this.supabase.client
      .from('weekly_prizes')
      .select('week_index, rank, description')
      .eq('business_id', business.id)
      .order('week_index', { ascending: true })
      .order('rank', { ascending: true })
    if (error) throw new Error(error.message)

    const grouped: Record<string, Array<{rank: number, description: string}>> = {}
    for (const row of data ?? []) {
      const key = String(row.week_index)
      if (!grouped[key]) grouped[key] = []
      grouped[key].push({ rank: row.rank, description: row.description })
    }
    return grouped
  }

  // Reemplaza los premios de una semana específica
  async replaceWeeklyForAdminUser(
    adminUserId: string,
    weekIndex: number,
    prizes: Array<{ rank: number; description: string }>
  ) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single()
    if (!business) throw new Error('Business not found')

    await this.supabase.client
      .from('weekly_prizes')
      .delete()
      .eq('business_id', business.id)
      .eq('week_index', weekIndex)

    if (!prizes.length) return []

    const { data, error } = await this.supabase.client
      .from('weekly_prizes')
      .insert(prizes.map(p => ({
        business_id: business.id,
        week_index: weekIndex,
        rank: p.rank,
        description: p.description,
      })))
      .select()
    if (error) throw new Error(error.message)
    return data
  }

  async replaceForAdminUser(adminUserId: string, prizes: Array<{ rank: number; description: string }>) {
    const { data: business, error: bizErr } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single();
    if (bizErr || !business) throw new Error('Business not found');

    await this.supabase.client.from('prizes').delete().eq('business_id', business.id);
    if (!prizes.length) return [];

    const { data, error } = await this.supabase.client
      .from('prizes')
      .insert(prizes.map(p => ({ rank: p.rank, description: p.description, business_id: business.id })))
      .select();
    if (error) throw new Error(error.message);
    return data;
  }
}
