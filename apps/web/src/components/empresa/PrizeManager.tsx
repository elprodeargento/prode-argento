'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPut, apiPatch } from '@/lib/api'
import { Loader2, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import { IgPublishModal } from './IgPublishModal'
import { WhatsAppSendModal } from './WhatsAppSendModal'

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

function formatWeekLabel(start: string, end: string) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

export function PrizeManager() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Weekly prizes
  const [weekOffset, setWeekOffset] = useState(0)
  const [weeklyData, setWeeklyData] = useState<{ entries: WeeklyEntry[]; weekStart: string; weekEnd: string } | null>(null)
  const [weeklyLoading, setWeeklyLoading] = useState(true)
  const [weeklyPrize, setWeeklyPrize] = useState('')
  const [savingWeeklyPrize, setSavingWeeklyPrize] = useState(false)
  const [igModalOpen, setIgModalOpen] = useState(false)
  const [waModalOpen, setWaModalOpen] = useState(false)

  useEffect(() => {
    async function fetchPrizes() {
      try {
        const [prizeData, bizData] = await Promise.all([
          apiGet<Prize[]>('/prizes/me'),
          apiGet<{ weekly_prize_description?: string }>('/businesses/me'),
        ])
        setPrizes(prizeData || [])
        setWeeklyPrize(bizData.weekly_prize_description ?? '')
      } catch (error) {
        console.error('Error fetching prizes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPrizes()
  }, [])

  useEffect(() => {
    async function fetchWeekly() {
      setWeeklyLoading(true)
      try {
        const data = await apiGet<{ entries: WeeklyEntry[]; weekStart: string; weekEnd: string }>(
          `/leaderboard/me/weekly?offset=${weekOffset}`
        )
        setWeeklyData(data)
      } catch (e) {
        console.error('Error fetching weekly leaderboard:', e)
      } finally {
        setWeeklyLoading(false)
      }
    }
    fetchWeekly()
  }, [weekOffset])

  const handleSaveWeeklyPrize = async () => {
    setSavingWeeklyPrize(true)
    try {
      await apiPatch('/businesses/me', { weekly_prize_description: weeklyPrize })
    } catch {
      alert('Error al guardar el premio semanal')
    } finally {
      setSavingWeeklyPrize(false)
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

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">
            Premios
          </h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Definí qué gana cada puesto del ranking</p>
        </div>
      </div>

      {/* PREMIOS SEMANALES */}
      <div className="card">
        <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
          <span className="text-[20px]">📅</span>
          <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Premio semanal</h3>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Configurar texto del premio */}
          <div>
            <label className="block text-[12px] font-black text-[#5A6480] uppercase tracking-wider mb-2">Premio de esta semana</label>
            <div className="flex gap-3">
              <input
                className="field-input flex-1"
                placeholder="Ej: Cena para dos en La Trattoria"
                value={weeklyPrize}
                onChange={e => setWeeklyPrize(e.target.value)}
              />
              <button
                onClick={handleSaveWeeklyPrize}
                disabled={savingWeeklyPrize}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#002B72] text-white text-[13px] font-black hover:bg-[#00318A] transition-all disabled:opacity-50 shrink-0"
              >
                {savingWeeklyPrize ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </button>
            </div>
          </div>

          {/* Display del premio guardado + acciones */}
          {weeklyPrize ? (
            <div className="rounded-2xl border-[1.5px] border-amber-200 bg-amber-50 p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="text-[28px] shrink-0">🎁</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-amber-600 uppercase tracking-wider mb-1">Premio configurado</div>
                  <div className="text-[15px] font-black text-[#0D1A3A] leading-snug">{weeklyPrize}</div>
                </div>
              </div>
              <div className="flex gap-2 pt-1 border-t border-amber-200">
                <button
                  onClick={() => setWaModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[13px] font-black hover:opacity-90 transition-all shadow-md"
                  style={{ background: '#25D366' }}
                >
                  💬 Enviar por WhatsApp
                </button>
                <button
                  onClick={() => setIgModalOpen(true)}
                  disabled={!weeklyData?.entries?.length}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[13px] font-black hover:opacity-90 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #cc2366)' }}
                >
                  📸 Publicar ganador
                </button>
              </div>
              {!weeklyData?.entries?.length && (
                <p className="text-[11px] text-amber-600/70 font-medium text-center -mt-1">
                  Publicar en Instagram requiere que haya partidos jugados esta semana
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[#DDE1EF] p-4 text-center text-[13px] text-[#8E96AE] font-medium">
              Completá el premio arriba y guardalo para poder enviarlo por WhatsApp o publicar al ganador
            </div>
          )}

          {/* Divisor */}
          <div className="border-t border-[#DDE1EF]" />

          {/* Ranking semanal */}
          <div>
            <label className="block text-[12px] font-black text-[#5A6480] uppercase tracking-wider mb-3">Ranking de la semana</label>

            {/* Week navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setWeekOffset(o => o - 1)}
                className="flex items-center gap-1 text-[13px] font-bold text-[#5A6480] hover:text-[#002B72] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </button>
              <span className="text-[13px] font-black text-[#0D1A3A] text-center">
                {weeklyData ? formatWeekLabel(weeklyData.weekStart, weeklyData.weekEnd) : '—'}
                {weekOffset === 0 && (
                  <span className="ml-2 text-[11px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Esta semana</span>
                )}
              </span>
              <button
                onClick={() => setWeekOffset(o => o + 1)}
                disabled={weekOffset >= 0}
                className="flex items-center gap-1 text-[13px] font-bold text-[#5A6480] hover:text-[#002B72] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Entries */}
            {weeklyLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-7 w-7 animate-spin text-[#DDE1EF]" /></div>
            ) : !weeklyData?.entries?.length ? (
              <div className="py-8 text-center text-[13px] font-medium text-[#8E96AE]">
                No hay partidos jugados esta semana todavía.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {weeklyData.entries.map((entry) => {
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-black hover:opacity-90 transition-all shadow-md"
              style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #cc2366)' }}
            >
              Publicar en Instagram
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

      {/* WhatsApp Modal */}
      <WhatsAppSendModal
        open={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        defaultMessage={
          weeklyData?.entries?.[0]
            ? `🏆 ¡Tenemos un ganador de la semana!\n\n🥇 ${weeklyData.entries[0].name} — ${weeklyData.entries[0].weekly_points} puntos${weeklyPrize ? `\n\n🎁 Premio: ${weeklyPrize}` : ''}\n\n¡Felicitaciones! 🎉⚽`
            : `🏆 ¡Resultados de la semana!\n\n${weeklyPrize ? `🎁 Premio: ${weeklyPrize}\n\n` : ''}¡Gracias por participar! ⚽`
        }
        title="Enviar premio semanal"
      />

      {/* IG Modal */}
      <IgPublishModal
        open={igModalOpen}
        onClose={() => setIgModalOpen(false)}
        empresa="MI EMPRESA"
        podium={(weeklyData?.entries ?? []).slice(0, 3).map(e => ({
          name: e.name,
          points: e.weekly_points,
          position: e.rank,
        }))}
      />
    </div>
  )
}
