import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard';

class JoinDto {
  @IsString() slug: string;
  @IsString() name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
}

@ApiTags('Participants')
@Controller({ path: 'participants', version: '1' })
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new participant for a business' })
  create(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantsService.create(createParticipantDto);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a prode by slug (participant registration)' })
  join(@Body() dto: JoinDto) {
    return this.participantsService.joinBySlug(dto.slug, dto.name, dto.email, dto.phone);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get participants for the current business' })
  findMine(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.participantsService.findByAdminUserId(req.user.id, search, Number(page), Number(limit));
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all participants for a specific business' })
  findAllByBusiness(@Param('businessId') businessId: string) {
    return this.participantsService.findAllByBusiness(businessId);
  }
}
