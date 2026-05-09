import { Module } from '@nestjs/common'
import { ParticipantsService } from './participants.service'
import { ParticipantsController } from './participants.controller'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [NotificationsModule],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
  exports: [ParticipantsService],
})
export class ParticipantsModule {}
