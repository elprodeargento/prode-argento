import type { Metadata } from 'next'
import { RankingPodium } from '@/components/empresa/RankingPodio'
import { RankingTable } from '@/components/empresa/RankingTable'
import { Card } from '@/components/ui/Card'
import { BarChart3 } from 'lucide-react'

export const metadata: Metadata = { title: 'Ranking' }

const mockRanking = [
  { id: '1', name: 'Martina López',    points: 22, position: 1, exact_count: 6, winner_count: 4, predictions_count: 12, change:  2 },
  { id: '2', name: 'Carlos Ruiz',      points: 18, position: 2, exact_count: 4, winner_count: 6, predictions_count: 12, change:  0 },
  { id: '3', name: 'Lucas Fernández',  points: 14, position: 3, exact_count: 3, winner_count: 5, predictions_count: 10, change: -1 },
  { id: '4', name: 'Sofia García',     points: 12, position: 4, exact_count: 2, winner_count: 6, predictions_count: 12, change:  1 },
  { id: '5', name: 'Juan Pérez',       points: 10, position: 5, exact_count: 1, winner_count: 7, predictions_count: 11, change: -2 },
  { id: '6', name: 'Ana Rodríguez',    points:  9, position: 6, exact_count: 1, winner_count: 6, predictions_count: 10, change:  0 },
  { id: '7', name: 'Diego Morales',    points:  7, position: 7, exact_count: 0, winner_count: 7, predictions_count:  9, change:  1 },
]

const distribution = [
  { label: '15-22 pts', count: 8,  percent: 9,  color: 'bg-[#18A06A]' },
  { label: '8-14 pts',  count: 34, percent: 39, color: 'bg-[#003FA3]' },
  { label: '1-7 pts',   count: 40, percent: 46, color: 'bg-[#5BA3D9]' },
  { label: '0 pts',     count: 5,  percent: 6,  color: 'bg-[#C8CEDF]' },
]

export default function RankingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-[900] text-[#0D1A3A] mb-1 leading-tight">Ranking completo</h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Actualizado en tiempo real</p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-2 text-[13px] font-bold text-[#5A6480] bg-white border-[1.5px] border-[#DDE1EF] rounded-[10px] px-4 py-[9px] hover:bg-[#F1F3F9] transition-all">
            📥 Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingPodium items={mockRanking.slice(0, 3)} empresa="Mi Empresa" igConnected={false} />

        <Card padding={false} className="overflow-hidden flex flex-col">
          <div className="px-[22px] py-[18px] border-b border-[#DDE1EF] flex items-center gap-2 mb-6">
            <span className="text-[18px]">📊</span>
            <h3 className="text-[15px] font-extrabold text-[#0D1A3A]">Distribución de puntos</h3>
          </div>
          <div className="flex-1 px-[22px] pb-[22px] space-y-5">
            {distribution.map((row, i) => (
              <div key={i}>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="font-extrabold text-[#5A6480]">{row.label}</span>
                  <span className="font-bold text-[#8E96AE]">{row.count} personas</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <RankingTable items={mockRanking} />
    </div>
  )
}
