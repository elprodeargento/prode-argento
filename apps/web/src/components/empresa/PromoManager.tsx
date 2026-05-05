'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Tag, Star, MapPin, X, UploadCloud, Eye, Info, Loader2 } from 'lucide-react'

interface Promo {
  id: string
  category: string
  description: string
  image_url?: string
  radius_km: number
  valid_until: string
  views: number
  active: boolean
}

const CATEGORIES = [
  '🍕 Gastronomía',
  '☕ Cafetería',
  '🛒 Supermercado',
  '👕 Indumentaria',
  '💻 Electrónica',
  '💆 Salud y Bienestar',
  '📚 Educación',
  '🎭 Entretenimiento',
  '🚗 Automotriz',
  '🔧 Servicios',
]

export function PromoManager() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function fetchPromos() {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet<Promo[]>('/promos/me')
        setPromos(data || [])
      } catch (error) {
        console.error('Error fetching promos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPromos()
  }, [])
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
            Mis Promociones
          </h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Las promos que cargues aparecen en el carrusel del prode, geolocalizadas</p>
        </div>
        <div className="page-actions">
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)} 
              className="flex items-center gap-2 bg-[#002B72] text-white rounded-xl px-5 py-[12px] text-[14px] font-black hover:bg-[#00318A] transition-all shadow-lg shadow-[#002B72]/20"
            >
              + Nueva promo
            </button>
          )}
        </div>
      </div>

      {/* PLAN NOTICE */}
      <div className="flex items-center gap-[14px] bg-gradient-to-br from-[#002B72] to-[#003FA3] rounded-[16px] p-[18px_22px] shadow-[0_8px_24px_rgba(0,43,114,0.15)]">
        <div className="text-[32px] shrink-0">⭐</div>
        <div className="flex-1">
          <div className="text-[15px] font-black text-white mb-0.5">Función disponible en Plan Pro</div>
          <div className="text-[13px] text-white/70 leading-tight">Tus promos llegan a todos los participantes de la zona que estén jugando en cualquier prode de la plataforma</div>
        </div>
        <button 
          className="bg-[#F5C518] text-[#002B72] text-[12px] font-black px-4 py-2 rounded-full whitespace-nowrap hover:bg-[#FFD740] transition-all"
        >
          Plan Pro →
        </button>
      </div>

      {/* LISTA DE PROMOS ACTIVAS */}
      <div className="card">
        <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[20px]">🏷️</span>
            <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Promos activas</h3>
          </div>
          <span className="bg-[#E8F8F1] text-[#18A06A] text-[11px] font-black px-3 py-1 rounded-full border border-[#18A06A]/20">
            {promos.filter(p => p.active).length} activas
          </span>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {promos.length === 0 && !showForm && (
            <div className="py-12 text-center text-[13px] font-medium text-[#8E96AE]">
              No tenés promociones cargadas todavía.
            </div>
          )}
          {promos.map(promo => {
            const until = new Date(promo.valid_until).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
            return (
              <div
                key={promo.id}
                className={`border-[1.5px] border-[#DDE1EF] rounded-xl overflow-hidden ${!promo.active ? 'opacity-60' : ''}`}
              >
                <div
                  className="h-[72px] relative flex items-center px-4"
                  style={{ background: 'linear-gradient(135deg, #1a3a5c, #2d6a8f)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
                  <div className="relative z-10">
                    <div className="text-[13px] font-[900] text-white leading-tight">{promo.category}</div>
                    <div className="text-[11px] text-white/80 font-medium leading-tight mt-0.5">{promo.description}</div>
                  </div>
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap bg-white">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!promo.active ? (
                      <span className="bg-[#FDECEB] text-[#D93025] text-[11px] font-black px-2 py-0.5 rounded-md border border-[#D93025]/10">⏸ Inactiva</span>
                    ) : (
                      <span className="bg-[#E8F8F1] text-[#18A06A] text-[11px] font-black px-2 py-0.5 rounded-md border border-[#18A06A]/10">✓ Activa</span>
                    )}
                    <span className="text-[11px] font-bold text-[#8E96AE] bg-[#F1F3F9] px-2 py-0.5 rounded-full">📍 {promo.radius_km} km de alcance</span>
                    <span className="text-[11px] font-bold text-[#8E96AE] bg-[#F1F3F9] px-2 py-0.5 rounded-full">⏰ Hasta {until}</span>
                    <span className="text-[11px] font-bold text-[#8E96AE] bg-[#F1F3F9] px-2 py-0.5 rounded-full">👁️ {promo.views} vistas</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* INFO ALCANCE */}
      <div className="bg-[#F1F3F9] border-[1.5px] border-[#DDE1EF] rounded-[16px] p-[18px_20px]">
        <h4 className="text-[13px] font-black text-[#0D1A3A] mb-[10px]">ℹ️ ¿Cómo funciona el alcance geo?</h4>
        <div className="flex flex-col gap-1.5">
          {[
            { text: 'Tus promos aparecen en el carrusel de ', bold: 'todos los prodes de la plataforma', suffix: ', no solo el tuyo' },
            { text: 'Solo las ven participantes que estén a menos del radio que configuraste' },
            { text: 'El carrusel rota automáticamente, mostrando primero las promos más cercanas' },
            { text: 'Podés ver cuántas vistas tuvo cada promo en tiempo real' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-[13px] text-[#5A6480] leading-tight font-medium">
              <span className="text-[#DDE1EF] mt-[-2px]">•</span>
              <p>
                {item.text}
                {item.bold && <strong className="text-[#0D1A3A] font-extrabold">{item.bold}</strong>}
                {item.suffix}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
