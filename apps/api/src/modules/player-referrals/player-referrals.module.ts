import { Module } from '@nestjs/common'
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module'
import { PlayerReferralsController } from './player-referrals.controller'
import { PlayerReferralsService } from './player-referrals.service'

@Module({
  imports: [SupabaseModule],
  controllers: [PlayerReferralsController],
  providers: [PlayerReferralsService],
  exports: [PlayerReferralsService],
})
export class PlayerReferralsModule {}
