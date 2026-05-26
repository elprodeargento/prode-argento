import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const ROOT_DOMAINS = ['elprode.ar', 'localhost']

const RESERVED_SLUGS = new Set([
  'www', 'api', 'app', 'admin', 'mail', 'smtp', 'ftp', 'cdn',
  'static', 'assets', 'media', 'dev', 'staging', 'test', 'demo',
  'blog', 'docs', 'help', 'support', 'status', 'auth', 'ref',
])

const EMPRESA_PUBLIC_PATHS = ['/empresa/login', '/empresa/registro']

function getSlug(host: string): string | null {
  const bare = host.split(':')[0]
  for (const root of ROOT_DOMAINS) {
    if (bare.endsWith(`.${root}`)) {
      const slug = bare.slice(0, -(root.length + 1))
      if (slug && !RESERVED_SLUGS.has(slug)) return slug
    }
  }
  return null
}

const GLOBAL_PATHS = ['/terminos', '/privacidad', '/terminos-referidos', '/ayuda']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') ?? ''
  const slug = getSlug(host)

  // — Skip subdomain rewrite for global marketing/legal paths
  if (slug && GLOBAL_PATHS.some(p => pathname.startsWith(p))) {
    console.log(`[MW] GLOBAL PATH on subdomain → skip rewrite`)
    return NextResponse.next()
  }

  // — Subdomain rewrite: pizza.elprode.ar → /p/pizza
  if (slug) {
    const url = request.nextUrl.clone()
    const rest = pathname === '/' ? '' : pathname
    url.pathname = `/p/${slug}${rest}`
    console.log(`[MW] REWRITE slug subdomain → ${url.pathname}`)
    return NextResponse.rewrite(url)
  }

  // — ref.elprode.ar handling
  if (host.startsWith('ref.')) {
    const refSlug = pathname.replace(/^\//, '').split('/')[0]
    const isSimpleSlug = refSlug &&
      !refSlug.startsWith('empresa') &&
      !refSlug.startsWith('_next') &&
      !refSlug.startsWith('api') &&
      pathname.split('/').filter(Boolean).length === 1

    if (isSimpleSlug) {
      const url = request.nextUrl.clone()
      url.hostname = ROOT_DOMAINS.find(d => host.endsWith(d)) ?? 'elprode.ar'
      url.pathname = `/ref/${refSlug}`
      console.log(`[MW] REWRITE ref subdomain → ${url.pathname}`)
      return NextResponse.rewrite(url)
    }
    const url = request.nextUrl.clone()
    url.hostname = 'elprode.ar'
    console.log(`[MW] REDIRECT ref root`)
    return NextResponse.redirect(url)
  }

  // — Session refresh + auth protection for /empresa/*
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    },
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Refresh token inválido o expirado — limpiar cookies y redirigir a login
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/empresa/login'
    const redirect = NextResponse.redirect(loginUrl)
    request.cookies.getAll()
      .filter(c => c.name.startsWith('sb-'))
      .forEach(c => redirect.cookies.delete(c.name))
    return redirect
  }

  const isEmpresaRoute = pathname.startsWith('/empresa/')
  const isEmpresaPublic = EMPRESA_PUBLIC_PATHS.some(p => pathname.startsWith(p))

  console.log(`[MW] auth path — user=${user?.id ?? 'anon'} isEmpresaRoute=${isEmpresaRoute} isEmpresaPublic=${isEmpresaPublic}`)

  if (isEmpresaRoute && !isEmpresaPublic && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/empresa/login'
    console.log(`[MW] REDIRECT unauthenticated empresa → /empresa/login`)
    return NextResponse.redirect(loginUrl)
  }

  if (isEmpresaPublic && user) {
    const dashUrl = request.nextUrl.clone()
    dashUrl.pathname = '/empresa/dashboard'
    console.log(`[MW] REDIRECT authenticated user away from public empresa page`)
    return NextResponse.redirect(dashUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw\\.js|manifest\\.json|pwa-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
