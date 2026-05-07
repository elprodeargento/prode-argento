import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromosService } from './promos.service';
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard';
import { CreatePromoDto } from './dto/create-promo.dto';

@ApiTags('Promos')
@Controller({ path: 'promos', version: '1' })
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promos for the current business' })
  findMine(@Req() req: any) {
    return this.promosService.findByAdminUserId(req.user.id);
  }

  @Post('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a promo for the current business' })
  create(@Req() req: any, @Body() dto: CreatePromoDto) {
    return this.promosService.create(req.user.id, dto);
  }
}
