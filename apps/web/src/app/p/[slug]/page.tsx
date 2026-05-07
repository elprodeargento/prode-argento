import { ProdeLogin } from '@/components/prode/ProdeLogin'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ slug: string }> }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `Prode Mundial 2026 — ${slug}` }
}

export default async function PublicProdePage({ params }: Props) {
  const { slug } = await params

  const bizRes = await fetch(`${API_URL}/businesses/${slug}`, { cache: 'no-store' })
  if (!bizRes.ok) notFound()
  const business = await bizRes.json()

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
