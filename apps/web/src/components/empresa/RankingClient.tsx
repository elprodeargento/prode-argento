'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { RankingPodium } from '@/components/empresa/RankingPodio'
import { RankingTable } from '@/components/empresa/RankingTable'
import { Loader2 } from 'lucide-react'

interface LeaderboardEntry {
  participant_id: string
  total_points: number
  exact_results: number
  correct_winners: number
  rank: number
  participants: { name: string; email: string; phone?: string } | null
}

export interface RankingItem {
  id: string
  name: string
  email: string
  phone: string
  points: number
  position: number
  exact_count: number
  winner_count: number
}

export interface Prize {
  rank: number
  description: string
}

function toRankingItem(e: LeaderboardEntry): RankingItem {
  return {
    id: e.participant_id,
    name: e.participants?.name ?? 'Sin nombre',
    email: e.participants?.email ?? '',
    phone: e.participants?.phone ?? '',
    points: e.total_points,
    position: e.rank,
    exact_count: e.exact_results,
    winner_count: e.correct_winners,
  }
}

function exportCSV(items: RankingItem[]) {
  const headers = ['Posición', 'Nombre', 'Email', 'Teléfono', 'Puntos', 'Exactos', 'Ganadores']
  const rows = items.map(p => [
    p.position,
    p.name,
    p.email,
    p.phone || '',
    p.points,
    p.exact_count,
    p.winner_count,
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ranking-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function StatsCard({ items }: { items: RankingItem[] }) {
  const withPoints = items.filter(i => i.points > 0)
  const avg = withPoints.length ? Math.round(withPoints.reduce((s, i) => s + i.points, 0) / withPoints.length) : 0
  const totalExact = items.reduce((s, i) => s + i.exact_count, 0)
  const participation = items.length ? Math.round((withPoints.length / items.length) * 100) : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        { label: 'Participantes', value: items.length, icon: '👥' },
        { label: 'Jugando', value: `${withPoints.length} (${participation}%)`, icon: '✅' },
        { label: 'Promedio de pts', value: avg, icon: '📊' },
        { label: 'Resultados exactos', value: totalExact, icon: '🎯' },
      ].map(({ label, value, icon }) => (
        <div key={label} className="card py-4 px-5 flex flex-col gap-1">
          <span className="text-[18px]">{icon}</span>
          <div className="font-bebas text-[26px] text-[#003FA3] leading-none">{value}</div>
          <div className="text-[11px] font-bold text-[#8E96AE] uppercase tracking-wide">{label}</div>
        </div>
      ))}
    </div>
  )
}

function DistributionCard({ items }: { items: RankingItem[] }) {
  const max = items.length ? Math.max(...items.map(i => i.points)) : 0
  const buckets = [
    { label: `${Math.round(max * 0.66)}+ pts`, min: Math.round(max * 0.66), max: Infinity, color: 'bg-[#18A06A]' },
    { label: `${Math.round(max * 0.33)}–${Math.round(max * 0.66 - 1)} pts`, min: Math.round(max * 0.33), max: Math.round(max * 0.66 - 1), color: 'bg-[#003FA3]' },
    { label: `1–${Math.round(max * 0.33 - 1)} pts`, min: 1, max: Math.round(max * 0.33 - 1), color: 'bg-[#5BA3D9]' },
    { label: '0 pts', min: 0, max: 0, color: 'bg-[#C8CEDF]' },
  ]
  const total = items.length || 1

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="px-[22px] py-[18px] border-b border-[#DDE1EF] flex items-center gap-2">
        <span className="text-[18px]">📊</span>
        <h3 className="text-[15px] font-extrabold text-[#0D1A3A]">Distribución de puntos</h3>
      </div>
      <div className="flex-1 px-[22px] py-[22px] space-y-5">
        {buckets.map((b, i) => {
          const count = max === 0 && i === 3
            ? items.length
            : items.filter(item => item.points >= b.min && item.points <= b.max).length
          const percent = Math.round((count / total) * 100)
          return (
            <div key={i}>
              <div className="flex justify-between text-[13px] mb-1.5">
                <span className="font-extrabold text-[#5A6480]">{b.label}</span>
                <span className="font-bold text-[#8E96AE]">{count} personas</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${b.color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function RankingClient() {
  const [items, setItems] = useState<RankingItem[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [igConnected, setIgConnected] = useState(false)

  useEffect(() => {
    Promise.all([
      apiGet<LeaderboardEntry[]>('/leaderboard/me'),
      apiGet<Prize[]>('/prizes/me').catch(() => []),
      apiGet<{ connected: boolean }>('/instagram/status').catch(() => ({ connected: false })),
    ])
      .then(([lb, pz, igStatus]) => {
        setItems((lb ?? []).map(toRankingItem))
        setPrizes(pz ?? [])
        setIgConnected(igStatus?.connected ?? false)
      })
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

  return (
    <div className="space-y-6">
      <StatsCard items={items} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingPodium items={items.slice(0, 3)} prizes={prizes} igConnected={igConnected} />
        <DistributionCard items={items} />
      </div>

      <RankingTable items={items} prizes={prizes} onExport={() => exportCSV(items)} />
    </div>
  )
}
