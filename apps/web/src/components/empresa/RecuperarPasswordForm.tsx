'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiPost } from '@/lib/api'

export function RecuperarPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiPost('/auth/forgot-password', { email })
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  return (
    <Card className="w-full max-w-sm !p-0 overflow-hidden">
      <div className="bg-[#002B72] p-8 text-center">
        <div className="mb-4 flex justify-center">
          <img src="/EL PRODE ARGENTO-04.png" alt="El Prode Argento" className="h-28 w-auto object-contain" />
        </div>
        <div className="font-bebas text-xl text-[#F5C518] tracking-widest">PANEL COMERCIO</div>
        <div className="text-white/80 text-sm mt-1 font-medium">Recuperar contraseña</div>
      </div>
      <div className="p-6">
        {sent ? (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-semibold text-center">
            Si existe una cuenta con ese email, te enviamos un link para restablecer tu contraseña.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3" autoComplete="off">
            <p className="text-sm text-slate-500 font-medium">
              Ingresá el email con el que te registraste y te enviaremos un link para crear una nueva contraseña.
            </p>
            <Input label="Email" type="email" placeholder="admin@tucomercio.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
            <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full font-black mt-2">
              {loading ? 'Enviando...' : 'Enviar link de recuperación'}
            </Button>
          </form>
        )}
        <p className="text-center text-xs text-slate-400 mt-4">
          <a href="/empresa/login" className="text-[#002B72] font-bold hover:underline">Volver a iniciar sesión</a>
        </p>
      </div>
    </Card>
  )
}
