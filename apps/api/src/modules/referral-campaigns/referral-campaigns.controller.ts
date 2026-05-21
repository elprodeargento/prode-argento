import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ReferralCampaignsService } from './referral-campaigns.service'
import { CreateReferralCampaignDto } from './dto/create-referral-campaign.dto'
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard'

@ApiTags('Referral Campaigns')
@Controller({ path: 'referral-campaigns', version: '1' })
export class ReferralCampaignsController {
  constructor(private readonly service: ReferralCampaignsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  create(@Req() req: any, @Body() dto: CreateReferralCampaignDto) {
    return this.service.create(req.user.id, dto)
  }

  @Get('my')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  getMyCampaign(@Req() req: any) {
    return this.service.getMyCampaign(req.user.id)
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  update(@Req() req: any, @Param('id') id: string, @Body() dto: CreateReferralCampaignDto) {
    return this.service.update(req.user.id, id, dto)
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  deactivate(@Req() req: any, @Param('id') id: string) {
    return this.service.deactivate(req.user.id, id)
  }

  @Get('public/:slug')
  getPublicCampaign(@Param('slug') slug: string) {
    return this.service.getPublicCampaign(slug)
  }

  @Get('participant-count/:participantId')
  getParticipantReferralCount(@Param('participantId') participantId: string) {
    return this.service.getParticipantReferralCount(participantId)
  }

  @Get('participant-history/:participantId')
  getParticipantReferralHistory(@Param('participantId') participantId: string) {
    return this.service.getParticipantReferralHistory(participantId)
  }
}
