'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

interface Step {
  id: string
  done: boolean
  icon: string
  title: string
  desc: string
  href: string
  cta: string
}

export function DashboardChecklist({ business }: { business: any }) {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 'logo',
      done: !!business.logo_url,
      icon: '🖼️',
      title: 'Subí el logo de tu comercio',
      desc: 'Tus clientes van a ver tu marca en cada partido.',
      href: '/empresa/configuracion',
      cta: 'Subir logo',
    },
    {
      id: 'prize',
      done: false,
      icon: '🎁',
      title: 'Configurá un premio',
      desc: 'Los premios son la razón por la que tus clientes vuelven al local.',
      href: '/empresa/premios',
      cta: 'Configurar premio',
    },
    {
      id: 'participants',
      done: (business.total_participants || 0) >= 3,
      icon: '👥',
      title: 'Sumá tus primeros clientes',
      desc: 'Compartí el link con al menos 3 clientes para arrancar.',
      href: '/empresa/participantes',
      cta: 'Ver link',
    },
    {
      id: 'notification',
      done: false,
      icon: '💬',
      title: 'Enviá tu primer mensaje',
      desc: 'Contactá a tus clientes antes del primer partido.',
      href: '/empresa/notificaciones',
      cta: 'Enviar mensaje',
    },
  ])

  useEffect(() => {
    apiGet<{ id: string }[]>('/prizes/me')
      .then(data => {
        setSteps(prev =>
          prev.map(s => s.id === 'prize' ? { ...s, done: data?.length > 0 } : s)
        )
      })
      .catch(() => {})
  }, [])

  const completedSteps = steps.filter(s => s.done).length
  const totalSteps = steps.length

  if (completedSteps === totalSteps) return null

  const progressPct = (completedSteps / totalSteps) * 100

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #002B72, #003FA3)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[15px] font-black text-white">🚀 Primeros pasos</div>
          <div className="text-[12px] font-bold text-white/70">
            {completedSteps} de {totalSteps} completados
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/20">
          <div
            className="h-1.5 rounded-full bg-[#F5C518] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
      <div className="divide-y divide-[#DDE1EF]">
        {steps.map(step => (
          <div
            key={step.id}
            className={`px-5 py-4 flex items-center gap-4 ${step.done ? 'bg-[#F1F3F9]' : 'bg-white'}`}
          >
            <span className="text-[22px] shrink-0">{step.done ? '✅' : step.icon}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-[14px] font-bold ${step.done ? 'line-through text-[#8E96AE]' : 'text-[#0D1A3A]'}`}>
                {step.title}
              </div>
              {!step.done && (
                <div className="text-[13px] text-[#5A6480] font-medium mt-0.5">{step.desc}</div>
              )}
            </div>
            {!step.done && (
              <a
                href={step.href}
                className="shrink-0 px-3 py-1.5 bg-[#002B72] text-white text-[12px] font-black rounded-lg hover:bg-[#00318A] transition-all"
              >
                {step.cta}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
