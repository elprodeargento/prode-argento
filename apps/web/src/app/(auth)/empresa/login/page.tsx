import { LoginEmpresaForm } from '@/components/empresa/LoginEmpresaForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return <LoginEmpresaForm />
}
