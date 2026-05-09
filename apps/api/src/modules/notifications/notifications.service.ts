import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'
import { normalizeE164AR } from '../../shared/utils/phone'
import { SendWhatsappDto } from './dto/send-whatsapp.dto'

const WA_BASE = 'https://graph.facebook.com/v22.0'
const WINDOW_MS = 24 * 60 * 60 * 1000

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
      }
    }

    const res = await fetch(`${WA_BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      this.logger.error(`WA send failed to ${to}: ${res.status} — ${JSON.stringify(body)}`)
      return false
    }
    return true
  }

  private async sendWATemplate(
    to: string,
    businessName: string,
    message: string,
    participantName: string,
    slug: string,
  ): Promise<boolean> {
    const phoneId = this.config.get('app.metaPhoneNumberId')
    const token = this.config.get('app.metaWaToken')
    const templateName = this.config.get('app.metaWaTemplate')

    const res = await fetch(`${WA_BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: businessName },
                { type: 'text', text: message },
                { type: 'text', text: participantName },
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [{ type: 'text', text: slug }],
            },
          ],
        },
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      this.logger.error(`WA template send failed to ${to}: ${res.status} — ${JSON.stringify(body)}`)
      return false
    }
    return true
  }

  private async sendWAToParticipant(
    participantId: string,
    phone: string,
    participantName: string,
    businessName: string,
    slug: string,
    message: string,
    lastWaSentAt: string | null,
    imageUrl?: string,
  ): Promise<boolean> {
    const withinWindow =
      lastWaSentAt !== null &&
      Date.now() - new Date(lastWaSentAt).getTime() < WINDOW_MS

    let ok: boolean
    if (withinWindow) {
      this.logger.log(`Using free text for ${phone} (within 24h window)`)
      ok = await this.sendWA(phone, message, imageUrl)
    } else {
      this.logger.log(`Using template for ${phone} (no open window)`)
      ok = await this.sendWATemplate(phone, businessName, message, participantName, slug)
    }

    if (ok) {
      await this.supabase.client
        .from('participants')
        .update({ last_wa_sent_at: new Date().toISOString() })
        .eq('id', participantId)
    }

    return ok
  }

  /** Blast a WhatsApp message to a business's participants with recipient filtering */
  async sendWhatsappBlast(
    businessId: string,
    dto: SendWhatsappDto,
  ): Promise<{ sent: number; skipped: number; failed: number }> {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('name, slug')
      .eq('id', businessId)
      .single()

    const bizName = business?.name ?? ''
    const bizSlug = business?.slug ?? ''

    let participants: Array<{ id: string; phone: string | null; name: string; last_wa_sent_at: string | null }> = []

    if (dto.recipients === 'all') {
      const { data } = await this.supabase.client
        .from('participants')
        .select('id, phone, name, last_wa_sent_at')
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
        .select('id, phone, name, last_wa_sent_at')
        .eq('business_id', businessId)

      if (predIds.length > 0) {
        query = query.not('id', 'in', `(${predIds.join(',')})`)
      }

      const { data } = await query
      participants = data ?? []
    } else if (dto.recipients === 'top10') {
      const { data } = await this.supabase.client
        .from('leaderboard_cache')
        .select('participants(id, phone, name, last_wa_sent_at)')
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
      const ok = await this.sendWAToParticipant(
        p.id,
        phone,
        p.name,
        bizName,
        bizSlug,
        dto.message,
        p.last_wa_sent_at,
        dto.imageUrl,
      )
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
      .select('name, slug')
      .eq('id', businessId)
      .single()

    if (!business) return

    const { data: withPreds } = await this.supabase.client
      .from('predictions')
      .select('participant_id')
      .eq('business_id', businessId)

    const predIds = (withPreds ?? []).map((p: any) => p.participant_id)

    let query = this.supabase.client
      .from('participants')
      .select('id, phone, name, last_wa_sent_at')
      .eq('business_id', businessId)

    if (predIds.length > 0) {
      query = query.not('id', 'in', `(${predIds.join(',')})`)
    }

    const { data: participants } = await query
    if (!participants?.length) return

    const message =
      `⚽ Los partidos de la ${fechaLabel} arrancan pronto.\n` +
      `Entrá a cargar tus pronósticos antes de que cierre ⏰`

    const results = await Promise.allSettled(
      participants.map((p) => {
        const phone = normalizeE164AR(p.phone)
        if (!phone) return Promise.resolve(false)
        return this.sendWAToParticipant(
          p.id,
          phone,
          p.name,
          business.name,
          business.slug,
          message,
          p.last_wa_sent_at,
        )
      }),
    )

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value === true).length
    this.logger.log(`Reminders sent: ${sent}/${participants.length} for business ${businessId}`)
  }

  /** Notify a participant of their match result */
  async sendResultNotification(
    participantId: string,
    phone: string,
    name: string,
    empresaNombre: string,
    businessSlug: string,
    fechaLabel: string,
    points: number,
    rank: number,
    lastWaSentAt: string | null,
  ) {
    const normalized = normalizeE164AR(phone)
    if (!normalized) {
      this.logger.warn(`Cannot normalize phone for result notification: ${phone}`)
      return false
    }
    const message =
      `🏆 Resultado ${fechaLabel}\n\n` +
      `Hola ${name}! Sumaste *${points} puntos* y estás en el puesto *${rank}°*.\n\n` +
      `¡Seguí así! 💪`

    return this.sendWAToParticipant(
      participantId,
      normalized,
      name,
      empresaNombre,
      businessSlug,
      message,
      lastWaSentAt,
    )
  }
}
