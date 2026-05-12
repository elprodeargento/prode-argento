import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MatchesService } from './matches.service'

@Injectable()
export class MatchesScheduler {
  private readonly logger = new Logger(MatchesScheduler.name)

  constructor(private readonly matchesService: MatchesService) {}

  // Every 2 hours between 07:00 and 23:00 Argentina time
  @Cron('0 7-23/2 * * *', { name: 'sync-matches-active-window', timeZone: 'America/Argentina/Buenos_Aires' })
  async syncActiveWindow() {
    this.logger.log('Running scheduled match sync (active window)...')
    try {
      const result = await this.matchesService.syncFromFootballData()
      this.logger.log(`Sync done: ${JSON.stringify(result)}`)
    } catch (err) {
      this.logger.error('Sync failed', err)
    }
  }
}
