'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SOCIAL_ENABLED } from '@/lib/features'

const TIPS = [
  {
    emoji: '🎯',
    titulo: 'Usá los partidos como excusa para aparecer',
    texto: 'Antes de cada partido tenés una razón perfecta para contactar a tus clientes. Un mensaje el día del partido tiene 10 veces más chances de generar una visita que un mensaje cualquier día.',
  },
  {
    emoji: '🎁',
    titulo: 'El ganador vuelve, los demás también',
    texto: 'Cuando avisás quién ganó el premio semanal, todos los demás se enteran. Los que perdieron quieren revancha la semana siguiente. Eso son visitas recurrentes a tu local.',
  },
  {
    emoji: '👥',
    titulo: 'Cada cliente nuevo es un contacto directo',
    texto: 'Cada persona que se suma a tu prode te está dando acceso directo a su WhatsApp o email. Al terminar el mundial vas a tener una lista de clientes reales a los que podés comunicarte cuando quieras.',
  },
  {
    emoji: '📅',
    titulo: 'Presencia semanal sin esfuerzo',
    texto: 'El prode te da una razón para aparecer frente a tus clientes cada semana durante dos meses. Ninguna campaña de marketing te da eso tan barato.',
  },
  {
    emoji: '📱',
    titulo: 'Tu local como punto de entrada',
    texto: 'Imprimí el QR y pegalo en la caja, en la puerta o en las mesas. Cada cliente que entra puede sumarse al instante. Los que juegan vuelven.',
  },
]

export function DashboardTips() {
  const activeTips = SOCIAL_ENABLED ? TIPS : TIPS.map(t => 
    t.emoji === '👥' 
      ? { ...t, texto: 'Cada persona que se suma a tu prode te está dando acceso directo a su email. Al terminar el mundial vas a tener una lista de clientes reales a los que podés comunicarte cuando quieras.' }
      : t
  )
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  const navigate = (idx: number) => {
    setVisible(false)
    setTimeout(() => {
      setCurrent(((idx % activeTips.length) + activeTips.length) % activeTips.length)
      setVisible(true)
    }, 200)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(c => (c + 1) % activeTips.length)
        setVisible(true)
      }, 200)
    }, 20000)
    return () => clearInterval(timer)
  }, [activeTips.length])

  const tip = activeTips[current]

  return (
    <div className="rounded-2xl px-6 py-5" style={{ background: 'linear-gradient(135deg, #002B72, #003FA3)' }}>
      <div
        className="flex flex-col gap-2 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <span className="text-3xl">{tip.emoji}</span>
        <div className="text-[15px] font-black text-white">{tip.titulo}</div>
        <div className="text-[13px] font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{tip.texto}</div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => navigate(current - 1)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors text-white"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {TIPS.map((_, i) => (
            <button
              key={i}
              onClick={() => navigate(i)}
              className="w-1.5 h-1.5 rounded-full transition-colors"
              style={{ background: i === current ? 'white' : 'rgba(255,255,255,0.3)' }}
            />
          ))}
        </div>
        <button
          onClick={() => navigate(current + 1)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors text-white"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
