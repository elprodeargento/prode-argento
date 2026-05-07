import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PredictionsService } from './predictions.service'
import { SavePredictionsDto } from './dto/save-predictions.dto'

@ApiTags('Predictions')
@Controller({ path: 'predictions', version: '1' })
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  @ApiOperation({ summary: 'Save participant predictions (no auth required)' })
  save(@Body() dto: SavePredictionsDto) {
    return this.predictionsService.savePredictions(dto)
  }

  @Get('participant/:participantId')
  @ApiOperation({ summary: 'Get predictions for a participant (public)' })
  findByParticipant(@Param('participantId') participantId: string) {
    return this.predictionsService.findByParticipant(participantId)
  }
}
