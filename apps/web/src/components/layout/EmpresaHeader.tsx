'use client'
import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/empresa/dashboard': 'Inicio',
  '/empresa/participantes': 'Participantes',
  '/empresa/ranking': 'Ranking',
  '/empresa/partidos': 'Partidos',
  '/empresa/premios': 'Premios',
  '/empresa/promos': 'Mis Promos',
  '/empresa/notificaciones': 'Notificaciones',
  '/empresa/configuracion': 'Configuración',
}

export function EmpresaHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const path = usePathname()
  const title = titles[path] ?? 'Panel'
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-[64px] bg-white border-b border-[#DDE1EF] flex items-center justify-between px-7 z-[100] shadow-[0_2px_16px_rgba(0,43,114,0.08)]">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-2xl text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          ☰
        </button>
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#5A6480]">
          <span>Prode 2026</span>
          <span className="text-[#8E96AE]">›</span>
          <span className="text-[#0D1A3A] text-base font-extrabold">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button className="relative w-10 h-10 bg-[#F1F3F9] border-[1.5px] border-[#DDE1EF] rounded-xl flex items-center justify-center text-[18px] hover:bg-[#DDE1EF] transition-all">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D93025] rounded-full border-2 border-white" />
        </button>

        <button className="hidden md:flex items-center gap-1.5 bg-[#F1F3F9] border-[1.5px] border-[#DDE1EF] rounded-xl px-4 py-[9px] text-[13px] font-bold text-[#5A6480] hover:bg-[#DDE1EF] transition-all">
          👁️ Ver prode
        </button>
        <button className="flex items-center gap-2 bg-[#002B72] text-white rounded-xl px-4 py-[9px] text-[13px] font-extrabold hover:bg-[#00318A] transition-all shadow-lg shadow-[#002B72]/20">
          <span className="hidden sm:inline">🔗 Compartir link</span>
          <span className="sm:hidden">🔗 Link</span>
        </button>
      </div>
    </header>
  )
}
