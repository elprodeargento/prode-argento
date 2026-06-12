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

    // Compute Monday–Sunday for the requested week
    const now = new Date()
    const daysFromMonday = (now.getDay() + 6) % 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - daysFromMonday + weekOffset * 7)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    // Matches played in this week
    const { data: weekMatches } = await this.supabase.client
      .from('matches')
      .select('id')
      .gte('kickoff_at', monday.toISOString())
      .lte('kickoff_at', sunday.toISOString())

    const matchIds = (weekMatches ?? []).map((m) => m.id)
    if (!matchIds.length) return { entries: [], weekStart: monday.toISOString(), weekEnd: sunday.toISOString() }

    // Participants for this business
    const { data: participants } = await this.supabase.client
      .from('participants')
      .select('id, name, email, registered_at')
      .eq('business_id', business.id)

    const participantIds = (participants ?? []).map((p) => p.id)
    const participantMap = Object.fromEntries((participants ?? []).map((p) => [p.id, p]))

    // Predictions for those matches + those participants
    const { data: preds } = await this.supabase.client
      .from('predictions')
      .select('participant_id, points_earned')
      .in('match_id', matchIds)
      .in('participant_id', participantIds)
      .not('points_earned', 'is', null)

    // Aggregate
    const totals: Record<string, { points: number; exact: number }> = {}
    for (const pred of preds ?? []) {
      if (!totals[pred.participant_id]) totals[pred.participant_id] = { points: 0, exact: 0 }
      totals[pred.participant_id].points += pred.points_earned ?? 0
      if (pred.points_earned === 3) totals[pred.participant_id].exact++
    }

    const entries = Object.entries(totals)
      .map(([id, data]) => ({
        participant_id: id,
        name: participantMap[id]?.name ?? 'Desconocido',
        email: participantMap[id]?.email ?? '',
        registered_at: participantMap[id]?.registered_at ?? null,
        weekly_points: data.points,
        exact_results: data.exact,
      }))
      .sort((a, b) => {
        if (b.weekly_points !== a.weekly_points) return b.weekly_points - a.weekly_points
        if (b.exact_results !== a.exact_results) return b.exact_results - a.exact_results
        return new Date(a.registered_at ?? 0).getTime() - new Date(b.registered_at ?? 0).getTime()
      })
      .slice(0, 10)
      .map((entry, i) => ({ ...entry, rank: i + 1 }))

    return { entries, weekStart: monday.toISOString(), weekEnd: sunday.toISOString() }
  }

  async getWeeklyLeaderboardByBusinessId(businessId: string, offset: number) {
    // Compute Monday–Sunday window for the requested week
    const now = new Date()
    const daysFromMonday = (now.getDay() + 6) % 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - daysFromMonday + offset * 7)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    // Matches played in this week
    const { data: weekMatches } = await this.supabase.client
      .from('matches')
      .select('id')
      .gte('kickoff_at', monday.toISOString())
      .lte('kickoff_at', sunday.toISOString())

    const matchIds = (weekMatches ?? []).map((m) => m.id)

    const { data: participants, error: pErr } = await this.supabase.client
      .from('participants')
      .select('id, name, registered_at')
      .eq('business_id', businessId)

    if (pErr) throw new Error(pErr.message)
    if (!participants?.length) return { entries: [], weekStart: monday.toISOString(), weekEnd: sunday.toISOString() }

    const participantIds = participants.map((p) => p.id)
    const participantMap = Object.fromEntries(participants.map((p) => [p.id, p]))

    const map: Record<string, { points: number; exact: number }> = {}
    for (const p of participants) map[p.id] = { points: 0, exact: 0 }

    if (matchIds.length > 0) {
      const { data: predictions, error: predErr } = await this.supabase.client
        .from('predictions')
        .select('participant_id, points_earned')
        .in('match_id', matchIds)
        .in('participant_id', participantIds)

      if (predErr) throw new Error(predErr.message)

      for (const pred of predictions ?? []) {
        if (map[pred.participant_id] && pred.points_earned != null) {
          map[pred.participant_id].points += pred.points_earned
          if (pred.points_earned === 3) map[pred.participant_id].exact++
        }
      }
    }

    const entries = Object.entries(map)
      .map(([id, v]) => ({
        participant_id: id,
        name: participantMap[id]?.name ?? 'Desconocido',
        registered_at: participantMap[id]?.registered_at ?? null,
        weekly_points: v.points,
        exact_results: v.exact,
      }))
      .sort((a, b) => {
        if (b.weekly_points !== a.weekly_points) return b.weekly_points - a.weekly_points
        if (b.exact_results !== a.exact_results) return b.exact_results - a.exact_results
        return new Date(a.registered_at ?? 0).getTime() - new Date(b.registered_at ?? 0).getTime()
      })
      .map((e, i) => ({ ...e, rank: i + 1 }))

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
