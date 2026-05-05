'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Bell, CheckCircle2, Loader2 } from 'lucide-react'

interface Match {
  id: number
  kickoff_at: string
  home_team: string
  away_team: string
  home_flag: string
  away_flag: string
  home_score?: number
  away_score?: number
  status: 'finished' | 'live' | 'scheduled'
  fd_match_id?: number
  coverage?: number
  total_participants?: number
}

interface DateGroup {
  label: string
  status: 'finished' | 'live' | 'scheduled'
  matches: Match[]
}

export function MatchList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [reminded, setReminded] = useState<Set<number>>(new Set())

  const handleRemind = (matchId: number) => {
    setReminded(prev => new Set(prev).add(matchId))
    setTimeout(() => setReminded(prev => { const s = new Set(prev); s.delete(matchId); return s }), 3000)
  }
  useEffect(() => {
    async function fetchMatches() {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet<Match[]>('/matches')
        setMatches(data || [])
      } catch (error) {
        console.error('Error fetching matches:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [])

  // Group matches by date
  const groups: DateGroup[] = matches.reduce((acc: DateGroup[], match) => {
    const date = new Date(match.kickoff_at)
    const label = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    
    let group = acc.find(g => g.label === label)
    if (!group) {
      group = { label, status: match.status, matches: [] }
      acc.push(group)
    }
    group.matches.push(match)
    
    // Update group status logic: if any is live, group is live. If all finished, group finished.
    if (match.status === 'live') group.status = 'live'
    
    return acc
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#DDE1EF]" />
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">⚽</div>
        <h3 className="text-lg font-black text-[#0D1A3A]">No hay partidos cargados</h3>
        <p className="text-sm text-[#5A6480]">Los partidos aparecerán aquí una vez que se sincronicen.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label} className="card overflow-hidden">
          <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[20px]">{group.status === 'finished' ? '📋' : group.status === 'live' ? '🔴' : '⏰'}</span>
              <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">{group.label} — {group.status === 'finished' ? 'Finalizada' : group.status === 'live' ? 'En curso' : 'Próxima'}</h3>
            </div>
          </div>

          <div className="p-0 flex flex-col">
            {group.matches.map((match) => {
              const kickoff = new Date(match.kickoff_at)
              const timeStr = kickoff.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
              return (
                <div
                  key={match.id}
                  className={`flex flex-col lg:flex-row lg:items-center gap-4 px-6 py-[14px] border-b-[1.5px] border-[#DDE1EF] last:border-b-0 hover:bg-[#F1F3F9]/30 transition-all`}
                >
                  {/* Time */}
                  <div className="text-[12px] font-bold text-[#8E96AE] min-w-[100px]">
                    {timeStr}
                  </div>

                  {/* Teams Row */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-[14px] font-extrabold text-[#0D1A3A] truncate">{match.home_team}</span>
                      <span className="text-[22px]">{match.home_flag}</span>
                    </div>

                    <div className="flex items-center justify-center min-w-[70px]">
                      {match.status === 'finished' || match.status === 'live' ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#0D1A3A] text-white rounded-lg font-bebas text-[20px]">
                          <span>{match.home_score ?? '?'}</span>
                          <span className="opacity-40">-</span>
                          <span>{match.away_score ?? '?'}</span>
                        </div>
                      ) : (
                        <span className="text-[16px] font-black text-[#8E96AE] uppercase">vs</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[22px]">{match.away_flag}</span>
                      <span className="text-[14px] font-extrabold text-[#0D1A3A] truncate">{match.away_team}</span>
                    </div>
                  </div>

                  {/* Status + Remind */}
                  <div className="flex items-center gap-2 min-w-[150px] justify-between lg:justify-end">
                    <StatusBadge status={match.status} />
                    {match.status === 'scheduled' &&
                      match.coverage !== undefined &&
                      match.total_participants !== undefined &&
                      match.total_participants > 0 &&
                      match.coverage / match.total_participants < 0.6 && (
                        <button
                          onClick={() => handleRemind(match.id)}
                          className={`text-[11px] font-black px-2.5 py-1 rounded-full transition-all whitespace-nowrap ${
                            reminded.has(match.id)
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-[#F1F3F9] text-[#5A6480] hover:bg-[#EBF4FC] hover:text-[#003FA3]'
                          }`}
                        >
                          {reminded.has(match.id) ? '✓ Enviado' : '📢 Recordar'}
                        </button>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: Match['status'] }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] animate-pulse whitespace-nowrap">
        🔴 EN VIVO
      </span>
    )
  }
  if (status === 'finished') {
    return (
      <span className="inline-flex items-center text-[11px] font-black px-2.5 py-1 rounded-full bg-[#E8F8F1] text-[#18A06A] whitespace-nowrap">
        FINALIZADO
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-[11px] font-black px-2.5 py-1 rounded-full bg-[#F1F3F9] text-[#8E96AE] whitespace-nowrap">
      PRÓXIMAMENTE
    </span>
  )
}
