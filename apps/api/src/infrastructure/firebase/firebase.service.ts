import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name)
  private messaging: any = null

  constructor(
    private config: ConfigService,
    private supabase: SupabaseService,
  ) {}

  async onModuleInit() {
    const serviceAccountJson = this.config.get<string>('app.firebaseServiceAccount')
    if (!serviceAccountJson) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set — push notifications disabled')
      return
    }

    try {
      const { initializeApp, getApps, cert } = await import('firebase-admin/app')
      const { getMessaging } = await import('firebase-admin/messaging')

      if (!getApps().length) {
        initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) })
      }
      this.messaging = getMessaging()
      this.logger.log('Firebase Admin initialized')
    } catch (err) {
      this.logger.error('Failed to initialize Firebase Admin', err)
    }
  }

  get isReady() {
    return this.messaging !== null
  }

  async sendPush(
    tokens: string[],
    title: string,
    body: string,
    imageUrl?: string,
    table: 'push_subscriptions' | 'admin_push_subscriptions' = 'push_subscriptions',
    icon?: string,
    link?: string,
  ): Promise<{ sent: number; failed: number }> {
    if (!this.isReady || !tokens.length) return { sent: 0, failed: 0 }

    const BATCH = 500
    let sent = 0
    let failed = 0
    const notifIcon = icon && icon.startsWith('http') ? icon : undefined

    for (let i = 0; i < tokens.length; i += BATCH) {
      const batch = tokens.slice(i, i + BATCH)
      try {
        const res = await this.messaging.sendEachForMulticast({
          tokens: batch,
          notification: { title, body, ...(imageUrl ? { imageUrl } : {}) },
          data: link ? { link } : undefined,
          webpush: {
            notification: {
              title,
              body,
              ...(notifIcon ? { icon: notifIcon } : {}),
              ...(imageUrl ? { image: imageUrl } : {}),
            },
            ...(link ? { fcmOptions: { link } } : {}),
          },
        })

        const staleTokens: string[] = []
        res.responses.forEach((r: any, idx: number) => {
          if (r.success) {
            sent++
          } else {
            failed++
            const code = r.error?.code
            if (
              code === 'messaging/registration-token-not-registered' ||
              code === 'messaging/invalid-registration-token'
            ) {
              staleTokens.push(batch[idx])
            }
          }
        })

        if (staleTokens.length) {
          await this.supabase.client
            .from(table)
            .delete()
            .in('fcm_token', staleTokens)
        }
      } catch (err) {
        this.logger.error(`FCM batch send error: ${err}`)
        failed += batch.length
      }
    }

    return { sent, failed }
  }
}
