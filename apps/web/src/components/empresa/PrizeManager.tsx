'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trophy, X, Plus, Lightbulb, Loader2, Save } from 'lucide-react'

interface Prize {
  id: string
  rank: number
  description: string
}

export function PrizeManager({ businessId }: { businessId: string }) {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPrizes() {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .eq('business_id', businessId)
        .order('rank', { ascending: true })

      if (error) {
        console.error('Error fetching prizes:', error)
      } else {
        setPrizes(data || [])
      }
      setLoading(false)
    }
    fetchPrizes()
  }, [businessId])

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
    // Delete existing and re-insert or upsert. Upsert is better.
    const prizesToSave = prizes.map(p => ({
      business_id: businessId,
      rank: p.rank,
      description: p.description
    }))

    // Clean current prizes first to avoid conflicts if ranks changed
    await supabase.from('prizes').delete().eq('business_id', businessId)

    const { error } = await supabase.from('prizes').insert(prizesToSave)

    if (error) {
      alert('Error al guardar premios')
    } else {
      alert('Premios guardados correctamente')
    }
    setSaving(false)
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
    </div>
  )
}
