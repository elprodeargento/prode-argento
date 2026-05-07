import type { Metadata } from 'next'
import { RankingClient } from '@/components/empresa/RankingClient'

export const metadata: Metadata = { title: 'Ranking' }

export default function RankingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-[900] text-[#0D1A3A] mb-1 leading-tight">Ranking completo</h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Actualizado en tiempo real</p>
        </div>
        <button className="flex items-center gap-2 text-[13px] font-bold text-[#5A6480] bg-white border-[1.5px] border-[#DDE1EF] rounded-[10px] px-4 py-[9px] hover:bg-[#F1F3F9] transition-all">
          📥 Exportar
        </button>
      </div>
      <RankingClient />
    </div>
  )
}
