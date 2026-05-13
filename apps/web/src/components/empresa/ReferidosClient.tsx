'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import { Loader2 } from 'lucide-react'
import { ReferidosTermsModal } from '@/components/shared/ReferidosTermsModal'

interface Referral {
  id: string
  status: 'pending' | 'paid'
  points_awarded: number
  created_at: string
  referred: { name: string; slug: string } | null
}

interface ReferralsData {
  points: number
  referralUrl: string
  referrals: Referral[]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ReferidosClient() {
  const [data, setData] = useState<ReferralsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const handleReferidosAction = (action: () => void) => {
    const accepted = localStorage.getItem('referidos-terms-accepted') === 'true'
    if (accepted) {
      action()
    } else {
      setPendingAction(() => action)
      setShowTermsModal(true)
    }
  }

  useEffect(() => {
    apiGet<ReferralsData>('/referrals/me')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleCopy = async () => {
    if (!data?.referralUrl) return
    trackEvent('biz_referral_link_copied')
    await navigator.clipboard?.writeText(data.referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waText = encodeURIComponent(
    `Creá tu propio prode del Mundial 2026 con la imagen de tu comercio. Entrá acá: ${data?.referralUrl ?? ''}`
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#8E96AE]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Card de puntos */}
      <div className="card p-6 text-center">
        <div className="font-bebas text-6xl text-[#002B72] leading-none">{data?.points ?? 0}</div>
        <div className="text-[14px] text-[#5A6480] font-medium mt-1">puntos acumulados</div>
        <a href="/empresa/canjes" className="inline-block mt-3 text-[13px] font-bold text-[#003FA3] hover:underline">
          Ver canjes disponibles →
        </a>
      </div>

      {/* Card de link */}
      <div className="card p-5">
        <div className="text-[14px] font-extrabold text-[#0D1A3A] mb-3">🔗 Tu link de referido</div>
        <div className="flex gap-2 mb-3">
          <input
            readOnly
            value={data?.referralUrl ?? ''}
            className="flex-1 rounded-xl border border-[#DDE1EF] bg-[#F1F3F9] px-3 py-2.5 text-[13px] text-[#0D1A3A] font-medium outline-none"
          />
          <button
            onClick={() => handleReferidosAction(handleCopy)}
            className="shrink-0 px-4 py-2.5 bg-[#002B72] text-white text-[13px] font-black rounded-xl hover:bg-[#00318A] transition-all"
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
        <button
          onClick={() => handleReferidosAction(() => {
            trackEvent('biz_referral_shared_whatsapp')
            window.open(`https://wa.me/?text=${waText}`, '_blank')
          })}
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white text-[13px] font-black rounded-xl hover:opacity-90 transition-all"
        >
          💬 Compartir por WhatsApp
        </button>
      </div>

      {/* Cómo funciona */}
      <div className="card p-5">
        <div className="text-[14px] font-extrabold text-[#0D1A3A] mb-4">Cómo funciona</div>
        <div className="space-y-3">
          {[
            { icon: '🔗', text: 'Compartí tu link con otros comercios' },
            { icon: '💳', text: 'Cuando pagan su plan, vos ganás 10 puntos' },
            { icon: '🎁', text: <span>Canjeá tus puntos por premios en{' '}<a href="/empresa/canjes" className="text-[#003FA3] font-black hover:underline">la tienda de canjes</a></span> },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6EEF9] flex items-center justify-center text-[16px] shrink-0">
                {step.icon}
              </div>
              <div className="text-[13px] font-medium text-[#0D1A3A]">{step.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial */}
      <div className="card">
        <div className="px-5 py-4 border-b border-[#DDE1EF]">
          <div className="text-[14px] font-extrabold text-[#0D1A3A]">Historial de referidos</div>
        </div>
        {!data?.referrals?.length ? (
          <div className="p-8 text-center">
            <div className="text-[32px] mb-3">🤝</div>
            <div className="text-[14px] font-bold text-[#0D1A3A] mb-1">Todavía no referiste a nadie</div>
            <div className="text-[13px] text-[#5A6480] font-medium mb-4">
              Compartí tu link y empezá a ganar puntos
            </div>
            <button
              onClick={() => handleReferidosAction(handleCopy)}
              className="px-4 py-2 bg-[#002B72] text-white text-[13px] font-black rounded-xl hover:bg-[#00318A] transition-all"
            >
              {copied ? '✓ Copiado' : 'Copiar link'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#DDE1EF]">
            {data.referrals.map(r => (
              <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[14px] font-bold text-[#0D1A3A]">
                    {(r.referred as any)?.name ?? r.referred?.slug ?? '—'}
                  </div>
                  <div className="text-[12px] text-[#8E96AE] font-medium mt-0.5">{formatDate(r.created_at)}</div>
                </div>
                {r.status === 'paid' ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-black text-[#18A06A] bg-[#E8F8F1] px-2.5 py-1 rounded-full">
                      ✅ Pagó
                    </span>
                    <span className="text-[12px] font-black text-[#18A06A]">+{r.points_awarded} pts</span>
                  </div>
                ) : (
                  <span className="text-[12px] font-bold text-[#8E96AE] bg-[#F1F3F9] px-2.5 py-1 rounded-full">
                    Pendiente
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[12px] text-[#8E96AE] text-center font-medium">
        Al usar el programa de referidos aceptás nuestros{' '}
        <a href="/terminos-referidos" target="_blank"
          className="text-[#003FA3] underline underline-offset-2 font-bold">
          términos y condiciones
        </a>
      </p>

      <ReferidosTermsModal
        open={showTermsModal}
        onClose={() => { setShowTermsModal(false); setPendingAction(null) }}
        onAccept={() => {
          setShowTermsModal(false)
          trackEvent('biz_referral_terms_accepted')
          if (pendingAction) { pendingAction(); setPendingAction(null) }
        }}
      />
    </div>
  )
}
