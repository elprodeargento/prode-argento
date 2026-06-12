import { ResetPasswordForm } from '@/components/empresa/ResetPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nueva contraseña' }

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
