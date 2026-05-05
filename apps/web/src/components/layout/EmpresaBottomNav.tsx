'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PRIMARY_TABS = [
  { href: '/empresa/dashboard',     icon: '🏠', label: 'Inicio' },
  { href: '/empresa/participantes', icon: '👥', label: 'Participantes' },
  { href: '/empresa/ranking',       icon: '🏆', label: 'Ranking' },
  { href: '/empresa/partidos',      icon: '⚽', label: 'Partidos' },
]

interface EmpresaBottomNavProps {
  onOpenSidebar: () => void
}

export function EmpresaBottomNav({ onOpenSidebar }: EmpresaBottomNavProps) {
  const path = usePathname()

  const isPrimaryActive = PRIMARY_TABS.some(t => t.href === path)
  const isMoreActive = !isPrimaryActive

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-slate-200 flex items-stretch shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      {PRIMARY_TABS.map(tab => {
        const active = path === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
              active ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <span className={`text-xl leading-none transition-transform ${active ? 'scale-110' : ''}`}>
              {tab.icon}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-tight ${active ? 'text-blue-600' : 'text-slate-400'}`}>
              {tab.label}
            </span>
            {active && (
              <span className="absolute bottom-0 h-0.5 w-10 bg-blue-600 rounded-full" />
            )}
          </Link>
        )
      })}

      {/* Más → opens sidebar */}
      <button
        onClick={onOpenSidebar}
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
          isMoreActive ? 'text-blue-600' : 'text-slate-400'
        }`}
      >
        <span className={`text-xl leading-none transition-transform ${isMoreActive ? 'scale-110' : ''}`}>☰</span>
        <span className={`text-[10px] font-black uppercase tracking-tight ${isMoreActive ? 'text-blue-600' : 'text-slate-400'}`}>
          Más
        </span>
        {isMoreActive && (
          <span className="absolute bottom-0 h-0.5 w-10 bg-blue-600 rounded-full" />
        )}
      </button>
    </nav>
  )
}
