import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrizesService } from './prizes.service';
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PrizeItemDto {
  @IsNumber() rank: number;
  @IsString() description: string;
}

class ReplacePrizesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrizeItemDto)
  prizes: PrizeItemDto[];
}

@ApiTags('Prizes')
@Controller({ path: 'prizes', version: '1' })
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get prizes for a business (public)' })
  findByBusiness(@Param('businessId') businessId: string) {
    return this.prizesService.findByBusinessId(businessId);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get prizes for the current business' })
  findMine(@Req() req: any) {
    return this.prizesService.findByAdminUserId(req.user.id);
  }

  @Put('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Replace all prizes for the current business' })
  replaceMine(@Req() req: any, @Body() body: ReplacePrizesDto) {
    return this.prizesService.replaceForAdminUser(req.user.id, body.prizes);
  }

  @Get('weekly/business/:businessId')
  @ApiOperation({ summary: 'Get weekly prizes for a business (public)' })
  getWeeklyByBusiness(@Param('businessId') businessId: string) {
    return this.prizesService.findWeeklyByBusinessId(businessId)
  }

  @Get('weekly/me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly prizes for the current business' })
  findWeeklyMine(@Req() req: any) {
    return this.prizesService.findWeeklyByAdminUserId(req.user.id)
  }

  @Put('weekly/me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Replace weekly prizes for a specific week' })
  replaceWeeklyMine(@Req() req: any, @Body() body: { weekIndex: number; prizes: Array<{ rank: number; description: string }> }) {
    return this.prizesService.replaceWeeklyForAdminUser(req.user.id, body.weekIndex, body.prizes)
  }
}
