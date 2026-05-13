import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module'
import { ReferralsModule } from '../referrals/referrals.module'
import { PlayerReferralsModule } from '../player-referrals/player-referrals.module'

@Module({
  imports: [ConfigModule, SupabaseModule, ReferralsModule, PlayerReferralsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
