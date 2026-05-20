import { Module } from '@nestjs/common'
import { ReferralCampaignsController } from './referral-campaigns.controller'
import { ReferralCampaignsService } from './referral-campaigns.service'
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module'

@Module({
  imports: [SupabaseModule],
  controllers: [ReferralCampaignsController],
  providers: [ReferralCampaignsService],
  exports: [ReferralCampaignsService],
})
export class ReferralCampaignsModule {}
