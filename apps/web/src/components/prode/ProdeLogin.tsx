'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProdeApp } from './ProdeApp'
import { SORTED_COUNTRIES } from '@/shared/utils/countries'
import { trackEvent } from '@/lib/analytics'

interface Empresa {
  id: string
  name: string
  slug: string
  primary_color: string
  logo_url: string | null
  background_url?: string | null
  welcome_msg: string
  plan: 'free' | 'pro' | 'premium'
  require_email?: boolean
  require_phone?: boolean
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
  const searchParams = useSearchParams()
  const referrerParticipantId = searchParams.get('ref') ?? undefined

  const requireEmail = empresa.require_email !== false
  const requirePhone = empresa.require_phone !== false
  const primaryField: 'email' | 'phone' = requireEmail ? 'email' : 'phone'

  const [step, setStep] = useState<'identifier' | 'register' | 'confirm' | 'app'>('identifier')
  const [loading, setLoading] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [remember, setRemember] = useState(false)
  const [form, setForm] = useState({ name: '', secondary: '', countryCode: '54' })
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [participant, setParticipant] = useState<Participant | null>(null)

  useEffect(() => {
    trackEvent('player_login_view', { business_slug: empresa?.slug })
    const stored = localStorage.getItem(storageKey(empresa.slug))
    if (stored) {
      try {
        const data = JSON.parse(stored) as Participant
        const body = requireEmail && data.email
          ? { slug: empresa.slug, email: data.email }
          : data.phone
            ? { slug: empresa.slug, phone: data.phone }
            : null
        if (!body) {
          localStorage.removeItem(storageKey(empresa.slug))
          return
        }
        fetch(`${API_URL}/participants/lookup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }).then(async res => {
          if (res.status === 403) {
            localStorage.removeItem(storageKey(empresa.slug))
            setDisabled(true)
            return
          }
          const json = await res.json().catch(() => ({}))
          if (json?.participant?.is_disabled) {
            localStorage.removeItem(storageKey(empresa.slug))
            setDisabled(true)
            return
          }
          setParticipant(data)
          setStep('app')
        }).catch(() => { setParticipant(data); setStep('app') })
      } catch { localStorage.removeItem(storageKey(empresa.slug)) }
    }
  }, [empresa.slug])

  const saveSession = (p: Participant) => {
    if (remember) localStorage.setItem(storageKey(empresa.slug), JSON.stringify(p))
  }

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setErrors({ identifier: primaryField === 'email' ? 'Ingresá tu email' : 'Ingresá tu celular' })
      return
    }
    setErrors({})
    setLoading(true)
    setApiError('')
    try {
      const body = primaryField === 'email'
        ? { slug: empresa.slug, email: identifier.trim() }
        : { slug: empresa.slug, phone: identifier.startsWith('+') ? identifier.trim() : `+${form.countryCode}${identifier.trim()}` }

      const res = await fetch(`${API_URL}/participants/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Error al verificar')
      }
      const json = await res.json()
      if (json.found && json.participant) {
        if (json.participant.is_disabled) {
          setDisabled(true)
          return
        }
        const p: Participant = {
          id: json.participant.id,
          name: json.participant.name,
          email: json.participant.email ?? '',
          phone: json.participant.phone ?? '',
        }
        setParticipant(p)
        saveSession(p)
        trackEvent('player_login', { business_slug: empresa.slug })
        setStep('app')
      } else {
        setStep('register')
      }
    } catch (err: any) {
      if (err.message?.includes('deshabilitado')) {
        setDisabled(true)
      } else {
        setApiError('Hubo un error. Intentá de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const validateRegister = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Ingresá tu nombre'
    const secondaryIsEmail = primaryField === 'phone'
    if (secondaryIsEmail && requireEmail && !form.secondary.trim()) e.secondary = 'Ingresá tu email'
    if (!secondaryIsEmail && requirePhone && !form.secondary.trim()) e.secondary = 'Ingresá tu celular'
    if (!terms) e.terms = 'Tenés que aceptar los términos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegister()) return
    setLoading(true)
    setApiError('')
    try {
      let email: string | undefined
      let phone: string | undefined

      if (primaryField === 'email') {
        email = identifier.trim()
        if (form.secondary.trim()) {
          phone = form.secondary.startsWith('+') ? form.secondary.trim() : `+${form.countryCode}${form.secondary.trim()}`
        }
      } else {
        phone = identifier.startsWith('+') ? identifier.trim() : `+${form.countryCode}${identifier.trim()}`
        if (form.secondary.trim()) email = form.secondary.trim()
      }

      const payload: Record<string, string> = { slug: empresa.slug, name: form.name }
      if (email) payload.email = email
      if (phone) payload.phone = phone
      if (referrerParticipantId) payload.referrer_participant_id = referrerParticipantId

      const res = await fetch(`${API_URL}/participants/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Error al registrarse')
      }
      const json = await res.json()
      const p: Participant = {
        id: json.participant.id,
        name: form.name,
        email: email ?? '',
        phone: phone ?? '',
      }
      setParticipant(p)
      saveSession(p)
      trackEvent('player_registered', { business_slug: empresa.slug })
      setStep('app')
    } catch (err: any) {
      if (err.message?.includes('deshabilitado')) {
        setDisabled(true)
      } else {
        setApiError(err.message ?? 'Hubo un error. Intentá de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(storageKey(empresa.slug))
    setParticipant(null)
    setIdentifier('')
    setForm({ name: '', secondary: '', countryCode: '54' })
    setTerms(false)
    setStep('identifier')
  }

  if (step === 'app' && participant) {
    return <ProdeApp empresa={empresa} participant={participant} onLogout={handleLogout} />
  }

  const color = empresa.primary_color ?? '#002B72'

  const HeroBanner = () => (
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
          {empresa.logo_url ? <img src={empresa.logo_url} alt={empresa.name} className="w-12 h-12 object-contain rounded-xl p-0.5" /> : '⚽'}
        </div>
        <div className="font-bebas text-2xl text-white tracking-widest leading-tight uppercase">{empresa.name}</div>
        <div className="text-white/60 text-sm mt-1">Prode Mundial 2026 🏆</div>
        {empresa.welcome_msg && (
          <div className="mt-3 px-4 py-2 rounded-xl bg-white/15 text-white/90 text-sm font-medium leading-snug">{empresa.welcome_msg}</div>
        )}
      </div>
    </div>
  )

  const RememberToggle = () => (
    <label className="flex items-center gap-3 cursor-pointer select-none py-1">
      <div
        onClick={() => setRemember(r => !r)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${remember ? 'border-[#002B72] bg-[#002B72]' : 'border-slate-300 bg-white'}`}
      >
        {remember && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span className="text-sm font-semibold text-slate-700">Recordarme en esta sesión</span>
    </label>
  )

  if (disabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: color }}>
        <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/25">
          <HeroBanner />
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <div className="text-5xl">🚫</div>
            <div className="font-black text-[18px] text-[#0D1A3A]">Acceso deshabilitado</div>
            <p className="text-[13px] text-[#5A6480] font-medium">
              El administrador de este prode deshabilitó tu acceso. Contactalo para más información.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Step: CONFIRM (returning user from sessionStorage)
  if (step === 'confirm' && participant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: color }}>
        <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/25">
          <HeroBanner />
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
                onClick={handleLogout}
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

  // Step: IDENTIFIER (login screen)
  if (step === 'identifier') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: color }}>
        <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/25">
          <HeroBanner />
          <div className="p-6">
            <div className="text-xl font-black text-slate-900 mb-1">¡Bienvenido!</div>
            <div className="text-sm text-slate-400 mb-5">
              {primaryField === 'email'
                ? 'Ingresá tu email para entrar al prode'
                : 'Ingresá tu celular para entrar al prode'}
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">{apiError}</div>
            )}

            <form onSubmit={handleIdentifierSubmit} className="flex flex-col gap-4" autoComplete="off">
              {primaryField === 'email' ? (
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="tu@correo.com"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  error={errors.identifier}
                  autoComplete="off"
                />
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Celular</label>
                  <div className="flex gap-2">
                    <select
                      value={form.countryCode}
                      onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}
                      className="flex items-center justify-center px-2 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-500 focus:outline-none focus:border-[#002B72] appearance-none cursor-pointer"
                    >
                      {SORTED_COUNTRIES.map(c => (
                        <option key={`${c.code}-${c.name}`} value={c.code}>{c.flag} +{c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="11 1234-5678"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      autoComplete="off"
                      className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium text-slate-900 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-[#002B72] focus:bg-white transition-colors ${errors.identifier ? 'border-red-400' : 'border-slate-200'}`}
                    />
                  </div>
                  {errors.identifier && <p className="text-xs text-red-500 font-semibold">{errors.identifier}</p>}
                </div>
              )}

              <RememberToggle />

              <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full font-black mt-1" style={{ background: color }}>
                {loading ? 'Verificando...' : 'Continuar →'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-xs text-slate-400">¿Primera vez?{' '}</span>
              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-xs font-bold underline underline-offset-2"
                style={{ color }}
              >
                Registrate directo
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step: REGISTER (new participant)
  const secondaryIsEmail = primaryField === 'phone'
  const secondaryRequired = secondaryIsEmail ? requireEmail : requirePhone

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: color }}>
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/25">
        <HeroBanner />
        <div className="p-6">
          <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <span className="text-xl mt-0.5">👋</span>
            <div>
              <div className="text-sm font-black text-blue-900">¡No encontramos tu cuenta!</div>
              <div className="text-xs text-blue-600 font-medium mt-0.5">Completá tus datos para registrarte. Es gratis.</div>
            </div>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">{apiError}</div>
          )}

          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4" autoComplete="off">
            {/* Identificador pre-completado */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                {primaryField === 'email' ? 'Correo electrónico' : 'Celular'}
              </label>
              <div className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-500 font-medium text-sm">
                {primaryField === 'phone' && !identifier.startsWith('+') ? `+${form.countryCode} ` : ''}{identifier}
              </div>
            </div>

            <Input
              label="Tu nombre completo"
              placeholder="Ej: María González"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              error={errors.name}
              autoComplete="off"
            />

            {/* Campo secundario */}
            {secondaryIsEmail ? (
              <Input
                label={`Correo electrónico${secondaryRequired ? '' : ' (Opcional)'}`}
                type="email"
                placeholder="tu@correo.com"
                value={form.secondary}
                onChange={e => setForm(f => ({ ...f, secondary: e.target.value }))}
                error={errors.secondary}
                autoComplete="off"
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Celular{secondaryRequired ? '' : ' (Opcional)'}
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.countryCode}
                    onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}
                    className="flex items-center justify-center px-2 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-500 focus:outline-none focus:border-[#002B72] appearance-none cursor-pointer"
                  >
                    {SORTED_COUNTRIES.map(c => (
                      <option key={`${c.code}-${c.name}`} value={c.code}>{c.flag} +{c.code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="11 1234-5678"
                    value={form.secondary}
                    onChange={e => setForm(f => ({ ...f, secondary: e.target.value }))}
                    autoComplete="off"
                    className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium text-slate-900 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-[#002B72] focus:bg-white transition-colors ${errors.secondary ? 'border-red-400' : 'border-slate-200'}`}
                  />
                </div>
                {errors.secondary && <p className="text-xs text-red-500 font-semibold">{errors.secondary}</p>}
              </div>
            )}

            <div
              className={`flex items-start gap-3 cursor-pointer select-none py-1 ${errors.terms ? 'p-2 bg-red-50 rounded-xl' : ''}`}
              onClick={() => { setTerms(t => !t); setErrors(e => ({ ...e, terms: '' })) }}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all flex-shrink-0 ${terms ? 'border-[#002B72] bg-[#002B72]' : errors.terms ? 'border-red-400' : 'border-slate-300 bg-white'}`}>
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

            <RememberToggle />

            <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full font-black mt-1" style={{ background: color }}>
              {loading ? 'Registrando...' : 'Registrarme ⚽'}
            </Button>

            <button
              type="button"
              onClick={() => { setStep('identifier'); setApiError('') }}
              className="text-center text-sm text-slate-400 hover:text-slate-600 font-semibold transition-colors"
            >
              ← Volver
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
