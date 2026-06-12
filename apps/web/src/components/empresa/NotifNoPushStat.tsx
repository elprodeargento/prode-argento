'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

export function NotifNoPushStat() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    apiGet<{ count: number }>('/notifications/no-pred-no-push-count')
      .then((r) => setCount(r.count))
      .catch(() => setCount(null))
  }, [])

  if (!count) return null

  return (
    <div className="card px-[18px] py-[14px] flex items-center gap-3 bg-[#FFF7E6] border-[1.5px] border-[#B7791F]/20">
      <span className="text-[20px]">⚠️</span>
      <p className="text-[13px] font-bold text-[#0D1A3A]">
        {count} participante{count !== 1 ? 's' : ''} no cargó pronósticos y no tiene notificaciones push habilitadas
      </p>
    </div>
  )
}
