'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/empresa/dashboard',      icon: '🏠', label: 'Inicio' },
  { href: '/empresa/participantes',  icon: '👥', label: 'Participantes' },
  { href: '/empresa/ranking',        icon: '🏆', label: 'Ranking' },
  { href: '/empresa/partidos',       icon: '⚽', label: 'Partidos' },
  { href: '/empresa/premios',        icon: '🎁', label: 'Premios' },
  { href: '/empresa/promos',         icon: '🏷️', label: 'Mis Promos' },
  { href: '/empresa/notificaciones', icon: '🔔', label: 'Notificaciones' },
  { href: '/empresa/configuracion',  icon: '⚙️', label: 'Configuración' },
]

export function EmpresaSidebar() {
  const path = usePathname()
  return (
    <aside className="w-64 bg-[#002B72] flex flex-col min-h-screen fixed left-0 top-0 bottom-0 z-50 shadow-xl">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">⚽</div>
          <div>
            <div className="font-bebas text-white text-lg tracking-wider">PRODE MUNDIAL</div>
            <div className="text-white/40 text-xs font-semibold uppercase">Panel empresa</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {nav.map(item => {
          const active = path === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all
                ${active
                  ? 'bg-white/15 text-white shadow-inner border-l-4 border-[#F5C518]'
                  : 'text-white/50 hover:bg-white/8 hover:text-white/80'}`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 bg-white/8 rounded-xl p-3 cursor-pointer hover:bg-white/12 transition-all">
          <div className="w-9 h-9 rounded-full bg-[#F5C518] flex items-center justify-center font-black text-[#002B72] text-sm">DG</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-bold truncate">Daniel García</div>
            <div className="text-white/40 text-xs">Administrador</div>
          </div>
          <span className="text-white/30 text-sm">⋮</span>
        </div>
      </div>
    </aside>
  )
}
