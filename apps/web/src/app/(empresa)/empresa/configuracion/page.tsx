import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { ConfigForm } from '@/components/empresa/ConfigForm'

export const metadata: Metadata = { title: 'Configuración' }

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">
            Configuración
          </h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Personalizá tu prode y ajustá las reglas</p>
        </div>
      </div>
      <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>}>
        <ConfigForm />
      </Suspense>
    </div>
  )
}
