import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MatchesService } from './matches.service'

@Injectable()
export class MatchesScheduler {
  private readonly logger = new Logger(MatchesScheduler.name)

  constructor(private readonly matchesService: MatchesService) {}

  @Cron('*/8 * * * *', { name: 'sync-matches' })
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
