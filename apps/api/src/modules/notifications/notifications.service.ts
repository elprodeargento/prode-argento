import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'
import { normalizeE164AR } from '../../shared/utils/phone'
import { SendWhatsappDto } from './dto/send-whatsapp.dto'

const WA_BASE = 'https://graph.facebook.com/v22.0'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  private async sendWA(to: string, text: string, imageUrl?: string): Promise<boolean> {
    const phoneId = this.config.get('app.metaPhoneNumberId')
    const token = this.config.get('app.metaWaToken')
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    // Send image first if provided (WA Cloud API requires two separate messages for image + caption)
    if (imageUrl) {
      const imgRes = await fetch(`${WA_BASE}/${phoneId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'image',
          image: { link: imageUrl },
        }),
      })
      if (!imgRes.ok) {
        this.logger.warn(`WA image send failed to ${to}: ${imgRes.status}`)
        // Continue to send text even if image fails
      }
    }

    const useTemplate = this.config.get<string>('app.metaWaTemplate')
    const body = useTemplate
      ? JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: useTemplate,
            language: { code: 'es' },
            components: [{ type: 'body', parameters: [{ type: 'text', text }] }],
          },
        })
      : JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } })

    const res = await fetch(`${WA_BASE}/${phoneId}/messages`, { method: 'POST', headers, body })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      this.logger.error(`WA send failed to ${to}: ${res.status} — ${JSON.stringify(body)}`)
      return false
    }
    return true
  }

  /** Blast a WhatsApp message to a business's participants with recipient filtering */
  async sendWhatsappBlast(
    businessId: string,
    dto: SendWhatsappDto,
  ): Promise<{ sent: number; skipped: number; failed: number }> {
    let participants: Array<{ phone: string | null; name: string }> = []

    if (dto.recipients === 'all') {
      const { data } = await this.supabase.client
        .from('participants')
        .select('phone, name')
        .eq('business_id', businessId)
      participants = data ?? []
    } else if (dto.recipients === 'no_pred') {
      const { data: withPred } = await this.supabase.client
        .from('predictions')
        .select('participant_id')
        .eq('business_id', businessId)

      const predIds = (withPred ?? []).map((p: any) => p.participant_id)

      let query = this.supabase.client
        .from('participants')
        .select('phone, name')
        .eq('business_id', businessId)

      if (predIds.length > 0) {
        query = query.not('id', 'in', `(${predIds.join(',')})`)
      }

      const { data } = await query
      participants = data ?? []
    } else if (dto.recipients === 'top10') {
      const { data } = await this.supabase.client
        .from('leaderboard_cache')
        .select('participants(phone, name)')
        .eq('business_id', businessId)
        .order('rank', { ascending: true })
        .lte('rank', 10)

      participants = ((data ?? []) as any[])
        .map((r) => r.participants)
        .filter(Boolean)
    }

    let sent = 0
    let skipped = 0
    let failed = 0

    for (const p of participants) {
      const phone = normalizeE164AR(p.phone)
      if (!phone) {
        this.logger.warn(`Skipping participant without valid phone: "${p.phone}" (${p.name})`)
        skipped++
        continue
      }
      const ok = await this.sendWA(phone, dto.message, dto.imageUrl)
      if (ok) sent++
      else failed++
    }

    this.logger.log(`Blast: ${sent} sent, ${skipped} sin teléfono, ${failed} fallidos for business ${businessId}`)
    return { sent, skipped, failed }
  }

  /** Send reminder to participants who haven't submitted predictions for a fecha */
  async sendReminderForFecha(businessId: string, fechaLabel: string) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single()

    // Only remind participants without any predictions for this business
    const { data: withPreds } = await this.supabase.client
      .from('predictions')
      .select('participant_id')
      .eq('business_id', businessId)

    const predIds = (withPreds ?? []).map((p: any) => p.participant_id)

    let query = this.supabase.client
      .from('participants')
      .select('phone, name')
      .eq('business_id', businessId)

    if (predIds.length > 0) {
      query = query.not('id', 'in', `(${predIds.join(',')})`)
    }

    const { data: participants } = await query
    if (!participants?.length) return

    const msgs = participants.map((p) => {
      const phone = normalizeE164AR(p.phone)
      if (!phone) return Promise.resolve(false)
      return this.sendWA(
        phone,
        `⚽ *${business?.name} — Prode Mundial 2026*\n\n` +
        `Hola ${p.name}! Los partidos de la ${fechaLabel} arrancan pronto.\n` +
        `Entrá a cargar tus pronósticos antes de que cierre ⏰`,
      )
    })

    const results = await Promise.allSettled(msgs)
    const sent = results.filter((r) => r.status === 'fulfilled' && r.value === true).length
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
    const normalized = normalizeE164AR(phone)
    if (!normalized) {
      this.logger.warn(`Cannot normalize phone for result notification: ${phone}`)
      return false
    }
    return this.sendWA(
      normalized,
      `🏆 *${empresaNombre} — Resultado ${fechaLabel}*\n\n` +
      `Hola ${name}! Sumaste *${points} puntos* y estás en el puesto *${rank}°*.\n\n` +
      `¡Seguí así! 💪`,
    )
  }
}
