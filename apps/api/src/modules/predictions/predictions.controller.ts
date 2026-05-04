import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PredictionsService } from './predictions.service'
import { SavePredictionsDto } from './dto/save-predictions.dto'
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard'

@ApiTags('Predictions')
@Controller({ path: 'predictions', version: '1' })
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save participant predictions for a date' })
  save(@Body() dto: SavePredictionsDto, @Request() req: any) {
    return this.predictionsService.savePredictions(dto, req.user.sub)
  }

  @Get(':participantId')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  findByParticipant(@Param('participantId') participantId: string) {
    return this.predictionsService.findByParticipant(participantId)
  }
}
