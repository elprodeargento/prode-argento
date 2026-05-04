// MercadoPago integration
// Install: npm install mercadopago
// Docs: https://github.com/mercadopago/sdk-nodejs

export interface PlanConfig {
  id: 'premium' | 'pro'
  title: string
  price: number
  currency: 'USD'
}

export const PLANS: Record<string, PlanConfig> = {
  premium: { id: 'premium', title: 'Prode Mundial 2026 — Plan Premium', price: 15, currency: 'USD' },
  pro:     { id: 'pro',     title: 'Prode Mundial 2026 — Plan Pro',     price: 25, currency: 'USD' },
}

export async function createCheckoutPreference(_params: {
  plan: 'premium' | 'pro'
  businessId: string
  adminEmail: string
  backUrls: { success: string; failure: string; pending: string }
}) {
  // TODO: Install mercadopago SDK and implement
  // npm install mercadopago
  throw new Error('MercadoPago SDK not installed. Run: npm install mercadopago')
}
