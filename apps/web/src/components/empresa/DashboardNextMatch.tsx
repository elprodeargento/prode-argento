'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { WhatsAppSendModal } from './WhatsAppSendModal'
import { SOCIAL_ENABLED } from '@/lib/features'

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

interface LeaderboardEntry {
  participant_id: string
  total_points: number
  exact_results: number
  correct_winners: number
}

function formatKickoff(kickoff_at: string): string {
  const d = new Date(kickoff_at)
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const day = d.getDate()
  const month = months[d.getMonth()]
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} · ${hours}:${minutes} hs`
}

export function DashboardNextMatch() {
  const [match, setMatch] = useState<Match | null | undefined>(undefined)
  const [sinCargar, setSinCargar] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

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
          const [totalRes, leaderboard] = await Promise.all([
            apiGet<{ total: number }>('/participants/me?page=1&limit=1'),
            apiGet<LeaderboardEntry[]>('/leaderboard/me'),
          ])
          const total = totalRes?.total ?? 0
          const conPronos = leaderboard.filter(e =>
            (e.total_points > 0) || (e.exact_results > 0) || (e.correct_winners > 0)
          ).length
          setSinCargar(Math.max(0, total - conPronos))
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

  const daysUntil = match
    ? Math.ceil((new Date(match.kickoff_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

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

  const waMessage = match
    ? `⚽ ¡Acordate de cargar tus pronósticos!\n\nPróximo partido: ${match.home_team} vs ${match.away_team}\n📅 ${dateLabel}\n\n¡No te quedes afuera del ranking! 🏆`
    : `⚽ ¡Acordate de cargar tus pronósticos!\n\n¡No te quedes afuera del ranking! 🏆`

  return (
    <>
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
                {SOCIAL_ENABLED ? (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full bg-[#002B72] text-white rounded-xl py-[12px] font-black text-[14px] hover:bg-[#00318A] transition-all shadow-lg shadow-[#002B72]/20"
                  >
                    📢 Recordar a los {sinCargar}
                  </button>
                ) : (
                  <a
                    href="/empresa/notificaciones"
                    className="w-full block bg-[#002B72] text-white rounded-xl py-[12px] font-black text-[14px] hover:bg-[#00318A] transition-all shadow-lg shadow-[#002B72]/20"
                  >
                    🔔 Enviar notificación a los {sinCargar}
                  </a>
                )}
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
    <WhatsAppSendModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      defaultMessage={waMessage}
      title="Recordar a participantes"
    />
    </>
  )
}
