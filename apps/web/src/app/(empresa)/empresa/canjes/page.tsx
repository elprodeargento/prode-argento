import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CanjesClient } from '@/components/empresa/CanjesClient'

export const metadata: Metadata = { title: 'Canjes' }

export default function CanjesPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">Canjes</h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Usá tus puntos para obtener beneficios</p>
        </div>
      </div>
      <Suspense>
        <CanjesClient />
      </Suspense>
    </div>
  )
}
