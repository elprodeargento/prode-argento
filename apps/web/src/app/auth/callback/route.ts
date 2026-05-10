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

  // Convert localhost to 127.0.0.1 to avoid Node.js IPv6 fetch issues with NestJS
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1').replace('localhost', '127.0.0.1')
  
  try {
    const bizRes = await fetch(`${apiUrl}/businesses/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
    })

    if (bizRes.ok) {
      return NextResponse.redirect(`${origin}/empresa/dashboard`)
    }

    // New OAuth user — create business from Google profile, then go to onboarding
    const postRes = await fetch(`${apiUrl}/businesses/me`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    if (!postRes.ok) {
      console.error('API Error creating business:', await postRes.text())
      return NextResponse.redirect(`${origin}/empresa/login?error=create_failed`)
    }

    // Use the `next` param provided by the frontend, fallback to onboarding
    return NextResponse.redirect(`${origin}${next === '/empresa/dashboard' ? '/empresa/onboarding' : next}`)
  } catch (err) {
    console.error('Fetch exception in auth callback:', err)
    return NextResponse.redirect(`${origin}/empresa/login?error=api_unreachable`)
  }
}
