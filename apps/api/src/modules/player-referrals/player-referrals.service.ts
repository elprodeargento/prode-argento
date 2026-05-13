import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

@Injectable()
export class PlayerReferralsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getOrCreate(email: string, name: string) {
    const { data: existing } = await this.supabase.client
      .from('player_referrers')
      .select('*')
      .eq('email', email)
      .single()

    if (existing) return existing

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 15)
    const code = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`

    const { data: created } = await this.supabase.client
      .from('player_referrers')
      .insert({ email, name, referral_code: code })
      .select()
      .single()

    return created
  }

  async confirmConversion(playerReferralCode: string) {
    const { data: referrer } = await this.supabase.client
      .from('player_referrers')
      .select('*')
      .eq('referral_code', playerReferralCode)
      .single()
    if (!referrer) return

    const newTotal = referrer.total_referrals + 1
    const newPending = referrer.pending_amount + (newTotal % 3 === 0 ? 12000 : 0)

    await this.supabase.client
      .from('player_referrers')
      .update({
        total_referrals: newTotal,
        pending_amount: newPending,
      })
      .eq('referral_code', playerReferralCode)

    if (newTotal % 3 === 0) {
      await this.sendPayoutNotification(referrer.name, referrer.email, newTotal, newPending)
    }
  }

  private async sendPayoutNotification(name: string, email: string, total: number, amount: number) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: 'elprodeargento@gmail.com',
          subject: `💰 Jugador completó 3 referidos — ${name}`,
          html: `
            <h2>Jugador completó grupo de referidos</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Total referidos:</strong> ${total}</p>
            <p><strong>Monto acumulado:</strong> $${amount.toLocaleString('es-AR')}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
          `,
        }),
      })
    } catch (e) {
      console.error('Error sending payout notification:', e)
    }
  }

  async requestPayout(email: string, name: string, amount: number, paymentInfo: string) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: 'elprodeargento@gmail.com',
          subject: `💸 Solicitud de cobro — ${name}`,
          html: `
            <h2>Solicitud de cobro de referidos</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Monto a transferir:</strong> $${amount.toLocaleString('es-AR')}</p>
            <p><strong>Datos de pago:</strong> ${paymentInfo}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
          `,
        }),
      })
    } catch (e) {
      console.error('Error sending payout request:', e)
    }
    return { success: true }
  }
}
