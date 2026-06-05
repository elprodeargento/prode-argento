'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

interface GrowthDay {
  label: string
  count: number
}

export function DashboardActivity() {
  const [data, setData] = useState<GrowthDay[] | null>(null)

  useEffect(() => {
    apiGet<GrowthDay[]>('/participants/me/growth')
      .then(rows => setData(rows))
      .catch(() => setData([]))
  }, [])

  const counts = data?.map(d => d.count) ?? []
  const max = counts.length > 0 ? Math.max(...counts, 1) : 1
  const total = counts.reduce((a, b) => a + b, 0)

  return (
    <div className="card">
      <div className="px-[20px] py-[14px] border-b border-[#DDE1EF] flex items-center justify-between">
        <div className="text-[14px] font-extrabold text-[#0D1A3A] flex items-center gap-2">
          <span className="text-[18px]">📈</span> Crecimiento de tu comunidad
        </div>
        <span className="text-[13px] font-bold text-[#8E96AE]">
          {data === null ? '…' : `+${total} esta semana`}
        </span>
      </div>
      <div className="p-[20px]">
        <div className="text-[12px] font-bold text-[#8E96AE] mb-[12px] uppercase tracking-wider">
          Participantes nuevos — últimos 7 días
        </div>

        {data === null ? (
          // Loading skeleton
          <div className="flex items-end gap-2 h-[64px]">
            {[30, 55, 40, 20, 70, 45, 60].map((pct, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end">
                <div
                  className="rounded-t-[4px] bg-[#EEF0F6] animate-pulse"
                  style={{ height: `${pct}%` }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-end gap-2 h-[64px]">
            {data.map((day, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end">
                <div
                  className={`rounded-t-[4px] transition-all ${
                    i === data.length - 1
                      ? 'bg-[#F5C518]'
                      : 'bg-[#DDE1EF] hover:bg-[#B0B8CC]'
                  }`}
                  style={{
                    height: day.count > 0
                      ? `${Math.max(10, Math.round((day.count / max) * 100))}%`
                      : '4px',
                  }}
                  title={`${day.label}: ${day.count} ${day.count === 1 ? 'persona' : 'personas'}`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-[8px]">
          <span className="text-[11px] font-bold text-[#B0B8CC]">
            {data?.[0]?.label ?? '…'}
          </span>
          <span className="text-[11px] font-bold text-[#B0B8CC]">Hoy</span>
        </div>
      </div>
    </div>
  )
}
