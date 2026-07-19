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

    // Calculamos la ventana lunes-domingo en timezone Argentina (ART = UTC-3, sin DST).
    // Restamos 3h para trabajar con los números de wall-clock ART como si fueran UTC,
    // calculamos inicio/fin de semana, y luego sumamos 3h para convertir de vuelta a UTC real.
    // Agregamos 3h extra de gracia al rollover: la semana no cambia a las 00:00 ART del lunes
    // sino a las 03:00 ART, para que partidos del domingo a la noche (que terminan ~01:00 ART)
    // siempre queden en la semana correcta.
    const ART_OFFSET_MS = 3 * 60 * 60 * 1000
    const ROLLOVER_GRACE_MS = 3 * 60 * 60 * 1000
    const nowAsART = new Date(now.getTime() - ART_OFFSET_MS - ROLLOVER_GRACE_MS)
    const daysFromMonday = (nowAsART.getUTCDay() + 6) % 7

    const mondayART = new Date(nowAsART)
    mondayART.setUTCDate(nowAsART.getUTCDate() - daysFromMonday + offset * 7)
    mondayART.setUTCHours(0, 0, 0, 0)

    const sundayART = new Date(mondayART)
    sundayART.setUTCDate(mondayART.getUTCDate() + 6)
    sundayART.setUTCHours(23, 59, 59, 999)

    const monday = new Date(mondayART.getTime() + ART_OFFSET_MS) // lunes 00:00 ART → UTC
    const sunday = new Date(sundayART.getTime() + ART_OFFSET_MS) // domingo 23:59:59 ART → UTC

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

  async getLeaderboard(businessId: string, limit = 1000) {
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
      .eq('is_disabled', false)
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

  async recalculateAllLeaderboards(): Promise<{ processed: number; failed: number }> {
    const { data: businesses, error } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('active', true)

    if (error) {
      this.logger.error('Error fetching businesses for leaderboard recalc', error.message)
      return { processed: 0, failed: 0 }
    }

    let processed = 0
    let failed = 0
    for (const biz of businesses ?? []) {
      const { error: rpcErr } = await this.supabase.client
        .rpc('recalculate_leaderboard', { p_business_id: biz.id })
      if (rpcErr) {
        this.logger.error(`Error recalculating leaderboard for business ${biz.id}`, rpcErr.message)
        failed++
      } else {
        processed++
      }
    }
    return { processed, failed }
  }
}
