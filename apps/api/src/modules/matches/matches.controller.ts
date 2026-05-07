import { Controller, Get, Post } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { MatchesService } from './matches.service'

@ApiTags('Matches')
@Controller({ path: 'matches', version: '1' })
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all matches' })
  findAll() {
    return this.matchesService.findAll()
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync all WC 2026 matches from football-data.org (upsert by fd_match_id)' })
  sync() {
    return this.matchesService.syncFromFootballData()
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed World Cup 2026 group stage matches (dev only)' })
  seed() {
    return this.matchesService.seedMatches()
  }
}
