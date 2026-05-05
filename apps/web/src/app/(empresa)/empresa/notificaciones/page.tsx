import type { Metadata } from 'next'
import { NotifForm } from '@/components/empresa/NotifForm'
import { NotifHistory } from '@/components/empresa/NotifHistory'

export const metadata: Metadata = { title: 'Notificaciones' }

export default function NotificacionesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">
            Notificaciones
          </h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Enviá mensajes a tus participantes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <NotifForm />
        <NotifHistory />
      </div>
    </div>
  )
}
