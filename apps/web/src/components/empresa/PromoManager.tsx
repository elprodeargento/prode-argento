'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Loader2, ImagePlus, Link, Pencil, Trash2 } from 'lucide-react'
import { uploadToR2 } from '@/lib/storage/r2'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'

interface Promo {
  id: string
  name: string
  category: string
  description: string
  image_url?: string
  radius_km: number
  valid_from?: string
  valid_until: string
  views: number
  active: boolean
}

const CATEGORIES = [
  '🍕 Gastronomía',
  '☕ Cafetería',
  '🛒 Supermercado',
  '🥖 Panadería',
  '🥩 Carnicería',
  '🥦 Verdulería',
  '🍭 Kiosco',
  '🧊 Congelados',
  '💊 Farmacia',
  '👗 Indumentaria',
  '💆 Bienestar',
  '📚 Librería',
  '🎬 Entretenimiento',
  '🔧 Servicios',
  '🏠 Hogar',
  '🐶 Mascotas',
  '⚽ Deportes',
  '💻 Tecnología',
  '🚗 Automotor',
  '🧸 Juguetería',
  '🧴 Estética',
  '🎨 Arte y Deco',
  '✨ Otros',
]

const GRADIENT_BY_CAT: Record<string, string> = {
  '🍕 Gastronomía':   'linear-gradient(135deg, #1a3a5c, #2d6a8f)',
  '☕ Cafetería':      'linear-gradient(135deg, #3d1a00, #8B4513)',
  '🛒 Supermercado':  'linear-gradient(135deg, #0d3b2e, #1a7a5e)',
  '🥖 Panadería':     'linear-gradient(135deg, #5c3a1a, #8b5e34)',
  '🥩 Carnicería':    'linear-gradient(135deg, #4a0000, #8b0000)',
  '🥦 Verdulería':    'linear-gradient(135deg, #0d2e0d, #1a5e1a)',
  '🍭 Kiosco':        'linear-gradient(135deg, #3b0d2e, #7a1a5e)',
  '🧊 Congelados':    'linear-gradient(135deg, #0d3b3b, #1a7a7a)',
  '💊 Farmacia':      'linear-gradient(135deg, #0d2e3b, #1a5e7a)',
  '👗 Indumentaria':  'linear-gradient(135deg, #2e0d3b, #7a1a5e)',
  '💆 Bienestar':     'linear-gradient(135deg, #1a3b2e, #2d8f6a)',
  '📚 Librería':      'linear-gradient(135deg, #3b2e0d, #8f6a2d)',
  '🎬 Entretenimiento':'linear-gradient(135deg, #1a0d3b, #5e1a8f)',
  '🔧 Servicios':     'linear-gradient(135deg, #2e2e2e, #5a5a5a)',
  '🏠 Hogar':         'linear-gradient(135deg, #1a2e3b, #2d5e8f)',
  '🐶 Mascotas':      'linear-gradient(135deg, #3d2400, #5c3a1a)',
  '⚽ Deportes':      'linear-gradient(135deg, #0d3b0d, #1a7a1a)',
  '💻 Tecnología':    'linear-gradient(135deg, #0f172a, #334155)',
  '🚗 Automotor':     'linear-gradient(135deg, #3b0d0d, #7a1a1a)',
  '🧸 Juguetería':    'linear-gradient(135deg, #3b2e00, #8f6a00)',
  '🧴 Estética':      'linear-gradient(135deg, #3b0d2e, #7a1a5e)',
  '🎨 Arte y Deco':   'linear-gradient(135deg, #0d3b3b, #1a7a7a)',
  '✨ Otros':         'linear-gradient(135deg, #334155, #475569)',
}

function PromoPreview({ name, description, category, radiusKm, imageUrl }: {
  name: string; description: string; category: string; radiusKm: number; imageUrl: string | null
}) {
  const bg = GRADIENT_BY_CAT[category] ?? 'linear-gradient(135deg, #1a3a5c, #2d6a8f)'
  return (
    <div
      className="h-[88px] rounded-[14px] overflow-hidden relative flex items-center"
      style={{ background: imageUrl ? undefined : bg }}
    >
      {imageUrl && (
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }}
      />
      <div className="relative z-10 px-4 flex flex-col gap-1">
        <span
          className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full w-fit uppercase tracking-wider"
          style={{ background: '#F5C518', color: '#002B72' }}
        >
          📍 {radiusKm < 1 ? `${radiusKm * 1000}m` : `${radiusKm} km`}
        </span>
        <div className="text-[14px] font-black text-white leading-tight">
          {name || 'Tu negocio'}
        </div>
        <div className="text-[11px] font-semibold leading-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {description || 'El texto de tu promo aparece acá'}
        </div>
      </div>
    </div>
  )
}

const INITIAL_FORM = {
  name: '',
  category: CATEGORIES[0],
  description: '',
  radius_km: 1,
  valid_from: '',
  valid_until: '',
  lat: 0,
  lon: 0,
  link_url: '',
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const { initPoint } = await apiPost<{ initPoint: string }>('/payments/checkout', { plan: 'premium' })
      window.location.href = initPoint
    } catch {
      alert('Error al iniciar el pago. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-300 hover:text-slate-600 transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⭐</div>
          <div className="text-xs font-black text-[#F5C518] uppercase tracking-widest mb-1">Plan Premium</div>
          <h3 className="text-2xl font-black text-[#0D1A3A] mb-2">Activá tus promos</h3>
          <p className="text-sm text-[#5A6480] leading-snug">
            Tus promos llegan a todos los participantes de la zona en cualquier prode de la plataforma.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-[#F5C518] bg-[#FFFBEA] p-5 mb-6">
          <div className="font-bebas text-4xl text-[#0D1A3A] mb-0.5">$80.000</div>
          <p className="text-[13px] font-black text-[#002B72] mb-4">🔒 Pago único · válido todo el Mundial 2026</p>
          <ul className="flex flex-col gap-2">
            {[
              'Todo lo del plan Pro',
              'Publicidad geolocalizada en la zona',
              'Estadísticas de visualizaciones',
              'Soporte por WhatsApp',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#2D3A5A] font-medium">
                <span className="text-green-500 font-black">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-white text-sm transition-all hover:bg-[#00318A] disabled:opacity-60 shadow-lg bg-[#002B72]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : '🚀 Contratar Plan Premium con MP'}
        </button>
        <p className="text-center text-xs text-[#8E96AE] mt-3">Pago seguro a través de Mercado Pago</p>
      </div>
    </div>
  )
}

export function PromoManager() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<string>('free')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'ok' | 'denied'>('idle')
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no puede superar los 10 MB.')
      e.target.value = ''
      return
    }
    setUploading(true)
    try {
      const url = await uploadToR2(file)
      setImageUrl(url)
    } catch {
      alert('Error al subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        image_url: imageUrl,
        link_url: form.link_url || undefined,
        valid_from: form.valid_from || undefined,
      }

      if (editingId) {
        const updated = await apiPatch<Promo>(`/promos/me/${editingId}`, payload)
        setPromos(p => p.map(x => x.id === editingId ? updated : x))
      } else {
        const created = await apiPost<Promo>('/promos/me', payload)
        setPromos(p => [created, ...p])
      }
      
      setShowForm(false)
      setForm(INITIAL_FORM)
      setEditingId(null)
      setImageUrl(null)
    } catch (err) {
      console.error('Error saving promo:', err)
      alert('Error al guardar la promo')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (promo: Promo) => {
    setEditingId(promo.id)
    setForm({
      name: promo.name,
      category: promo.category,
      description: promo.description,
      radius_km: promo.radius_km,
      valid_from: promo.valid_from ? new Date(promo.valid_from).toISOString().split('T')[0] : '',
      valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().split('T')[0] : '',
      lat: (promo as any).lat || 0,
      lon: (promo as any).lon || 0,
      link_url: (promo as any).link_url || '',
    })
    setImageUrl(promo.image_url ?? null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta promo?')) return
    try {
      await apiDelete(`/promos/me/${id}`)
      setPromos(p => p.filter(x => x.id !== id))
    } catch (err) {
      console.error('Error deleting promo:', err)
      alert('No se pudo eliminar la promo')
    }
  }

  const openForm = () => {
    setShowForm(true)
    setGeoStatus('idle')
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(f => ({ ...f, lat: pos.coords.latitude, lon: pos.coords.longitude }))
          setGeoStatus('ok')
        },
        () => setGeoStatus('denied'),
        { timeout: 8000 },
      )
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setForm(INITIAL_FORM)
    setEditingId(null)
    setImageUrl(null)
    setGeoStatus('idle')
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [data, biz] = await Promise.all([
          apiGet<Promo[]>('/promos/me'),
          apiGet<{ plan: string }>('/businesses/me'),
        ])
        setPromos(data || [])
        setPlan(biz.plan)
      } catch (error) {
        console.error('Error fetching promos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

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
              onClick={() => plan === 'premium' ? openForm() : setShowUpgrade(true)}
              className="flex items-center gap-2 bg-[#002B72] text-white rounded-xl px-5 py-[12px] text-[14px] font-black hover:bg-[#00318A] transition-all shadow-lg shadow-[#002B72]/20"
            >
              + Nueva promo
            </button>
          )}
        </div>
      </div>

      {/* PLAN NOTICE — solo si no es premium */}
      {plan !== 'premium' && (
        <div className="flex items-center gap-[14px] bg-gradient-to-br from-[#002B72] to-[#003FA3] rounded-[16px] p-[18px_22px] shadow-[0_8px_24px_rgba(0,43,114,0.15)]">
          <div className="text-[32px] shrink-0">⭐</div>
          <div className="flex-1">
            <div className="text-[15px] font-black text-white mb-0.5">Función disponible en Plan Premium</div>
            <div className="text-[13px] text-white/70 leading-tight">Tus promos llegan a todos los participantes de la zona que estén jugando en cualquier prode de la plataforma</div>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            className="bg-[#F5C518] text-[#002B72] text-[12px] font-black px-4 py-2 rounded-full whitespace-nowrap hover:bg-[#FFD740] transition-all"
          >
            Plan Premium →
          </button>
        </div>
      )}

      {/* FORMULARIO NUEVA PROMO */}
      {showForm && (
        <div className="card">
          <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[20px]">{editingId ? '✏️' : '✨'}</span>
              <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">{editingId ? 'Editar promoción' : 'Nueva promoción'}</h3>
            </div>
            <button onClick={handleCancel} className="text-[12px] font-bold text-[#5A6480] hover:text-[#D93025] transition-colors">
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

            {/* Fila 1: Nombre + Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="field">
                <div className="field-label">Nombre del negocio</div>
                <input
                  className="field-input"
                  placeholder="Ej: Pizzería Don Carlo"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <div className="field-label">Categoría</div>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="field-input"
                  required
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Fila 2: Texto de la promo */}
            <div className="field">
              <div className="field-label">Texto de la promo</div>
              <input
                className="field-input"
                placeholder="Ej: 2x1 en pizzas todos los miércoles"
                maxLength={60}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
              />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-[#8E96AE] font-medium">Sé directo y concreto</span>
                <span className={`text-[11px] font-bold ${form.description.length > 50 ? 'text-amber-500' : 'text-[#8E96AE]'}`}>
                  {form.description.length}/60
                </span>
              </div>
            </div>

            {/* Fila 3: Desde + Hasta + Radio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="field">
                <div className="field-label">Válida desde</div>
                <input
                  type="date"
                  className="field-input"
                  value={form.valid_from}
                  onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
                />
              </div>
              <div className="field">
                <div className="field-label">Válida hasta</div>
                <input
                  type="date"
                  className="field-input"
                  value={form.valid_until}
                  onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <div className="field-label">Radio de alcance</div>
                <select
                  className="field-input"
                  value={form.radius_km}
                  onChange={e => setForm(f => ({ ...f, radius_km: Number(e.target.value) }))}
                >
                  <option value={0.5}>500 metros</option>
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                </select>
              </div>
            </div>

            {/* Ubicación detectada */}
            <div className="flex items-center gap-2 text-[12px] font-medium">
              {geoStatus === 'idle' && <span className="text-[#8E96AE]">📍 Detectando ubicación del local...</span>}
              {geoStatus === 'ok'   && <span className="text-[#18A06A]">📍 Ubicación capturada — la promo aparecerá a {form.radius_km} km a la redonda</span>}
              {geoStatus === 'denied' && <span className="text-amber-500">⚠️ Sin ubicación — la promo se mostrará a todos los participantes</span>}
            </div>

            {/* Imagen de fondo */}
            <div className="field">
              <div className="field-label">
                Imagen de fondo <span className="text-[#8E96AE] font-medium">(opcional)</span>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-[#DDE1EF] h-20">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-[#C8CEDF] rounded-xl p-5 text-center hover:border-[#003FA3] transition-all group disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#DDE1EF] mx-auto mb-1" />
                  ) : (
                    <div className="text-[28px] mb-1.5">🖼️</div>
                  )}
                  <div className="text-[13px] font-bold text-[#003FA3] group-hover:underline">
                    {uploading ? 'Subiendo...' : 'Subir imagen'}
                  </div>
                  <div className="text-[11px] text-[#8E96AE] mt-1">JPG o PNG · 1200×400px recomendado</div>
                </button>
              )}
            </div>

            {/* Link opcional */}
            <div className="field">
              <div className="field-label">
                Link externo <span className="text-[#8E96AE] font-medium">(opcional)</span>
              </div>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E96AE]" />
                <input
                  type="url"
                  className="field-input pl-9"
                  placeholder="https://instagram.com/p/... o tu web"
                  value={form.link_url}
                  onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                />
              </div>
              <p className="text-[11px] text-[#8E96AE] font-medium mt-1">Instagram, Facebook, tu web, un post, lo que quieras</p>
            </div>

            {/* Preview en el carrusel */}
            <div className="field">
              <div className="field-label">Preview en el carrusel</div>
              <PromoPreview
                name={form.name}
                description={form.description}
                category={form.category}
                radiusKm={form.radius_km}
                imageUrl={imageUrl}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#002B72] text-white text-[14px] font-black py-[14px] rounded-xl hover:bg-[#00318A] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : editingId ? '✅ Guardar cambios' : '✅ Publicar promo'}
            </button>
          </form>
        </div>
      )}

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
                className={`border-[1.5px] border-[#DDE1EF] rounded-xl overflow-hidden ${!promo.active ? 'opacity-70' : ''}`}
              >
                <div
                  className="h-[72px] relative flex items-center px-4"
                  style={{ background: promo.image_url ? undefined : (GRADIENT_BY_CAT[promo.category] ?? 'linear-gradient(135deg, #1a3a5c, #2d6a8f)') }}
                >
                  {promo.image_url && (
                    <img src={promo.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
                  <div className="relative z-10">
                    <div className="text-[13px] font-[900] text-white leading-tight">{promo.name || promo.category}</div>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="p-2 text-[#5A6480] hover:text-[#002B72] hover:bg-[#F1F3F9] rounded-lg transition-all"
                      title="Editar promo"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-2 text-[#5A6480] hover:text-[#D93025] hover:bg-[#FDECEB] rounded-lg transition-all"
                      title="Eliminar promo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {!promo.active && (
                      <button
                        onClick={() => handleEdit(promo)}
                        className="text-[12px] font-black text-[#003FA3] border-[1.5px] border-[#DDE1EF] px-3 py-1 rounded-lg hover:bg-[#EBF4FC] transition-all whitespace-nowrap"
                      >
                        🔄 Renovar
                      </button>
                    )}
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
