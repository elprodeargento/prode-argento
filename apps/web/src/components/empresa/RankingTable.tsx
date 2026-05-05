'use client'

import { Card } from '@/components/ui/Card'
import { Download } from 'lucide-react'

interface RankingItem {
  id: string
  name: string
  points: number
  position: number
  exact_count: number
  winner_count: number
  predictions_count: number
  change?: number
}

interface RankingTableProps {
  items: RankingItem[]
}

export function RankingTable({ items }: RankingTableProps) {
  return (
    <Card padding={false} className="overflow-hidden">
      <div className="px-[22px] py-[18px] border-b border-[#DDE1EF] flex items-center justify-between">
        <h3 className="text-[15px] font-extrabold text-[#0D1A3A] flex items-center gap-2">
          <span className="text-[18px]">📋</span> Tabla completa
        </h3>
        <button className="flex items-center gap-2 text-[13px] font-bold text-[#003FA3] hover:underline transition-all">
          <Download className="h-4 w-4" />
          Exportar
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
              <th className="px-5 py-3 text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-center">Pronósticos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE1EF]">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F1F3F9] font-bebas text-[18px] text-[#0D1A3A] border border-[#DDE1EF]">
                      {p.position}
                    </div>
                    {p.change === undefined || p.change === null ? null : p.change === 0 ? (
                      <span className="text-[11px] font-bold text-slate-400">—</span>
                    ) : p.change > 0 ? (
                      <span className="text-[11px] font-black text-emerald-500">↑{p.change}</span>
                    ) : (
                      <span className="text-[11px] font-black text-red-500">↓{Math.abs(p.change)}</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EBF4FC] flex items-center justify-center text-sm font-bold border border-[#DDE1EF]">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[#0D1A3A]">{p.name}</div>
                      <div className="text-[11px] font-medium text-[#8E96AE]">@{p.name.toLowerCase().replace(' ', '')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center font-bebas text-[20px] text-[#003FA3]">{p.points}</td>
                <td className="px-5 py-3.5 text-center font-bold text-[14px] text-[#0D1A3A]">{p.exact_count}</td>
                <td className="px-5 py-3.5 text-center font-bold text-[14px] text-[#5A6480]">{p.winner_count}</td>
                <td className="px-5 py-3.5 text-center font-bold text-[14px] text-[#8E96AE]">{p.predictions_count}/48</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
