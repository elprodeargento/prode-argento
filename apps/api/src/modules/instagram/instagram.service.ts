import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

const GRAPH_API = 'https://graph.facebook.com/v25.0'

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {}

  // ──────────────────────────────────────────────────────────────
  // Token encryption / decryption (AES-256-GCM)
  // Format: {iv_hex}:{authTag_hex}:{encrypted_hex}
  // ──────────────────────────────────────────────────────────────

  private getEncryptionKey(): Buffer {
    const keyB64 = this.config.get<string>('app.metaIgEncryptionKey')!
    return Buffer.from(keyB64, 'base64')
  }

  private encryptToken(plainText: string): string {
    const key = this.getEncryptionKey()
    const iv = crypto.randomBytes(12) // 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
  }

  private decryptToken(encrypted: string): string {
    const [ivHex, authTagHex, dataHex] = encrypted.split(':')
    const key = this.getEncryptionKey()
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const data = Buffer.from(dataHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  }

  // ──────────────────────────────────────────────────────────────
  // getOAuthUrl
  // ──────────────────────────────────────────────────────────────

  async getOAuthUrl(businessId: string): Promise<string> {
    const appId = this.config.get<string>('app.metaIgAppId')!
    const apiUrl = this.config.get<string>('app.apiUrl')!
    const redirectUri = `${apiUrl}/instagram/oauth/callback`

    const statePayload = JSON.stringify({ businessId, ts: Date.now() })
    const state = Buffer.from(statePayload).toString('base64url')

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
      state,
    })

    return `https://www.facebook.com/v25.0/dialog/oauth?${params.toString()}`
  }

  // ──────────────────────────────────────────────────────────────
  // handleCallback
  // ──────────────────────────────────────────────────────────────

  async handleCallback(
    code: string,
    state: string,
  ): Promise<{ businessId: string; username: string; accountType: string }> {
    // Validate state age
    let stateData: { businessId: string; ts: number }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
    } catch {
      throw new BadRequestException('Estado OAuth inválido')
    }

    const ageMs = Date.now() - stateData.ts
    if (ageMs > 10 * 60 * 1000) {
      throw new BadRequestException('El estado OAuth expiró. Intentá de nuevo.')
    }

    const { businessId } = stateData
    const appId = this.config.get<string>('app.metaIgAppId')!
    const appSecret = this.config.get<string>('app.metaIgAppSecret')!
    const apiUrl = this.config.get<string>('app.apiUrl')!
    const redirectUri = `${apiUrl}/instagram/oauth/callback`

    // Exchange code → short-lived token
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    })
    const shortTokenRes = await fetch(
      `${GRAPH_API}/oauth/access_token?${tokenParams.toString()}`,
    )
    const shortTokenData = await shortTokenRes.json()
    if (!shortTokenRes.ok || !shortTokenData.access_token) {
      this.logger.error('Short token exchange failed', shortTokenData)
      this.handleMetaError(shortTokenData)
      throw new BadRequestException('Error al obtener el token de acceso')
    }
    const shortToken: string = shortTokenData.access_token

    // Exchange short-lived → long-lived token
    const longTokenParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortToken,
    })
    const longTokenRes = await fetch(
      `${GRAPH_API}/oauth/access_token?${longTokenParams.toString()}`,
    )
    const longTokenData = await longTokenRes.json()
    if (!longTokenRes.ok || !longTokenData.access_token) {
      this.logger.error('Long token exchange failed', longTokenData)
      this.handleMetaError(longTokenData)
      throw new BadRequestException('Error al obtener el token de larga duración')
    }
    const longToken: string = longTokenData.access_token
    const expiresIn: number = longTokenData.expires_in ?? 5184000 // default 60 days
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Fetch pages with instagram_business_account
    const pagesRes = await fetch(
      `${GRAPH_API}/me/accounts?fields=id,name,instagram_business_account{id,username,account_type,name}&access_token=${longToken}`,
    )
    const pagesData = await pagesRes.json()
    if (!pagesRes.ok) {
      this.logger.error('Fetching pages failed', pagesData)
      this.handleMetaError(pagesData)
      throw new BadRequestException('Error al obtener las páginas de Facebook')
    }

    const pages: any[] = pagesData.data ?? []
    const pageWithIg = pages.find((p: any) => p.instagram_business_account?.id)

    if (!pageWithIg) {
      throw new BadRequestException(
        'No se encontró ninguna cuenta de Instagram Business conectada a tus Páginas de Facebook. Asegurate de que tu cuenta de Instagram esté vinculada a una Página de Facebook desde la app de Instagram.',
      )
    }

    const igAccount = pageWithIg.instagram_business_account
    const accountType: string = igAccount.account_type ?? 'UNKNOWN'

    if (accountType === 'PERSONAL') {
      throw new ForbiddenException(
        'Tu cuenta de Instagram es personal. Para publicar necesitás convertirla a Empresa o Creador desde Configuración > Cuenta en la app de Instagram.',
      )
    }

    const igUserId: string = igAccount.id
    const username: string = igAccount.username ?? ''

    // Encrypt and save to DB
    const encryptedToken = this.encryptToken(longToken)

    const { error } = await this.supabase.client
      .from('businesses')
      .update({
        ig_user_id: igUserId,
        ig_access_token: encryptedToken,
        ig_token_expires_at: expiresAt,
        ig_account_type: accountType,
      } as any)
      .eq('id', businessId)

    if (error) {
      this.logger.error('Failed to save IG token to DB', error)
      throw new BadRequestException('Error al guardar la conexión de Instagram')
    }

    this.logger.log(`Instagram connected for business ${businessId}: @${username} (${accountType})`)
    return { businessId, username, accountType }
  }

  // ──────────────────────────────────────────────────────────────
  // getStatus
  // ──────────────────────────────────────────────────────────────

  async getStatus(businessId: string): Promise<{
    connected: boolean
    username?: string
    accountType?: string
    expiresAt?: string
    daysLeft?: number
  }> {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('ig_user_id, ig_access_token, ig_token_expires_at, ig_account_type')
      .eq('id', businessId)
      .maybeSingle()

    const b = business as any
    if (!b?.ig_user_id || !b?.ig_access_token) {
      return { connected: false }
    }

    let token: string
    try {
      token = this.decryptToken(b.ig_access_token)
    } catch {
      return { connected: false }
    }

    // Validate token with Graph API
    try {
      const res = await fetch(
        `${GRAPH_API}/${b.ig_user_id}?fields=username,account_type&access_token=${token}`,
      )
      const data = await res.json()

      if (!res.ok || data.error) {
        // Token invalid — clear it
        await this.clearIgConnection(businessId)
        return { connected: false }
      }

      const expiresAt: string | null = b.ig_token_expires_at ?? null
      const daysLeft = expiresAt
        ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 86400000))
        : undefined

      return {
        connected: true,
        username: data.username,
        accountType: data.account_type ?? b.ig_account_type,
        expiresAt: expiresAt ?? undefined,
        daysLeft,
      }
    } catch (err) {
      this.logger.error('Error checking IG status', err)
      return { connected: false }
    }
  }

  // ──────────────────────────────────────────────────────────────
  // publishPost
  // ──────────────────────────────────────────────────────────────

  async publishPost(
    businessId: string,
    imageUrl: string,
    caption: string,
  ): Promise<{ postId: string }> {
    // Check plan
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('plan, ig_user_id, ig_access_token')
      .eq('id', businessId)
      .maybeSingle()

    if (!business) throw new BadRequestException('Negocio no encontrado')
    if (business.plan !== 'pro') {
      throw new ForbiddenException('La publicación en Instagram requiere el plan Pro')
    }

    const b = business as any
    if (!b.ig_user_id || !b.ig_access_token) {
      throw new BadRequestException('Instagram no está conectado')
    }

    let token: string
    try {
      token = this.decryptToken(b.ig_access_token)
    } catch {
      throw new UnauthorizedException('Token de Instagram inválido. Reconectá tu cuenta.')
    }

    const igUserId: string = b.ig_user_id

    // Step 1: Create media container
    const containerRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
    })
    const containerData = await containerRes.json()
    if (!containerRes.ok) {
      this.logger.error('Create media container failed', containerData)
      this.handleMetaError(containerData)
      throw new BadRequestException('Error al crear el contenedor de medios en Instagram')
    }
    const containerId: string = containerData.id

    // Step 2: Poll container status
    await this.waitForContainer(igUserId, containerId, token)

    // Step 3: Publish
    const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: containerId, access_token: token }),
    })
    const publishData = await publishRes.json()
    if (!publishRes.ok) {
      this.logger.error('Publish media failed', publishData)
      this.handleMetaError(publishData)
      throw new BadRequestException('Error al publicar en Instagram')
    }

    this.logger.log(`Published IG post for business ${businessId}: postId=${publishData.id}`)
    return { postId: publishData.id }
  }

  private async waitForContainer(
    _igUserId: string,
    containerId: string,
    token: string,
    maxRetries = 8,
  ): Promise<void> {
    let delay = 500
    for (let i = 0; i < maxRetries; i++) {
      await new Promise((r) => setTimeout(r, delay))
      delay = Math.min(delay * 2, 8000)

      const res = await fetch(
        `${GRAPH_API}/${containerId}?fields=status_code,status&access_token=${token}`,
      )
      const data = await res.json()

      if (data.status_code === 'FINISHED') return
      if (data.status_code === 'ERROR' || data.status_code === 'EXPIRED') {
        throw new BadRequestException(
          `El contenedor de Instagram falló: ${data.status ?? data.status_code}`,
        )
      }
      // IN_PROGRESS or PUBLISHED or unknown — keep polling
    }
    throw new BadRequestException(
      'El contenedor de Instagram tardó demasiado. Intentá de nuevo.',
    )
  }

  // ──────────────────────────────────────────────────────────────
  // handleMetaError
  // ──────────────────────────────────────────────────────────────

  handleMetaError(err: any): never | void {
    const error = err?.error ?? err
    const code: number = error?.code ?? 0
    const message: string = error?.message ?? ''

    if (code === 190) {
      throw new UnauthorizedException(
        'El token de Instagram venció. Reconectá tu cuenta desde Configuración.',
      )
    }
    if (code === 10 || code === 200) {
      throw new ForbiddenException(
        'Permisos insuficientes en Instagram. Volvé a conectar y aceptá todos los permisos.',
      )
    }
    if (code === 4 || code === 32 || code === 2207051) {
      throw new BadRequestException(
        'Límite de publicaciones alcanzado. Esperá un rato antes de intentar de nuevo.',
      )
    }
    if (code === 100 && message.toLowerCase().includes('image')) {
      throw new BadRequestException(
        'La imagen no es accesible públicamente. Asegurate de que la URL sea pública.',
      )
    }
    if (code === 36000) {
      throw new BadRequestException(
        'Esta cuenta de Instagram no es de tipo Empresa o Creador. Convertila desde la app de Instagram.',
      )
    }
  }

  // ──────────────────────────────────────────────────────────────
  // refreshToken
  // ──────────────────────────────────────────────────────────────

  async refreshToken(businessId: string): Promise<void> {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('ig_access_token')
      .eq('id', businessId)
      .maybeSingle()

    const b = business as any
    if (!b?.ig_access_token) return

    let currentToken: string
    try {
      currentToken = this.decryptToken(b.ig_access_token)
    } catch {
      return
    }

    const appId = this.config.get<string>('app.metaIgAppId')!
    const appSecret = this.config.get<string>('app.metaIgAppSecret')!

    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: currentToken,
    })

    const res = await fetch(`${GRAPH_API}/oauth/access_token?${params.toString()}`)
    const data = await res.json()

    if (!res.ok || !data.access_token) {
      this.logger.warn(`Token refresh failed for business ${businessId}`, data)
      return
    }

    const newToken: string = data.access_token
    const expiresIn: number = data.expires_in ?? 5184000
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
    const encryptedToken = this.encryptToken(newToken)

    await this.supabase.client
      .from('businesses')
      .update({
        ig_access_token: encryptedToken,
        ig_token_expires_at: expiresAt,
      } as any)
      .eq('id', businessId)

    this.logger.log(`Token refreshed for business ${businessId}, expires ${expiresAt}`)
  }

  // ──────────────────────────────────────────────────────────────
  // refreshAllExpiringTokens
  // ──────────────────────────────────────────────────────────────

  async refreshAllExpiringTokens(): Promise<void> {
    const threshold = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

    const { data: businesses, error } = await this.supabase.client
      .from('businesses')
      .select('id, ig_token_expires_at')
      .not('ig_access_token', 'is', null)
      .lt('ig_token_expires_at' as any, threshold)

    if (error) {
      this.logger.error('Failed to query expiring tokens', error)
      return
    }

    if (!businesses || businesses.length === 0) {
      this.logger.log('No expiring IG tokens found')
      return
    }

    this.logger.log(`Refreshing ${businesses.length} expiring IG token(s)`)

    for (const biz of businesses) {
      try {
        await this.refreshToken(biz.id)
      } catch (err) {
        this.logger.error(`Failed to refresh token for business ${biz.id}`, err)
      }
    }
  }

  // ──────────────────────────────────────────────────────────────
  // disconnect
  // ──────────────────────────────────────────────────────────────

  async disconnect(businessId: string): Promise<void> {
    await this.clearIgConnection(businessId)
    this.logger.log(`Instagram disconnected for business ${businessId}`)
  }

  private async clearIgConnection(businessId: string): Promise<void> {
    await this.supabase.client
      .from('businesses')
      .update({
        ig_user_id: null,
        ig_access_token: null,
        ig_token_expires_at: null,
      } as any)
      .eq('id', businessId)
  }
}
