import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { LeaderboardService } from './leaderboard.service'

@ApiTags('Leaderboard')
@Controller({ path: 'leaderboard', version: '1' })
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':businessId')
  @ApiOperation({ summary: 'Get leaderboard for a business' })
  getLeaderboard(
    @Param('businessId') businessId: string,
    @Query('limit') limit = 50,
  ) {
    return this.leaderboardService.getLeaderboard(businessId, limit)
  }
}
