import { ProdeLogin } from '@/components/prode/ProdeLogin'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props { params: Promise<{ slug: string }> }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let name = slug
  let color = '#002B72'
  let logoUrl: string | undefined

  try {
    const res = await fetch(`${API_URL}/businesses/${slug}`, { cache: 'no-store' })
    if (res.ok) {
      const biz = await res.json()
      name = biz.name ?? slug
      color = biz.primary_color ?? color
      logoUrl = biz.logo_url ?? undefined
    }
  } catch {}

  return {
    title: `${name} — Prode Mundial 2026`,
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: name,
    },
    icons: logoUrl ? { apple: logoUrl } : undefined,
    themeColor: color,
  }
}

export default async function PublicProdePage({ params }: Props) {
  const { slug } = await params

  console.log(`[/p/${slug}] fetching business from ${API_URL}/businesses/${slug}`)
  const bizRes = await fetch(`${API_URL}/businesses/${slug}`, { cache: 'no-store' })
  console.log(`[/p/${slug}] businesses response status: ${bizRes.status}`)
  if (!bizRes.ok) {
    console.error(`[/p/${slug}] business not found — status ${bizRes.status}`)
    notFound()
  }
  const business = await bizRes.json()
  console.log(`[/p/${slug}] business loaded: id=${business.id} slug=${business.slug}`)

  const prizesRes = await fetch(`${API_URL}/prizes/business/${business.id}`, { cache: 'no-store' })
  const prizes: Array<{ rank: number; description: string }> = prizesRes.ok ? await prizesRes.json() : []

  const medals = ['🥇', '🥈', '🥉']
  const empresa = {
    id: business.id,
    name: business.name,
    slug: business.slug,
    primary_color: business.primary_color ?? '#002B72',
    logo_url: business.logo_url ?? null,
    background_url: business.background_url ?? null,
    welcome_msg: business.welcome_msg ?? '¡Bienvenido al prode del Mundial!',
    plan: (business.plan ?? 'free') as 'free' | 'pro' | 'premium',
    require_email: business.require_email ?? true,
    require_phone: business.require_phone ?? true,
    match_visibility: (business.match_visibility ?? 'all') as 'all' | 'daily',
    close_minutes: business.close_minutes ?? 5,
    prizes: prizes.map((p, i) => ({
      rank: p.rank,
      medal: medals[i] ?? `${p.rank}°`,
      pos: `${p.rank}° Puesto`,
      description: p.description,
    })),
  }

  return <ProdeLogin empresa={empresa} />
}
