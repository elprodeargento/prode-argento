import { RecuperarPasswordForm } from '@/components/empresa/RecuperarPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Recuperar contraseña' }

export default function RecuperarPasswordPage() {
  return <RecuperarPasswordForm />
}
