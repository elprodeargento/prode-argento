'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface LeaderboardEntry {
  rank: number
  total_points: number
  participants: {
    name: string
  }
}

export function DashboardRanking() {
  const [ranking, setRanking] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchRanking() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .eq('admin_user_id', user.id)
          .single()
        if (!business) return

        const { data: cached } = await supabase
          .from('leaderboard_cache')
          .select('rank, total_points, participants(name)')
          .eq('business_id', business.id)
          .order('rank', { ascending: true })
          .limit(5)

        if (cached && cached.length > 0) {
          setRanking(cached as unknown as LeaderboardEntry[])
          return
        }

        const { data: parts } = await supabase
          .from('participants')
          .select('id, name')
          .eq('business_id', business.id)
          .eq('is_disabled', false)
          .order('registered_at', { ascending: true })
          .limit(5)

        setRanking((parts ?? []).map((p, i) => ({
          rank: i + 1,
          total_points: 0,
          participants: { name: p.name },
        })))
      } catch (error) {
        console.error('Error fetching ranking:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRanking()
  }, [])

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#DDE1EF]" />
      </Card>
    )
  }

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#DDE1EF]">
        <div className="text-[15px] font-extrabold text-[#0D1A3A]">🏆 Top 5 del ranking</div>
        <a href="/empresa/ranking" className="text-[13px] font-bold text-[#003FA3] hover:underline transition-all">Ver completo</a>
      </div>
      <div className="pt-4 px-4 pb-4 flex flex-col gap-[8px]">
        {ranking.length === 0 && (
          <div className="py-12 text-center text-[13px] font-medium text-[#8E96AE]">
            No hay datos de ranking todavía.
          </div>
        )}
        {ranking.map((r, i) => (
          <div key={i} className={`flex items-center gap-3 p-[14px] rounded-[10px] border-[1.5px] transition-all
            ${i === 0 
              ? 'bg-[#E8F8F1] border-[#18A06A]/10' 
              : 'bg-[#F1F3F9] border-[#DDE1EF]'}`}>
            <span className={`font-bebas text-[22px] w-8 text-center ${i === 0 ? 'text-[#18A06A]' : 'text-[#002B72]'}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </span>
            <span className="flex-1 font-extrabold text-[14px] text-[#0D1A3A] truncate">
              {r.participants?.name || 'Participante'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`font-bebas text-[20px] ${i === 0 ? 'text-[#18A06A]' : 'text-[#0D1A3A]'}`}>
                {r.total_points}
              </span>
              <span className="text-[11px] font-bold text-[#8E96AE] uppercase">pts</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
