import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';

@ApiTags('Participants')
@Controller({ path: 'participants', version: '1' })
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new participant for a business' })
  create(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantsService.create(createParticipantDto);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all participants for a specific business' })
  findAllByBusiness(@Param('businessId') businessId: string) {
    return this.participantsService.findAllByBusiness(businessId);
  }
}
