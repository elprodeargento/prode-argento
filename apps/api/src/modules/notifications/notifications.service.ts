import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

const WA_BASE = 'https://graph.facebook.com/v22.0'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  private async sendWA(to: string, text: string) {
    const phoneId = this.config.get('app.metaPhoneNumberId')
    const token = this.config.get('app.metaWaToken')

    const res = await fetch(`${WA_BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    })

    if (!res.ok) {
      this.logger.error(`WA send failed to ${to}: ${res.status}`)
      return false
    }
    return true
  }

  /** Send reminder to all participants without predictions for a fecha */
  async sendReminderForFecha(businessId: string, fechaLabel: string) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single()

    const { data: participants } = await this.supabase.client
      .from('participants')
      .select('phone, name')
      .eq('business_id', businessId)

    if (!participants?.length) return

    const msgs = participants.map((p) =>
      this.sendWA(
        p.phone,
        `⚽ *${business?.name} — Prode Mundial 2026*\n\n` +
        `Hola ${p.name}! Los partidos de la ${fechaLabel} arrancan pronto.\n` +
        `Entrá a cargar tus pronósticos antes de que cierre ⏰`,
      ),
    )

    const results = await Promise.allSettled(msgs)
    const sent = results.filter((r) => r.status === 'fulfilled').length
    this.logger.log(`Reminders sent: ${sent}/${participants.length} for business ${businessId}`)
  }

  /** Notify a participant of their match result */
  async sendResultNotification(
    phone: string,
    name: string,
    empresaNombre: string,
    fechaLabel: string,
    points: number,
    rank: number,
  ) {
    return this.sendWA(
      phone,
      `🏆 *${empresaNombre} — Resultado ${fechaLabel}*\n\n` +
      `Hola ${name}! Sumaste *${points} puntos* y estás en el puesto *${rank}°*.\n\n` +
      `¡Seguí así! 💪`,
    )
  }
}
