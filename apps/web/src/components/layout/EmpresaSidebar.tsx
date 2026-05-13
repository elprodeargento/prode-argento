'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { apiGet } from '@/lib/api'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/empresa/dashboard', icon: '🏠', label: 'Inicio', iconColor: '#003FA3', badgeKey: null },
      { href: '/empresa/participantes', icon: '👥', label: 'Participantes', iconColor: '#18A06A', badgeKey: 'participants' },
      { href: '/empresa/ranking', icon: '🏆', label: 'Ranking', iconColor: '#F5C518', badgeKey: null },
      { href: '/empresa/partidos', icon: '⚽', label: 'Partidos', iconColor: '#003FA3', badgeKey: null },
    ]
  },
  {
    label: 'Gestión',
    items: [
      { href: '/empresa/configuracion', icon: '⚙️', label: 'Configuración', iconColor: '#003FA3', badgeKey: null },
      { href: '/empresa/premios', icon: '🎁', label: 'Premios', iconColor: '#F5C518', badgeKey: null },
      { href: '/empresa/notificaciones', icon: '🔔', label: 'Notificaciones', iconColor: '#D93025', badgeKey: null },
      { href: '/empresa/promos', icon: '🏷️', label: 'Mis Promos', iconColor: '#18A06A', badgeKey: null },
      { href: '/empresa/planes', icon: '💳', label: 'Planes', iconColor: '#F5C518', badgeKey: null },
      { href: '/empresa/referidos', icon: '🤝', label: 'Referidos', iconColor: '#18A06A', badgeKey: 'referral_points' },
    ]
  },
  {
    label: 'Cuenta',
    items: [
      { href: '/ayuda', icon: '❓', label: 'Ayuda', iconColor: '#5A6480', badgeKey: null },
    ]
  }
]

interface Business { name: string; logo_url?: string | null }

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function EmpresaSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [badges, setBadges] = useState<Record<string, string>>({})
  const [business, setBusiness] = useState<Business | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    apiGet<{ data: unknown[]; total: number }>('/participants/me?page=1&limit=1')
      .then(res => setBadges(prev => ({ ...prev, participants: String(res.total) })))
      .catch(() => {})

    apiGet<{ points: number }>('/referrals/me')
      .then(res => { if (res.points > 0) setBadges(prev => ({ ...prev, referral_points: String(res.points) })) })
      .catch(() => {})

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserName(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '')
      setUserEmail(user.email || '')

      const { data: biz } = await supabase
        .from('businesses')
        .select('name, logo_url')
        .eq('admin_user_id', user.id)
        .single()
      if (biz) setBusiness(biz)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/empresa/login')
  }

  const companyName = business?.name ?? ''
  const userInitials = userName ? initials(userName) : '?'

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 bottom-0 w-[260px] bg-[#002B72] flex flex-col z-[200] shadow-[4px_0_32px_rgba(0,43,114,0.25)] border-r border-white/10 sidebar-transition
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="pt-6 px-6 pb-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-[44px] h-[44px] shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-[22px] border-[1.5px] border-white/20 overflow-hidden">
            {business?.logo_url
              ? <img src={business.logo_url} alt="" className="w-full h-full object-contain" />
              : '⚽'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bebas text-white text-[17px] tracking-[1px] leading-[1.1] truncate uppercase">
              {companyName || '—'}
            </div>
            <div className="text-white/50 text-[11px] font-semibold uppercase tracking-[0.06em] mt-0.5">Panel Comercio</div>
          </div>
          <button onClick={onClose} className="lg:hidden shrink-0 text-white/50 hover:text-white">
            <span className="text-xl">✕</span>
          </button>
        </div>

        <nav className="flex-1 pt-4 px-3 pb-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="px-3 text-[10px] font-extrabold text-white/35 uppercase tracking-[0.1em] pt-[14px] pb-[6px]">{group.label}</div>
              {group.items.map(item => {
                const active = path === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { if (window.innerWidth < 1024) onClose() }}
                    className={`flex items-center gap-3 px-[14px] py-[13px] rounded-xl text-sm font-bold transition-all relative group
                      ${active
                        ? 'bg-white/15 text-white shadow-[inset_3px_0_0_#F5C518]'
                        : 'text-white/65 hover:bg-white/10 hover:text-white/90'}`}>
                    <span
                      className="text-[20px] w-6 text-center transition-all opacity-100 group-hover:scale-110"
                      style={{ color: item.iconColor }}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badgeKey && badges[item.badgeKey] && (
                      <span className="bg-[#F5C518] text-[#002B72] text-[11px] font-black px-2 py-0.5 rounded-full min-w-[22px] text-center shadow-sm">
                        {badges[item.badgeKey]}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3.5">
            <div className="w-[38px] h-[38px] rounded-full bg-[#F5C518] flex items-center justify-center font-black text-[#002B72] text-[16px] shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[13px] font-bold truncate">{userName || userEmail || '—'}</div>
              <div className="text-white/50 text-[11px] font-semibold">Administrador</div>
            </div>
            <button onClick={handleLogout} title="Cerrar sesión" className="text-white/40 hover:text-white transition-colors p-1">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
