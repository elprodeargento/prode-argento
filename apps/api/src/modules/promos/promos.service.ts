import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';

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
}
