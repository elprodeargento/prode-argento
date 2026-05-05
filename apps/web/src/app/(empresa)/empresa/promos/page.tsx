import type { Metadata } from 'next'
import { PromoManager } from '@/components/empresa/PromoManager'

export const metadata: Metadata = { title: 'Mis Promos' }

export default function MisPromosPage() {
  return <PromoManager />
}
