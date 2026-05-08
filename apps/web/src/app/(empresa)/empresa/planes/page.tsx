import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PlanesClient } from '@/components/empresa/PlanesClient'

export const metadata: Metadata = { title: 'Planes y precios' }

export default function PlanesPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">Planes y precios</h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Elegí el plan que mejor se adapta a tu comercio</p>
          <p className="text-[14px] text-[#5A6480] font-medium mt-1">
            Pago único por todo el mundial.
          </p>
        </div>
      </div>
      <Suspense>
        <PlanesClient />
      </Suspense>
    </div>
  )
}
