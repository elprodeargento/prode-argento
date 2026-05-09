'use client'
import { useState, useEffect, useRef } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

async function publicFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.json()
}

type Tab = 'home' | 'pronosticar' | 'ranking' | 'resultados' | 'perfil'

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
}

const GRADIENT_BY_CAT: Record<string, string> = {
  '🍕 Gastronomía':    'linear-gradient(135deg, #1a3a5c, #2d6a8f)',
  '☕ Cafetería':       'linear-gradient(135deg, #3d1a00, #8B4513)',
  '🛒 Supermercado':   'linear-gradient(135deg, #0d3b2e, #1a7a5e)',
  '💊 Farmacia':       'linear-gradient(135deg, #0d2e3b, #1a5e7a)',
  '👗 Indumentaria':   'linear-gradient(135deg, #2e0d3b, #7a1a5e)',
  '💆 Bienestar':      'linear-gradient(135deg, #1a3b2e, #2d8f6a)',
  '📚 Librería':       'linear-gradient(135deg, #3b2e0d, #8f6a2d)',
  '🎬 Entretenimiento':'linear-gradient(135deg, #1a0d3b, #5e1a8f)',
  '🔧 Servicios':      'linear-gradient(135deg, #2e2e2e, #5a5a5a)',
  '🏠 Hogar':          'linear-gradient(135deg, #1a2e3b, #2d5e8f)',
}

function PromoCarousel({ promos }: { promos: Promo[] }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (promos.length <= 1) return
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % promos.length), 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
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
        className="h-[88px] rounded-[16px] overflow-hidden relative flex items-center cursor-pointer select-none"
        style={{ background: promo.image_url ? undefined : bg }}
        onClick={() => setCurrent(c => (c + 1) % promos.length)}
      >
        {promo.image_url && (
          <img src={promo.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.15) 60%,transparent 100%)' }} />
        <div className="relative z-10 px-4 flex flex-col gap-1 flex-1 min-w-0">
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
  const [editForm, setEditForm] = useState({ name: participant.name, email: participant.email, phone: participant.phone })
  const [editSaving, setEditSaving] = useState(false)
  const [showPointsInfo, setShowPointsInfo] = useState(false)
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<Array<{ participant_id: string; name: string; weekly_points: number; exact_results: number; rank: number }>>([])
  const [exactAlert, setExactAlert] = useState(false)
  const color = empresa.primary_color ?? '#002B72'
  const prizes = empresa.prizes ?? []

  useEffect(() => {
    // Fetch nearby promos silently using geolocation if available
    function loadPromos(lat = 0, lon = 0) {
      publicFetch(`/promos/nearby?lat=${lat}&lon=${lon}`)
        .then((data: Promo[]) => setPromos(data ?? []))
        .catch(() => {})
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
          .catch(() => {})

        // Leaderboard semanal
        publicFetch(`/leaderboard/${empresa.id}/weekly`)
          .then((data: any) => setWeeklyLeaderboard(data?.entries ?? []))
          .catch(() => {})

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
      setSavedMsg('✅ Guardados')
      setHasChanges(false)
      // Refresh predictions
      const fresh = await publicFetch(`/predictions/participant/${participant.id}`).catch(() => [])
      const predMap: Record<number, RawPrediction> = {}
      for (const p of (fresh as RawPrediction[])) predMap[p.match_id] = p
      setApiPreds(predMap)
    } catch (e: any) {
      setSavedMsg(`Error: ${e.message}`)
    } finally {
      setSaving(false)
      setTimeout(() => setSavedMsg(''), 3000)
    }
  }

  const handleEditSave = async () => {
    setEditSaving(true)
    try {
      await publicFetch(`/participants/${participant.id}`, {
        method: 'PATCH',
        body: JSON.stringify(editForm),
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
    { id: 'perfil', icon: '👤', label: 'Perfil' },
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
              {empresa.logo_url ? <img src={empresa.logo_url} alt="" className="w-full h-full object-cover" /> : '⚽'}
            </div>
            <div>
              <div className="font-bebas text-base tracking-widest">{empresa.name.toUpperCase()}</div>
              <div className="text-white/50 text-xs font-semibold">Prode Mundial 2026</div>
            </div>
          </div>
          <button onClick={() => setTab('perfil')} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base">👤</button>
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
              </div>
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

            <button
              onClick={async () => {
                const url = `https://${empresa.slug}.elprode.ar`
                const text = `¡Estoy jugando el prode del Mundial 2026 en ${empresa.name}! Sumate acá:`
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
              👥 Invitá a un amigo
            </button>

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
                          onChange={e => { setPreds(p => ({...p, [m.id]: {...p[m.id], h: e.target.value, a: p[m.id]?.a ?? ''}})); setHasChanges(true) }}
                          className="w-10 h-10 text-center border-2 border-slate-200 rounded-xl font-bebas text-xl focus:outline-none disabled:bg-slate-50"
                          style={{ borderColor: preds[m.id]?.h !== undefined && preds[m.id]?.h !== '' ? color : undefined }} />
                        <span className="font-bebas text-xl text-slate-400">:</span>
                        <input type="number" min={0} max={20} disabled={locked}
                          value={preds[m.id]?.a ?? ''}
                          onChange={e => { setPreds(p => ({...p, [m.id]: {...p[m.id], a: e.target.value, h: p[m.id]?.h ?? ''}})); setHasChanges(true) }}
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
                <input placeholder="Teléfono" type="tel" value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-medium text-slate-900 bg-slate-50 focus:outline-none focus:border-[#002B72] transition-colors" />
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
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex shadow-lg z-50">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
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
