import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const ROOT_DOMAINS = ['elprode.ar', 'localhost']

const RESERVED_SLUGS = new Set([
  'www', 'api', 'app', 'admin', 'mail', 'smtp', 'ftp', 'cdn',
  'static', 'assets', 'media', 'dev', 'staging', 'test', 'demo',
  'blog', 'docs', 'help', 'support', 'status', 'auth', 'ref',
])

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

export async function middleware(request: NextRequest) {
  const slug = getSlug(request.headers.get('host') ?? '')

  if (slug) {
    const url = request.nextUrl.clone()
    const rest = request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname
    url.pathname = `/p/${slug}${rest}`
    return NextResponse.rewrite(url)
  }

  if (slug === null) {
    // Verificar si es ref.elprode.ar
    const host = request.headers.get('host') ?? ''
    const isRef = host.startsWith('ref.')
    if (isRef) {
      // El path es /slug-del-referrer
      const refSlug = request.nextUrl.pathname.replace('/', '')
      if (refSlug) {
        const url = request.nextUrl.clone()
        url.pathname = `/ref/${refSlug}`
        return NextResponse.rewrite(url)
      }
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
