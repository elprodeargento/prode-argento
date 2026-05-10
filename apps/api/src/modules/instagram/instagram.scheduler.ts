import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InstagramService } from './instagram.service'

@Injectable()
export class InstagramScheduler {
  private readonly logger = new Logger(InstagramScheduler.name)

  constructor(private readonly instagramService: InstagramService) {}

  // 03:00 UTC daily
  @Cron('0 3 * * *', { name: 'refresh-ig-tokens', timeZone: 'UTC' })
  async refreshExpiringTokens() {
    this.logger.log('Running IG token refresh job...')
    try {
      await this.instagramService.refreshAllExpiringTokens()
      this.logger.log('IG token refresh job completed')
    } catch (err) {
      this.logger.error('IG token refresh job failed', err)
    }
  }
}
