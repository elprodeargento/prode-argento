import { Injectable, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import MercadoPago, { Preference } from 'mercadopago'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

export const PLANS = {
  pro:     { label: 'Plan Pro',     price: 40000, max_participants: null },
  premium: { label: 'Plan Premium', price: 80000, max_participants: null },
} as const

export type UpgradeablePlan = keyof typeof PLANS

@Injectable()
export class PaymentsService {
  private mp: MercadoPago
  private preference: Preference

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {
    this.mp = new MercadoPago({ accessToken: this.config.get<string>('app.mercadopagoToken')! })
    this.preference = new Preference(this.mp)
  }

  async createCheckoutPreference(businessId: string, plan: UpgradeablePlan, adminEmail: string) {
    const webUrl = this.config.get<string>('app.webUrl')!
    const apiUrl = process.env.API_PUBLIC_URL || webUrl.replace('3000', '4000') + '/api/v1'
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
    if (body.type !== 'payment') return { ignored: true }

    const paymentId = body.data?.id
    if (!paymentId) return { ignored: true }

    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${this.config.get<string>('app.mercadopagoToken')}` },
    })
    if (!res.ok) throw new BadRequestException('Could not fetch payment from MP')
    const payment = await res.json()

    if (payment.status !== 'approved') return { ignored: true, status: payment.status }

    let ref: { businessId: string; plan: UpgradeablePlan }
    try {
      ref = JSON.parse(payment.external_reference)
    } catch {
      throw new BadRequestException('Invalid external_reference')
    }

    if (!PLANS[ref.plan]) throw new BadRequestException('Unknown plan')

    const { error } = await this.supabase.client
      .from('businesses')
      .update({ plan: ref.plan })
      .eq('id', ref.businessId)

    if (error) throw new BadRequestException(error.message)

    return { updated: true, businessId: ref.businessId, plan: ref.plan }
  }
}
