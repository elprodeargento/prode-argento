import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common'
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

  @Post('redeem')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  async redeem(@Req() req: any, @Body() body: { prize: string; points: number }) {
    return this.referralsService.redeemPrize(req.user.id, body.prize, body.points)
  }
}
