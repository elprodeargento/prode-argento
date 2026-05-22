import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard';

class JoinDto {
  @IsString() slug: string;
  @IsString() name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsUUID() referrer_participant_id?: string;
}

class LookupDto {
  @IsString() slug: string;
  @IsOptional() @IsEmail() email?: string;
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
    return this.participantsService.joinBySlug(dto.slug, dto.name, dto.email, dto.phone, dto.referrer_participant_id);
  }

  @Post('lookup')
  @ApiOperation({ summary: 'Check if a participant exists by email or phone' })
  lookup(@Body() dto: LookupDto) {
    return this.participantsService.lookup(dto.slug, dto.email, dto.phone);
  }

  @Get('me/stats')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  getStats(@Req() req: any) {
    return this.participantsService.getStats(req.user.id)
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
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
  ) {
    return this.participantsService.findByAdminUserId(
      req.user.id, search, Number(page), Number(limit), sortBy, sortDir as 'asc' | 'desc',
    );
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all participants for a specific business' })
  findAllByBusiness(@Param('businessId') businessId: string) {
    return this.participantsService.findAllByBusiness(businessId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update participant data' })
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; phone?: string },
  ) {
    return this.participantsService.update(id, body)
  }

  @Patch(':id/disabled')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable or disable a participant (Premium only)' })
  setDisabled(
    @Param('id') id: string,
    @Body() body: { is_disabled: boolean },
    @Req() req: any,
  ) {
    return this.participantsService.setDisabled(req.user.id, id, body.is_disabled)
  }
}
