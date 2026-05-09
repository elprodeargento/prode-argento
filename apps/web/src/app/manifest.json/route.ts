import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
const ROOT_DOMAINS = ['elprode.ar', 'localhost']

function getSlug(host: string): string | null {
  const bare = host.split(':')[0]
  for (const root of ROOT_DOMAINS) {
    if (bare.endsWith(`.${root}`)) {
      const slug = bare.slice(0, -(root.length + 1))
      return slug || null
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const slug = getSlug(host)

  const manifest: Record<string, unknown> = {
    name: 'Prode Mundial 2026',
    short_name: 'Prode',
    start_url: '/',
    display: 'standalone',
    background_color: '#002B72',
    theme_color: '#002B72',
    icons: [],
  }

  if (slug) {
    try {
      const res = await fetch(`${API_URL}/businesses/${slug}`, { cache: 'no-store' })
      if (res.ok) {
        const biz = await res.json()
        const color = biz.primary_color ?? '#002B72'
        manifest.name = biz.name ? `${biz.name} — Prode` : manifest.name
        manifest.short_name = biz.name ?? manifest.short_name
        manifest.background_color = color
        manifest.theme_color = color
        if (biz.logo_url) {
          manifest.icons = [
            { src: biz.logo_url, sizes: '192x192 512x512', type: 'image/png', purpose: 'any' },
          ]
        }
      }
    } catch {
      // Use defaults
    }
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
