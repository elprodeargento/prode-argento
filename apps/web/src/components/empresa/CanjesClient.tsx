'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface ReferralsData {
  points: number
}

const PRIZES = [
  {
    icon: '🏅',
    titulo: 'Insignia Embajador',
    desc: 'Tu perfil muestra la insignia de Embajador visible para tus clientes',
    puntos: 10,
    color: '#5A6480',
  },
  {
    icon: '💰',
    titulo: 'Cashback $12.000',
    desc: 'Te devolvemos $12.000 a tu cuenta de MercadoPago',
    puntos: 30,
    color: '#18A06A',
  },
  {
    icon: '⚡',
    titulo: 'Plan Pro gratis',
    desc: 'Activá el plan Pro sin costo durante todo el mundial',
    puntos: 50,
    color: '#002B72',
  },
  {
    icon: '💵',
    titulo: 'Cashback $40.000',
    desc: 'Te devolvemos el valor completo de un plan Pro a tu MercadoPago',
    puntos: 50,
    color: '#003FA3',
  },
  {
    icon: '👑',
    titulo: 'Plan Premium gratis',
    desc: 'Activá el plan Premium sin costo durante todo el mundial',
    puntos: 100,
    color: '#F5C518',
    colorText: '#002B72',
  },
  {
    icon: '💵',
    titulo: 'Cashback $80.000',
    desc: 'Te devolvemos el valor completo de un plan Premium a tu MercadoPago',
    puntos: 100,
    color: '#0D1A3A',
  },
]

export function CanjesClient() {
  const [points, setPoints] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<ReferralsData>('/referrals/me')
      .then(data => setPoints(data.points))
      .catch(() => setPoints(0))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#8E96AE]" />
      </div>
    )
  }

  const currentPoints = points ?? 0

  return (
    <div className="space-y-5">

      {/* Badge puntos disponibles */}
      <div className="flex items-center gap-3 bg-[#E6EEF9] rounded-2xl px-5 py-3">
        <span className="text-[22px]">🎯</span>
        <div className="text-[14px] font-black text-[#0D1A3A]">
          {currentPoints} pts disponibles
        </div>
      </div>

      {/* Grilla de premios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRIZES.map(prize => {
          const canRedeem = currentPoints >= prize.puntos
          const missing = prize.puntos - currentPoints

          return (
            <div
              key={prize.titulo}
              className={`card overflow-hidden transition-all ${!canRedeem ? 'opacity-60 grayscale' : ''}`}
            >
              <div
                className="px-5 py-4 flex items-center gap-3"
                style={{ background: prize.color }}
              >
                <span className="text-[28px]">{prize.icon}</span>
                <div>
                  <div className="text-[15px] font-black" style={{ color: prize.colorText }}>
                    {prize.titulo}
                  </div>
                  <div className="text-[12px] font-bold opacity-80" style={{ color: prize.colorText }}>
                    {prize.puntos} puntos
                  </div>
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-[13px] text-[#5A6480] font-medium mb-4">{prize.desc}</p>
                {canRedeem ? (
                  <button
                    onClick={() => alert('¡Solicitud enviada! Nos contactaremos por WhatsApp en las próximas 24hs.')}
                    className="w-full py-2.5 rounded-xl text-[13px] font-black text-white transition-all hover:opacity-90"
                    style={{ background: prize.color }}
                  >
                    Canjear
                  </button>
                ) : (
                  <div className="flex items-center gap-2 justify-center py-2.5 rounded-xl bg-[#F1F3F9] text-[13px] font-bold text-[#8E96AE]">
                    🔒 Te faltan {missing} punto{missing !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
