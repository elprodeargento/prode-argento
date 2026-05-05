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
    const { data } = await this.supabase.client
      .from('leaderboard_cache')
      .select('*, participants(name, email)')
      .eq('business_id', businessId)
      .order('rank', { ascending: true })
      .limit(limit)

    return data ?? []
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
