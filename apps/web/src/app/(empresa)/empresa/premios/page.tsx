import type { Metadata } from 'next'
import { PrizeManager } from '@/components/empresa/PrizeManager'

export const metadata: Metadata = { title: 'Premios' }

export default function PremiosPage() {
  return <PrizeManager />
}
