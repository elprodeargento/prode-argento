import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ReferidosClient } from '@/components/empresa/ReferidosClient'

export const metadata: Metadata = { title: 'Referidos' }

export default function ReferidosPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">Referidos</h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Invitá otros comercios y ganá puntos</p>
        </div>
      </div>
      <Suspense>
        <ReferidosClient />
      </Suspense>
    </div>
  )
}
