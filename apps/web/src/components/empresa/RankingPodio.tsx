'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Trophy } from 'lucide-react'
import { IgPublishModal } from './IgPublishModal'

function IgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}


interface PodiumItem {
  id: string
  name: string
  points: number
  position: number
  avatar?: string
}

interface RankingPodiumProps {
  items: PodiumItem[]
  empresa?: string
  igConnected?: boolean
}

export function RankingPodium({ items, empresa = 'Mi Empresa', igConnected = false }: RankingPodiumProps) {
  const [igOpen, setIgOpen] = useState(false)

  const p1 = items.find((i) => i.position === 1)
  const p2 = items.find((i) => i.position === 2)
  const p3 = items.find((i) => i.position === 3)

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
            className="flex items-center justify-center gap-2 px-[14px] py-[7px] rounded-lg text-white text-[12px] font-black hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-pink-500/10"
            style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #cc2366)' }}
          >
            <span className="text-[14px]">📸</span> Publicar en Instagram
          </button>
        </div>

        <div className="flex items-end justify-center gap-3 px-[22px] pt-6 pb-0">
          {/* 2nd Place */}
          <div className="flex flex-col items-center flex-1">
            <div className="h-[52px] w-[52px] rounded-full bg-[#F0F2F8] border-[3px] border-[#B0B8CC] flex items-center justify-center text-xl font-black mb-2 text-[#002B72]">
              {p2?.avatar || '👨'}
            </div>
            <div className="text-[12px] font-extrabold text-[#0D1A3A] text-center mb-1 truncate w-full">{p2?.name || 'Carlos Ruiz'}</div>
            <div className="font-bebas text-[20px] text-[#7A839E] mb-2 leading-none">{p2?.points || 0} pts</div>
            <div className="w-full h-[56px] bg-[#9BA5BE] rounded-t-xl flex items-center justify-center font-bebas text-2xl text-white/60">
              2°
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center flex-1">
            <div className="h-[60px] w-[60px] rounded-full bg-[#FEF8D8] border-[3px] border-[#F5C518] flex items-center justify-center text-2xl font-black mb-2 text-[#002B72]">
              {p1?.avatar || '👩'}
            </div>
            <div className="text-[12px] font-extrabold text-[#0D1A3A] text-center mb-1 truncate w-full">{p1?.name || 'Martina López'}</div>
            <div className="font-bebas text-[20px] text-[#C49A00] mb-2 leading-none">{p1?.points || 0} pts</div>
            <div className="w-full h-[70px] bg-[#F5C518] rounded-t-xl flex items-center justify-center font-bebas text-[24px] text-[#002B72]">
              1°
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center flex-1">
            <div className="h-[52px] w-[52px] rounded-full bg-[#FBF0E8] border-[3px] border-[#CD9B6A] flex items-center justify-center text-xl font-black mb-2 text-[#002B72]">
              {p3?.avatar || '🧑'}
            </div>
            <div className="text-[12px] font-extrabold text-[#0D1A3A] text-center mb-1 truncate w-full">{p3?.name || 'Lucas Fernández'}</div>
            <div className="font-bebas text-[20px] text-[#9B6B3A] mb-2 leading-none">{p3?.points || 0} pts</div>
            <div className="w-full h-[44px] bg-[#CD9B6A] rounded-t-xl flex items-center justify-center font-bebas text-2xl text-white/60">
              3°
            </div>
          </div>
        </div>
      </Card>

      <IgPublishModal
        open={igOpen}
        onClose={() => setIgOpen(false)}
        podium={items.map((i) => ({ name: i.name, points: i.points, position: i.position }))}
        empresa={empresa}
        igConnected={igConnected}
      />
    </>
  )
}
