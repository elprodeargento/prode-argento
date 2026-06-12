import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { LeaderboardService } from './leaderboard.service'

@Injectable()
export class LeaderboardScheduler {
  private readonly logger = new Logger(LeaderboardScheduler.name)

  constructor(private leaderboard: LeaderboardService) {}

  @Cron('*/10 * * * *')
  async recalculateLeaderboards() {
    this.logger.log('Recalculating leaderboards for all businesses')
    await this.leaderboard.recalculateAllLeaderboards()
  }
}
