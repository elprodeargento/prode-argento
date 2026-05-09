import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/empresa/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/empresa/login?error=no_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as any))
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/empresa/login?error=auth`)
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.redirect(`${origin}/empresa/login?error=no_session`)
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
  const bizRes = await fetch(`${apiUrl}/businesses/me`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  })

  if (bizRes.ok) {
    return NextResponse.redirect(`${origin}/empresa/dashboard`)
  }

  // New OAuth user — create business from Google profile, then go to onboarding
  await fetch(`${apiUrl}/businesses/me`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  return NextResponse.redirect(`${origin}/empresa/onboarding`)
}
