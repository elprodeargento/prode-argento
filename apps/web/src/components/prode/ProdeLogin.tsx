'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProdeApp } from './ProdeApp'

interface Empresa {
  id: string
  name: string
  slug: string
  primary_color: string
  logo_url: string | null
  background_url?: string | null
  welcome_msg: string
  prizes?: Array<{ rank: number; medal: string; pos: string; description: string }>
}

interface Participant {
  id: string
  name: string
  email: string
  phone: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
const storageKey = (slug: string) => `prode:${slug}`

export function ProdeLogin({ empresa }: { empresa: Empresa }) {
  const [step, setStep] = useState<'login' | 'confirm' | 'app'>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [remember, setRemember] = useState(false)
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [participant, setParticipant] = useState<Participant | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(empresa.slug))
    if (stored) {
      try {
        const data = JSON.parse(stored) as Participant
        setParticipant(data)
        setStep('confirm')
      } catch {}
    }
  }, [empresa.slug])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Ingresá tu nombre'
    if (!form.email.trim()) e.email = 'Ingresá tu email'
    if (!form.phone.trim()) e.phone = 'Ingresá tu celular'
    if (!terms) e.terms = 'Tenés que aceptar los términos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError('')
    try {
      const res = await fetch(`${API_URL}/participants/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: empresa.slug, name: form.name, email: form.email, phone: form.phone }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Error al unirse al prode')
      }
      const { participant: p } = await res.json()
      const saved: Participant = { id: p.id, name: form.name, email: form.email, phone: form.phone }
      setParticipant(saved)
      if (remember) localStorage.setItem(storageKey(empresa.slug), JSON.stringify(saved))
      setStep('app')
    } catch (err: any) {
      setApiError(err.message ?? 'Hubo un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'app' && participant) {
    return (
      <ProdeApp
        empresa={empresa}
        participant={participant}
        onLogout={() => {
          localStorage.removeItem(storageKey(empresa.slug))
          setParticipant(null)
          setStep('login')
          setForm({ name: '', email: '', phone: '' })
          setTerms(false)
        }}
      />
    )
  }

  const color = empresa.primary_color ?? '#002B72'

  if (step === 'confirm' && participant) {
    return (
      <div className="min-h-screen flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: color }}>
        <div className="w-full sm:max-w-sm bg-white sm:rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 text-center relative overflow-hidden" style={{
            background: color,
            ...(empresa.background_url ? {
              backgroundImage: `url(${empresa.background_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : {}),
          }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/15 border-2 border-white/25 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
                {empresa.logo_url ? <img src={empresa.logo_url} alt={empresa.name} className="w-12 h-12 object-cover rounded-xl" /> : '⚽'}
              </div>
              <div className="font-bebas text-2xl text-white tracking-widest leading-tight uppercase">{empresa.name}</div>
              <div className="text-white/60 text-sm mt-1">Prode Mundial 2026 🏆</div>
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-2xl font-black text-slate-600 mx-auto mb-4">
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-lg font-black text-slate-900 mb-1">¿Seguís siendo vos?</div>
            <div className="text-sm text-slate-400 mb-1">Tenemos tus datos guardados</div>
            <div className="text-base font-bold text-slate-700 mb-6">{participant.name}</div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep('app')}
                className="w-full py-3.5 rounded-full font-black text-white text-base shadow-md transition-opacity hover:opacity-90"
                style={{ background: color }}
              >
                Sí, entrar →
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(storageKey(empresa.slug))
                  setParticipant(null)
                  setStep('login')
                }}
                className="w-full py-3 rounded-full font-semibold text-slate-500 text-sm border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                No soy yo
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: color }}>
      <div className="w-full sm:max-w-sm bg-white sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Hero */}
        <div className="p-8 text-center relative overflow-hidden" style={{
          background: color,
          ...(empresa.background_url ? {
            backgroundImage: `url(${empresa.background_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}),
        }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/15 border-2 border-white/25 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
              {empresa.logo_url ? <img src={empresa.logo_url} alt={empresa.name} className="w-12 h-12 object-cover rounded-xl" /> : '⚽'}
            </div>
            <div className="font-bebas text-2xl text-white tracking-widest leading-tight uppercase">{empresa.name}</div>
            <div className="text-white/60 text-sm mt-1">Prode Mundial 2026 🏆</div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="text-xl font-black text-slate-900 mb-1">¡Bienvenido!</div>
          <div className="text-sm text-slate-400 mb-5">Ingresá tus datos para participar del prode</div>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
            <Input label="Tu nombre completo" placeholder="Ej: María González"
              value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              error={errors.name} autoComplete="off" />

            <Input label="Correo electrónico" type="email" placeholder="tu@correo.com"
              value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
              error={errors.email} autoComplete="off" />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Celular</label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center gap-1.5 px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-500">
                  🇦🇷 +54
                </div>
                <input type="tel" placeholder="11 1234-5678"
                  value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  autoComplete="off"
                  className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium text-slate-900 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-[#002B72] focus:bg-white transition-colors ${errors.phone ? 'border-red-400' : 'border-slate-200'}`} />
              </div>
              {errors.phone && <p className="text-xs text-red-500 font-semibold">{errors.phone}</p>}
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none py-1">
              <div
                onClick={() => setRemember(r => !r)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                  ${remember ? 'border-[#002B72] bg-[#002B72]' : 'border-slate-300 bg-white'}`}>
                {remember && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="text-sm font-semibold text-slate-700">Recordarme en este dispositivo</span>
            </label>

            <div className={`flex items-start gap-3 cursor-pointer select-none py-1 ${errors.terms ? 'p-2 bg-red-50 rounded-xl' : ''}`}
              onClick={() => { setTerms(t => !t); setErrors(e => ({...e, terms: ''})) }}>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all flex-shrink-0
                ${terms ? 'border-[#002B72] bg-[#002B72]' : errors.terms ? 'border-red-400' : 'border-slate-300 bg-white'}`}>
                {terms && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="text-sm text-slate-500 leading-relaxed" onClick={e => e.stopPropagation()}>
                Acepto los{' '}
                <a href="https://elprode.ar/terminos" target="_blank" rel="noopener noreferrer" className="text-[#002B72] font-bold underline" onClick={e => e.stopPropagation()}>Términos y Condiciones</a>
                {' '}y la{' '}
                <a href="https://elprode.ar/privacidad" target="_blank" rel="noopener noreferrer" className="text-[#002B72] font-bold underline" onClick={e => e.stopPropagation()}>Política de Privacidad</a>
              </span>
            </div>
            {errors.terms && <p className="text-xs text-red-500 font-semibold -mt-2">{errors.terms}</p>}

            <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full font-black mt-1"
              style={{ background: color }}>
              {loading ? 'Entrando...' : 'Entrar al Prode ⚽'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
