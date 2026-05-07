import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchesScheduler } from './matches.scheduler';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, MatchesScheduler],
})
export class MatchesModule {}
