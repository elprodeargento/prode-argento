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
