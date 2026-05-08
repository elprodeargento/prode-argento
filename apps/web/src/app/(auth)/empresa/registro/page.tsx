import { RegistroEmpresaForm } from '@/components/empresa/RegistroEmpresaForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Registrar comercio' }

export default function RegistroPage() {
  return <RegistroEmpresaForm />
}
