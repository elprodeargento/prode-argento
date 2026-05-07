import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MatchesService } from './matches.service'

@Injectable()
export class MatchesScheduler {
  private readonly logger = new Logger(MatchesScheduler.name)

  constructor(private readonly matchesService: MatchesService) {}

  // 07:00 Argentina time = 10:00 UTC
  @Cron('0 10 * * *', { name: 'sync-matches-morning', timeZone: 'UTC' })
  async syncMorning() {
    this.logger.log('Running morning match sync...')
    try {
      const result = await this.matchesService.syncFromFootballData()
      this.logger.log(`Morning sync done: ${JSON.stringify(result)}`)
    } catch (err) {
      this.logger.error('Morning sync failed', err)
    }
  }

  // 23:00 Argentina time = 02:00 UTC
  @Cron('0 2 * * *', { name: 'sync-matches-night', timeZone: 'UTC' })
  async syncNight() {
    this.logger.log('Running night match sync...')
    try {
      const result = await this.matchesService.syncFromFootballData()
      this.logger.log(`Night sync done: ${JSON.stringify(result)}`)
    } catch (err) {
      this.logger.error('Night sync failed', err)
    }
  }
}
