import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

@Injectable()
export class ReferralsService {
  constructor(private readonly supabase: SupabaseService) {}

  // Registrar un referido cuando se crea un negocio
  async registerReferral(referredId: string, referrerSlug: string) {
    const { data: referrer } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('slug', referrerSlug)
      .single()
    if (!referrer) return null

    await this.supabase.client
      .from('referrals')
      .insert({ referrer_id: referrer.id, referred_id: referredId, status: 'pending' })
      .single()
  }

  // Confirmar pago y sumar puntos al referrer
  async confirmPayment(businessId: string) {
    const { data: referral } = await this.supabase.client
      .from('referrals')
      .select('*')
      .eq('referred_id', businessId)
      .eq('status', 'pending')
      .single()
    if (!referral) return

    await this.supabase.client
      .from('referrals')
      .update({ status: 'paid', points_awarded: 10 })
      .eq('id', referral.id)

    await this.supabase.client.rpc('increment_referral_points', {
      business_id: referral.referrer_id,
      points: 10,
    })
  }

  // Obtener datos de referidos del comercio actual
  async getMyReferrals(adminUserId: string) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id, slug, referral_points')
      .eq('admin_user_id', adminUserId)
      .single()
    if (!business) throw new Error('Business not found')

    const { data: referrals } = await this.supabase.client
      .from('referrals')
      .select('id, status, points_awarded, created_at, referred:referred_id(name, slug)')
      .eq('referrer_id', business.id)
      .order('created_at', { ascending: false })

    return {
      points: business.referral_points,
      referralUrl: `https://ref.elprode.ar/${business.slug}`,
      referrals: referrals || [],
    }
  }
}
