import { Module } from '@nestjs/common'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { NotificationsScheduler } from './notifications.scheduler'
import { LeaderboardModule } from '../leaderboard/leaderboard.module'

@Module({
  imports: [LeaderboardModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}
