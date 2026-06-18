import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'
import { FirebaseService } from '../../infrastructure/firebase/firebase.service'
import { normalizeE164AR } from '../../shared/utils/phone'
import { SendWhatsappDto } from './dto/send-whatsapp.dto'
import { SendPushDto } from './dto/send-push.dto'

const WA_BASE = 'https://graph.facebook.com/v22.0'
const WINDOW_MS = 24 * 60 * 60 * 1000

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
    private firebase: FirebaseService,
  ) {}

  // ─── WhatsApp ──────────────────────────────────────────────────────────────

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
          language: { code: 'es_AR' },
          components: [
            {
              type: 'header',
              parameters: [
                { type: 'text', text: businessName },
              ],
            },
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
        .limit(10000)
      participants = data ?? []
    } else if (dto.recipients === 'no_pred') {
      const { data: withPred } = await this.supabase.client
        .from('predictions')
        .select('participant_id')
        .eq('business_id', businessId)
        .limit(10000)

      const predIds = [...new Set((withPred ?? []).map((p: any) => p.participant_id))]

      let query = this.supabase.client
        .from('participants')
        .select('id, phone, name, last_wa_sent_at')
        .eq('business_id', businessId)
        .limit(10000)

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
    await this.logNotification(businessId, 'whatsapp', dto.recipients, dto.message, sent, failed, skipped)
    return { sent, skipped, failed }
  }

  private async logNotification(
    businessId: string,
    channel: 'whatsapp' | 'push',
    recipients: string,
    message: string,
    sent: number,
    failed: number,
    skipped = 0,
  ) {
    await this.supabase.client.from('notification_logs').insert({
      business_id: businessId,
      channel,
      recipients,
      message,
      sent,
      failed,
      skipped,
    })
  }

  async getNotificationHistory(businessId: string, limit = 20) {
    const { data } = await this.supabase.client
      .from('notification_logs')
      .select('id, channel, recipients, message, sent, failed, skipped, sent_at')
      .eq('business_id', businessId)
      .order('sent_at', { ascending: false })
      .limit(limit)
    return data ?? []
  }

  async getNoPredNoPushCount(businessId: string) {
    const { data: allParticipants } = await this.supabase.client
      .from('participants')
      .select('id')
      .eq('business_id', businessId)
      .limit(10000)

    const allIds = (allParticipants ?? []).map((p: any) => p.id)
    if (allIds.length === 0) return { count: 0 }

    const { data: withPred } = await this.supabase.client
      .from('predictions')
      .select('participant_id')
      .eq('business_id', businessId)
      .limit(10000)

    const predIds = new Set((withPred ?? []).map((p: any) => p.participant_id))
    const noPredIds = allIds.filter((id) => !predIds.has(id))
    if (noPredIds.length === 0) return { count: 0 }

    const { data: withPush } = await this.supabase.client
      .from('push_subscriptions')
      .select('participant_id')
      .in('participant_id', noPredIds)

    const pushIds = new Set((withPush ?? []).map((s: any) => s.participant_id))
    const count = noPredIds.filter((id) => !pushIds.has(id)).length

    return { count }
  }

  private async getParticipantsMissingMatches(businessId: string, matchIds: number[]): Promise<string[]> {
    if (!matchIds.length) return []

    const { data: participants } = await this.supabase.client
      .from('participants')
      .select('id')
      .eq('business_id', businessId)
      .limit(10000)
    const allIds = (participants ?? []).map((p: any) => p.id)
    if (!allIds.length) return []

    const { data: preds } = await this.supabase.client
      .from('predictions')
      .select('participant_id, match_id')
      .eq('business_id', businessId)
      .in('match_id', matchIds)

    const predictedByParticipant = new Map<string, Set<number>>()
    for (const p of preds ?? []) {
      const set = predictedByParticipant.get(p.participant_id) ?? new Set()
      set.add(p.match_id)
      predictedByParticipant.set(p.participant_id, set)
    }

    return allIds.filter((id) => (predictedByParticipant.get(id)?.size ?? 0) < matchIds.length)
  }

  async sendReminderForFecha(businessId: string, matchIds: number[]) {
    const participantIds = await this.getParticipantsMissingMatches(businessId, matchIds)
    if (!participantIds.length) return

    const { data: subs } = await this.supabase.client
      .from('push_subscriptions')
      .select('fcm_token')
      .in('participant_id', participantIds)

    const tokens = (subs ?? []).map((s: any) => s.fcm_token)
    if (!tokens.length) return

    const { icon, link } = await this.getBusinessInfo(businessId)
    await this.firebase.sendPush(
      tokens,
      '⚽ Recordatorio de pronósticos',
      'El partido arranca pronto. ¡Cargá tu predicción antes de que cierre!',
      undefined,
      'push_subscriptions',
      icon,
      link,
    )
  }

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

  // ─── Push Notifications ────────────────────────────────────────────────────

  private getArgentinaTodayRange(): { start: string; end: string } {
    const ART_OFFSET_MS = 3 * 60 * 60 * 1000 // Argentina is UTC-3 year-round
    const argNow = new Date(Date.now() - ART_OFFSET_MS)
    const startArt = Date.UTC(argNow.getUTCFullYear(), argNow.getUTCMonth(), argNow.getUTCDate())
    const start = new Date(startArt + ART_OFFSET_MS)
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
    return { start: start.toISOString(), end: end.toISOString() }
  }

  private async getFilteredParticipantIds(
    businessId: string,
    recipients: 'all' | 'no_pred' | 'no_pred_today' | 'top10',
  ): Promise<string[]> {
    if (recipients === 'no_pred_today') {
      const { start, end } = this.getArgentinaTodayRange()
      const { data: matches } = await this.supabase.client
        .from('matches')
        .select('id')
        .eq('status', 'scheduled')
        .gte('kickoff_at', start)
        .lt('kickoff_at', end)
      const matchIds = (matches ?? []).map((m: any) => m.id)
      return this.getParticipantsMissingMatches(businessId, matchIds)
    }

    if (recipients === 'all') {
      const { data } = await this.supabase.client
        .from('participants')
        .select('id')
        .eq('business_id', businessId)
        .limit(10000)
      return (data ?? []).map((p: any) => p.id)
    }

    if (recipients === 'no_pred') {
      const { data: withPred } = await this.supabase.client
        .from('predictions')
        .select('participant_id')
        .eq('business_id', businessId)
        .limit(10000)
      const predIds = [...new Set((withPred ?? []).map((p: any) => p.participant_id))]

      let query = this.supabase.client
        .from('participants')
        .select('id')
        .eq('business_id', businessId)
        .limit(10000)
      if (predIds.length > 0) {
        query = query.not('id', 'in', `(${predIds.join(',')})`)
      }
      const { data, error } = await query
      if (error) this.logger.error(`getFilteredParticipantIds no_pred error: ${JSON.stringify(error)}`)
      return (data ?? []).map((p: any) => p.id)
    }

    // top10
    const { data } = await this.supabase.client
      .from('leaderboard_cache')
      .select('participant_id')
      .eq('business_id', businessId)
      .order('rank', { ascending: true })
      .lte('rank', 10)
      .limit(10)
    return (data ?? []).map((r: any) => r.participant_id)
  }

  private async getBusinessInfo(businessId: string): Promise<{ icon?: string; link?: string }> {
    const { data } = await this.supabase.client
      .from('businesses')
      .select('logo_url, slug')
      .eq('id', businessId)
      .single()
    if (!data) return {}
    return {
      icon: data.logo_url ?? undefined,
      link: data.slug ? `https://${data.slug}.elprode.ar` : undefined,
    }
  }

  private async sendPushReminderForBusiness(
    businessId: string,
    title: string,
    body: string,
    imageUrl?: string,
  ): Promise<{ sent: number; failed: number }> {
    const { data } = await this.supabase.client
      .from('push_subscriptions')
      .select('fcm_token, participants!inner(business_id)')
      .eq('participants.business_id', businessId)

    const tokens = (data ?? []).map((r: any) => r.fcm_token)
    if (!tokens.length) return { sent: 0, failed: 0 }

    const { icon, link } = await this.getBusinessInfo(businessId)
    return this.firebase.sendPush(tokens, title, body, imageUrl, 'push_subscriptions', icon, link)
  }

  async sendPushBlast(
    businessId: string,
    dto: SendPushDto,
  ): Promise<{ sent: number; failed: number }> {
    let result: { sent: number; failed: number }

    if (dto.recipients === 'all') {
      result = await this.sendPushReminderForBusiness(businessId, dto.title, dto.body, dto.imageUrl)
    } else {
      const participantIds = await this.getFilteredParticipantIds(businessId, dto.recipients)
      if (!participantIds.length) return { sent: 0, failed: 0 }

      const { data } = await this.supabase.client
        .from('push_subscriptions')
        .select('fcm_token')
        .in('participant_id', participantIds)

      const tokens = (data ?? []).map((r: any) => r.fcm_token)
      if (!tokens.length) return { sent: 0, failed: 0 }

      const { icon, link } = await this.getBusinessInfo(businessId)
      result = await this.firebase.sendPush(tokens, dto.title, dto.body, dto.imageUrl, 'push_subscriptions', icon, link)
    }

    this.logger.log(`Push blast: ${result.sent} sent, ${result.failed} failed for business ${businessId}`)
    await this.logNotification(businessId, 'push', dto.recipients, dto.body, result.sent, result.failed)
    return result
  }

  async sendPushToParticipant(
    participantId: string,
    title: string,
    body: string,
    imageUrl?: string,
    businessId?: string,
  ): Promise<void> {
    const { data } = await this.supabase.client
      .from('push_subscriptions')
      .select('fcm_token')
      .eq('participant_id', participantId)

    const tokens = (data ?? []).map((r: any) => r.fcm_token)
    if (!tokens.length) return

    const { icon, link } = businessId ? await this.getBusinessInfo(businessId) : {}
    await this.firebase.sendPush(tokens, title, body, imageUrl, 'push_subscriptions', icon, link)
  }

  async sendPushToAdmin(businessId: string, title: string, body: string): Promise<void> {
    const { data } = await this.supabase.client
      .from('admin_push_subscriptions')
      .select('fcm_token')
      .eq('business_id', businessId)

    const tokens = (data ?? []).map((r: any) => r.fcm_token)
    if (!tokens.length) return

    const { icon } = await this.getBusinessInfo(businessId)
    await this.firebase.sendPush(tokens, title, body, undefined, 'admin_push_subscriptions', icon)
  }

  async registerParticipantToken(participantId: string, token: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('push_subscriptions')
      .upsert({ participant_id: participantId, fcm_token: token }, { onConflict: 'participant_id,fcm_token' })
    if (error) this.logger.error(`registerParticipantToken error: ${JSON.stringify(error)}`)
  }

  async registerAdminToken(businessId: string, token: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('admin_push_subscriptions')
      .upsert({ business_id: businessId, fcm_token: token }, { onConflict: 'business_id,fcm_token' })
    if (error) this.logger.error(`registerAdminToken error: ${JSON.stringify(error)}`)
  }
}
