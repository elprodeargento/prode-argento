import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { SupabaseModule } from './infrastructure/supabase/supabase.module'
import { AuthModule } from './modules/auth/auth.module'
import { BusinessesModule } from './modules/businesses/businesses.module'
import { ParticipantsModule } from './modules/participants/participants.module'
import { MatchesModule } from './modules/matches/matches.module'
import { PredictionsModule } from './modules/predictions/predictions.module'
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module'
import { PrizesModule } from './modules/prizes/prizes.module'
import { PromosModule } from './modules/promos/promos.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { InstagramModule } from './modules/instagram/instagram.module'
import { PaymentsModule } from './modules/payments/payments.module'
import appConfig from './config/app.config'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig], cache: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ScheduleModule.forRoot(),
    SupabaseModule,
    AuthModule,
    BusinessesModule,
    ParticipantsModule,
    MatchesModule,
    PredictionsModule,
    LeaderboardModule,
    PrizesModule,
    PromosModule,
    NotificationsModule,
    InstagramModule,
    PaymentsModule,
  ],
})
export class AppModule {}
