import type { Metadata } from 'next'
import { MatchList } from '@/components/empresa/MatchList'

export const metadata: Metadata = { title: 'Partidos' }

export default function PartidosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">
            Partidos del Mundial
          </h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Resultados y cobertura de pronósticos</p>
        </div>
      </div>
      <MatchList />
    </div>
  )
}
