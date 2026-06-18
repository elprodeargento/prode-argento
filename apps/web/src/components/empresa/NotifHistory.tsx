'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { apiGet } from '@/lib/api'

interface NotifLog {
  id: string
  channel: 'whatsapp' | 'push'
  recipients: string
  message: string
  sent: number
  failed: number
  skipped: number
  sent_at: string
}

const RECIPIENT_LABEL: Record<string, string> = {
  all: 'Todos',
  no_pred: 'Sin pronósticos',
  no_pred_today: 'Sin pronósticos hoy',
  top10: 'Top 10',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hs = Math.floor(mins / 60)
  if (hs < 24) return `Hace ${hs}h`
  const days = Math.floor(hs / 24)
  return `Hace ${days} día${days !== 1 ? 's' : ''}`
}

export function NotifHistory() {
  const [logs, setLogs] = useState<NotifLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<NotifLog[]>('/notifications/history')
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="card">
      <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
        <span className="text-[20px]">📋</span>
        <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Historial de envíos</h3>
      </div>

      <div className="p-4 flex flex-col gap-[10px]">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-[#8E96AE]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="text-3xl">📭</span>
            <div className="text-[14px] font-extrabold text-[#0D1A3A]">Sin envíos todavía</div>
            <div className="text-[12px] text-[#8E96AE] font-medium">Cada notificación que enviés aparecerá acá</div>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-[14px] bg-[#F1F3F9] rounded-[10px] border-[1.5px] border-[#DDE1EF]"
            >
              <div className="flex justify-between items-start gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{log.channel === 'whatsapp' ? '💬' : '🔔'}</span>
                  <span className="text-[13px] font-extrabold text-[#0D1A3A] truncate">
                    {log.message.slice(0, 60)}{log.message.length > 60 ? '…' : ''}
                  </span>
                </div>
                <span className={`shrink-0 text-[11px] font-black px-2 py-0.5 rounded-md border ${
                  log.sent > 0
                    ? 'bg-[#E8F8F1] text-[#18A06A] border-[#18A06A]/10'
                    : 'bg-[#FDECEB] text-[#D93025] border-[#D93025]/10'
                }`}>
                  {log.sent > 0 ? `✓ ${log.sent} enviados` : 'Sin envíos'}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#8E96AE] font-medium">
                <span>{RECIPIENT_LABEL[log.recipients] ?? log.recipients}</span>
                {log.skipped > 0 && <span>· {log.skipped} sin tel.</span>}
                {log.failed > 0 && <span className="text-[#D93025]">· {log.failed} fallidos</span>}
                <span>· {timeAgo(log.sent_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
