'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { WC_WEEKS, getCurrentWCWeekIdx } from '@/lib/wcWeeks'

interface Prize {
  rank: number
  description: string
}

export function DashboardWeeklyPrize({ businessId }: { businessId: string }) {
  const [prizes, setPrizes] = useState<Prize[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Record<string, Array<{ rank: number; description: string }>>>('/prizes/weekly/me')
      .then(data => {
        const currentIdx = getCurrentWCWeekIdx(WC_WEEKS)
        const key = String(currentIdx)
        const weekPrizes = data[key] || []
        setPrizes(weekPrizes.length > 0 ? weekPrizes : null)
      })
      .catch(() => setPrizes(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  if (!prizes) {
    return (
      <div className="card border-dashed border-[#DDE1EF]">
        <div className="p-5 flex items-center gap-4">
          <span className="text-[32px]">🎁</span>
          <div className="flex-1">
            <div className="text-[14px] font-black text-[#0D1A3A]">
              Sin premio semanal configurado
            </div>
            <div className="text-[13px] text-[#5A6480] font-medium mt-0.5">
              Configurá un premio para esta semana y dales a tus clientes una razón para volver al local.
            </div>
          </div>
          <a
            href="/empresa/premios"
            className="shrink-0 px-4 py-2 bg-[#002B72] text-white text-[13px] font-black rounded-xl hover:bg-[#00318A] transition-all"
          >
            Configurar
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[20px]">🎁</span>
          <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Premio de esta semana</h3>
        </div>
        <a href="/empresa/premios" className="text-[12px] font-bold text-[#003FA3] hover:underline">
          Editar
        </a>
      </div>
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          {prizes.map((p, i) => (
            <span key={i} className="text-[14px] font-bold text-[#0D1A3A]">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {p.description}
            </span>
          ))}
        </div>
        <a
          href="/empresa/notificaciones"
          className="shrink-0 px-4 py-2.5 bg-[#25D366] text-white text-[13px] font-black rounded-xl hover:opacity-90 transition-all"
        >
          💬 Notificar ganador
        </a>
      </div>
    </div>
  )
}
