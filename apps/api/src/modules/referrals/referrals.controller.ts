import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ReferralsService } from './referrals.service'
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard'

@ApiTags('Referrals')
@Controller({ path: 'referrals', version: '1' })
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  getMyReferrals(@Req() req: any) {
    return this.referralsService.getMyReferrals(req.user.id)
  }
}
