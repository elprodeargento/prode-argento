import { Module } from '@nestjs/common'
import { LeaderboardController } from './leaderboard.controller'
import { LeaderboardService } from './leaderboard.service'
import { LeaderboardScheduler } from './leaderboard.scheduler'

@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardScheduler],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
