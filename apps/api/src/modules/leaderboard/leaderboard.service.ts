import { Injectable, Logger } from '@nestjs/common'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

export interface ScoringResult {
  participantId: string
  matchId: number
  pointsEarned: number
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name)

  constructor(private supabase: SupabaseService) {}

  /** Called after a match finishes — scores all predictions for that match */
  async scoreMatch(matchId: number, homeScore: number, awayScore: number): Promise<ScoringResult[]> {
    const { data, error } = await this.supabase.client
      .rpc('score_match_predictions', {
        p_match_id:   matchId,
        p_home_score: homeScore,
        p_away_score: awayScore,
      })

    if (error) {
      this.logger.error(`Error scoring match ${matchId}`, error.message)
      throw new Error(error.message)
    }

    if (!data?.length) return []

    // Leaderboard recalculation is handled by the dedicated scheduler — decoupled from scoring
    return (data as Array<{ participant_id: string; points_earned: number }>).map((r) => ({
      participantId: r.participant_id,
      matchId,
      pointsEarned: r.points_earned,
    }))
  }

  async getWeeklyLeaderboard(adminUserId: string, weekOffset = 0) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single()
    if (!business) return []

    const result = await this.getWeeklyLeaderboardByBusinessId(business.id, weekOffset)
    return {
      ...result,
      entries: result.entries.slice(0, 10),
    }
  }

  async getWeeklyLeaderboardByBusinessId(businessId: string, offset: number) {
    const now = new Date()
    const daysFromMonday = (now.getDay() + 6) % 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - daysFromMonday + offset * 7)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    const { data, error } = await this.supabase.client
      .rpc('get_weekly_leaderboard', {
        p_business_id: businessId,
        p_week_start:  monday.toISOString(),
        p_week_end:    sunday.toISOString(),
      })

    if (error) throw new Error(error.message)

    const entries = (data ?? []).map((r: any) => ({
      participant_id: r.participant_id,
      name:           r.name,
      email:          r.email,
      registered_at:  r.registered_at,
      weekly_points:  Number(r.weekly_points),
      exact_results:  Number(r.exact_results),
      rank:           Number(r.rank),
    }))

    return { entries, weekStart: monday.toISOString(), weekEnd: sunday.toISOString() }
  }

  async getLeaderboardByAdminId(adminUserId: string, limit = 50) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single()
    if (!business) return []
    return this.getLeaderboard(business.id, limit)
  }

  async getLeaderboard(businessId: string, limit = 50) {
    const { data: cached } = await this.supabase.client
      .from('leaderboard_cache')
      .select('*, participants(name, email, phone)')
      .eq('business_id', businessId)
      .order('rank', { ascending: true })
      .limit(limit)

    if (cached && cached.length > 0) return cached

    // Cache empty (no matches scored yet) — fall back to participants with 0 pts
    const { data: parts } = await this.supabase.client
      .from('participants')
      .select('id, name, email, phone')
      .eq('business_id', businessId)
      .order('registered_at', { ascending: true })
      .limit(limit)

    return (parts ?? []).map((p, i) => ({
      participant_id: p.id,
      total_points: 0,
      exact_results: 0,
      correct_winners: 0,
      rank: i + 1,
      participants: { name: p.name, email: p.email, phone: p.phone },
    }))
  }

  async recalculateAllLeaderboards() {
    const { data: businesses, error } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('active', true)

    if (error) {
      this.logger.error('Error fetching businesses for leaderboard recalc', error.message)
      return
    }

    for (const biz of businesses ?? []) {
      const { error: rpcErr } = await this.supabase.client
        .rpc('recalculate_leaderboard', { p_business_id: biz.id })
      if (rpcErr) {
        this.logger.error(`Error recalculating leaderboard for business ${biz.id}`, rpcErr.message)
      }
    }
  }
}
