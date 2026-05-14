import { RegistroEmpresaForm } from '@/components/empresa/RegistroEmpresaForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear mi prode gratis',
  description: 'Registrá tu comercio y creá tu prode del Mundial 2026 en 5 minutos.',
}

export default function RegistroPage() {
  return <RegistroEmpresaForm />
}
