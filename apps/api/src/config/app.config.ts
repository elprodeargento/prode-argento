import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  webUrl: process.env.WEB_URL ?? 'http://localhost:3000',
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  footballDataKey: process.env.FOOTBALL_DATA_API_KEY!,
  metaWaToken: process.env.META_WA_TOKEN!,
  metaPhoneNumberId: process.env.META_PHONE_NUMBER_ID!,
  metaVerifyToken: process.env.META_VERIFY_TOKEN!,
  mercadopagoToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  mercadopagoWebhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET!,
}))
