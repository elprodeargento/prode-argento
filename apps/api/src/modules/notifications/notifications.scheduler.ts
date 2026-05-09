import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { NotificationsService } from './notifications.service'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'
import { LeaderboardService } from '../leaderboard/leaderboard.service'

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name)

  constructor(
    private notifications: NotificationsService,
    private supabase: SupabaseService,
    private leaderboard: LeaderboardService,
  ) {}

  /** Check every hour for upcoming matches — send reminder 24h before kickoff */
  @Cron(CronExpression.EVERY_HOUR)
  async checkUpcomingMatches() {
    const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const in23h = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()

    const { data: matches } = await this.supabase.client
      .from('matches')
      .select('id, stage, group')
      .eq('status', 'scheduled')
      .gte('kickoff_at', in23h)
      .lte('kickoff_at', in24h)

    if (!matches?.length) return
    this.logger.log(`Found ${matches.length} matches in ~24h — sending reminders`)

    const { data: businesses } = await this.supabase.client
      .from('businesses')
      .select('id, name, plan')
      .eq('active', true)
      .in('plan', ['premium', 'pro'])

    for (const biz of businesses ?? []) {
      await this.notifications.sendReminderForFecha(biz.id, `Fecha de grupos`)
    }
  }

  /** After a match finishes — score predictions and send result notifications */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkFinishedMatches() {
    const { data: matches } = await this.supabase.client
      .from('matches')
      .select('id, home_score, away_score')
      .eq('status', 'finished')
      .is('scored_at', null)

    if (!matches?.length) return
    this.logger.log(`Scoring ${matches.length} finished matches`)

    for (const match of matches) {
      if (match.home_score === null || match.away_score === null) continue

      // Score all predictions for this match and update leaderboard cache
      const results = await this.leaderboard.scoreMatch(
        match.id,
        match.home_score,
        match.away_score,
      )

      // Mark match as scored so this cron doesn't process it again
      await this.supabase.client
        .from('matches')
        .update({ scored_at: new Date().toISOString() })
        .eq('id', match.id)

      // Send result notifications to premium/pro participants who have a phone
      for (const result of results) {
        const { data: participant } = await this.supabase.client
          .from('participants')
          .select('id, phone, name, rank, last_wa_sent_at, businesses(name, plan, slug)')
          .eq('id', result.participantId)
          .single()

        if (!participant) continue
        const biz = participant.businesses as any
        if (!biz || !['premium', 'pro'].includes(biz.plan)) continue
        if (!participant.phone) continue

        await this.notifications.sendResultNotification(
          participant.id,
          participant.phone,
          participant.name,
          biz.name,
          biz.slug ?? '',
          `Partido ${match.id}`,
          result.pointsEarned,
          participant.rank ?? 0,
          participant.last_wa_sent_at ?? null,
        )
      }
    }
  }
}
