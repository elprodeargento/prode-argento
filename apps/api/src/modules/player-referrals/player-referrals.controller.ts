import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PlayerReferralsService } from './player-referrals.service'

@ApiTags('Player Referrals')
@Controller({ path: 'player-referrals', version: '1' })
export class PlayerReferralsController {
  constructor(private readonly service: PlayerReferralsService) {}

  @Post('register')
  @ApiOperation({ summary: 'Get or create player referrer record' })
  register(@Body() body: { email: string; name: string }) {
    return this.service.getOrCreate(body.email, body.name)
  }

  @Post('request-payout')
  @ApiOperation({ summary: 'Request payout for accumulated referrals' })
  requestPayout(@Body() body: { email: string; name: string; amount: number; paymentInfo: string }) {
    return this.service.requestPayout(body.email, body.name, body.amount, body.paymentInfo)
  }
}
