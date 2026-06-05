'use client'

import { useEffect, useRef, useState } from 'react'
import { apiGet } from '@/lib/api'

interface GrowthDay {
  label: string
  count: number
}

export function DashboardActivity() {
  const [data, setData]           = useState<GrowthDay[] | null>(null)
  const [hovered, setHovered]     = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; side: 'left' | 'right' }>({ x: 0, side: 'left' })
  const containerRef              = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiGet<GrowthDay[]>('/participants/me/growth')
      .then(rows => setData(rows))
      .catch(() => setData([]))
  }, [])

  const counts = data?.map(d => d.count) ?? []
  const max    = counts.length > 0 ? Math.max(...counts, 1) : 1
  const total  = counts.reduce((a, b) => a + b, 0)

  function handleMouseEnter(i: number, e: React.MouseEvent<HTMLDivElement>) {
    setHovered(i)
    if (!containerRef.current) return
    const rect      = containerRef.current.getBoundingClientRect()
    const barRect   = e.currentTarget.getBoundingClientRect()
    const barCenter = barRect.left + barRect.width / 2 - rect.left
    const side      = barCenter > rect.width / 2 ? 'right' : 'left'
    setTooltipPos({ x: barCenter, side })
  }

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

        {/* Chart */}
        <div
          ref={containerRef}
          className="relative"
          onMouseLeave={() => setHovered(null)}
        >
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
              {data.map((day, i) => {
                const isHovered = hovered === i
                const isToday   = i === data.length - 1
                return (
                  <div
                    key={i}
                    className="flex-1 h-full flex flex-col justify-end cursor-default"
                    onMouseEnter={e => handleMouseEnter(i, e)}
                  >
                    <div
                      className={`rounded-t-[4px] transition-all duration-150 ${
                        isToday
                          ? isHovered ? 'bg-[#e6b800]' : 'bg-[#F5C518]'
                          : isHovered ? 'bg-[#8E96AE]' : 'bg-[#DDE1EF]'
                      }`}
                      style={{
                        height: day.count > 0
                          ? `${Math.max(10, Math.round((day.count / max) * 100))}%`
                          : '4px',
                      }}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* Tooltip */}
          {hovered !== null && data !== null && (
            <div
              className="absolute bottom-[calc(100%+8px)] pointer-events-none z-10"
              style={{
                left:      tooltipPos.side === 'left'  ? tooltipPos.x      : undefined,
                right:     tooltipPos.side === 'right' ? `calc(100% - ${tooltipPos.x}px)` : undefined,
                transform: tooltipPos.side === 'left'  ? 'translateX(-50%)' : 'translateX(50%)',
              }}
            >
              <div className="bg-[#0D1A3A] text-white rounded-[10px] px-[12px] py-[8px] shadow-lg text-center whitespace-nowrap">
                <div className="text-[11px] font-semibold text-[#8E96AE] mb-[2px]">
                  {hovered === data.length - 1 ? 'Hoy' : data[hovered].label}
                </div>
                <div className="text-[18px] font-black leading-none">
                  {data[hovered].count}
                </div>
                <div className="text-[11px] font-semibold text-[#B0B8CC] mt-[2px]">
                  {data[hovered].count === 1 ? 'nuevo participante' : 'nuevos participantes'}
                </div>
              </div>
              {/* Arrow */}
              <div
                className="w-0 h-0 mx-auto"
                style={{
                  borderLeft:  '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop:   '5px solid #0D1A3A',
                }}
              />
            </div>
          )}
        </div>

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
