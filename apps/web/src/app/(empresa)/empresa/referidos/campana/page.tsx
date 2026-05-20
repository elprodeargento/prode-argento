import type { Metadata } from 'next'
import { CampanaReferidosClient } from '@/components/empresa/CampanaReferidosClient'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Campaña de Referidos' }

export default function CampanaPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link
            href="/empresa/referidos"
            className="p-2 rounded-xl hover:bg-white transition-colors text-[#5A6480]"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">🎁 Campaña de Referidos</h1>
            <p className="text-[14px] text-[#5A6480] font-medium">
              Incentivá a tus participantes a invitar amigos con premios personalizados
            </p>
          </div>
        </div>
      </div>
      <CampanaReferidosClient />
    </div>
  )
}
