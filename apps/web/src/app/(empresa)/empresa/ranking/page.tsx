import type { Metadata } from 'next'
import { RankingClient } from '@/components/empresa/RankingClient'

export const metadata: Metadata = { title: 'Ranking' }

export default function RankingPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-[900] text-[#0D1A3A] mb-1 leading-tight">Ranking</h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Actualizado en tiempo real</p>
        </div>
      </div>
      <RankingClient />
    </div>
  )
}
