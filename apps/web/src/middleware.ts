import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const ROOT_DOMAINS = ['prode.ar', 'localhost']

function getSlug(host: string): string | null {
  const bare = host.split(':')[0]
  for (const root of ROOT_DOMAINS) {
    if (bare.endsWith(`.${root}`)) {
      const slug = bare.slice(0, -(root.length + 1))
      if (slug && slug !== 'www') return slug
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

  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
