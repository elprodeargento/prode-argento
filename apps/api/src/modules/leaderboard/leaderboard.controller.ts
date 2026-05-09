import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { LeaderboardService } from './leaderboard.service'
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard'

@ApiTags('Leaderboard')
@Controller({ path: 'leaderboard', version: '1' })
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('me/weekly')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly leaderboard (Mon–Sun) for the current business' })
  getMyWeeklyLeaderboard(@Req() req: any, @Query('offset') offset = 0) {
    return this.leaderboardService.getWeeklyLeaderboard(req.user.id, Number(offset))
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get leaderboard for the current business' })
  getMyLeaderboard(@Req() req: any, @Query('limit') limit = 50) {
    return this.leaderboardService.getLeaderboardByAdminId(req.user.id, Number(limit))
  }

  @Get(':businessId/weekly')
  @ApiOperation({ summary: 'Get weekly leaderboard for a business (public)' })
  getWeeklyByBusiness(
    @Param('businessId') businessId: string,
    @Query('offset') offset = 0,
  ) {
    return this.leaderboardService.getWeeklyLeaderboardByBusinessId(businessId, Number(offset))
  }

  @Get(':businessId')
  @ApiOperation({ summary: 'Get leaderboard for a business' })
  getLeaderboard(
    @Param('businessId') businessId: string,
    @Query('limit') limit = 50,
  ) {
    return this.leaderboardService.getLeaderboard(businessId, Number(limit))
  }
}
