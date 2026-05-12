'use client'

import { Card } from '@/components/ui/Card'
import { Download } from 'lucide-react'
import type { RankingItem, Prize } from './RankingClient'

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}`
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

interface RankingTableProps {
  items: RankingItem[]
  prizes?: Prize[]
  onExport?: () => void
}

export function RankingTable({ items, prizes = [], onExport }: RankingTableProps) {
  return (
    <Card padding={false} className="overflow-hidden">
      <div className="px-[22px] py-[18px] border-b border-[#DDE1EF] flex items-center justify-between">
        <h3 className="text-[15px] font-extrabold text-[#0D1A3A] flex items-center gap-2">
          <span className="text-[18px]">📋</span> Tabla completa
        </h3>
        <button
          onClick={onExport}
          className="flex items-center gap-2 text-[13px] font-bold text-[#003FA3] hover:underline transition-all"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1F3F9] border-b border-[#DDE1EF]">
              <th className="px-5 py-3 text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] w-16">Pos.</th>
              <th className="px-5 py-3 text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em]">Participante</th>
              <th className="px-5 py-3 text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-center">Puntos</th>
              <th className="px-5 py-3 text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-center">Exactos</th>
              <th className="px-5 py-3 text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-center">Ganadores</th>
              <th className="px-5 py-3 text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em]">Premio</th>
              <th className="px-5 py-3 text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-right">Contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE1EF]">
            {items.map((p) => {
              const prize = prizes.find(pr => pr.rank === p.position)
              const isTop3 = p.position <= 3
              return (
                <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${isTop3 ? 'bg-[#FAFBFF]' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {MEDALS[p.position] ? (
                        <span className="text-[20px] w-8 text-center">{MEDALS[p.position]}</span>
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F1F3F9] font-bebas text-[18px] text-[#0D1A3A] border border-[#DDE1EF]">
                          {p.position}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EBF4FC] flex items-center justify-center text-sm font-bold border border-[#DDE1EF] shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-[#0D1A3A] truncate">{p.name}</div>
                        <div className="text-[11px] font-medium text-[#8E96AE] truncate">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center font-bebas text-[20px] text-[#003FA3]">{p.points}</td>
                  <td className="px-5 py-3.5 text-center font-bold text-[14px] text-[#0D1A3A]">{p.exact_count}</td>
                  <td className="px-5 py-3.5 text-center font-bold text-[14px] text-[#5A6480]">{p.winner_count}</td>
                  <td className="px-5 py-3.5">
                    {prize ? (
                      <span className="text-[12px] font-bold text-[#5A6480]">🎁 {prize.description}</span>
                    ) : (
                      <span className="text-[12px] text-[#C8CEDF]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.phone && (
                        <a
                          href={waLink(p.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 text-[11px] font-black text-[#25D366] bg-[#E8F8F1] border border-[#25D366]/20 rounded-lg hover:bg-[#25D366] hover:text-white transition-all"
                        >
                          💬
                        </a>
                      )}
                      <a
                        href={`mailto:${p.email}`}
                        className="px-2.5 py-1.5 text-[11px] font-black text-[#5A6480] bg-[#F1F3F9] border border-[#DDE1EF] rounded-lg hover:bg-[#003FA3] hover:text-white transition-all"
                      >
                        ✉️
                      </a>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
