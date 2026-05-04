'use client'
import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/empresa/dashboard':      'Inicio',
  '/empresa/participantes':  'Participantes',
  '/empresa/ranking':        'Ranking',
  '/empresa/partidos':       'Partidos',
  '/empresa/premios':        'Premios',
  '/empresa/promos':         'Mis Promos',
  '/empresa/notificaciones': 'Notificaciones',
  '/empresa/configuracion':  'Configuración',
}

export function EmpresaHeader() {
  const path = usePathname()
  const title = titles[path] ?? 'Panel'
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-7 z-40 shadow-sm">
      <div>
        <span className="text-xs text-slate-400 font-semibold">Prode 2026 › </span>
        <span className="text-base font-black text-slate-900">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-lg hover:bg-slate-100 transition-all">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>
        <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all">
          👁️ Ver prode
        </button>
        <button className="flex items-center gap-2 bg-[#002B72] text-white rounded-xl px-3 py-2 text-sm font-bold hover:bg-[#00318A] transition-all">
          🔗 Compartir
        </button>
      </div>
    </header>
  )
}
