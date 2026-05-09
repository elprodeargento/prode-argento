import { Body, Controller, Post, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';
import { ReferralsService } from '../referrals/referrals.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly referralsService: ReferralsService,
  ) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const base = dto.name
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'comercio';

    // Check if slug already exists and append numeric suffix if needed
    let slug = base;
    const { data: existing } = await this.supabase.client
      .from('businesses')
      .select('slug')
      .eq('slug', base)
      .maybeSingle();
    if (existing) {
      const { data: siblings } = await this.supabase.client
        .from('businesses')
        .select('slug')
        .like('slug', `${base}-%`);
      const taken = new Set([base, ...(siblings ?? []).map((r: any) => r.slug)]);
      let i = 2;
      while (taken.has(`${base}-${i}`)) i++;
      slug = `${base}-${i}`;
    }

    // 1. Create Supabase auth user
    const { data: authData, error: authError } = await this.supabase.client.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { company_name: dto.name },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('already')) {
        throw new ConflictException('Ya existe una cuenta con ese email');
      }
      throw new InternalServerErrorException(authError.message);
    }

    // 2. Create business record
    const { data: newBusiness, error: bizError } = await this.supabase.client
      .from('businesses')
      .insert({
        name: dto.name,
        slug,
        admin_user_id: authData.user.id,
        admin_email: authData.user.email ?? dto.email,
      })
      .select('id')
      .single();

    if (bizError || !newBusiness) {
      // Rollback: delete the auth user so the email isn't blocked
      await this.supabase.client.auth.admin.deleteUser(authData.user.id);
      throw new InternalServerErrorException(bizError?.message ?? 'Error creating business');
    }

    // 3. Register referral if referrerSlug is provided
    if (dto.referrerSlug) {
      await this.referralsService.registerReferral(newBusiness.id, dto.referrerSlug).catch(() => {});
    }

    return { userId: authData.user.id };
  }
}
