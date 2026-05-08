'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { apiPost, apiGet } from '@/lib/api'
import { Check } from 'lucide-react'

type Plan = 'free' | 'premium' | 'pro'

interface Business { plan: Plan }

const PLANS = [
  {
    id: 'free' as Plan,
    name: 'Free',
    price: 0,
    priceLabel: 'Gratis',
    color: '#5A6480',
    features: [
      'Hasta 5 participantes',
      'Todo el mundial',
      'Ranking en tiempo real',
      'Página pública con tu marca',
    ],
    cta: 'Plan actual',
    highlight: false,
  },
  {
    id: 'pro' as Plan,
    name: 'Pro',
    price: 40000,
    priceLabel: '$40.000',
    color: '#002B72',
    features: [
      'Participantes ilimitados',
      'Todo lo del plan Free',
      'Premios semanales configurables',
      'Notificaciones por WhatsApp',
      'Publicar podio en Instagram',
      'QR descargable para tu local',
      'Exportar lista de participantes',
    ],
    cta: 'Contratar Pro',
    highlight: true,
  },
  {
    id: 'premium' as Plan,
    name: 'Premium',
    price: 80000,
    priceLabel: '$80.000',
    color: '#F5C518',
    colorText: '#002B72',
    features: [
      'Todo lo del plan Pro',
      'Publicidad geolocalizada en la zona',
      'Estadísticas de visualizaciones',
      'Soporte por WhatsApp',
      'Exportar lista de participantes',
    ],
    cta: 'Contratar Premium',
    highlight: false,
  },
]

export function PlanesClient() {
  const searchParams = useSearchParams()
  const [currentPlan, setCurrentPlan] = useState<Plan>('free')
  const [loading, setLoading] = useState<Plan | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    apiGet<Business>('/businesses/me')
      .then(b => setCurrentPlan(b.plan))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const status = searchParams.get('status')
    const plan = searchParams.get('plan')
    if (status === 'approved' && plan) {
      setToast({ msg: `¡Plan ${plan} activado correctamente!`, type: 'success' })
      setCurrentPlan(plan as Plan)
      setTimeout(() => setToast(null), 5000)
    } else if (status === 'error') {
      setToast({ msg: 'Hubo un error con el pago. Intentá de nuevo.', type: 'error' })
      setTimeout(() => setToast(null), 5000)
    }
  }, [searchParams])

  const handleCheckout = async (plan: Plan) => {
    if (plan === 'free') return
    setLoading(plan)
    try {
      const { initPoint } = await apiPost<{ initPoint: string }>('/payments/checkout', { plan })
      window.location.href = initPoint
    } catch (e: any) {
      setToast({ msg: e.message ?? 'Error al iniciar el pago', type: 'error' })
      setTimeout(() => setToast(null), 4000)
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-2xl shadow-xl font-bold text-white text-sm
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl items-start">
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id
          const isUpgrade = plan.id !== 'free' && !isCurrent
          const isLoading = loading === plan.id

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-[1.5px] p-6 flex flex-col gap-5 transition-all duration-300
                ${isCurrent
                  ? 'border-[#002B72] bg-[#F5F8FF] shadow-lg'
                  : 'border-[#DDE1EF] hover:shadow-md'
                }`}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#002B72] text-white text-xs font-black px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                  ✦ Tu plan actual
                </div>
              )}

              {!isCurrent && plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#002B72] text-white text-[10px] font-black px-4 py-1 rounded-full">
                  MÁS POPULAR
                </div>
              )}

              <div>
                <div className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: isCurrent ? '#002B72' : plan.color }}>
                  {plan.name}
                </div>
                <div className="font-bebas text-[42px] text-[#0D1A3A] leading-none">{plan.priceLabel}</div>
                {plan.price > 0 && (
                  <div className="text-[12px] text-[#8E96AE] font-medium mt-1">pago único · + IVA</div>
                )}
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#2D3A5A] font-medium">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => isUpgrade && handleCheckout(plan.id)}
                disabled={isCurrent || isLoading || plan.id === 'free'}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all
                  ${isCurrent
                    ? 'bg-[#002B72] text-white cursor-default'
                    : plan.id === 'free'
                    ? 'bg-[#F1F3F9] text-[#8E96AE] cursor-default'
                    : plan.id === 'pro'
                    ? 'bg-[#002B72] text-white hover:bg-[#00318A] disabled:opacity-60'
                    : 'bg-[#F5C518] text-[#002B72] hover:bg-yellow-300 disabled:opacity-60'
                  }`}
              >
                {isLoading ? 'Redirigiendo...' : isCurrent ? '✓ Plan actual' : plan.cta}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-[#8E96AE] mt-2">
        Los pagos se procesan de forma segura a través de Mercado Pago. El plan es válido por todo el mundial.
      </p>
    </>
  )
}
