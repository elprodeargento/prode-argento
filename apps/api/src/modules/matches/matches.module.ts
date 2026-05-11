import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchesScheduler } from './matches.scheduler';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [LeaderboardModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesScheduler],
})
export class MatchesModule {}
