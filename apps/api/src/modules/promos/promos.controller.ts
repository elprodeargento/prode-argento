import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromosService } from './promos.service';
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard';

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
}
