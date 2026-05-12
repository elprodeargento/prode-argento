import type { Metadata } from 'next'
import { ParticipantesTable } from '@/components/empresa/ParticipantesTable'

export const metadata: Metadata = { title: 'Participantes' }

export default function ParticipantesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">Participantes</h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Personas que juegan en tu prode</p>
        </div>
      </div>
      <ParticipantesTable />
    </div>
  )
}
