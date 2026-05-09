import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

export interface ScoringResult {
  participantId: string
  matchId: number
  pointsEarned: number
}

@Injectable()
export class LeaderboardService {
  constructor(private supabase: SupabaseService) {}

  /** Called after a match finishes — scores all predictions for that match */
  async scoreMatch(matchId: number, homeScore: number, awayScore: number): Promise<ScoringResult[]> {
    const { data: predictions } = await this.supabase.client
      .from('predictions')
      .select('id, participant_id, home_pred, away_pred')
      .eq('match_id', matchId)

    if (!predictions?.length) return []

    const results: ScoringResult[] = predictions.map((p) => {
      let pts = 0
      if (p.home_pred === homeScore && p.away_pred === awayScore) {
        pts = 3 // exact
      } else {
        const realWinner = Math.sign(homeScore - awayScore)
        const predWinner = Math.sign(p.home_pred - p.away_pred)
        if (realWinner === predWinner) pts = 1 // correct winner
      }
      return { participantId: p.participant_id, matchId, pointsEarned: pts }
    })

    // Update points on each prediction
    await Promise.all(
      results.map((r) =>
        this.supabase.client
          .from('predictions')
          .update({ points_earned: r.pointsEarned })
          .eq('participant_id', r.participantId)
          .eq('match_id', matchId),
      ),
    )

    // Recalculate leaderboard cache for each affected business
    await this.recalculateLeaderboards(results.map((r) => r.participantId))

    return results
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
      .select('id, name, email')
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
        weekly_points: data.points,
        exact_results: data.exact,
      }))
      .sort((a, b) => b.weekly_points - a.weekly_points)
      .slice(0, 10)
      .map((entry, i) => ({ ...entry, rank: i + 1 }))

    return { entries, weekStart: monday.toISOString(), weekEnd: sunday.toISOString() }
  }

  async getWeeklyLeaderboardByBusinessId(businessId: string, offset: number) {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - offset * 7)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    const { data, error } = await this.supabase.client
      .from('predictions')
      .select(`
        participant_id,
        points_earned,
        participants!inner(name, business_id)
      `)
      .eq('participants.business_id', businessId)
      .gte('created_at', monday.toISOString())
      .lte('created_at', sunday.toISOString())
      .not('points_earned', 'is', null)

    if (error) throw new Error(error.message)

    const map: Record<string, { name: string; points: number; exact: number }> = {}
    for (const row of data ?? []) {
      const pid = row.participant_id
      const name = (row.participants as any)?.name ?? 'Participante'
      if (!map[pid]) map[pid] = { name, points: 0, exact: 0 }
      map[pid].points += row.points_earned ?? 0
      if (row.points_earned === 3) map[pid].exact++
    }

    const entries = Object.entries(map)
      .map(([id, v]) => ({ participant_id: id, name: v.name, weekly_points: v.points, exact_results: v.exact }))
      .sort((a, b) => b.weekly_points - a.weekly_points)
      .map((e, i) => ({ ...e, rank: i + 1 }))

    return {
      entries,
      weekStart: monday.toISOString(),
      weekEnd: sunday.toISOString(),
    }
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
      .select('*, participants(name, email)')
      .eq('business_id', businessId)
      .order('rank', { ascending: true })
      .limit(limit)

    if (cached && cached.length > 0) return cached

    // Cache empty (no matches scored yet) — fall back to participants with 0 pts
    const { data: parts } = await this.supabase.client
      .from('participants')
      .select('id, name, email')
      .eq('business_id', businessId)
      .order('name', { ascending: true })
      .limit(limit)

    return (parts ?? []).map((p, i) => ({
      participant_id: p.id,
      total_points: 0,
      exact_results: 0,
      correct_winners: 0,
      rank: i + 1,
      participants: { name: p.name, email: p.email },
    }))
  }

  private async recalculateLeaderboards(participantIds: string[]) {
    // Get affected businesses
    const { data: parts } = await this.supabase.client
      .from('participants')
      .select('id, business_id')
      .in('id', participantIds)

    const businessIds = [...new Set(parts?.map((p) => p.business_id) ?? [])]

    for (const businessId of businessIds) {
      await this.supabase.client.rpc('recalculate_leaderboard', { p_business_id: businessId })
    }
  }
}
