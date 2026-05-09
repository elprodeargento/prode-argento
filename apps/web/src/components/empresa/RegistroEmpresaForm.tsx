'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { apiPost } from '@/lib/api'

export function RegistroEmpresaForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/empresa/onboarding` },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const referrerSlug = document.cookie
      .split('; ')
      .find(r => r.startsWith('referrer_slug='))
      ?.split('=')?.[1]

    try {
      await apiPost('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        ...(referrerSlug ? { referrerSlug } : {}),
      })
    } catch (err: any) {
      setError(err?.message ?? 'Error al registrar el comercio')
      setLoading(false)
      return
    }

    // Get client session after API created the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/empresa/onboarding')
  }

  return (
    <Card className="w-full max-w-sm !p-0 overflow-hidden">
      <div className="bg-[#002B72] p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        <div className="relative z-10">
          <div className="text-5xl mb-3">⚽</div>
          <div className="font-bebas text-2xl text-white tracking-widest">PRODE MUNDIAL 2026</div>
          <div className="text-white/60 text-sm mt-1">Registrá tu comercio</div>
        </div>
      </div>

      <div className="p-6">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-green-200">
          ✅ Plan gratuito · Sin tarjeta
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-3 font-bold text-slate-700 hover:border-[#002B72] hover:bg-blue-50 transition-all mb-4"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative flex items-center my-4">
          <div className="flex-1 border-t border-slate-200"/>
          <span className="px-3 text-xs text-slate-400 font-semibold">o con email</span>
          <div className="flex-1 border-t border-slate-200"/>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Nombre del comercio" placeholder="Ej: Distribuidora García SA"
            value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
          <Input label="Email corporativo" type="email" placeholder="admin@tucomercio.com"
            value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
          <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres"
            value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full font-black mt-2">
            {loading ? 'Creando cuenta...' : 'Crear cuenta y configurar →'}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          ¿Ya tenés cuenta?{' '}
          <a href="/empresa/login" className="text-[#002B72] font-bold hover:underline">Iniciar sesión</a>
        </p>
      </div>
    </Card>
  )
}
