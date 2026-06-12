'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiPost } from '@/lib/api'

export function ResetPasswordForm() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    setToken(hash.get('access_token'))
  }, [])

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!token) {
      setError('El link de recuperación es inválido o expiró')
      return
    }

    setLoading(true)
    try {
      await apiPost('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => router.push('/empresa/login'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intentá de nuevo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm !p-0 overflow-hidden">
      <div className="bg-[#002B72] p-8 text-center">
        <div className="mb-4 flex justify-center">
          <img src="/EL PRODE ARGENTO-04.png" alt="El Prode Argento" className="h-28 w-auto object-contain" />
        </div>
        <div className="font-bebas text-xl text-[#F5C518] tracking-widest">PANEL COMERCIO</div>
        <div className="text-white/80 text-sm mt-1 font-medium">Crear nueva contraseña</div>
      </div>
      <div className="p-6">
        {done ? (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-semibold text-center">
            Contraseña actualizada. Redirigiendo al login...
          </div>
        ) : !token ? (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-semibold text-center">
            Este link de recuperación es inválido o expiró. Pedí uno nuevo desde la pantalla de login.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3" autoComplete="off">
            <Input label="Nueva contraseña" type="password" placeholder="Mínimo 8 caracteres"
              value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            <Input label="Repetir contraseña" type="password" placeholder="Repetí la contraseña"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-semibold">
                {error}
              </div>
            )}
            <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full font-black mt-2">
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </Button>
          </form>
        )}
      </div>
    </Card>
  )
}
