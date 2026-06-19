import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { LeaderboardService } from './leaderboard.service'

@Injectable()
export class LeaderboardScheduler {
  private readonly logger = new Logger(LeaderboardScheduler.name)

  constructor(private leaderboard: LeaderboardService) {}

  @Cron('*/10 * * * *', { name: 'recalculate-leaderboards' })
  async recalculateLeaderboards() {
    this.logger.log('recalculateLeaderboards: tick')
    const { processed, failed } = await this.leaderboard.recalculateAllLeaderboards()
    this.logger.log(`recalculateLeaderboards: ${processed} negocios OK, ${failed} fallidos`)
  }
}
