'use client'
import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { ReferidosTermsModal } from '@/components/shared/ReferidosTermsModal'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useInstallPWA } from '@/hooks/useInstallPWA'
import { SORTED_COUNTRIES } from '@/shared/utils/countries'
import { trackEvent } from '@/lib/analytics'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

async function publicFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err: any = new Error(`${path} → ${res.status}`)
    err.body = body
    throw err
  }
  return res.json()
}

type Tab = 'home' | 'pronosticar' | 'ranking' | 'resultados' | 'perfil' | 'referidos'

interface Match {
  id: number
  home_team: string
  home_flag: string
  away_team: string
  away_flag: string
  kickoff_at: string
  status: 'scheduled' | 'live' | 'finished'
  home_score: number | null
  away_score: number | null
  group: string
}

interface RawPrediction {
  match_id: number
  home_pred: number
  away_pred: number
  points_earned: number | null
}

interface LeaderboardEntry {
  participant_id: string
  total_points: number
  exact_results: number
  correct_winners: number
  rank: number
  participants: { name: string; email: string }
}

interface Promo {
  id: string
  name: string
  category: string
  description: string
  image_url?: string
  radius_km: number
  lat: number
  lon: number
  link_url?: string
}

const GRADIENT_BY_CAT: Record<string, string> = {
  '🍕 Gastronomía': 'linear-gradient(135deg, #1a3a5c, #2d6a8f)',
  '☕ Cafetería': 'linear-gradient(135deg, #3d1a00, #8B4513)',
  '🛒 Supermercado': 'linear-gradient(135deg, #0d3b2e, #1a7a5e)',
  '🥖 Panadería': 'linear-gradient(135deg, #5c3a1a, #8b5e34)',
  '🥩 Carnicería': 'linear-gradient(135deg, #4a0000, #8b0000)',
  '🥦 Verdulería': 'linear-gradient(135deg, #0d2e0d, #1a5e1a)',
  '🍭 Kiosco': 'linear-gradient(135deg, #3b0d2e, #7a1a5e)',
  '🧊 Congelados': 'linear-gradient(135deg, #0d3b3b, #1a7a7a)',
  '💊 Farmacia': 'linear-gradient(135deg, #0d2e3b, #1a5e7a)',
  '👗 Indumentaria': 'linear-gradient(135deg, #2e0d3b, #7a1a5e)',
  '💆 Bienestar': 'linear-gradient(135deg, #1a3b2e, #2d8f6a)',
  '📚 Librería': 'linear-gradient(135deg, #3b2e0d, #8f6a2d)',
  '🎬 Entretenimiento': 'linear-gradient(135deg, #1a0d3b, #5e1a8f)',
  '🔧 Servicios': 'linear-gradient(135deg, #2e2e2e, #5a5a5a)',
  '🏠 Hogar': 'linear-gradient(135deg, #1a2e3b, #2d5e8f)',
  '🐶 Mascotas': 'linear-gradient(135deg, #3d2400, #5c3a1a)',
  '⚽ Deportes': 'linear-gradient(135deg, #0d3b0d, #1a7a1a)',
  '💻 Tecnología': 'linear-gradient(135deg, #0f172a, #334155)',
  '🚗 Automotor': 'linear-gradient(135deg, #3b0d0d, #7a1a1a)',
  '🧸 Juguetería': 'linear-gradient(135deg, #3b2e00, #8f6a00)',
  '🧴 Estética': 'linear-gradient(135deg, #3b0d2e, #7a1a5e)',
  '🎨 Arte y Deco': 'linear-gradient(135deg, #0d3b3b, #1a7a7a)',
  '✨ Otros': 'linear-gradient(135deg, #334155, #475569)',
}

function PromoCarousel({ promos }: { promos: Promo[] }) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const viewedRef = useRef<Set<string>>(new Set())

  const trackView = (promoId: string) => {
    if (viewedRef.current.has(promoId)) return
    viewedRef.current.add(promoId)
    fetch(`${API_URL}/promos/${promoId}/view`, { method: 'POST' }).catch(() => {})
  }

  const advance = () => {
    if (fadeRef.current) clearTimeout(fadeRef.current)
    setVisible(false)
    fadeRef.current = setTimeout(() => {
      setCurrent(c => {
        const next = (c + 1) % promos.length
        trackView(promos[next].id)
        return next
      })
      setVisible(true)
    }, 200)
  }

  useEffect(() => {
    if (promos.length > 0) trackView(promos[0].id)
  }, [promos])

  useEffect(() => {
    if (promos.length <= 1) return
    timerRef.current = setInterval(advance, 4000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (fadeRef.current) clearTimeout(fadeRef.current)
    }
  }, [promos.length])

  if (!promos.length) return null

  const promo = promos[current]
  const bg = GRADIENT_BY_CAT[promo.category] ?? 'linear-gradient(135deg, #1a3a5c, #2d6a8f)'
  const radiusLabel = promo.radius_km < 1 ? `${promo.radius_km * 1000}m` : `${promo.radius_km} km`
  const hasLocation = promo.lat !== 0 || promo.lon !== 0

  return (
    <div className="px-4 pt-4">
      <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Promociones locales</div>
      <div
        className={`rounded-[16px] overflow-hidden relative cursor-pointer select-none transition-opacity duration-200${!visible ? ' opacity-0' : ''}${!promo.image_url ? ' aspect-[3/1]' : ''}`}
        style={{ background: bg }}
        onClick={() => promo.link_url ? window.open(promo.link_url, '_blank', 'noopener,noreferrer') : advance()}
      >
        {promo.image_url && (
          <img src={promo.image_url} alt="" className="w-full h-auto block" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex flex-col gap-1 min-w-0">
          {hasLocation && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full w-fit uppercase tracking-wider"
              style={{ background: '#F5C518', color: '#002B72' }}>
              📍 {radiusLabel}
            </span>
          )}
          <div className="text-[14px] font-black text-white leading-tight truncate">{promo.name || promo.category}</div>
          <div className="text-[11px] font-semibold leading-tight truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{promo.description}</div>
        </div>
        {promos.length > 1 && (
          <div className="absolute bottom-2 right-3 flex gap-1">
            {promos.map((_, i) => (
              <div key={i} className={`rounded-full transition-all ${i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface Participant { id: string; name: string; email: string; phone: string }
interface Empresa {
  id: string; name: string; slug: string; primary_color: string; logo_url: string | null
  background_url?: string | null
  welcome_msg?: string
  plan?: 'free' | 'pro' | 'premium'
  require_email?: boolean
  require_phone?: boolean
  match_visibility?: 'all' | 'daily'
  close_minutes?: number
  prizes?: Array<{ rank: number; medal: string; pos: string; description: string }>
}

function Flag({ src, className = 'w-7 h-7' }: { src: string; className?: string }) {
  if (src?.startsWith('http')) {
    return <img src={src} alt="" className={`object-contain ${className}`} />
  }
  return <span>{src}</span>
}

function isLocked(match: Match, closeMinutes: number) {
  if (match.status !== 'scheduled') return true
  return (new Date(match.kickoff_at).getTime() - Date.now()) < closeMinutes * 60 * 1000
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Ahora'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  if (d > 0) return `${d}d ${h}h`
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
}

export function ProdeApp({ empresa, participant, onLogout }: {
  empresa: Empresa; participant: Participant; onLogout?: () => void
}) {
  const [tab, setTab] = useState<Tab>('home')
  const [matches, setMatches] = useState<Match[]>([])
  const [apiPreds, setApiPreds] = useState<Record<number, RawPrediction>>({})
  const [preds, setPreds] = useState<Record<number, { h: string; a: string }>>({})
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [isUpcomingDay, setIsUpcomingDay] = useState(false)
  const [promos, setPromos] = useState<Promo[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [weeklyPrizes, setWeeklyPrizes] = useState<Array<{ rank: number; description: string }>>([])
  const [positionChange, setPositionChange] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: participant.name, email: participant.email, phone: participant.phone, countryCode: '54' })
  const [editSaving, setEditSaving] = useState(false)
  const [showPointsInfo, setShowPointsInfo] = useState(false)
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<Array<{ participant_id: string; name: string; weekly_points: number; exact_results: number; rank: number }>>([])
  const [exactAlert, setExactAlert] = useState(false)
  const [referrerData, setReferrerData] = useState<{
    referral_code: string
    total_referrals: number
    pending_amount: number
    history: Array<{
      id: string
      business_name: string
      business_slug: string
      status: 'pending' | 'paid'
      created_at: string
    }>
  } | null>(null)
  const [referrerLoading, setReferrerLoading] = useState(false)
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [paymentInfo, setPaymentInfo] = useState('')
  const [payoutSent, setPayoutSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [participantCampaign, setParticipantCampaign] = useState<{
    id: string; name: string; description?: string; invite_message?: string; invite_button_text?: string
    prizes: Array<{ rank: number; description: string }>
    milestones: Array<{ at: number; prize: string }>
    terms_pdf_url?: string
  } | null>(null)
  const [showTermsPdf, setShowTermsPdf] = useState(false)
  const [participantReferralCount, setParticipantReferralCount] = useState(0)
  const [participantReferralHistory, setParticipantReferralHistory] = useState<Array<{ name: string; registered_at: string }>>([])
  const [campaignLinkCopied, setCampaignLinkCopied] = useState(false)
  const [referidosView, setReferidosView] = useState<'campaign' | 'prode-ar'>('campaign')
  usePushNotifications(participant.id)
  const { canInstall, install } = useInstallPWA()

  const color = empresa.primary_color ?? '#002B72'
  const prizes = empresa.prizes ?? []

  const track = (name: string, params?: Record<string, any>) =>
    trackEvent(name, { business_slug: empresa.slug, business_name: empresa.name, ...params })

  useEffect(() => { track('player_prode_view') }, [])

  useEffect(() => {
    // Fetch nearby promos silently using geolocation if available
    function loadPromos(lat = 0, lon = 0) {
      publicFetch(`/promos/nearby?lat=${lat}&lon=${lon}`)
        .then((data: Promo[]) => setPromos(data ?? []))
        .catch(() => { })
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadPromos(pos.coords.latitude, pos.coords.longitude),
        () => loadPromos(),
        { timeout: 5000 },
      )
    } else {
      loadPromos()
    }
  }, [])

  useEffect(() => {
    const worldCupStart = new Date('2026-06-11T21:00:00-03:00')
    const timer = setInterval(() => {
      const diff = worldCupStart.getTime() - Date.now()
      if (diff <= 0) { clearInterval(timer); return }
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (positionChange !== null) {
      const t = setTimeout(() => setPositionChange(null), 5000)
      return () => clearTimeout(t)
    }
  }, [positionChange])

  useEffect(() => {
    async function load() {
      try {
        const [matchData, predData, lbData] = await Promise.all([
          publicFetch('/matches'),
          publicFetch(`/predictions/participant/${participant.id}`).catch(() => []),
          publicFetch(`/leaderboard/${empresa.id}`).catch(() => []),
        ])
        const allMatches: Match[] = matchData
        let visibleMatches = allMatches
        let upcoming = false
        if (empresa.match_visibility === 'daily') {
          const tz = 'America/Argentina/Buenos_Aires'
          const dayKey = (iso: string) =>
            new Date(iso).toLocaleDateString('es-AR', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
          const todayKey = dayKey(new Date().toISOString())
          const todayMatches = allMatches.filter(m => dayKey(m.kickoff_at) === todayKey)
          if (todayMatches.length > 0) {
            visibleMatches = todayMatches
          } else {
            // No hay partidos hoy — buscar el primer día futuro con partidos
            const futureMatches = allMatches.filter(m => new Date(m.kickoff_at) > new Date())
            if (futureMatches.length > 0) {
              const nextDayKey = dayKey(futureMatches[0].kickoff_at)
              visibleMatches = futureMatches.filter(m => dayKey(m.kickoff_at) === nextDayKey)
              upcoming = true
            } else {
              visibleMatches = []
            }
          }
        }
        setIsUpcomingDay(upcoming)
        setMatches(visibleMatches)
        setLeaderboard(lbData)

        // Position change tracking
        const storageRankKey = `prode:${empresa.slug}:rank`
        const prevRank = parseInt(localStorage.getItem(storageRankKey) ?? '0')
        const currentRank = (lbData as LeaderboardEntry[]).find(e => e.participant_id === participant.id)?.rank ?? 0
        if (prevRank > 0 && currentRank > 0 && currentRank < prevRank) {
          setPositionChange(prevRank - currentRank)
        }
        if (currentRank > 0) {
          localStorage.setItem(storageRankKey, String(currentRank))
        }

        const predMap: Record<number, RawPrediction> = {}
        const editMap: Record<number, { h: string; a: string }> = {}
        for (const p of (predData as RawPrediction[])) {
          predMap[p.match_id] = p
          editMap[p.match_id] = { h: String(p.home_pred), a: String(p.away_pred) }
        }
        setApiPreds(predMap)
        setPreds(editMap)

        // Weekly prizes
        publicFetch(`/prizes/weekly/business/${empresa.id}`)
          .then(data => {
            const wcStart = new Date('2026-06-11')
            const now = new Date()
            const diffMs = now.getTime() - wcStart.getTime()

            if (diffMs < 0) {
              // Antes del mundial: mostrar premios de la semana 0 si existen
              const firstAvailable = Object.values(data)[0] as Array<{ rank: number; description: string }> ?? []
              setWeeklyPrizes(firstAvailable)
            } else {
              const weekIdx = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
              const current = data[String(weekIdx)] ?? []
              setWeeklyPrizes(current)
            }
          })
          .catch(() => { })

        // Leaderboard semanal
        publicFetch(`/leaderboard/${empresa.id}/weekly`)
          .then((data: any) => setWeeklyLeaderboard(data?.entries ?? []))
          .catch(() => { })

        // Detectar resultado exacto nuevo
        const exactKey = `prode:${empresa.slug}:exactAlerted`
        const hasNewExact = (predData as RawPrediction[]).some(p => p.points_earned === 3)
        const alreadyAlerted = localStorage.getItem(exactKey) === 'true'
        if (hasNewExact && !alreadyAlerted) {
          setExactAlert(true)
          localStorage.setItem(exactKey, 'true')
          setTimeout(() => setExactAlert(false), 5000)
        }
      } catch (e) {
        console.error('Load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [participant.id, empresa.id])

  useEffect(() => {
    if (!participant) return
    setReferrerLoading(true)
    publicFetch('/player-referrals/register', {
      method: 'POST',
      body: JSON.stringify({ email: participant.email, name: participant.name })
    })
      .then((data: any) => setReferrerData(data))
      .catch(() => {})
      .finally(() => setReferrerLoading(false))
  }, [participant])

  useEffect(() => {
    publicFetch(`/referral-campaigns/public/${empresa.slug}`)
      .then((data: any) => setParticipantCampaign(data))
      .catch(() => {})
  }, [empresa.slug])

  useEffect(() => {
    if (!participantCampaign) return
    Promise.all([
      publicFetch(`/referral-campaigns/participant-count/${participant.id}`),
      publicFetch(`/referral-campaigns/participant-history/${participant.id}`),
    ]).then(([countData, histData]: any[]) => {
      setParticipantReferralCount(countData?.count ?? 0)
      setParticipantReferralHistory(histData?.referrals ?? [])
    }).catch(() => {})
  }, [participantCampaign, participant.id])

  const handleReferidosAction = (action: () => void) => {
    const accepted = localStorage.getItem('referidos-terms-accepted') === 'true'
    if (accepted) {
      action()
    } else {
      setPendingAction(() => action)
      setShowTermsModal(true)
    }
  }

  const myEntry = leaderboard.find(e => e.participant_id === participant.id)
  const scheduledMatches = matches.filter(m => m.status === 'scheduled')
  const finishedMatches = matches.filter(m => m.status === 'finished')
  const closeMin = empresa.close_minutes ?? 5
  const nextMatch = scheduledMatches.find(m => !isLocked(m, closeMin))
  const nextMatchApiPred = nextMatch ? apiPreds[nextMatch.id] : null
  const worldCupStarted = new Date() >= new Date('2026-06-11T21:00:00-03:00')

  const handleSave = async () => {
    setSaving(true)
    setSavedMsg('')
    try {
      const items = Object.entries(preds)
        .filter(([matchId, v]) => {
          if (v.h === '' || v.a === '') return false
          const match = matches.find(m => m.id === Number(matchId))
          return match && !isLocked(match, closeMin)
        })
        .map(([matchId, v]) => ({ matchId: Number(matchId), homeScore: Number(v.h), awayScore: Number(v.a) }))
      if (!items.length) { setSavedMsg('Nada para guardar'); setSaving(false); return }
      await publicFetch('/predictions', {
        method: 'POST',
        body: JSON.stringify({ participantId: participant.id, predictions: items }),
      })
      track('player_predictions_saved', { count: items.length })
      setSavedMsg('✅ Guardados')
      setHasChanges(false)
      // Refresh predictions
      const fresh = await publicFetch(`/predictions/participant/${participant.id}`).catch(() => [])
      const predMap: Record<number, RawPrediction> = {}
      for (const p of (fresh as RawPrediction[])) predMap[p.match_id] = p
      setApiPreds(predMap)
    } catch (e: any) {
      const msg = e.body?.message ?? e.message ?? ''
      if (msg.includes('Participant not found') || msg.includes('not found')) {
        localStorage.removeItem(`prode:${empresa.slug}`)
        window.location.reload()
        return
      }
      setSavedMsg(`Error: ${msg}`)
    } finally {
      setSaving(false)
      setTimeout(() => setSavedMsg(''), 3000)
    }
  }

  const handleEditSave = async () => {
    setEditSaving(true)
    try {
      const fullPhone = editForm.phone.startsWith('+') ? editForm.phone : `+${editForm.countryCode}${editForm.phone}`
      const { countryCode: _, ...editFields } = editForm
      await publicFetch(`/participants/${participant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...editFields, phone: fullPhone }),
      })
      const stored = localStorage.getItem(`prode:${empresa.slug}`)
      if (stored) {
        const data = JSON.parse(stored)
        localStorage.setItem(`prode:${empresa.slug}`, JSON.stringify({ ...data, ...editForm }))
      }
      setEditing(false)
    } catch {
      alert('Error al guardar. Intentá de nuevo.')
    } finally {
      setEditSaving(false)
    }
  }

  const generateShareImage = async ({
    rank, points, exactResults, businessName, logoUrl, color: bgColor, type,
  }: {
    rank: number; points: number; exactResults: number
    businessName: string; logoUrl: string | null; color: string; type: 'ranking' | 'semanal'
  }): Promise<Blob | null> => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)
    gradient.addColorStop(0, bgColor)
    gradient.addColorStop(1, '#000000')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    // Patrón de puntos sutil
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    for (let x = 0; x < 1080; x += 40) {
      for (let y = 0; y < 1080; y += 40) {
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Logo del comercio (si existe)
    if (logoUrl) {
      try {
        // Descargar la imagen via proxy para evitar CORS
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
        const proxiedUrl = `${API_BASE}/storage/proxy?url=${encodeURIComponent(logoUrl!)}`
        const response = await fetch(proxiedUrl)
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)

        const img = new Image()
        await new Promise<void>((res, rej) => {
          img.onload = () => res()
          img.onerror = () => rej()
          img.src = objectUrl
        })

        const logoSize = 160
        const logoX = (1080 - logoSize) / 2
        const centerY = 260

        // Calcular dimensiones respetando aspect ratio
        const aspectRatio = img.naturalWidth / img.naturalHeight
        let drawW = logoSize
        let drawH = logoSize
        if (aspectRatio > 1) {
          drawH = logoSize / aspectRatio
        } else {
          drawW = logoSize * aspectRatio
        }
        const drawX = logoX + (logoSize - drawW) / 2
        const drawY = centerY - logoSize / 2 + (logoSize - drawH) / 2

        // Clip circular
        ctx.save()
        ctx.beginPath()
        ctx.arc(logoX + logoSize / 2, centerY, logoSize / 2, 0, Math.PI * 2)
        ctx.clip()
        // Fondo del color del comercio dentro del clip por si la imagen tiene transparencia
        ctx.fillStyle = bgColor
        ctx.fillRect(logoX, centerY - logoSize / 2, logoSize, logoSize)
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
        ctx.restore()

        URL.revokeObjectURL(objectUrl)
      } catch {
        // Fallback: inicial del comercio
        ctx.beginPath()
        ctx.arc(540, 220, 90, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 80px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(businessName.charAt(0).toUpperCase(), 540, 248)
      }
    } else {
      // Sin logo: inicial del comercio
      ctx.beginPath()
      ctx.arc(540, 220, 90, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 80px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(businessName.charAt(0).toUpperCase(), 540, 248)
    }

    // Nombre del comercio (ajusta font size para que entre)
    const maxNameWidth = 950
    let nameFontSize = 52
    ctx.font = `bold ${nameFontSize}px system-ui, sans-serif`
    while (ctx.measureText(businessName.toUpperCase()).width > maxNameWidth && nameFontSize > 24) {
      nameFontSize -= 2
      ctx.font = `bold ${nameFontSize}px system-ui, sans-serif`
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.textAlign = 'center'
    ctx.fillText(businessName.toUpperCase(), 540, 390)

    // Tipo de ranking
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = 'bold 30px system-ui, sans-serif'
    ctx.fillText(type === 'semanal' ? 'RANKING SEMANAL' : 'RANKING GENERAL', 540, 435)

    // Posición grande
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
    if (medal) {
      ctx.font = '200px system-ui'
      ctx.fillText(medal, 540, 620)
    } else {
      ctx.fillStyle = '#F5C518'
      ctx.font = 'bold 220px system-ui, sans-serif'
      ctx.fillText(`${rank}°`, 540, 640)
    }

    // Puntos
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px system-ui, sans-serif'
    ctx.fillText(`${points} puntos`, 540, 750)

    // Exactos
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = 'bold 42px system-ui, sans-serif'
    ctx.fillText(`${exactResults} resultados exactos`, 540, 820)

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = 'bold 36px system-ui, sans-serif'
    ctx.fillText('⚽ Prode Mundial 2026 · elprode.ar', 540, 960)

    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  }

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'pronosticar', icon: '⚽', label: 'Pronosticar' },
    { id: 'ranking', icon: '🏆', label: 'Ranking' },
    { id: 'resultados', icon: '📊', label: 'Resultados' },
    { id: 'referidos', icon: '🤝', label: 'Referidos' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: color }}>
        <div className="text-white text-center">
          <div className="text-5xl mb-4 animate-bounce">⚽</div>
          <div className="font-bebas text-2xl tracking-widest">Cargando tu prode...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="text-white px-5 py-4 pb-5" style={{
        background: color,
        ...(empresa.background_url ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${empresa.background_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}),
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-lg overflow-hidden">
              {empresa.logo_url ? <img src={empresa.logo_url} alt="" className="w-full h-full object-contain p-0.5" /> : '⚽'}
            </div>
            <div>
              <div className="font-bebas text-base tracking-widest">{empresa.name.toUpperCase()}</div>
              <div className="text-white/50 text-xs font-semibold">Prode Mundial 2026</div>
            </div>
          </div>
          <button onClick={() => setTab('perfil' as any)} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base">👤</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 overscroll-none">

        {/* HOME */}
        {tab === 'home' && (
          <div>
            {exactAlert && (
              <div
                className="mx-4 mt-4 rounded-2xl p-4 text-center text-white"
                style={{ background: 'linear-gradient(135deg, #F5C518, #E6A800)' }}
                onClick={() => setExactAlert(false)}>
                <div className="text-3xl mb-1">🎯</div>
                <div className="font-black text-[#002B72] text-base">¡Resultado exacto!</div>
                <div className="text-[#002B72]/70 text-xs mt-0.5 font-bold">Acertaste el marcador exacto · +3 puntos</div>
                {referrerData !== null && !(referrerData.total_referrals > 0 && referrerData.total_referrals % 3 === 0) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setTab('referidos') }}
                    className="mt-2 text-[11px] font-black text-[#002B72]/60 underline underline-offset-2">
                    ¿Sabías que podés ganar $12.000 invitando comercios? →
                  </button>
                )}
              </div>
            )}

            {positionChange !== null && (
              <div className="mx-4 mt-4 rounded-2xl p-4 text-white text-center animate-bounce"
                style={{ background: 'linear-gradient(135deg, #18A06A, #0d7a52)' }}
                onClick={() => setPositionChange(null)}>
                <div className="text-2xl mb-1">🎉</div>
                <div className="font-black text-sm">
                  ¡Subiste {positionChange} {positionChange === 1 ? 'posición' : 'posiciones'}!
                </div>
                <div className="text-white/70 text-xs mt-0.5">
                  Ahora estás {myEntry ? `${myEntry.rank}°` : ''} en el ranking
                </div>
                {referrerData !== null && !(referrerData.total_referrals > 0 && referrerData.total_referrals % 3 === 0) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setTab('referidos') }}
                    className="mt-2 text-[11px] font-black text-[#002B72]/60 underline underline-offset-2">
                    ¿Sabías que podés ganar $12.000 invitando comercios? →
                  </button>
                )}
              </div>
            )}

            {participantCampaign?.invite_message ? (
              <button
                onClick={() => setTab('referidos')}
                className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all text-left"
                style={{ borderColor: color, background: `${color}10` }}>
                <span className="text-xl shrink-0">🎁</span>
                <span className="flex-1 font-black text-[13px]" style={{ color }}>
                  {participantCampaign.invite_message}
                </span>
                <span className="text-[12px] font-black shrink-0" style={{ color }}>→</span>
              </button>
            ) : referrerData !== null && !(referrerData.total_referrals > 0 && referrerData.total_referrals % 3 === 0) && (
              (() => {
                const enGrupo = referrerData.total_referrals % 3
                const falta = 3 - enGrupo
                const mensaje = enGrupo === 0
                  ? { icon: '💰', text: '¿Tenés amigos con comercios? Cada 3 comercios ganá $12.000' }
                  : falta === 1
                    ? { icon: '⚡', text: `¡Casi! Te falta 1 solo para ganar $12.000` }
                    : { icon: '🔥', text: `¡Ya tenés ${enGrupo}! Te faltan ${falta} para ganar $12.000` }
                return (
                  <button
                    onClick={() => setTab('referidos')}
                    className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all text-left"
                    style={{ borderColor: color, background: `${color}10` }}>
                    <span className="text-xl shrink-0">{mensaje.icon}</span>
                    <span className="flex-1 font-black text-[13px]" style={{ color }}>
                      {mensaje.text}
                    </span>
                    <span className="text-[12px] font-black shrink-0" style={{ color }}>→</span>
                  </button>
                )
              })()
            )}

            <div className="grid grid-cols-2 gap-3 px-4 pt-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="font-bebas text-4xl" style={{ color }}>{myEntry?.total_points ?? 0}</div>
                <div className="text-xs font-bold text-slate-400">Mis puntos</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="font-bebas text-4xl" style={{ color }}>{myEntry ? `${myEntry.rank}°` : '—'}</div>
                <div className="text-xs font-bold text-slate-400">Posición</div>
              </div>
            </div>

            {(() => {
              const isFree = empresa.plan === 'free'
              const count = leaderboard.length
              const isFull = isFree && count >= 5

              if (isFull) {
                return (
                  <div className="mx-4 mt-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="flex items-center gap-2 text-amber-600 font-black text-sm mb-1">
                      ⚠️ Cupos agotados
                    </div>
                    <p className="text-[12px] text-amber-800/70 font-medium leading-tight">
                      Este prode alcanzó el límite de 5 participantes del plan gratuito.
                      Para sumar más amigos, el organizador debe subir de plan.
                    </p>
                  </div>
                )
              }

              return (
                <button
                  onClick={async () => {
                    track('player_share_invite')
                    const hasRefCampaign = !!participantCampaign
                    const url = `https://${empresa.slug}.elprode.ar${hasRefCampaign ? `?ref=${participant.id}` : ''}`
                    const text = participantCampaign?.invite_message
                      ?? `¡Estoy jugando el prode del Mundial 2026 en ${empresa.name}! Sumate acá:`
                    if (navigator.share) {
                      await navigator.share({ title: empresa.name, text, url })
                    } else {
                      await navigator.clipboard.writeText(`${text} ${url}`)
                      alert('¡Link copiado!')
                    }
                  }}
                  className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-black text-sm transition-all"
                  style={{ borderColor: color, color, background: `${color}10` }}
                >
                  👥 {participantCampaign?.invite_button_text ?? 'Invitá a un amigo'}
                  {isFree && <span className="ml-1 opacity-50 text-[10px] font-bold">({count}/5)</span>}
                </button>
              )
            })()}

            {!worldCupStarted && (
              <div className="mx-4 mt-4 rounded-2xl p-5 text-white text-center" style={{ background: color }}>
                <div className="text-xs font-black text-white/60 uppercase tracking-widest mb-3">⚽ El Mundial arranca en</div>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    [countdown.d, 'días'],
                    [countdown.h, 'horas'],
                    [countdown.m, 'min'],
                    [countdown.s, 'seg'],
                  ] as [number, string][]).map(([v, l]) => (
                    <div key={l} className="bg-white/15 rounded-xl py-2">
                      <div className="font-bebas text-3xl text-yellow-300">{v}</div>
                      <div className="text-[10px] font-black text-white/60 uppercase">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nextMatch ? (
              <div className="mx-4 mt-4 rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: color }}>
                <div className="text-xs font-bold text-white/60 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
                  Próximo partido
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center">
                    <Flag src={nextMatch.home_flag} className="w-10 h-10 mx-auto" />
                    <div className="text-xs font-black mt-1">{nextMatch.home_team}</div>
                  </div>
                  <div className="font-bebas text-2xl text-yellow-300">VS</div>
                  <div className="text-center">
                    <Flag src={nextMatch.away_flag} className="w-10 h-10 mx-auto" />
                    <div className="text-xs font-black mt-1">{nextMatch.away_team}</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-white/60 mb-3">
                  <span>📅 {formatDate(nextMatch.kickoff_at)}</span>
                  <span>⏰ {timeUntil(nextMatch.kickoff_at)}</span>
                </div>
                {nextMatchApiPred ? (
                  <div className="w-full bg-white/15 rounded-xl py-3 px-4 flex items-center justify-between">
                    <span className="text-white/70 text-xs font-black uppercase tracking-wide">Tu pronóstico</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bebas text-3xl text-yellow-300">{nextMatchApiPred.home_pred}</span>
                      <span className="font-bebas text-xl text-white/50">-</span>
                      <span className="font-bebas text-3xl text-yellow-300">{nextMatchApiPred.away_pred}</span>
                    </div>
                    <span className="text-white/50 text-xs font-bold">✅ Cargado</span>
                  </div>
                ) : (
                  <button onClick={() => setTab('pronosticar')}
                    className="w-full bg-yellow-400 text-[#002B72] rounded-xl py-2.5 font-black text-sm hover:bg-yellow-300 transition-all">
                    ⚡ Cargar mi pronóstico
                  </button>
                )}
              </div>
            ) : null}

            {weeklyPrizes.length > 0 && (
              <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-2">🎁 Premio semanal de {empresa.name}</div>
                <div className="flex flex-col gap-1">
                  {weeklyPrizes.map((p, i) => (
                    <div key={i} className="text-sm font-black text-slate-900">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {p.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leaderboard.length > 0 && (
              <div className="mx-4 mt-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">🏅 Ranking de la semana</div>
                  <button
                    onClick={async () => {
                      const source = weeklyLeaderboard.length > 0
                        ? weeklyLeaderboard
                        : leaderboard.map(e => ({
                          participant_id: e.participant_id,
                          weekly_points: e.total_points,
                          exact_results: e.exact_results,
                          rank: e.rank,
                        }))
                      const myWeeklyEntry = source.find(e => e.participant_id === participant.id)
                      if (!myWeeklyEntry) return
                      const blob = await generateShareImage({
                        rank: myWeeklyEntry.rank,
                        points: myWeeklyEntry.weekly_points,
                        exactResults: myWeeklyEntry.exact_results ?? 0,
                        businessName: empresa.name,
                        logoUrl: empresa.logo_url,
                        color,
                        type: 'semanal',
                      })
                      if (!blob) return
                      const file = new File([blob], 'ranking-semanal.png', { type: 'image/png' })
                      track('player_share_ranking', { type: 'semanal' })
                      if (navigator.share && navigator.canShare({ files: [file] })) {
                        await navigator.share({ files: [file], title: empresa.name })
                      } else {
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'ranking-semanal.png'
                        a.click()
                        URL.revokeObjectURL(url)
                      }
                    }}
                    className="text-[11px] font-black px-2.5 py-1 rounded-full text-white transition-all"
                    style={{ background: color }}>
                    📤 Compartir
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {(weeklyLeaderboard.length > 0
                    ? weeklyLeaderboard
                    : leaderboard.slice(0, 5).map(e => ({
                      participant_id: e.participant_id,
                      name: e.participants?.name ?? 'Participante',
                      weekly_points: e.total_points,
                      exact_results: e.exact_results,
                      rank: e.rank,
                    }))
                  ).slice(0, 5).map(entry => {
                    const isMe = entry.participant_id === participant.id
                    const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}°`
                    return (
                      <div key={entry.participant_id}
                        className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-blue-50' : ''}`}
                        style={isMe ? { borderLeft: `3px solid ${color}` } : {}}>
                        <span className="text-base w-6 text-center">{medal}</span>
                        <span className={`flex-1 text-sm font-bold truncate ${isMe ? 'text-slate-900' : 'text-slate-600'}`}>
                          {entry.name}
                          {isMe && (
                            <span className="text-[10px] text-white px-1.5 py-0.5 rounded-full ml-1 font-black" style={{ background: color }}>Vos</span>
                          )}
                        </span>
                        <span className="font-bebas text-xl" style={{ color }}>{entry.weekly_points}</span>
                        <span className="text-xs text-slate-400">pts</span>
                      </div>
                    )
                  })}
                </div>
                {(() => {
                  const source = weeklyLeaderboard.length > 0
                    ? weeklyLeaderboard
                    : leaderboard.map(e => ({
                      participant_id: e.participant_id,
                      name: e.participants?.name ?? 'Participante',
                      weekly_points: e.total_points,
                      rank: e.rank,
                    }))
                  const myIdx = source.findIndex(e => e.participant_id === participant.id)
                  const myEntry2 = source[myIdx]
                  if (myIdx < 5 || !myEntry2) return null
                  return (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-3 bg-blue-50"
                      style={{ borderLeft: `3px solid ${color}` }}>
                      <span className="text-base w-6 text-center">{myEntry2.rank}°</span>
                      <span className="flex-1 text-sm font-bold text-slate-900">
                        {participant.name}
                        <span className="text-[10px] text-white px-1.5 py-0.5 rounded-full ml-1 font-black" style={{ background: color }}>Vos</span>
                      </span>
                      <span className="font-bebas text-xl" style={{ color }}>{myEntry2.weekly_points}</span>
                      <span className="text-xs text-slate-400">pts</span>
                    </div>
                  )
                })()}
              </div>
            )}

            <PromoCarousel promos={promos} />

            {prizes.length > 0 && (
              <div className="px-4 pt-5">
                <div className="text-sm font-black text-slate-900 mb-3">🏆 Premios</div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {prizes.map((p) => (
                    <div key={p.rank} className="flex-shrink-0 w-32 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
                      <div className="text-3xl mb-1">{p.medal}</div>
                      <div className="font-bebas text-sm" style={{ color }}>{p.pos}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{p.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="h-4" />
          </div>
        )}

        {/* PRONOSTICAR */}
        {tab === 'pronosticar' && (
          <div className="p-4">
            {(() => {
              const totalScheduled = scheduledMatches.length
              const totalPredicted = scheduledMatches.filter(m => apiPreds[m.id] !== undefined).length
              return (
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-black text-slate-900">Cargá tus pronósticos</div>
                  <div className={`text-xs font-black px-3 py-1.5 rounded-full ${totalPredicted === totalScheduled && totalScheduled > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    ✅ {totalPredicted} de {totalScheduled} cargados
                  </div>
                </div>
              )
            })()}

            {isUpcomingDay && scheduledMatches.length > 0 && (
              <div className="rounded-2xl mb-4 px-4 py-3 flex items-center gap-3"
                style={{ background: `${color}15`, border: `1.5px solid ${color}40` }}>
                <span className="text-xl">⏳</span>
                <div>
                  <div className="text-xs font-black" style={{ color }}>PRÓXIMAMENTE</div>
                  <div className="text-xs font-semibold text-slate-500">
                    Los partidos del {formatDate(scheduledMatches[0].kickoff_at).split(',')[0]} abren en {timeUntil(scheduledMatches[0].kickoff_at)}
                  </div>
                </div>
              </div>
            )}

            {scheduledMatches.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <div className="text-3xl mb-2">📋</div>
                <div className="font-bold">No hay partidos disponibles</div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {scheduledMatches.map(m => {
                const locked = isUpcomingDay || isLocked(m, closeMin)
                return (
                  <div key={m.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                    ${locked ? 'opacity-70 border-slate-100' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-black text-slate-500">{formatDate(m.kickoff_at)}</span>
                      {isUpcomingDay
                        ? <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, background: `${color}15` }}>⏳ Próximamente</span>
                        : locked
                          ? <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">🔒 Cerrado</span>
                          : <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Abierto · {timeUntil(m.kickoff_at)}</span>}
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Flag src={m.home_flag} className="w-7 h-7 shrink-0" />
                        <span className="text-xs font-black text-slate-900 leading-tight">{m.home_team}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="number" min={0} max={20} disabled={locked}
                          value={preds[m.id]?.h ?? ''}
                          onChange={e => { setPreds(p => ({ ...p, [m.id]: { ...p[m.id], h: e.target.value, a: p[m.id]?.a ?? '' } })); setHasChanges(true) }}
                          className="w-10 h-10 text-center border-2 border-slate-200 rounded-xl font-bebas text-xl focus:outline-none disabled:bg-slate-50"
                          style={{ borderColor: preds[m.id]?.h !== undefined && preds[m.id]?.h !== '' ? color : undefined }} />
                        <span className="font-bebas text-xl text-slate-400">:</span>
                        <input type="number" min={0} max={20} disabled={locked}
                          value={preds[m.id]?.a ?? ''}
                          onChange={e => { setPreds(p => ({ ...p, [m.id]: { ...p[m.id], a: e.target.value, h: p[m.id]?.h ?? '' } })); setHasChanges(true) }}
                          className="w-10 h-10 text-center border-2 border-slate-200 rounded-xl font-bebas text-xl focus:outline-none disabled:bg-slate-50"
                          style={{ borderColor: preds[m.id]?.a !== undefined && preds[m.id]?.a !== '' ? color : undefined }} />
                      </div>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="text-xs font-black text-slate-900 leading-tight text-right">{m.away_team}</span>
                        <Flag src={m.away_flag} className="w-7 h-7 shrink-0" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* RANKING */}
        {tab === 'ranking' && (
          <div className="p-4">
            {myEntry && (
              <div className="rounded-2xl p-4 text-white mb-4 flex items-center gap-4" style={{ background: color }}>
                <div className="font-bebas text-5xl text-yellow-300">{myEntry.rank}°</div>
                <div>
                  <div className="text-white/60 text-xs font-bold uppercase tracking-wide">Tu posición</div>
                  <div className="font-bebas text-2xl">{myEntry.total_points} puntos</div>
                  <div className="text-white/60 text-xs">{myEntry.exact_results} exactos · {myEntry.correct_winners} ganadores</div>
                </div>
              </div>
            )}
            {myEntry && (
              <button
                onClick={async () => {
                  const blob = await generateShareImage({
                    rank: myEntry.rank,
                    points: myEntry.total_points,
                    exactResults: myEntry.exact_results,
                    businessName: empresa.name,
                    logoUrl: empresa.logo_url,
                    color,
                    type: 'ranking',
                  })
                  if (!blob) return
                  const file = new File([blob], 'mi-posicion.png', { type: 'image/png' })
                  track('player_share_ranking', { type: 'ranking' })
                  if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: empresa.name })
                  } else {
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'mi-posicion.png'
                    a.click()
                    URL.revokeObjectURL(url)
                  }
                }}
                className="w-full mb-4 py-2.5 rounded-xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all"
                style={{ borderColor: color, color }}>
                📤 Compartir mi posición
              </button>
            )}
            {leaderboard.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-bold">Ranking vacío por ahora</div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {leaderboard.map(r => {
                const isMe = r.participant_id === participant.id
                return (
                  <div key={r.participant_id} className={`flex items-center gap-3 bg-white rounded-xl px-4 py-3 border shadow-sm
                    ${isMe ? 'border-2 bg-blue-50' : 'border-slate-100'}`}
                    style={isMe ? { borderColor: color } : {}}>
                    <span className="text-xl w-8 text-center font-bold">
                      {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                    </span>
                    <span className="flex-1 font-bold text-sm text-slate-900">
                      {r.participants?.name ?? 'Participante'}
                      {isMe && <span className="text-[10px] text-white px-2 py-0.5 rounded-full ml-1" style={{ background: color }}>Vos</span>}
                    </span>
                    <span className="font-bebas text-2xl" style={{ color }}>{r.total_points}</span>
                    <span className="text-xs text-slate-400 font-semibold">pts</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* RESULTADOS */}
        {tab === 'resultados' && (
          <div className="p-4">
            <div className="text-sm font-black text-slate-900 mb-4">Resultados</div>
            <button
              onClick={() => setShowPointsInfo(s => !s)}
              className="w-full flex items-center justify-between mb-3 px-1 text-sm font-black text-slate-500">
              <span>¿Cómo se puntúa?</span>
              <span>{showPointsInfo ? '▲' : '▼'}</span>
            </button>
            {showPointsInfo && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎯</span>
                  <div>
                    <div className="text-sm font-black text-slate-900">3 puntos — Resultado exacto</div>
                    <div className="text-xs text-slate-400">Acertás el marcador exacto del partido</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">👍</span>
                  <div>
                    <div className="text-sm font-black text-slate-900">1 punto — Ganador correcto</div>
                    <div className="text-xs text-slate-400">Acertás quién gana pero no el marcador exacto</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">😔</span>
                  <div>
                    <div className="text-sm font-black text-slate-900">0 puntos — Sin acierto</div>
                    <div className="text-xs text-slate-400">El resultado no coincide con tu pronóstico</div>
                  </div>
                </div>
              </div>
            )}
            {finishedMatches.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <div className="text-3xl mb-2">📊</div>
                <div className="font-bold">Aún no hay partidos finalizados</div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {finishedMatches.map(m => {
                const pred = apiPreds[m.id]
                const pts = pred?.points_earned ?? null
                return (
                  <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500">{formatDate(m.kickoff_at)}</span>
                      {pred ? (
                        <span className={`text-xs font-black px-2 py-1 rounded-full ${pts === 3 ? 'bg-green-100 text-green-700' : pts === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                          {pts === 3 ? '+3 pts 🎯 Exacto' : pts === 1 ? '+1 pt 👍 Ganador' : pts === 0 ? '0 pts' : '—'}
                        </span>
                      ) : <span className="text-xs text-slate-400">Sin pronóstico</span>}
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Flag src={m.home_flag} className="w-7 h-7 shrink-0" />
                      <span className="flex-1 text-xs font-black">{m.home_team}</span>
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bebas text-xl">{m.home_score ?? '?'}</span>
                        <span className="font-bebas text-xl text-slate-400">:</span>
                        <span className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bebas text-xl">{m.away_score ?? '?'}</span>
                      </div>
                      <span className="flex-1 text-xs font-black text-right">{m.away_team}</span>
                      <Flag src={m.away_flag} className="w-7 h-7 shrink-0" />
                    </div>
                    {pred && (
                      <div className="px-4 pb-3 text-xs text-slate-400">
                        Tu pronóstico: {pred.home_pred} - {pred.away_pred}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PERFIL */}
        {tab === 'perfil' && (
          <div className="p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center mb-4">
              <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-3xl mx-auto mb-3"
                style={{ borderColor: color }}>👤</div>
              <div className="font-black text-xl text-slate-900 mb-1">{participant.name}</div>
              <div className="text-sm text-slate-400">{participant.email}</div>
              {participant.phone && <div className="text-sm text-slate-400 mt-0.5">{participant.phone}</div>}
              <div className="grid grid-cols-3 gap-4 mt-5">
                {[
                  [String(myEntry?.total_points ?? 0), 'Puntos'],
                  [String(myEntry?.exact_results ?? 0), 'Exactos'],
                  [myEntry ? `${myEntry.rank}°` : '—', 'Posición'],
                ].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <div className="font-bebas text-3xl" style={{ color }}>{v}</div>
                    <div className="text-xs font-bold text-slate-400">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {editing ? (
              <div className="flex flex-col gap-3 mt-4">
                <input placeholder="Nombre completo" value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-medium text-slate-900 bg-slate-50 focus:outline-none focus:border-[#002B72] transition-colors" />
                <input placeholder="Email" type="email" value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-medium text-slate-900 bg-slate-50 focus:outline-none focus:border-[#002B72] transition-colors" />
                <div className="flex gap-2">
                  <select
                    value={editForm.countryCode}
                    onChange={e => setEditForm(f => ({ ...f, countryCode: e.target.value }))}
                    className="flex items-center justify-center px-2 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-500 focus:outline-none focus:border-[#002B72] appearance-none cursor-pointer"
                  >
                    {SORTED_COUNTRIES.map(c => (
                      <option key={`${c.code}-${c.name}`} value={c.code}>
                        {c.flag} +{c.code}
                      </option>
                    ))}
                  </select>
                  <input placeholder="Teléfono" type="tel" value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 font-medium text-slate-900 bg-slate-50 focus:outline-none focus:border-[#002B72] transition-colors" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-500 font-bold text-sm">
                    Cancelar
                  </button>
                  <button onClick={handleEditSave} disabled={editSaving}
                    className="flex-[2] py-3 rounded-xl text-white font-black text-sm disabled:opacity-60"
                    style={{ background: color }}>
                    {editSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(true)}
                className="mt-4 w-full py-2.5 rounded-xl border-2 font-bold text-sm transition-all"
                style={{ borderColor: color, color }}>
                ✏️ Editar mis datos
              </button>
            )}
            {canInstall && (
              <button
                onClick={install}
                className="w-full mt-3 py-3 rounded-2xl font-black text-sm text-white transition-all flex items-center justify-center gap-2"
                style={{ background: color }}>
                📲 Instalar app
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full mt-3 py-3 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">
                Cerrar sesión
              </button>
            )}
            <div className="flex justify-center gap-4 mt-5 text-xs text-slate-400">
              <a href="https://elprode.ar/terminos" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600 transition-colors">Términos y Condiciones</a>
              <span>·</span>
              <a href="https://elprode.ar/privacidad" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600 transition-colors">Política de Privacidad</a>
            </div>
          </div>
        )}

        {/* REFERIDOS */}
        {tab === 'referidos' && (
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="px-4 pt-5 pb-2 flex flex-col gap-5">

              {/* Vista: Campaña del negocio */}
              {participantCampaign && referidosView === 'campaign' && (
                <>
                  {/* Header */}
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎁</div>
                    <h2 className="text-[20px] font-black text-slate-900">
                      {participantCampaign.name}
                    </h2>
                    {participantCampaign.description && (
                      <p className="text-[13px] text-slate-500 font-medium mt-1">
                        {participantCampaign.description}
                      </p>
                    )}
                  </div>

                  {/* Card de progreso */}
                  <div className="rounded-2xl p-5 text-white"
                    style={{ background: `linear-gradient(135deg, ${color}, #0D1A3A)` }}>
                    <div className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-5 text-center">
                      Tu progreso actual
                    </div>
                    {(() => {
                      const milestones = participantCampaign.milestones ?? []
                      const count = participantReferralCount
                      if (milestones.length === 0) {
                        return <p className="text-center text-white/60 text-[13px] font-medium">Compartí tu link y empezá a ganar</p>
                      }
                      const currentIdx = milestones.findIndex(m => count < m.at)
                      const current = currentIdx === -1 ? milestones[milestones.length - 1] : milestones[currentIdx]
                      const prevAt = currentIdx <= 0 ? 0 : milestones[currentIdx - 1].at
                      const groupSize = current.at - prevAt
                      const groupCount = Math.min(count - prevAt, groupSize)
                      const justCompleted = count >= current.at
                      return (
                        <>
                          <div className="flex items-center justify-center gap-4 mb-5 flex-wrap">
                            {Array.from({ length: groupSize }).map((_, i) => {
                              const filled = justCompleted || i < groupCount
                              return (
                                <div key={i} className="flex flex-col items-center gap-2">
                                  <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4 transition-all"
                                    style={{
                                      background: filled ? '#F5C518' : 'rgba(255,255,255,0.1)',
                                      borderColor: filled ? '#F5C518' : 'rgba(255,255,255,0.2)',
                                      color: filled ? '#002B72' : 'rgba(255,255,255,0.3)',
                                    }}>
                                    {filled ? '✓' : i + 1}
                                  </div>
                                  <div className="text-[10px] font-bold text-white/40 uppercase">
                                    {filled ? 'Listo' : 'Pendiente'}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="h-px flex-1 bg-white/20" />
                            <div className="bg-[#F5C518] text-[#002B72] font-black text-[12px] px-4 py-1.5 rounded-full text-center max-w-[200px] leading-tight">
                              🎁 {current.prize}
                            </div>
                            <div className="h-px flex-1 bg-white/20" />
                          </div>
                          <div className="text-center">
                            {count === 0 ? (
                              <p className="text-white/60 text-[13px] font-medium">Compartí tu link y empezá a ganar</p>
                            ) : justCompleted && currentIdx === -1 ? (
                              <p className="text-[#F5C518] text-[13px] font-black">🎉 ¡Completaste todos los hitos!</p>
                            ) : justCompleted ? (
                              <p className="text-[#F5C518] text-[13px] font-black">🎉 ¡Completaste este hito!</p>
                            ) : (
                              <p className="text-white/70 text-[13px] font-medium">
                                Te {current.at - count === 1 ? 'falta 1 referido' : `faltan ${current.at - count} referidos`} para ganar {current.prize}
                              </p>
                            )}
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center mb-2">
                              Premios disponibles
                            </div>
                            <div className="flex justify-between">
                              {milestones.map((m, i) => (
                                <div key={i} className="text-center flex-1">
                                  <div className="text-[#F5C518] font-black text-[14px] leading-tight">
                                    {count >= m.at ? '✓ ' : ''}{m.prize}
                                  </div>
                                  <div className="text-white/40 text-[10px] font-bold">{m.at} referidos</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Link de invitación */}
                  <div className="rounded-2xl bg-white border border-slate-200 p-4">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      🔗 Tu link de invitación
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-3 mb-3 text-center">
                      <div className="text-[11px] text-slate-400 font-medium mb-1">{empresa.slug}.elprode.ar</div>
                      <div className="font-black text-[13px] text-slate-900 break-all">?ref={participant.id.slice(0, 8)}...</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          const url = `https://${empresa.slug}.elprode.ar?ref=${participant.id}`
                          await navigator.clipboard.writeText(url)
                          setCampaignLinkCopied(true)
                          setTimeout(() => setCampaignLinkCopied(false), 2000)
                          track('player_campaign_link_copied')
                        }}
                        className="flex-1 py-2.5 rounded-xl font-black text-[13px] border-2 transition-all"
                        style={{
                          borderColor: color,
                          color: campaignLinkCopied ? 'white' : color,
                          background: campaignLinkCopied ? color : 'transparent',
                        }}>
                        {campaignLinkCopied ? '✓ Copiado' : 'Copiar'}
                      </button>
                      <button
                        onClick={async () => {
                          const url = `https://${empresa.slug}.elprode.ar?ref=${participant.id}`
                          track('player_campaign_link_shared')
                          const text = participantCampaign.invite_message
                            ?? `¡Estoy jugando el prode del Mundial 2026 en ${empresa.name}! Sumate con mi link:`
                          if (navigator.share) {
                            await navigator.share({ title: empresa.name, text, url })
                          } else {
                            await navigator.clipboard.writeText(`${text} ${url}`)
                            alert('¡Link copiado!')
                          }
                        }}
                        className="flex-1 py-2.5 rounded-xl font-black text-[13px] text-white shrink-0 transition-all"
                        style={{ background: color }}>
                        Compartir
                      </button>
                    </div>
                  </div>

                  {/* Historial */}
                  <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest">
                        Historial de referidos
                      </div>
                    </div>
                    {!participantReferralHistory.length ? (
                      <div className="p-6 text-center">
                        <div className="text-2xl mb-2">🤝</div>
                        <div className="text-[13px] font-bold text-slate-900 mb-1">
                          Todavía no referiste a nadie
                        </div>
                        <div className="text-[12px] text-slate-400 font-medium">
                          Compartí tu link y empezá a ganar
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {participantReferralHistory.map((h, i) => (
                          <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                            <div>
                              <div className="text-[13px] font-bold text-slate-900">{h.name}</div>
                              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                {new Date(h.registered_at).toLocaleDateString('es-AR', {
                                  day: '2-digit', month: 'short', year: 'numeric'
                                })}
                              </div>
                            </div>
                            <span className="text-[11px] font-black text-green-700 bg-green-100 px-2.5 py-1 rounded-full shrink-0">
                              ✅ Se unió
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cómo funciona */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      ¿Cómo funciona?
                    </div>
                    <div className="flex flex-col gap-3">
                      {[
                        { n: '1', text: 'Compartí tu link de invitación' },
                        { n: '2', text: 'Tus amigos se registran al prode con tu link' },
                        { n: '3', text: `Acumulás referidos y podés ganar los premios de ${empresa.name}` },
                      ].map(step => (
                        <div key={step.n} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bebas text-base shrink-0"
                            style={{ background: color }}>
                            {step.n}
                          </div>
                          <p className="text-[13px] text-slate-600 font-medium">{step.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Términos y condiciones PDF */}
                  {participantCampaign.terms_pdf_url && (
                    <button
                      onClick={() => setShowTermsPdf(true)}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 bg-white text-[13px] font-black text-slate-600 hover:bg-slate-50 transition-colors w-full">
                      📄 Ver términos y condiciones
                    </button>
                  )}

                  {/* Link a prode.ar referidos */}
                  <button
                    onClick={() => setReferidosView('prode-ar')}
                    className="text-[12px] text-slate-400 text-center font-medium hover:text-slate-600 transition-colors py-1">
                    ¿Tenés un comercio? Ver referidos de prode.ar →
                  </button>
                </>
              )}

              {/* Modal PDF términos y condiciones */}
              {showTermsPdf && participantCampaign?.terms_pdf_url && (
                <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.7)' }}>
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                    <span className="text-[15px] font-black text-slate-900">Términos y condiciones</span>
                    <div className="flex items-center gap-3">
                      <a href={participantCampaign.terms_pdf_url} target="_blank" rel="noopener noreferrer"
                        onClick={() => setShowTermsPdf(false)}
                        className="text-[12px] font-bold text-blue-600 underline underline-offset-2">
                        Abrir en nueva pestaña
                      </a>
                      <button onClick={() => setShowTermsPdf(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-black text-base hover:bg-slate-200 transition-colors">
                        ✕
                      </button>
                    </div>
                  </div>
                  <iframe
                    src={participantCampaign.terms_pdf_url}
                    className="flex-1 w-full bg-white"
                    title="Términos y condiciones"
                  />
                </div>
              )}

              {/* Vista: prode.ar referidos (default si no hay campaña, o si el usuario navega a ella) */}
              {(!participantCampaign || referidosView === 'prode-ar') && (
                <>
                  {participantCampaign && referidosView === 'prode-ar' && (
                    <button
                      onClick={() => setReferidosView('campaign')}
                      className="flex items-center gap-2 text-[13px] font-black text-slate-500 hover:text-slate-700 transition-colors -mb-1">
                      ← Volver a la campaña de {empresa.name}
                    </button>
                  )}

                  {referrerLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-7 w-7 animate-spin" style={{ color }} />
                    </div>
                  ) : referrerData && (
                    <>
                      {/* Header */}
                      <div className="text-center">
                        <div className="text-3xl mb-2">🤝</div>
                        <h2 className="text-[20px] font-black text-slate-900">
                          Invitá comercios y ganá plata
                        </h2>
                        <p className="text-[13px] text-slate-500 font-medium mt-1">
                          Cada 3 comercios que paguen un plan recibís $12.000. Sin límite.
                        </p>
                      </div>

                      {/* Card de progreso */}
                      <div className="rounded-2xl p-5 text-white"
                        style={{ background: `linear-gradient(135deg, ${color}, #0D1A3A)` }}>
                        <div className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-5 text-center">
                          Tu progreso actual
                        </div>
                        {(() => {
                          const enGrupo = referrerData.total_referrals % 3
                          return (
                            <div className="flex items-center justify-center gap-4 mb-5">
                              {[0, 1, 2].map(i => {
                                const filled = i < enGrupo
                                return (
                                  <div key={i} className="flex flex-col items-center gap-2">
                                    <div
                                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4 transition-all"
                                      style={{
                                        background: filled ? '#F5C518' : 'rgba(255,255,255,0.1)',
                                        borderColor: filled ? '#F5C518' : 'rgba(255,255,255,0.2)',
                                        color: filled ? '#002B72' : 'rgba(255,255,255,0.3)',
                                      }}>
                                      {filled ? '✓' : i + 1}
                                    </div>
                                    <div className="text-[10px] font-bold text-white/40 uppercase">
                                      {filled ? 'Listo' : 'Pendiente'}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })()}
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="h-px flex-1 bg-white/20" />
                          <div className="bg-[#F5C518] text-[#002B72] font-black text-[13px] px-4 py-1.5 rounded-full">
                            = $12.000 🎉
                          </div>
                          <div className="h-px flex-1 bg-white/20" />
                        </div>
                        <div className="text-center">
                          {referrerData.total_referrals % 3 === 0 && referrerData.total_referrals === 0 ? (
                            <p className="text-white/60 text-[13px] font-medium">Compartí tu link y empezá a ganar</p>
                          ) : referrerData.total_referrals % 3 === 0 ? (
                            <p className="text-[#F5C518] text-[13px] font-black">
                              🎉 ¡Completaste un grupo! Ya ganaste ${(Math.floor(referrerData.total_referrals / 3) * 12000).toLocaleString('es-AR')}
                            </p>
                          ) : (
                            <p className="text-white/70 text-[13px] font-medium">
                              Te {3 - referrerData.total_referrals % 3 === 1 ? 'falta 1 referido' : `faltan ${3 - referrerData.total_referrals % 3} referidos`} para ganar $12.000
                            </p>
                          )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center mb-2">
                            Potencial de ganancias
                          </div>
                          <div className="flex justify-between">
                            {[{ refs: 3, amount: '$12.000' }, { refs: 6, amount: '$24.000' }, { refs: 9, amount: '$36.000' }].map(item => (
                              <div key={item.refs} className="text-center flex-1">
                                <div className="text-[#F5C518] font-black text-[14px]">{item.amount}</div>
                                <div className="text-white/40 text-[10px] font-bold">{item.refs} referidos</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Dinero acumulado */}
                      {referrerData.pending_amount > 0 && (
                        <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
                          <div className="text-center mb-4">
                            <div className="text-[11px] font-black text-green-600 uppercase tracking-widest mb-1">
                              💰 Dinero disponible para cobrar
                            </div>
                            <div className="font-bebas text-5xl text-green-700">
                              ${referrerData.pending_amount.toLocaleString('es-AR')}
                            </div>
                          </div>
                          {!showPayoutForm ? (
                            <button onClick={() => setShowPayoutForm(true)}
                              className="w-full py-3 rounded-xl font-black text-[14px] text-white bg-green-600 hover:bg-green-700 transition-all">
                              💸 Quiero cobrar
                            </button>
                          ) : payoutSent ? (
                            <div className="text-center text-[13px] font-black text-green-700 py-2">
                              ✅ ¡Solicitud enviada! Te contactamos en 24-48hs.
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <p className="text-[13px] text-slate-600 font-medium text-center">
                                Ingresá tu alias de MercadoPago, CBU o datos de pago
                              </p>
                              <textarea
                                value={paymentInfo}
                                onChange={e => setPaymentInfo(e.target.value)}
                                placeholder="Ej: mi.alias o CBU 0000003100..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-[13px] font-medium text-slate-900 bg-slate-50 focus:outline-none focus:border-green-500 resize-none"
                              />
                              <button
                                disabled={!paymentInfo.trim()}
                                onClick={async () => {
                                  await publicFetch('/player-referrals/request-payout', {
                                    method: 'POST',
                                    body: JSON.stringify({
                                      email: participant.email,
                                      name: participant.name,
                                      amount: referrerData.pending_amount,
                                      paymentInfo,
                                    })
                                  })
                                  track('player_payout_requested', { amount: referrerData.pending_amount })
                                  setPayoutSent(true)
                                }}
                                className="w-full py-3 rounded-xl font-black text-[14px] text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-40">
                                Enviar solicitud de cobro
                              </button>
                              <button onClick={() => setShowPayoutForm(false)}
                                className="text-[13px] text-slate-400 font-medium text-center">
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Link de referido */}
                      <div className="rounded-2xl bg-white border border-slate-200 p-4">
                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          🔗 Tu link de referido
                        </div>
                        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-3 text-center">
                          <div className="text-[11px] text-slate-400 font-medium mb-1">elprode.ar/ref/jugador/</div>
                          <div className="font-black text-[16px] text-slate-900">{referrerData.referral_code}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReferidosAction(async () => {
                              const url = `https://elprode.ar/ref/jugador/${referrerData.referral_code}`
                              await navigator.clipboard.writeText(url)
                              setCopied(true)
                              setTimeout(() => setCopied(false), 2000)
                              track('player_referral_link_copied')
                            })}
                            className="flex-1 py-2.5 rounded-xl font-black text-[13px] border-2 transition-all"
                            style={{
                              borderColor: color,
                              color: copied ? 'white' : color,
                              background: copied ? color : 'transparent'
                            }}>
                            {copied ? '✓ Copiado' : 'Copiar'}
                          </button>
                          <button
                            onClick={() => handleReferidosAction(async () => {
                              const url = `https://elprode.ar/ref/jugador/${referrerData.referral_code}`
                              track('player_referral_shared')
                              if (navigator.share) {
                                await navigator.share({
                                  title: 'Creá tu prode del Mundial',
                                  text: `Che, ¿tenés un comercio? Armé mi prode del Mundial en elprode.ar y está buenísimo para fidelizar clientes. Entrá por mi link:`,
                                  url
                                })
                              } else {
                                await navigator.clipboard.writeText(url)
                                alert('¡Link copiado!')
                              }
                            })}
                            className="flex-1 py-2.5 rounded-xl font-black text-[13px] text-white shrink-0 transition-all"
                            style={{ background: color }}>
                            Compartir
                          </button>
                        </div>
                      </div>

                      {/* Historial prode.ar */}
                      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest">
                            Historial de referidos
                          </div>
                        </div>
                        {!referrerData.history?.length ? (
                          <div className="p-6 text-center">
                            <div className="text-2xl mb-2">🤝</div>
                            <div className="text-[13px] font-bold text-slate-900 mb-1">Todavía no referiste a nadie</div>
                            <div className="text-[12px] text-slate-400 font-medium">Compartí tu link y empezá a ganar</div>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {referrerData.history.map(h => (
                              <div key={h.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-[13px] font-bold text-slate-900">{h.business_name}</div>
                                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    {new Date(h.created_at).toLocaleDateString('es-AR', {
                                      day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                  </div>
                                </div>
                                {h.status === 'paid' ? (
                                  <span className="text-[11px] font-black text-green-700 bg-green-100 px-2.5 py-1 rounded-full shrink-0">✅ Pagó</span>
                                ) : (
                                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">Pendiente</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Cómo funciona */}
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          ¿Cómo funciona?
                        </div>
                        <div className="flex flex-col gap-3">
                          {[
                            { n: '1', text: 'Compartí tu link con dueños de comercios' },
                            { n: '2', text: 'Cuando crean su prode y pagan un plan, sumás 1 referido' },
                            { n: '3', text: 'Cada 3 referidos que pagan recibís $12.000. Sin límite de canje.' },
                          ].map(step => (
                            <div key={step.n} className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bebas text-base shrink-0"
                                style={{ background: color }}>
                                {step.n}
                              </div>
                              <p className="text-[13px] text-slate-600 font-medium">{step.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="text-[12px] text-slate-400 text-center font-medium">
                        Al usar el programa de referidos aceptás nuestros{' '}
                        <a href="/terminos-referidos" target="_blank" rel="noopener noreferrer"
                          className="font-bold underline underline-offset-2" style={{ color }}>
                          términos y condiciones
                        </a>
                      </p>
                    </>
                  )}
                </>
              )}

            </div>
          </div>
        )}

      </div>

      {/* Floating save button */}
      {hasChanges && tab === 'pronosticar' && (
        <div className="fixed bottom-[64px] left-0 right-0 max-w-md mx-auto px-4 pb-3 z-40">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-2xl py-4 text-white font-black text-base shadow-lg hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: color }}>
            {saving
              ? <><span className="animate-spin">⚽</span> Guardando...</>
              : savedMsg
                ? savedMsg
                : '💾 Guardar pronósticos'}
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <ReferidosTermsModal
        open={showTermsModal}
        onClose={() => { setShowTermsModal(false); setPendingAction(null) }}
        onAccept={() => {
          setShowTermsModal(false)
          track('player_referral_terms_accepted')
          if (pendingAction) { pendingAction(); setPendingAction(null) }
        }}
      />

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex shadow-lg z-50">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setTab(item.id); track('player_tab_view', { tab_name: item.id }) }}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
            style={{ color: tab === item.id ? color : '#94a3b8' }}>
            <span className={`text-xl transition-transform ${tab === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
            <span className="text-[10px] font-black">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
