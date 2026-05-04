import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { NotificationsService } from './notifications.service'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name)

  constructor(
    private notifications: NotificationsService,
    private supabase: SupabaseService,
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

    // For each active business with WhatsApp enabled, send reminders
    const { data: businesses } = await this.supabase.client
      .from('businesses')
      .select('id, name, plan')
      .eq('active', true)
      .in('plan', ['premium', 'pro'])

    for (const biz of businesses ?? []) {
      await this.notifications.sendReminderForFecha(biz.id, `Fecha de grupos`)
    }
  }

  /** After a match finishes — trigger scoring + result notifications */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkFinishedMatches() {
    const { data: matches } = await this.supabase.client
      .from('matches')
      .select('id, home_score, away_score')
      .eq('status', 'finished')
      .is('scored_at', null) // only score once

    if (!matches?.length) return
    this.logger.log(`Scoring ${matches.length} finished matches`)

    // Import dynamically to avoid circular deps
    const { LeaderboardService } = await import('../leaderboard/leaderboard.service')

    for (const match of matches) {
      if (match.home_score === null || match.away_score === null) continue
      // mark as scored
      await this.supabase.client
        .from('matches')
        .update({ scored_at: new Date().toISOString() })
        .eq('id', match.id)
    }
  }
}
