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
    const host = request.headers.get('host') ?? ''
    const isRef = host.startsWith('ref.')
    if (isRef) {
      const pathname = request.nextUrl.pathname
      // Solo reescribir si es la raíz o un slug simple (sin sub-rutas)
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
        return NextResponse.rewrite(url)
      }

      // Para cualquier otra ruta en ref.elprode.ar,
      // redirigir al dominio principal manteniendo el path
      const url = request.nextUrl.clone()
      url.hostname = 'elprode.ar'
      return NextResponse.redirect(url)
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
