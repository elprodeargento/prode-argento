'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface Match {
  id: string
  home_team: string
  away_team: string
  home_flag: string
  away_flag: string
  kickoff_at: string
  status: string
  group?: string
}

interface ParticipantStats {
  total: number
  with_predictions: number
  without_predictions: number
}

function formatKickoff(kickoff_at: string): string {
  const TZ = 'America/Argentina/Buenos_Aires'
  const d = new Date(kickoff_at)
  const day = d.toLocaleDateString('es-AR', { day: 'numeric', timeZone: TZ })
  const month = d.toLocaleDateString('es-AR', { month: 'short', timeZone: TZ })
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: TZ, hour12: false })
  return `${day} ${month} · ${time} hs`
}

export function DashboardNextMatch() {
  const router = useRouter()
  const [match, setMatch] = useState<Match | null | undefined>(undefined)
  const [sinCargar, setSinCargar] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const matches = await apiGet<Match[]>('/matches')
        const scheduled = matches
          .filter(m => m.status === 'scheduled')
          .sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime())
        const next = scheduled[0] ?? null
        setMatch(next)

        try {
          const stats = await apiGet<ParticipantStats>('/participants/me/stats')
          setSinCargar(stats?.without_predictions ?? 0)
        } catch {
          setSinCargar(0)
        }
      } catch {
        setMatch(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const daysUntil = match ? (() => {
    const TZ = 'America/Argentina/Buenos_Aires'
    const todayStr  = new Date().toLocaleDateString('en-CA', { timeZone: TZ })
    const matchStr  = new Date(match.kickoff_at).toLocaleDateString('en-CA', { timeZone: TZ })
    const today     = new Date(todayStr)
    const matchDate = new Date(matchStr)
    return Math.round((matchDate.getTime() - today.getTime()) / 86400000)
  })() : null

  const badge = daysUntil === null ? null
    : daysUntil < 0 ? null
    : daysUntil === 0
      ? <span className="bg-[#FDECEB] text-[#D93025] text-[11px] font-black px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">🔴 Hoy</span>
      : daysUntil === 1
        ? <span className="bg-[#FFF4E5] text-[#FF8A00] text-[11px] font-black px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">🔴 Mañana</span>
        : <span className="bg-[#E8F8F1] text-[#18A06A] text-[11px] font-black px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">🔴 En {daysUntil} días</span>

  const dateLabel = match
    ? (match.group ? `${match.group} · ` : '') + formatKickoff(match.kickoff_at)
    : ''

  return (
    <div className="card">
      <div className="px-[20px] py-[14px] border-b border-[#DDE1EF] flex items-center justify-between">
        <div className="text-[14px] font-extrabold text-[#0D1A3A] flex items-center gap-2">
          <span className="text-[18px]">⏰</span> Próximo partido
        </div>
        {badge}
      </div>
      <div className="p-[20px] text-center">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-[#8E96AE]" />
          </div>
        ) : !match ? (
          <div className="py-6 text-[14px] text-[#8E96AE] font-medium">
            No hay partidos programados aún
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-3 mb-[10px]">
              <img src={match.home_flag} alt={match.home_team} className="w-10 h-10 rounded-full object-cover border border-[#DDE1EF]" />
              <span className="text-[20px]">🆚</span>
              <img src={match.away_flag} alt={match.away_team} className="w-10 h-10 rounded-full object-cover border border-[#DDE1EF]" />
            </div>
            <div className="text-[16px] font-black text-[#0D1A3A] mb-[6px]">
              {match.home_team} vs {match.away_team}
            </div>
            <div className="text-[13px] text-[#5A6480] mb-[14px] font-medium">
              {dateLabel}
            </div>
            {sinCargar > 0 ? (
              <>
                <div className="bg-[#FFF4E5] rounded-[10px] py-[10px] px-[14px] text-[13px] font-extrabold text-[#FF8A00] mb-[12px] border border-[#FF8A00]/10">
                  ⚠️ {sinCargar} participante{sinCargar !== 1 ? 's' : ''} sin cargar aún
                </div>
                <button
                  onClick={() => router.push('/empresa/notificaciones?recipients=no_pred&channel=push')}
                  className="w-full bg-[#002B72] text-white rounded-xl py-[12px] font-black text-[14px] hover:bg-[#00318A] transition-all shadow-lg shadow-[#002B72]/20"
                >
                  🔔 Recordar a los {sinCargar}
                </button>
              </>
            ) : (
              <div className="bg-[#E8F8F1] rounded-[10px] py-[10px] px-[14px] text-[13px] font-extrabold text-[#18A06A] border border-[#18A06A]/10">
                ✅ Todos cargaron sus pronósticos
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
