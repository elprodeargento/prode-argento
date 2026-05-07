'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { apiGet, apiPatch, apiPut } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Loader2, QrCode, Mail, MessageCircle, Copy, Plus, Minus, ArrowRight, Check } from 'lucide-react'

import { uploadToR2 } from '@/lib/storage/r2'

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
const DEFAULTS = ['Trofeo + Diploma ⚽', 'Medalla de plata 🥈', 'Medalla de bronce 🥉', 'Aplauso del jefe 👏', 'El último puesto 😅']

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<'config' | 'success'>('config')
  const [loading, setLoading] = useState(false)
  const [business, setBusiness] = useState<any>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [color, setColor] = useState('#003087')
  const [prizeCount, setPrizeCount] = useState(3)
  const [prizes, setPrizes] = useState<string[]>(['', '', ''])
  const [copied, setCopied] = useState(false)
  const [showPlanes, setShowPlanes] = useState(false)

  useEffect(() => {
    async function getBusiness() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/empresa/login')
        return
      }

      try {
        const data = await apiGet<any>('/businesses/me')
        if (data) {
          setBusiness(data)
          setName(data.name)
          if (data.primary_color) setColor(data.primary_color)
          if (data.logo_url) setLogoUrl(data.logo_url)
        }
      } catch {
        // no business yet
      }
    }
    getBusiness()
  }, [router])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) return

    setLoading(true)
    try {
      const publicUrl = await uploadToR2(file, business.id)
      setLogoUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading logo to R2:', error)
      alert('Error al subir el logo a Cloudflare R2. Verifica la configuración de tu API.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!business) return
    setLoading(true)

    try {
      await apiPatch('/businesses/me', { primary_color: color, logo_url: logoUrl })

      const prizesToSave = prizes.slice(0, prizeCount).map((desc, i) => ({
        rank: i + 1,
        description: desc || DEFAULTS[i],
      }))
      await apiPut('/prizes/me', { prizes: prizesToSave })

      setStep('success')
      window.scrollTo(0, 0)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    const url = `https://${business?.slug}.elprode.ar`
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!business && step === 'config') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#002B72]" />
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#002B72] flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-8 text-center animate-in fade-in zoom-in duration-300">
          <span className="text-6xl mb-4 block">🎉</span>
          <h2 className="font-bebas text-4xl text-[#002B72] tracking-wider mb-2">¡TODO LISTO!</h2>
          <p className="text-slate-500 text-sm mb-8 font-semibold">Tu prode está activo y listo para compartir</p>

          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-slate-200">
            <span className="flex-1 text-left text-sm font-black text-[#002B72] truncate italic">
              {business?.slug}.elprode.ar
            </span>
            <button 
              onClick={copyLink}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-[#002B72] text-white hover:scale-105'}`}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'COPIADO' : 'COPIAR'}
            </button>
          </div>

          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all">
            <QrCode className="h-10 w-10 text-slate-400 mb-2" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descargar QR</span>
          </div>

          <div className="flex gap-2 mb-8">
            <button className="flex-1 flex flex-col items-center gap-1 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
              <MessageCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400">WhatsApp</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-1 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
              <Mail className="h-5 w-5 text-blue-500" />
              <span className="text-[10px] font-black text-slate-400">Email</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-1 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
              <Copy className="h-5 w-5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400">Link</span>
            </button>
          </div>

          <div className="h-px bg-slate-100 mb-6" />

          <button 
            onClick={() => setShowPlanes(!showPlanes)}
            className="w-full flex items-center justify-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-all mb-4"
          >
            Ver planes disponibles <Minus className={`h-3 w-3 transition-transform ${showPlanes ? '' : 'rotate-90'}`} />
          </button>

          {showPlanes && (
            <div className="space-y-3 mb-6 animate-in slide-in-from-top-4 duration-300">
              {/* FREE */}
              <div className="border-2 border-slate-200 rounded-2xl p-4 text-left">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-black text-[#0D1A3A]">🎮 Free</h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Para jugar con amigos</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bebas text-2xl text-slate-400">$0</div>
                    <div className="text-[10px] text-slate-400 font-bold">gratis</div>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  {['Hasta 5 jugadores', 'Link y QR del prode', 'Ranking básico'].map(f => (
                    <div key={f} className="text-[12px] text-[#0D1A3A] flex gap-2"><span>✅</span>{f}</div>
                  ))}
                  {['Sin panel de datos', 'Sin notificaciones'].map(f => (
                    <div key={f} className="text-[12px] text-slate-400 flex gap-2 opacity-50"><span>🔒</span>{f}</div>
                  ))}
                </div>
                <div className="bg-slate-100 rounded-xl py-2 text-center text-[12px] font-black text-slate-400">Tu plan actual ✓</div>
              </div>

              {/* PREMIUM */}
              <div className="border-2 border-[#002B72] rounded-2xl p-4 text-left" style={{ background: 'linear-gradient(135deg,rgba(0,48,135,0.03),rgba(116,172,223,0.04))' }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-black text-[#002B72]">⭐ Premium</h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Para empresas que juegan en serio</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bebas text-2xl text-[#002B72]">USD 15</div>
                    <div className="text-[10px] text-slate-400 font-bold">todo el Mundial</div>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  {['Jugadores ilimitados', 'Panel con datos completos', 'Notificaciones por email', 'Exportar ranking CSV', 'Estadísticas de participación'].map(f => (
                    <div key={f} className="text-[12px] text-[#0D1A3A] flex gap-2"><span>✅</span>{f}</div>
                  ))}
                  <div className="text-[12px] text-slate-400 flex gap-2 opacity-50"><span>🔒</span>Sin promos geolocalizadas</div>
                </div>
                <button className="w-full py-3 rounded-full bg-[#002B72] text-white text-[13px] font-black shadow-lg shadow-blue-900/20">Activar Premium — USD 15 →</button>
              </div>

              {/* PRO */}
              <div className="border-2 rounded-2xl p-4 text-left" style={{ borderColor: '#2d1a6e', background: 'linear-gradient(135deg,rgba(45,26,110,0.04),rgba(0,48,135,0.04))' }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-black" style={{ color: '#2d1a6e' }}>📍 Pro</h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Para negocios que quieren clientes del barrio</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bebas text-2xl" style={{ color: '#2d1a6e' }}>USD 25</div>
                    <div className="text-[10px] text-slate-400 font-bold">todo el Mundial</div>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  {[
                    ['✅', 'Todo lo de Premium'],
                    ['📍', 'Promos geolocalizadas entre prodes'],
                    ['💬', 'Notificaciones por WhatsApp'],
                    ['🏷️', 'Sin marca ProdeApp'],
                    ['📊', 'Estadísticas avanzadas'],
                    ['🎯', 'Soporte prioritario'],
                  ].map(([icon, text]) => (
                    <div key={text} className="text-[12px] text-[#0D1A3A] flex gap-2"><span>{icon}</span>{text}</div>
                  ))}
                </div>
                <button className="w-full py-3 rounded-full text-white text-[13px] font-black shadow-lg" style={{ background: 'linear-gradient(135deg,#2d1a6e,#003087)', boxShadow: '0 4px 20px rgba(45,26,110,0.28)' }}>Activar Pro — USD 25 →</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={() => router.push('/empresa/dashboard')}
              className="w-full bg-[#002B72] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
            >
              IR AL PANEL →
            </button>
            <button 
              onClick={() => router.push('/empresa/configuracion')}
              className="w-full bg-white border-2 border-[#002B72] text-[#002B72] py-4 rounded-2xl font-black text-sm active:scale-95 transition-all"
            >
              EDITAR CONFIGURACIÓN
            </button>
          </div>
        </Card>
      </div>
    )
  }

  const progress = 30 + (logoUrl ? 25 : 0) + (color !== '#003087' ? 20 : 0) + (prizes.some(p => p) ? 25 : 0)

  return (
    <div className="min-h-screen bg-[#F1F3F9]">
      <header className="bg-[#002B72] pt-8 pb-10 px-6 sticky top-0 z-50 overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative">
          <h1 className="font-bebas text-2xl text-white tracking-widest mb-4">CONFIGURÁ TU PRODE</h1>
          <div className="max-w-md mx-auto bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F5C518] h-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-6 -mt-6 relative z-10 space-y-6 pb-32">
        {/* LOGO */}
        <Card className="p-6">
          <h3 className="text-sm font-black text-[#002B72] uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-xl">🖼️</span> LOGO DE LA EMPRESA <span className="text-[10px] text-slate-400 ml-1 italic lowercase font-bold tracking-normal">(opcional)</span>
          </h3>
          
          <div 
            onClick={() => document.getElementById('logo-input')?.click()}
            className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center cursor-pointer hover:bg-blue-50 hover:border-[#002B72] transition-all group"
          >
            <input type="file" id="logo-input" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            {loading ? (
              <Loader2 className="h-10 w-10 animate-spin text-[#002B72] mx-auto" />
            ) : logoUrl ? (
              <div className="flex flex-col items-center">
                <img src={logoUrl} className="w-20 h-20 rounded-2xl object-cover mb-2 border-4 border-white shadow-md" alt="Logo" />
                <span className="text-[11px] font-black text-slate-400">Tocá para cambiar</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">📁</div>
                <span className="text-sm font-extrabold text-[#002B72]">Tocá para subir tu logo</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1">PNG, JPG o SVG · Recomendado 200x200px</span>
              </div>
            )}
          </div>
        </Card>

        {/* COLORES */}
        <Card className="p-6">
          <h3 className="text-sm font-black text-[#002B72] uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-xl">🎨</span> COLOR PRINCIPAL
          </h3>
          
          <div className="grid grid-cols-6 gap-3 mb-6">
            {['#003087', '#74ACDF', '#F6C543', '#C8102E', '#1B5E20', '#111111'].map(c => (
              <button 
                key={c}
                onClick={() => setColor(c)}
                className={`aspect-square rounded-full border-4 transition-all hover:scale-110 ${color === c ? 'border-slate-900 scale-110' : 'border-white shadow-sm'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex gap-3">
             <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex-shrink-0" style={{ backgroundColor: color }} />
             <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={color.toUpperCase()} 
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 font-black text-slate-700 uppercase outline-none focus:border-[#002B72]"
                />
                <input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute right-2 top-2 w-8 h-8 opacity-0 cursor-pointer"
                />
                <div className="absolute right-3 top-3 w-6 h-6 rounded-md pointer-events-none border border-slate-200" style={{ backgroundColor: color }} />
             </div>
          </div>
        </Card>

        {/* PREMIOS */}
        <Card className="p-6">
          <h3 className="text-sm font-black text-[#002B72] uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-xl">🏆</span> PREMIOS
          </h3>

          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-extrabold text-[#0D1A3A]">¿Cuántos ganadores?</span>
            <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               <button onClick={() => setPrizeCount(Math.max(1, prizeCount - 1))} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-[#002B72] active:scale-95 transition-all"><Minus className="h-4 w-4" /></button>
               <span className="font-bebas text-3xl text-[#002B72] w-6 text-center">{prizeCount}</span>
               <button onClick={() => setPrizeCount(Math.min(5, prizeCount + 1))} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-[#002B72] active:scale-95 transition-all"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="space-y-3">
            {[...Array(prizeCount)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 group focus-within:border-blue-200 focus-within:bg-white transition-all">
                <span className="text-2xl flex-shrink-0">{MEDALS[i]}</span>
                <input 
                  type="text" 
                  placeholder={DEFAULTS[i]}
                  value={prizes[i] || ''}
                  onChange={(e) => {
                    const newPrizes = [...prizes]
                    newPrizes[i] = e.target.value
                    setPrizes(newPrizes)
                  }}
                  className="flex-1 bg-transparent border-none outline-none font-extrabold text-sm text-[#0D1A3A] placeholder:text-slate-300"
                />
                {i >= 3 && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mr-2">extra</span>}
              </div>
            ))}
          </div>

          <button 
            onClick={() => setPrizes(DEFAULTS.slice(0, prizeCount))}
            className="w-full text-center text-xs font-black text-slate-400 underline mt-5 hover:text-slate-600 transition-all uppercase tracking-tighter"
          >
            Usar premios por defecto (honor y gloria ⚽)
          </button>
        </Card>

        {/* PREVIEW */}
        <Card className="p-6">
          <h3 className="text-sm font-black text-[#002B72] uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-xl">👁️</span> PREVIEW DEL PRODE
          </h3>

          <div className="rounded-[32px] overflow-hidden border-4 border-slate-100 shadow-xl">
             <div className="p-8 text-center relative" style={{ backgroundColor: color }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <div className="relative">
                  <div className="w-14 h-14 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                    {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover rounded-2xl" alt="Logo" /> : '⚽'}
                  </div>
                  <h4 className="font-bebas text-2xl text-white tracking-widest truncate">{name || 'TU EMPRESA'}</h4>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Prode Mundial 2026</p>
                </div>
             </div>
             <div className="p-6 bg-white space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partidos · Fecha 1</p>
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
                   <span className="text-2xl">🇦🇷</span>
                   <span className="flex-1 text-[13px] font-black text-slate-900">Argentina</span>
                   <div className="w-10 h-10 bg-white rounded-xl border-2 border-slate-100 flex items-center justify-center font-bebas text-xl text-slate-900">2</div>
                   <div className="w-10 h-10 bg-white rounded-xl border-2 border-slate-100 flex items-center justify-center font-bebas text-xl text-slate-900">0</div>
                   <span className="flex-1 text-[13px] font-black text-slate-900 text-right">Marruecos</span>
                   <span className="text-2xl">🇲🇦</span>
                </div>
             </div>
          </div>
        </Card>

        {/* ACTIONS */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F1F3F9] via-[#F1F3F9] to-transparent pt-12 z-50">
          <div className="max-w-lg mx-auto">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#002B72] text-white py-5 rounded-[24px] font-black text-base shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>⚡ GENERAR LINK Y QR <ArrowRight className="h-5 w-5" /></>}
            </button>
            <p className="text-center text-[11px] text-slate-400 font-bold mt-4 italic uppercase tracking-tighter">Después podés seguir editando desde el panel</p>
          </div>
        </div>

      </main>
    </div>
  )
}
