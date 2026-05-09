'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { IgPublishModal } from './IgPublishModal'
import type { Prize } from './RankingClient'

function IgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const num = digits.startsWith('54') ? digits : `54${digits}`
  return `https://wa.me/${num}`
}

interface PodiumItem {
  id: string
  name: string
  email: string
  phone: string
  points: number
  position: number
}

interface RankingPodiumProps {
  items: PodiumItem[]
  prizes?: Prize[]
  empresa?: string
  igConnected?: boolean
}

const PODIUM = [
  { pos: 1, ringColor: 'border-[#F5C518]', bg: 'bg-[#FEF8D8]', barColor: 'bg-[#F5C518]', barH: 'h-[70px]', barText: 'text-[#002B72]', ptsColor: 'text-[#C49A00]' },
  { pos: 2, ringColor: 'border-[#B0B8CC]', bg: 'bg-[#F0F2F8]', barColor: 'bg-[#9BA5BE]', barH: 'h-[56px]', barText: 'text-white/60', ptsColor: 'text-[#7A839E]' },
  { pos: 3, ringColor: 'border-[#CD9B6A]', bg: 'bg-[#FBF0E8]', barColor: 'bg-[#CD9B6A]', barH: 'h-[44px]', barText: 'text-white/60', ptsColor: 'text-[#9B6B3A]' },
]

export function RankingPodium({ items, prizes = [], empresa = 'Mi Comercio', igConnected = false }: RankingPodiumProps) {
  const [igOpen, setIgOpen] = useState(false)

  const byPos = (pos: number) => items.find(i => i.position === pos)
  const prize = (pos: number) => prizes.find(p => p.rank === pos)

  const PodiumSlot = ({ pos }: { pos: number }) => {
    const p = byPos(pos)
    const pr = prize(pos)
    const style = PODIUM.find(s => s.pos === pos)!
    const order = pos === 1 ? 'order-2' : pos === 2 ? 'order-1' : 'order-3'

    return (
      <div className={`flex flex-col items-center flex-1 ${order}`}>
        <div className={`h-[52px] w-[52px] ${pos === 1 ? 'h-[60px] w-[60px]' : ''} rounded-full ${style.bg} border-[3px] ${style.ringColor} flex items-center justify-center text-xl font-black mb-2 text-[#002B72]`}>
          {p?.name?.charAt(0) ?? '?'}
        </div>
        <div className="text-[12px] font-extrabold text-[#0D1A3A] text-center mb-0.5 truncate w-full px-1">
          {p?.name ?? '—'}
        </div>
        <div className={`font-bebas text-[18px] ${style.ptsColor} leading-none mb-1`}>
          {p?.points ?? 0} pts
        </div>
        {pr && (
          <div className="text-[10px] font-black text-[#5A6480] text-center mb-1 px-1 truncate w-full" title={pr.description}>
            🎁 {pr.description}
          </div>
        )}
        {p?.phone && (
          <a
            href={waLink(p.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-black text-[#25D366] bg-[#E8F8F1] px-2 py-0.5 rounded-full mb-2 hover:opacity-80 transition-all"
          >
            💬 WA
          </a>
        )}
        <div className={`w-full ${style.barH} ${style.barColor} rounded-t-xl flex items-center justify-center font-bebas text-[22px] ${style.barText}`}>
          {pos}°
        </div>
      </div>
    )
  }

  return (
    <>
      <Card padding={false} className="overflow-hidden">
        <div className="px-[22px] py-[18px] border-b border-[#DDE1EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">🏆</span>
            <h3 className="text-[15px] font-extrabold text-[#0D1A3A]">Podio</h3>
          </div>
          <button
            onClick={() => setIgOpen(true)}
            className="flex items-center justify-center gap-2 px-[14px] py-[7px] rounded-lg text-white text-[12px] font-black hover:opacity-90 transition-all shadow-lg shadow-pink-500/10"
            style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #cc2366)' }}
          >
            <IgIcon className="w-4 h-4" /> Publicar en Instagram
          </button>
        </div>

        <div className="flex items-end justify-center gap-3 px-[22px] pt-6 pb-0">
          <PodiumSlot pos={2} />
          <PodiumSlot pos={1} />
          <PodiumSlot pos={3} />
        </div>
      </Card>

      <IgPublishModal
        open={igOpen}
        onClose={() => setIgOpen(false)}
        podium={items.map(i => ({ name: i.name, points: i.points, position: i.position }))}
        empresa={empresa}
        igConnected={igConnected}
      />
    </>
  )
}
