'use client'

import { useState } from 'react'
import { NotifForm } from '@/components/empresa/NotifForm'
import { NotifHistory } from '@/components/empresa/NotifHistory'
import { NotifNoPushStat } from '@/components/empresa/NotifNoPushStat'

export default function NotificacionesPage() {
  const [historyKey, setHistoryKey] = useState(0)

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">Notificaciones</h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Enviá mensajes a tus participantes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <NotifForm onSent={() => setHistoryKey(k => k + 1)} />
        <div className="flex flex-col gap-3">
          <NotifNoPushStat />
          <NotifHistory key={historyKey} />
        </div>
      </div>
    </div>
  )
}
