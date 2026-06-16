import { Injectable, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'
import { ReferralsService } from '../referrals/referrals.service'
import { PlayerReferralsService } from '../player-referrals/player-referrals.service'

export const PLANS = {
  pro: { label: 'Plan Pro', price: 33880, max_participants: null },
  premium: { label: 'Plan Premium', price: 96800, max_participants: null },
} as const

export type UpgradeablePlan = keyof typeof PLANS

@Injectable()
export class PaymentsService {
  private mp: MercadoPagoConfig
  private preference: Preference

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
    private readonly referralsService: ReferralsService,
    private readonly playerReferralsService: PlayerReferralsService,
  ) {
    this.mp = new MercadoPagoConfig({ accessToken: this.config.get<string>('app.mercadopagoToken')! })
    this.preference = new Preference(this.mp)
  }

  async createCheckoutPreference(businessId: string, plan: UpgradeablePlan, adminEmail: string) {
    const rawUrl = this.config.get<string>('app.webUrl') ?? ''
    const webUrl = rawUrl.includes('localhost') ? 'https://elprode.ar' : rawUrl
    const apiUrl = this.config.get<string>('app.apiUrl')
    const planInfo = PLANS[plan]

    const result = await this.preference.create({
      body: {
        items: [{
          id: `prode-${plan}`,
          title: planInfo.label,
          description: `Prode Mundial 2026 — ${planInfo.label} (pago único)`,
          quantity: 1,
          unit_price: planInfo.price,
          currency_id: 'ARS',
        }],
        payer: { email: adminEmail },
        external_reference: JSON.stringify({ businessId, plan }),
        back_urls: {
          success: `${webUrl}/empresa/planes?status=approved&plan=${plan}`,
          failure: `${webUrl}/empresa/planes?status=error`,
          pending: `${webUrl}/empresa/planes?status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${apiUrl}/payments/webhook`,
      },
    })

    return { preferenceId: result.id, initPoint: result.init_point }
  }

  async handleWebhook(body: any) {
    console.log('--- 💳 PROCESSING PAYMENT ---')
    console.log('📦 Webhook Body:', JSON.stringify(body))

    // Handle both Webhook (type) and IPN (topic)
    const type = body.type || body.topic || (body.resource && 'payment')
    if (type !== 'payment') {
      console.log('⏭️ Ignoring non-payment event type:', type)
      return { ignored: true }
    }

    const paymentId = body.data?.id || body.id
    if (!paymentId) {
      console.error('❌ No payment ID found in webhook body')
      return { ignored: true }
    }

    console.log(`🔍 Fetching details for Payment #${paymentId}...`)
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${this.config.get<string>('app.mercadopagoToken')}` },
    })

    if (!res.ok) {
      console.error(`❌ MercadoPago API Error: ${res.status}`)
      throw new BadRequestException('Could not fetch payment from MP')
    }

    const payment = await res.json()
    console.log(`📊 MP Status: ${payment.status} (${payment.status_detail})`)

    if (payment.status !== 'approved') {
      console.log(`⏳ Payment not approved yet. Current status: ${payment.status}`)
      return { ignored: true, status: payment.status }
    }

    let ref: { businessId: string; plan: UpgradeablePlan }
    try {
      ref = typeof payment.external_reference === 'string'
        ? JSON.parse(payment.external_reference)
        : payment.external_reference
      console.log('🔗 External Reference found:', JSON.stringify(ref))
    } catch (err) {
      console.error('❌ Failed to parse external_reference:', payment.external_reference)
      throw new BadRequestException('Invalid external_reference')
    }

    if (!PLANS[ref.plan]) {
      console.error('❌ Unknown plan in metadata:', ref.plan)
      throw new BadRequestException('Unknown plan')
    }

    console.log(`✨ Updating Business ${ref.businessId} to Plan: ${ref.plan}...`)
    const { error } = await this.supabase.client
      .from('businesses')
      .update({
        plan: ref.plan,
        paid_at: new Date().toISOString(),
        mp_payment_id: paymentId.toString()
      })
      .eq('id', ref.businessId)

    if (error) {
      console.error('❌ Supabase Update Error:', error.message)
      throw new BadRequestException(error.message)
    }

    console.log('✅ DATABASE UPDATED SUCCESSFULLY')

    try {
      await this.referralsService.confirmPayment(ref.businessId)
      console.log('🤝 Referral confirmed')
    } catch (e) {
      console.warn('⚠️ Could not confirm referral, but plan was updated')
    }

    // Si el comercio fue referido por un jugador, confirmar conversión
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('player_referral_code, name, slug, admin_user_id')
      .eq('id', ref.businessId)
      .single()
    if (business?.player_referral_code && business.admin_user_id) {
      await this.playerReferralsService.confirmConversion(
        business.player_referral_code,
        business.name,
        business.slug,
        business.admin_user_id,
      ).catch(() => {})
    }

    console.log(JSON.stringify({ event: 'plan_purchased', plan: ref.plan, businessId: ref.businessId }))

    console.log('--- 🏁 PAYMENT PROCESS FINISHED ---')
    return { updated: true, businessId: ref.businessId, plan: ref.plan }
  }
}
