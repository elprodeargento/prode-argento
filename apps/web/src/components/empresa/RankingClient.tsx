'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { RankingPodium } from '@/components/empresa/RankingPodio'
import { RankingTable } from '@/components/empresa/RankingTable'
import { Card } from '@/components/ui/Card'
import { Loader2 } from 'lucide-react'

interface LeaderboardEntry {
  participant_id: string
  total_points: number
  exact_results: number
  correct_winners: number
  rank: number
  participants: { name: string; email: string } | null
}

interface RankingItem {
  id: string
  name: string
  points: number
  position: number
  exact_count: number
  winner_count: number
  predictions_count: number
  change?: number
}

function toRankingItem(e: LeaderboardEntry): RankingItem {
  return {
    id: e.participant_id,
    name: e.participants?.name ?? 'Sin nombre',
    points: e.total_points,
    position: e.rank,
    exact_count: e.exact_results,
    winner_count: e.correct_winners,
    predictions_count: 0,
  }
}

function computeDistribution(items: RankingItem[]) {
  const buckets = [
    { label: '15+ pts',  min: 15, max: Infinity, color: 'bg-[#18A06A]' },
    { label: '8-14 pts', min: 8,  max: 14,       color: 'bg-[#003FA3]' },
    { label: '1-7 pts',  min: 1,  max: 7,         color: 'bg-[#5BA3D9]' },
    { label: '0 pts',    min: 0,  max: 0,         color: 'bg-[#C8CEDF]' },
  ]
  const total = items.length || 1
  return buckets.map(b => {
    const count = items.filter(i => i.points >= b.min && i.points <= b.max).length
    return { ...b, count, percent: Math.round((count / total) * 100) }
  })
}

export function RankingClient() {
  const [items, setItems] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<LeaderboardEntry[]>('/leaderboard/me')
      .then(data => setItems((data ?? []).map(toRankingItem)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#DDE1EF]" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-lg font-black text-[#0D1A3A]">Sin datos de ranking</h3>
        <p className="text-sm text-[#5A6480]">Todavía no hay pronósticos cargados.</p>
      </div>
    )
  }

  const distribution = computeDistribution(items)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingPodium items={items.slice(0, 3)} igConnected={false} />

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

      <RankingTable items={items} />
    </div>
  )
}
