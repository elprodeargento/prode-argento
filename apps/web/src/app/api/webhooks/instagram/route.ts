import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookChallenge } from '@/lib/meta/instagram'

// GET: webhook verification (Meta calls this to confirm the endpoint)
export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = validateWebhookChallenge(
    searchParams.get('hub.mode') ?? '',
    searchParams.get('hub.verify_token') ?? '',
    searchParams.get('hub.challenge') ?? '',
  )
  if (challenge) return new NextResponse(challenge, { status: 200 })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST: real-time event notifications
export async function POST(request: NextRequest) {
  const body = await request.json()
  // Process Instagram notifications (comments, mentions, etc.) here
  console.log('[IG Webhook]', JSON.stringify(body, null, 2))
  return NextResponse.json({ received: true })
}
