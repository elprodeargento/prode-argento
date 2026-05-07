'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPut } from '@/lib/api'
import { Loader2, Save, ChevronDown, X, Plus } from 'lucide-react'

interface Prize {
  id: string
  rank: number
  description: string
}

interface WeekPrize {
  rank: number
  description: string
}

interface Week {
  index: number
  label: string
  start: Date
  end: Date
}

type WeeklyPrizesMap = Record<string, WeekPrize[]>

const RANK_MEDALS = ['🥇', '🥈', '🥉', '🎖️', '🎖️']
const RANK_LABELS = ['Primer lugar', 'Segundo lugar', 'Tercer lugar', 'Cuarto lugar', 'Quinto lugar']

// Mundial: 11 jun – 19 jul 2026, agrupado lunes-domingo
function getWorldCupWeeks(): Week[] {
  const worldCupStart = new Date('2026-06-11')
  const worldCupEnd = new Date('2026-07-19')
  const weeks: Week[] = []
  let current = new Date(worldCupStart)
  let index = 1

  while (current <= worldCupEnd) {
    const weekStart = new Date(current)
    const dayOfWeek = current.getDay()
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const weekEnd = new Date(current)
    weekEnd.setDate(weekEnd.getDate() + daysUntilSunday)
    if (weekEnd > worldCupEnd) weekEnd.setTime(worldCupEnd.getTime())

    weeks.push({ index, label: `Semana ${index}`, start: weekStart, end: weekEnd })

    current = new Date(weekEnd)
    current.setDate(current.getDate() + 1)
    index++
  }

  return weeks
}

function formatDateRange(start: Date, end: Date): string {
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} - ${end.getDate()} ${months[start.getMonth()]}`
  }
  return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`
}

function getWeekStatus(week: Week, today: Date): 'proxima' | 'en-curso' | 'finalizada' {
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startDay = new Date(week.start.getFullYear(), week.start.getMonth(), week.start.getDate())
  const endDay = new Date(week.end.getFullYear(), week.end.getMonth(), week.end.getDate())

  if (todayDay > endDay) return 'finalizada'
  if (todayDay >= startDay) return 'en-curso'
  return 'proxima'
}

const WEEKS = getWorldCupWeeks()

export function PrizeManager() {
  const router = useRouter()
  const [mundialPrizes, setMundialPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)

  const [weeklyPrizes, setWeeklyPrizes] = useState<WeeklyPrizesMap>({})
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)
  const [draftPrizes, setDraftPrizes] = useState<WeekPrize[]>([])
  const [savingWeek, setSavingWeek] = useState(false)

  const today = new Date()

  useEffect(() => {
    async function fetchData() {
      try {
        const [prizeData, bizData] = await Promise.all([
          apiGet<Prize[]>('/prizes/me'),
          apiGet<{ id: string }>('/businesses/me'),
        ])
        setMundialPrizes(prizeData || [])
        setBusinessId(bizData.id)
      } catch (e) {
        console.error('Error fetching prizes:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!businessId) return
    try {
      const stored = localStorage.getItem(`weekly-prizes-${businessId}`)
      if (stored) setWeeklyPrizes(JSON.parse(stored))
    } catch {}
  }, [businessId])

  const persistWeeklyPrizes = (updated: WeeklyPrizesMap) => {
    if (!businessId) return
    localStorage.setItem(`weekly-prizes-${businessId}`, JSON.stringify(updated))
    setWeeklyPrizes(updated)
  }

  const handleExpandWeek = (weekIndex: number) => {
    if (expandedWeek === weekIndex) {
      setExpandedWeek(null)
      return
    }
    setExpandedWeek(weekIndex)
    const existing = weeklyPrizes[String(weekIndex)] ?? []
    setDraftPrizes(existing.length > 0 ? [...existing] : [{ rank: 1, description: '' }])
  }

  const handleAddRank = () => {
    setDraftPrizes(prev => [...prev, { rank: prev.length + 1, description: '' }])
  }

  const handleRemoveRank = (i: number) => {
    setDraftPrizes(prev => prev.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, rank: idx + 1 })))
  }

  const handleUpdateDraft = (i: number, description: string) => {
    setDraftPrizes(prev => prev.map((p, idx) => idx === i ? { ...p, description } : p))
  }

  const handleSaveWeek = (weekIndex: number) => {
    setSavingWeek(true)
    const filtered = draftPrizes.filter(p => p.description.trim())
    persistWeeklyPrizes({ ...weeklyPrizes, [String(weekIndex)]: filtered })
    setSavingWeek(false)
    setExpandedWeek(null)
  }

  // Mundial prizes
  const addPrize = () => {
    setMundialPrizes(prev => [...prev, { id: crypto.randomUUID(), rank: prev.length + 1, description: '' }])
  }

  const removePrize = (id: string) => {
    setMundialPrizes(prev => prev.filter(p => p.id !== id))
  }

  const updatePrize = (id: string, description: string) => {
    setMundialPrizes(prev => prev.map(p => p.id === id ? { ...p, description } : p))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiPut('/prizes/me', {
        prizes: mundialPrizes.map(p => ({ rank: p.rank, description: p.description })),
      })
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

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">Premios</h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Definí los premios del torneo y de cada semana</p>
        </div>
      </div>

      {/* ── SECCIÓN 1: PREMIOS DEL MUNDIAL ── */}
      <div>
        <h2 className="text-[12px] font-black text-[#5A6480] uppercase tracking-wider mb-3">Premios del mundial</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Editable list */}
          <div className="card">
            <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[20px]">🏆</span>
                <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Premios configurados</h3>
              </div>
              <button onClick={addPrize} className="text-[12px] font-bold text-[#003FA3] hover:underline">
                + Agregar puesto
              </button>
            </div>
            <div className="p-[20px] flex flex-col gap-[14px]">
              <div className="flex flex-col gap-[10px]">
                {mundialPrizes.map((prize) => (
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

          {/* Podium preview */}
          <div className="card">
            <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
              <span className="text-[20px]">📊</span>
              <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Vista previa del podio</h3>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {[1, 2, 3].map((rank) => {
                const prize = mundialPrizes.find(p => p.rank === rank)
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
                      <div className="text-[14px] font-black text-[#0D1A3A] truncate">Puesto {rank}</div>
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
      </div>

      {/* ── SECCIÓN 2: PREMIOS SEMANALES ── */}
      <div>
        <h2 className="text-[12px] font-black text-[#5A6480] uppercase tracking-wider mb-3">Premios semanales</h2>
        <div className="card">
          <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
            <span className="text-[20px]">📅</span>
            <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Semanas del mundial</h3>
            <span className="text-[12px] text-[#5A6480] font-medium ml-auto">11 jun – 19 jul 2026</span>
          </div>

          <div className="divide-y divide-[#DDE1EF]">
            {WEEKS.map((week) => {
              const status = getWeekStatus(week, today)
              const weekPrizes = weeklyPrizes[String(week.index)] ?? []
              const isExpanded = expandedWeek === week.index

              return (
                <div key={week.index}>
                  {/* Week row */}
                  <div
                    className={`flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#F8F9FC] transition-colors ${isExpanded ? 'bg-[#F1F3F9]' : ''}`}
                    onClick={() => handleExpandWeek(week.index)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-black text-[#0D1A3A]">{week.label}</span>
                        <span className="text-[12px] font-medium text-[#5A6480]">{formatDateRange(week.start, week.end)}</span>
                        {status === 'en-curso' && (
                          <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wider">En curso</span>
                        )}
                        {status === 'finalizada' && (
                          <span className="text-[10px] font-black text-[#5A6480] bg-[#DDE1EF] px-2 py-0.5 rounded-full uppercase tracking-wider">Finalizada</span>
                        )}
                        {status === 'proxima' && (
                          <span className="text-[10px] font-black text-[#002B72] bg-[#EBF0FF] px-2 py-0.5 rounded-full uppercase tracking-wider">Próxima</span>
                        )}
                      </div>

                      {weekPrizes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {weekPrizes.map((p, i) => (
                            <span key={i} className="flex items-center gap-1 text-[11px] font-bold text-[#0D1A3A] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              {RANK_MEDALS[i] ?? '🎖️'} {p.description}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {status === 'finalizada' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push('/empresa/notificaciones') }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002B72] text-white text-[11px] font-black hover:bg-[#00318A] transition-all"
                        >
                          📢 Notificar ganador
                        </button>
                      )}
                      {weekPrizes.length === 0 && status !== 'finalizada' && (
                        <span className="text-[12px] font-bold text-[#003FA3]">+ Agregar premio</span>
                      )}
                      <ChevronDown className={`h-4 w-4 text-[#8E96AE] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Inline expanded panel */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-4 bg-[#F8F9FC] border-t border-[#DDE1EF]">
                      <div className="flex flex-col gap-3">
                        {draftPrizes.map((dp, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-[20px] shrink-0 w-7 text-center">{RANK_MEDALS[i] ?? '🎖️'}</span>
                            <span className="text-[12px] font-black text-[#5A6480] w-28 shrink-0">
                              {RANK_LABELS[i] ?? `Puesto ${i + 1}`}
                            </span>
                            <input
                              type="text"
                              value={dp.description}
                              onChange={(e) => handleUpdateDraft(i, e.target.value)}
                              placeholder="Ej: 10% de descuento"
                              className="flex-1 bg-white border-[1.5px] border-[#DDE1EF] rounded-[8px] px-[14px] py-[10px] text-[14px] font-semibold text-[#0D1A3A] outline-none focus:border-[#003FA3] transition-all"
                            />
                            <button
                              onClick={() => handleRemoveRank(i)}
                              className="w-8 h-8 flex items-center justify-center text-[#8E96AE] hover:text-[#D93025] hover:bg-[#FDECEB] rounded-lg transition-all shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={handleAddRank}
                          className="flex items-center gap-2 text-[13px] font-bold text-[#003FA3] hover:text-[#002B72] transition-colors mt-1 w-fit"
                        >
                          <Plus className="h-4 w-4" /> Agregar otro puesto
                        </button>

                        <div className="flex justify-end mt-1">
                          <button
                            onClick={() => handleSaveWeek(week.index)}
                            disabled={savingWeek}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002B72] text-white text-[13px] font-black hover:bg-[#00318A] transition-all disabled:opacity-50"
                          >
                            {savingWeek ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
