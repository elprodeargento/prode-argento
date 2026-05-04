import { ProdeLogin } from '@/components/prode/ProdeLogin'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `Prode Mundial 2026 — ${slug}` }
}

export default async function PublicProdePage({ params }: Props) {
  const { slug } = await params
  // En producción: fetch desde Supabase
  const empresa = {
    id: '1',
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    slug,
    primary_color: '#002B72',
    logo_url: null,
    welcome_msg: '¡Bienvenido al prode del Mundial!',
    prizes: [
      { rank: 1, medal: '🥇', pos: '1° Puesto', description: 'Premio sorpresa' },
    ],
  }
  return <ProdeLogin empresa={empresa} />
}
