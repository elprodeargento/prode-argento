'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { History, Mail, MessageSquare } from 'lucide-react'

const history = [
  { id: '1', title: 'Recordatorio Fecha 2', status: 'Enviado', recipients: 87, channel: 'Email', date: 'Hace 1 día' },
  { id: '2', title: 'Resultado Fecha 1', status: 'Enviado', recipients: 87, channel: 'Email', date: 'Hace 3 días' },
  { id: '3', title: 'Bienvenida al prode', status: 'Enviado', recipients: 87, channel: 'Email + WhatsApp', date: 'Hace 7 días' },
]

export function NotifHistory() {
  return (
    <div className="card">
      <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
        <span className="text-[20px]">📋</span>
        <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Historial de envíos</h3>
      </div>

      <div className="p-4 flex flex-col gap-[10px]">
        {history.map((item) => (
          <div 
            key={item.id}
            className="p-[14px] bg-[#F1F3F9] rounded-[10px] border-[1.5px] border-[#DDE1EF]"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[13px] font-extrabold text-[#0D1A3A]">{item.title}</span>
              <span className="bg-[#E8F8F1] text-[#18A06A] text-[11px] font-black px-2 py-0.5 rounded-md border border-[#18A06A]/10">
                Enviado
              </span>
            </div>
            <div className="text-[12px] text-[#8E96AE] font-medium">
              {item.recipients} destinatarios · {item.channel} · {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
