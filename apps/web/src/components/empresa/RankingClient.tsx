'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { WC_WEEKS, formatWCWeekLabel, getCurrentWCWeekIdx } from '@/lib/wcWeeks'
import { RankingPodium } from '@/components/empresa/RankingPodio'
import { RankingTable } from '@/components/empresa/RankingTable'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [tab, setTab] = useState<'mundial' | 'semanal'>('mundial')
  const [weeklyEntries, setWeeklyEntries] = useState<Array<{
    participant_id: string
    name: string
    weekly_points: number
    exact_results: number
    rank: number
  }>>([])
  const [weeklyLoading, setWeeklyLoading] = useState(false)
  const [weeklyPrizesMap, setWeeklyPrizesMap] = useState<Record<string, Array<{rank: number, description: string}>>>({})
  const [business, setBusiness] = useState<{ id: string, name: string, primary_color: string, logo_url?: string } | null>(null)
  const currentWeekIdx = Math.max(0, getCurrentWCWeekIdx(WC_WEEKS))
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(currentWeekIdx)

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

    apiGet<{ id: string, name: string, primary_color: string, logo_url?: string }>('/businesses/me')
      .then(b => setBusiness(b))
      .catch(() => {})

    apiGet<Record<string, Array<{rank: number, description: string}>>>('/prizes/weekly/me')
      .then(data => setWeeklyPrizesMap(data ?? {}))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (tab !== 'semanal' || !business?.id) return
    setWeeklyLoading(true)
    const offset = selectedWeekIdx - currentWeekIdx
    apiGet<{ entries: Array<any> }>(`/leaderboard/${business.id}/weekly?offset=${offset}`)
      .then(data => setWeeklyEntries(data?.entries ?? []))
      .catch(() => setWeeklyEntries([]))
      .finally(() => setWeeklyLoading(false))
  }, [tab, business?.id, selectedWeekIdx])

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

      {/* TABS */}
      <div className="flex gap-2 bg-[#F1F3F9] p-1 rounded-xl w-fit">
        {([
          { id: 'mundial', label: '🏆 Mundial' },
          { id: 'semanal', label: '📅 Semanal' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-[13px] font-black transition-all ${
              tab === t.id
                ? 'bg-white text-[#002B72] shadow-sm'
                : 'text-[#5A6480] hover:text-[#002B72]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB MUNDIAL */}
      {tab === 'mundial' && (
        <>
          <StatsCard items={items} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RankingPodium
              items={items.slice(0, 3)}
              prizes={prizes}
              igConnected={igConnected}
              empresa={business?.name}
              primaryColor={business?.primary_color}
              logoUrl={business?.logo_url}
            />
            <DistributionCard items={items} />
          </div>
          <RankingTable items={items} prizes={prizes} onExport={() => exportCSV(items)} />
        </>
      )}

      {/* TAB SEMANAL */}
      {tab === 'semanal' && (
        <div className="space-y-4">

          {/* Navegación de semana */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setSelectedWeekIdx(i => Math.max(0, i - 1))}
              disabled={selectedWeekIdx === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-black text-[#5A6480] hover:text-[#002B72] hover:bg-[#F1F3F9] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[13px] font-black text-[#0D1A3A]">
                {WC_WEEKS[selectedWeekIdx]?.label} · {WC_WEEKS[selectedWeekIdx] ? formatWCWeekLabel(WC_WEEKS[selectedWeekIdx]) : '—'}
              </span>
              {selectedWeekIdx === currentWeekIdx && (
                <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  En curso
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedWeekIdx(i => Math.min(WC_WEEKS.length - 1, i + 1))}
              disabled={selectedWeekIdx >= currentWeekIdx}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-black text-[#5A6480] hover:text-[#002B72] hover:bg-[#F1F3F9] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Banner premio semanal */}
          {(weeklyPrizesMap[String(selectedWeekIdx)] ?? []).length > 0 ? (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <div className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-2">🎁 Premio de la semana</div>
              <div className="flex flex-col gap-1">
                {(weeklyPrizesMap[String(selectedWeekIdx)] ?? []).map((p, i) => (
                  <div key={i} className="text-[13px] font-black text-slate-900">
                    {i===0?'🥇':i===1?'🥈':'🥉'} {p.description}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#FFF4E5] border border-[#FF8A00]/20 p-4 flex items-center gap-4">
              <span className="text-[28px]">🎁</span>
              <div className="flex-1">
                <div className="text-[14px] font-black text-[#0D1A3A]">
                  Sin premio configurado para esta semana
                </div>
                <div className="text-[13px] text-[#5A6480] font-medium mt-0.5">
                  Tus clientes necesitan saber qué pueden ganar.
                </div>
              </div>
              <a href="/empresa/premios"
                className="shrink-0 px-4 py-2 bg-[#FF8A00] text-white text-[13px] font-black rounded-xl hover:opacity-90 transition-all">
                Configurar
              </a>
            </div>
          )}

          {/* Ranking semanal */}
          <div className="card">
            <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
              <span className="text-[20px]">📅</span>
              <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">
                Ranking de la semana
              </h3>
            </div>
            <div className="divide-y divide-[#DDE1EF]">
              {weeklyLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-[#DDE1EF]" />
                </div>
              ) : weeklyEntries.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-3xl mb-3">⚽</div>
                  <div className="text-[14px] font-black text-[#0D1A3A] mb-1">
                    Sin datos esta semana todavía
                  </div>
                  <div className="text-[13px] text-[#5A6480] font-medium">
                    El ranking se actualiza a medida que se juegan los partidos.
                  </div>
                </div>
              ) : (
                weeklyEntries.map(entry => {
                  const medal = entry.rank === 1 ? '🥇'
                    : entry.rank === 2 ? '🥈'
                    : entry.rank === 3 ? '🥉'
                    : null
                  return (
                    <div key={entry.participant_id}
                      className={`flex items-center gap-3 px-5 py-4 ${
                        entry.rank <= 3 ? 'bg-amber-50/50' : ''
                      }`}>
                      <span className="text-[20px] w-7 text-center shrink-0">
                        {medal ?? (
                          <span className="text-[13px] font-black text-[#8E96AE]">
                            {entry.rank}
                          </span>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-black text-[#0D1A3A] truncate">
                          {entry.name}
                        </div>
                        <div className="text-[11px] text-[#8E96AE] font-medium">
                          {entry.exact_results} exactos esta semana
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bebas text-[24px] text-[#002B72] leading-none">
                          {entry.weekly_points}
                        </div>
                        <div className="text-[10px] font-bold text-[#8E96AE]">pts</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
