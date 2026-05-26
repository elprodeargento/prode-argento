import { Controller, Get, Post, Body, UseGuards, Req, Query, ParseFloatPipe, DefaultValuePipe, Patch, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PromosService } from './promos.service';
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard';
import { CreatePromoDto } from './dto/create-promo.dto';

@ApiTags('Promos')
@Controller({ path: 'promos', version: '1' })
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Get active promos near a location (public)' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lon', required: false, type: Number })
  findNearby(
    @Query('lat', new DefaultValuePipe(0), ParseFloatPipe) lat: number,
    @Query('lon', new DefaultValuePipe(0), ParseFloatPipe) lon: number,
  ) {
    return this.promosService.findNearby(lat, lon);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment view count for a promo (public)' })
  trackView(@Param('id') id: string) {
    return this.promosService.incrementView(id)
  }

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

  @Patch('me/:id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a promo' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreatePromoDto>) {
    return this.promosService.update(req.user.id, id, dto);
  }

  @Delete('me/:id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a promo' })
  remove(@Req() req: any, @Param('id') id: string, @Body() _body?: any) {
    return this.promosService.remove(req.user.id, id);
  }
}
