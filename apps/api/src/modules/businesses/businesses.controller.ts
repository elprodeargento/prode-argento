import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard';

@ApiTags('Businesses')
@Controller({ path: 'businesses', version: '1' })
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new business' })
  create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessesService.create(createBusinessDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all businesses' })
  findAll() {
    return this.businessesService.findAll();
  }

  @Post('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create business for OAuth user (idempotent)' })
  createMe(@Req() req: any) {
    const user = req.user
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Mi Comercio'
    return this.businessesService.createForOAuthUser(user.id, user.email, name)
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user business' })
  findMe(@Req() req: any) {
    return this.businessesService.findOneByAdminId(req.user.id);
  }

  @Patch('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the current user business' })
  updateMe(@Req() req: any, @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessesService.updateByAdminId(req.user.id, updateBusinessDto);
  }

  @Delete('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete the current user business' })
  removeMe(@Req() req: any) {
    return this.businessesService.removeByAdminId(req.user.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a business by slug' })
  findOneBySlug(@Param('slug') slug: string) {
    return this.businessesService.findOneBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a business by ID' })
  update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessesService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a business by ID' })
  remove(@Param('id') id: string) {
    return this.businessesService.remove(id);
  }
}
