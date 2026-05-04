import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log('[MercadoPago webhook]', body.type)
  // TODO: verify signature and update business plan in Supabase
  return NextResponse.json({ received: true })
}
