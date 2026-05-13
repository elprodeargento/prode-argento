'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPut } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import { Loader2, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import { IgPublishModal } from './IgPublishModal'
import { SOCIAL_ENABLED } from '@/lib/features'

interface Prize {
  id: string
  rank: number
  description: string
}

interface WeeklyEntry {
  participant_id: string
  name: string
  email: string
  weekly_points: number
  exact_results: number
  rank: number
}

// ── Premios semanales ──────────────────────────────────────────────────────

interface WeekPrize {
  rank: number
  description: string
}

interface WorldCupWeek {
  index: number
  label: string
  start: Date
  end: Date
}

function getWorldCupWeeks(): WorldCupWeek[] {
  const wcStart = new Date('2026-06-11')
  const wcEnd   = new Date('2026-07-19')
  const weeks: WorldCupWeek[] = []
  let current = new Date(wcStart)
  let idx = 0
  while (current <= wcEnd) {
    const weekStart = new Date(current)
    const dow = current.getDay()
    const toSunday = dow === 0 ? 0 : 7 - dow
    const weekEnd = new Date(current)
    weekEnd.setDate(weekEnd.getDate() + toSunday)
    if (weekEnd > wcEnd) weekEnd.setTime(wcEnd.getTime())
    weeks.push({ index: idx, label: `Semana ${idx + 1}`, start: weekStart, end: weekEnd })
    current = new Date(weekEnd)
    current.setDate(current.getDate() + 1)
    idx++
  }
  return weeks
}

function formatWCWeekLabel(week: WorldCupWeek): string {
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const s = week.start, e = week.end
  if (s.getMonth() === e.getMonth())
    return `${s.getDate()} - ${e.getDate()} ${months[s.getMonth()]}`
  return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]}`
}

function getCurrentWCWeekIdx(weeks: WorldCupWeek[]): number {
  const today = new Date()
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return weeks.findIndex(w => {
    const s = new Date(w.start.getFullYear(), w.start.getMonth(), w.start.getDate())
    const e = new Date(w.end.getFullYear(), w.end.getMonth(), w.end.getDate())
    return t >= s && t <= e
  })
}

const WC_WEEKS = getWorldCupWeeks()

// ── Tips slider ────────────────────────────────────────────────────────────

const TIPS = [
  {
    emoji: '🎁',
    titulo: 'Los premios convierten jugadores en clientes',
    texto: 'Un 10% de descuento o un café gratis es suficiente para que el ganador tenga una razón concreta de volver a tu local esta semana.',
  },
  {
    emoji: '📅',
    titulo: 'Premios semanales = contacto semanal',
    texto: 'Cada semana que termina es una oportunidad de comunicarte con tus clientes. El que gana se acuerda de vos. El que no gana quiere revancha.',
  },
  {
    emoji: '💡',
    titulo: 'No hace falta gastar mucho',
    texto: 'Los premios más efectivos tienen valor percibido alto y costo real bajo: un postre, un descuento, prioridad en un turno, acceso anticipado a algo.',
  },
  {
    emoji: '📸',
    titulo: 'Publicar al ganador multiplica el efecto',
    texto: 'Cuando publicás el podio en Instagram, los que no ganaron lo ven y quieren participar la próxima semana. Es publicidad gratis generada por el juego.',
  },
  {
    emoji: '💬',
    titulo: 'WhatsApp tiene 98% de tasa de apertura',
    texto: 'El email se ignora, las redes se pierden en el feed. Un WhatsApp llega directo al bolsillo de tu cliente. Usalo para avisarle que ganó, para recordarle que cargue sus pronósticos.',
  },
]

function TipsSlider() {
  const activeTips = SOCIAL_ENABLED ? TIPS : TIPS.filter(t => !t.titulo.includes('Instagram') && !t.titulo.includes('WhatsApp'))
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
    }, 15000)
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
          {activeTips.map((_, i) => (
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

// ──────────────────────────────────────────────────────────────────────────

export function PrizeManager() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [igConnected, setIgConnected] = useState(false)
  const [igModalOpen, setIgModalOpen] = useState(false)
  const [igFinalModalOpen, setIgFinalModalOpen] = useState(false)
  // ── Premios semanales state ──────────────────────────────────────────────
  const currentWCWeekIdx = getCurrentWCWeekIdx(WC_WEEKS)
  const [wpWeekIdx, setWpWeekIdx] = useState(Math.max(0, currentWCWeekIdx))
  const [wpPrizesMap, setWpPrizesMap] = useState<Record<string, WeekPrize[]>>({})
  const [wpDraftPrizes, setWpDraftPrizes] = useState<WeekPrize[]>([{ rank: 1, description: '' }])
  const [savingWpPrizes, setSavingWpPrizes] = useState(false)
  const [wpSaved, setWpSaved] = useState(false)
  const [wpWeeklyData, setWpWeeklyData] = useState<{ entries: WeeklyEntry[]; weekStart: string; weekEnd: string } | null>(null)
  const [wpWeeklyLoading, setWpWeeklyLoading] = useState(true)
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchPrizes() {
      try {
        const [prizeData, weeklyData, igStatus] = await Promise.all([
          apiGet<Prize[]>('/prizes/me'),
          apiGet<Record<string, Array<{ rank: number; description: string }>>>('/prizes/weekly/me'),
          apiGet<{ connected: boolean }>('/instagram/status').catch(() => ({ connected: false })),
        ])
        setPrizes(prizeData || [])
        setWpPrizesMap(weeklyData || {})
        setIgConnected(igStatus?.connected ?? false)
      } catch (error) {
        console.error('Error fetching prizes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPrizes()
  }, [])

  // ── Premios semanales effects ────────────────────────────────────────────

  useEffect(() => {
    const existing = wpPrizesMap[String(wpWeekIdx)] ?? []
    setWpDraftPrizes(existing.length > 0 ? [...existing] : [{ rank: 1, description: '' }])
  }, [wpWeekIdx, wpPrizesMap])

  useEffect(() => {
    async function fetchWpWeekly() {
      setWpWeeklyLoading(true)
      try {
        const offset = wpWeekIdx - currentWCWeekIdx
        const data = await apiGet<{ entries: WeeklyEntry[]; weekStart: string; weekEnd: string }>(
          `/leaderboard/me/weekly?offset=${offset}`
        )
        setWpWeeklyData(data)
      } catch (e) {
        console.error('Error fetching weekly leaderboard:', e)
      } finally {
        setWpWeeklyLoading(false)
      }
    }
    fetchWpWeekly()
  }, [wpWeekIdx, currentWCWeekIdx])

  // ─────────────────────────────────────────────────────────────────────────

  const wpAddPrize = () => {
    setWpDraftPrizes(prev => [...prev, { rank: prev.length + 1, description: '' }])
  }

  const wpRemovePrizeAt = (idx: number) => {
    setWpDraftPrizes(prev => prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, rank: i + 1 })))
  }

  const wpUpdatePrize = (idx: number, description: string) => {
    setWpDraftPrizes(prev => prev.map((p, i) => i === idx ? { ...p, description } : p))
  }

  const handleSaveWpPrizes = async () => {
    setSavingWpPrizes(true)
    try {
      const filtered = wpDraftPrizes.filter(p => p.description.trim())
      await apiPut('/prizes/weekly/me', { weekIndex: wpWeekIdx, prizes: filtered })
      const updated = { ...wpPrizesMap, [String(wpWeekIdx)]: filtered }
      setWpPrizesMap(updated)
      trackEvent('biz_weekly_prize_configured')
      setWpSaved(true)
      setTimeout(() => setWpSaved(false), 2500)
    } catch {
      alert('Error al guardar los premios de la semana')
    } finally {
      setSavingWpPrizes(false)
    }
  }

  const addPrize = () => {
    const nextRank = prizes.length + 1
    const newPrize: Prize = {
      id: crypto.randomUUID(),
      rank: nextRank,
      description: ''
    }
    setPrizes([...prizes, newPrize])
  }

  const removePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id))
  }

  const updatePrize = (id: string, description: string) => {
    setPrizes(prizes.map(p => p.id === id ? { ...p, description } : p))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiPut('/prizes/me', {
        prizes: prizes.map(p => ({ rank: p.rank, description: p.description })),
      })
      trackEvent('biz_prize_configured')
      alert('Premios guardados correctamente')
    } catch {
      alert('Error al guardar premios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#DDE1EF]" />
      </div>
    )
  }

  const wpCurrentPrizes = wpPrizesMap[String(wpWeekIdx)] ?? []
  const wpPrizesText = wpCurrentPrizes
    .map((p, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️'} ${p.description}`)
    .join('\n')
  const waMessage = wpWeeklyData?.entries?.[0]
    ? `🏆 ¡Tenemos un ganador de ${WC_WEEKS[wpWeekIdx]?.label}!\n\n🥇 ${wpWeeklyData.entries[0].name} — ${wpWeeklyData.entries[0].weekly_points} puntos${wpPrizesText ? `\n\n🎁 Premios:\n${wpPrizesText}` : ''}\n\n¡Felicitaciones! 🎉⚽`
    : `🏆 ¡Resultados de ${WC_WEEKS[wpWeekIdx]?.label}!\n\n${wpPrizesText ? `🎁 Premios:\n${wpPrizesText}\n\n` : ''}¡Gracias por participar! ⚽`

  return (
    <div className="flex flex-col gap-6">
      {/* TIPS SLIDER */}
      <TipsSlider />

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">
            Premios
          </h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Definí qué gana cada puesto del ranking</p>
        </div>
      </div>

      {/* ── PREMIOS SEMANALES ─────────────────────────────────────────────── */}
      <div className="card">
        <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
          <span className="text-[20px]">📅</span>
          <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Premios semanales</h3>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Navegación de semanas */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWpWeekIdx(i => Math.max(0, i - 1))}
              disabled={wpWeekIdx === 0}
              className="flex items-center gap-1 text-[13px] font-bold text-[#5A6480] hover:text-[#002B72] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <span className="text-[13px] font-black text-[#0D1A3A] text-center">
              {WC_WEEKS[wpWeekIdx]?.label} · {WC_WEEKS[wpWeekIdx] ? formatWCWeekLabel(WC_WEEKS[wpWeekIdx]) : '—'}
              {wpWeekIdx === currentWCWeekIdx && currentWCWeekIdx !== -1 && (
                <span className="ml-2 text-[11px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Esta semana</span>
              )}
            </span>
            <button
              onClick={() => setWpWeekIdx(i => Math.min(WC_WEEKS.length - 1, i + 1))}
              disabled={wpWeekIdx === WC_WEEKS.length - 1}
              className="flex items-center gap-1 text-[13px] font-bold text-[#5A6480] hover:text-[#002B72] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Empty state — desaparece cuando el usuario empieza a escribir */}
          {wpDraftPrizes.length === 1 && wpDraftPrizes[0].description === '' && (
            <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 p-4 mb-2">
              <span>🎯</span>
              <span className="font-black"> ¿Qué gana el cliente esta semana?</span>
              <br />
              <span className="text-[13px] text-[#5A6480]">
                Definí un premio y dale a tus clientes una razón concreta de volver a tu local.
              </span>
            </div>
          )}

          {/* Lista editable de premios para la semana */}
          <div className="flex flex-col gap-[10px]">
            {wpDraftPrizes.map((prize, idx) => (
              <div key={idx} className="flex items-center gap-3 p-[12px_14px] bg-[#F1F3F9] rounded-[10px] border-[1.5px] border-[#DDE1EF]">
                <span className="text-[28px] shrink-0">
                  {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : prize.rank === 3 ? '🥉' : '🎖️'}
                </span>
                <input
                  type="text"
                  value={prize.description}
                  onChange={(e) => wpUpdatePrize(idx, e.target.value)}
                  placeholder="Ej: 10% de descuento"
                  className="flex-1 bg-white border-[1.5px] border-[#DDE1EF] rounded-[8px] px-[14px] py-[10px] text-[14px] font-semibold text-[#0D1A3A] outline-none focus:border-[#003FA3] transition-all"
                />
                <button
                  onClick={() => wpRemovePrizeAt(idx)}
                  className="w-8 h-8 flex items-center justify-center bg-[#FDECEB] text-[#D93025] rounded-lg hover:bg-[#D93025] hover:text-white transition-all text-lg font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#C8CEDF] bg-transparent text-[#5A6480] text-[14px] font-bold hover:border-[#003FA3] hover:text-[#003FA3] hover:bg-[#EBF4FC] transition-all"
            onClick={wpAddPrize}
          >
            + Agregar otro puesto
          </button>

          <button
            disabled={savingWpPrizes}
            onClick={handleSaveWpPrizes}
            className="w-full text-white text-[14px] font-black p-[14px] rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: wpSaved ? '#18A06A' : '#002B72' }}
          >
            {savingWpPrizes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingWpPrizes ? 'Guardando...' : wpSaved ? '✓ Guardado' : 'Guardar premios de la semana'}
          </button>

          {/* Divisor */}
          <div className="border-t border-[#DDE1EF]" />

          {/* Ranking de la semana */}
          <div>
            <label className="block text-[12px] font-black text-[#5A6480] uppercase tracking-wider mb-3">Ranking de la semana</label>

            {wpWeeklyLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-7 w-7 animate-spin text-[#DDE1EF]" /></div>
            ) : !wpWeeklyData?.entries?.length ? (
              <div className="py-8 text-center text-[13px] font-medium text-[#8E96AE]">
                No hay partidos jugados esta semana todavía.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {wpWeeklyData.entries.map((entry) => {
                  const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null
                  return (
                    <div key={entry.participant_id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] transition-all
                        ${entry.rank === 1 ? 'border-amber-200 bg-amber-50' : 'border-[#DDE1EF] bg-[#F8F9FC]'}`}>
                      <span className="text-[20px] w-7 text-center shrink-0">
                        {medal ?? <span className="text-[13px] font-black text-[#8E96AE]">{entry.rank}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-black text-[#0D1A3A] truncate">{entry.name}</div>
                        <div className="text-[11px] text-[#8E96AE] font-medium">{entry.exact_results} exactos esta semana</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bebas text-[24px] text-[#002B72] leading-none">{entry.weekly_points}</div>
                        <div className="text-[10px] font-bold text-[#8E96AE]">pts</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Botones de acción — solo si hay premios configurados para esta semana */}
          {wpCurrentPrizes.length > 0 && (
            <div className="flex gap-2 pt-1 border-t border-[#DDE1EF]">
              {SOCIAL_ENABLED && (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5
                    rounded-xl text-white text-[13px] font-black hover:opacity-90
                    transition-all shadow-md"
                  style={{ background: '#25D366' }}
                >
                  💬 Enviar por WhatsApp
                </a>
              )}
              <button
                onClick={() => (!SOCIAL_ENABLED || igConnected) && setIgModalOpen(true)}
                disabled={!wpWeeklyData?.entries?.length || (SOCIAL_ENABLED && !igConnected)}
                title={SOCIAL_ENABLED && !igConnected ? 'Conectá tu cuenta de Instagram desde Configuración' : undefined}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[13px] font-black hover:opacity-90 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #cc2366)' }}
              >
                📸 {SOCIAL_ENABLED ? 'Publicar ganador' : 'Exportar para Instagram'}
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: editable prize list */}
        <div className="card">
          <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[20px]">🏆</span>
              <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Premios configurados</h3>
            </div>
            <button
              onClick={addPrize}
              className="text-[12px] font-bold text-[#003FA3] hover:underline"
            >
              + Agregar puesto
            </button>
          </div>
          <div className="p-[20px] flex flex-col gap-[14px]">
            {prizes.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-[#DDE1EF] bg-[#F1F3F9] p-6 text-center">
                <span className="text-3xl">🏆</span>
                <div className="font-black text-[#0D1A3A] mt-2">¿Qué gana el campeón del mundial?</div>
                <div className="text-[13px] text-[#5A6480] mt-1">
                  El premio final es el gran motivador para que tus clientes participen durante todo el torneo.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-[10px]">
                {prizes.map((prize) => (
                  <div key={prize.id} className="flex items-center gap-3 p-[12px_14px] bg-[#F1F3F9] rounded-[10px] border-[1.5px] border-[#DDE1EF]">
                    <span className="text-[28px] shrink-0">
                      {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : prize.rank === 3 ? '🥉' : '🎖️'}
                    </span>
                    <input
                      type="text"
                      value={prize.description}
                      onChange={(e) => updatePrize(prize.id, e.target.value)}
                      placeholder="Ej: Camiseta oficial..."
                      className="flex-1 bg-white border-[1.5px] border-[#DDE1EF] rounded-[8px] px-[14px] py-[10px] text-[14px] font-semibold text-[#0D1A3A] outline-none focus:border-[#003FA3] transition-all"
                    />
                    <button
                      onClick={() => removePrize(prize.id)}
                      className="w-8 h-8 flex items-center justify-center bg-[#FDECEB] text-[#D93025] rounded-lg hover:bg-[#D93025] hover:text-white transition-all text-lg font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#C8CEDF] bg-transparent text-[#5A6480] text-[14px] font-bold hover:border-[#003FA3] hover:text-[#003FA3] hover:bg-[#EBF4FC] transition-all"
              onClick={addPrize}
            >
              + Agregar otro premio
            </button>

            <button
              disabled={saving}
              onClick={handleSave}
              className="w-full mt-4 bg-[#002B72] text-white text-[14px] font-black p-[14px] rounded-xl hover:bg-[#00318A] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Guardando...' : 'Guardar premios'}
            </button>
          </div>
        </div>

        {/* Right: podium preview (Keep but styled like a card) */}
        <div className="card">
          <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[20px]">📊</span>
              <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Vista previa del podio</h3>
            </div>
            <button
              onClick={() => (!SOCIAL_ENABLED || igConnected) && setIgFinalModalOpen(true)}
              disabled={SOCIAL_ENABLED && !igConnected}
              title={SOCIAL_ENABLED && !igConnected ? 'Conectá tu cuenta de Instagram desde Configuración' : undefined}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-black hover:opacity-90 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #cc2366)' }}
            >
              {SOCIAL_ENABLED ? 'Publicar en Instagram' : 'Exportar para Instagram'}
            </button>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {[1, 2, 3].map((rank) => {
              const prize = prizes.find(p => p.rank === rank)
              const name = `Puesto ${rank}`
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
              const bgClass = rank === 1
                ? 'bg-amber-50/50 border-amber-200'
                : rank === 2
                  ? 'bg-[#F1F3F9] border-[#DDE1EF]'
                  : 'bg-orange-50/30 border-orange-200/50'

              return (
                <div key={rank} className={`flex items-center gap-4 p-4 border-[1.5px] rounded-2xl transition-all ${bgClass}`}>
                  <span className="text-[28px] shrink-0">{medal}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-black text-[#0D1A3A] truncate">{name}</div>
                    <div className="text-[12px] font-bold text-[#5A6480] truncate mt-0.5">
                      {prize?.description || <span className="italic text-[#8E96AE]">Sin premio configurado</span>}
                    </div>
                  </div>
                  {rank === 1 && (
                    <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wider">
                      CAMPEÓN
                    </span>
                  )}
                </div>
              )
            })}

            <div className="mt-4 pt-4 border-t border-[#DDE1EF]">
              <p className="text-[11px] font-bold text-[#8E96AE] text-center uppercase tracking-widest leading-relaxed">
                Los nombres se actualizan automáticamente al terminar el prode
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* IG Modal — ranking semanal */}
      <IgPublishModal
        open={igModalOpen}
        onClose={() => setIgModalOpen(false)}
        empresa="MI COMERCIO"
        igConnected={igConnected}
        podium={(wpWeeklyData?.entries ?? []).slice(0, 3).map(e => ({
          name: e.name,
          points: e.weekly_points,
          position: e.rank,
        }))}
      />

      {/* IG Modal — podio final del mundial */}
      <IgPublishModal
        open={igFinalModalOpen}
        onClose={() => setIgFinalModalOpen(false)}
        empresa="MI COMERCIO"
        igConnected={igConnected}
        podium={prizes.slice(0, 3).map((p, i) => ({
          name: p.description || `Puesto ${i + 1}`,
          points: 0,
          position: i + 1,
        }))}
      />
    </div>
  )
}
