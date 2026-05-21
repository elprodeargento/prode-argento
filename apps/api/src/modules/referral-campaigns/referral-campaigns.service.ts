import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'
import { CreateReferralCampaignDto } from './dto/create-referral-campaign.dto'

@Injectable()
export class ReferralCampaignsService {
  constructor(private readonly supabase: SupabaseService) {}

  private async getBusinessByAdmin(adminUserId: string) {
    const { data } = await this.supabase.client
      .from('businesses')
      .select('id, plan')
      .eq('admin_user_id', adminUserId)
      .maybeSingle()
    if (!data) throw new BadRequestException('Business not found')
    return data
  }

  async create(adminUserId: string, dto: CreateReferralCampaignDto) {
    const business = await this.getBusinessByAdmin(adminUserId)
    if (business.plan !== 'premium') {
      throw new ForbiddenException('Solo el plan Premium puede crear campañas de referidos')
    }

    const { data, error } = await this.supabase.client
      .from('referral_campaigns')
      .insert({
        business_id: business.id,
        name: dto.name,
        description: dto.description ?? null,
        invite_message: dto.invite_message ?? null,
        prizes: dto.prizes ?? [],
        milestones: dto.milestones ?? [],
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') throw new BadRequestException('Ya tenés una campaña activa. Desactivala primero.')
      throw new Error(error.message)
    }
    return data
  }

  async getMyCampaign(adminUserId: string) {
    const business = await this.getBusinessByAdmin(adminUserId)

    const { data: campaign } = await this.supabase.client
      .from('referral_campaigns')
      .select('*')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!campaign) return { campaign: null, leaderboard: [], plan: business.plan }

    const { data: participants } = await this.supabase.client
      .from('participants')
      .select('id, name, referred_by_participant_id')
      .eq('business_id', business.id)

    const countMap: Record<string, number> = {}
    for (const p of participants ?? []) {
      if (p.referred_by_participant_id) {
        countMap[p.referred_by_participant_id] = (countMap[p.referred_by_participant_id] ?? 0) + 1
      }
    }

    const leaderboard = (participants ?? [])
      .map(p => ({ id: p.id, name: p.name, referral_count: countMap[p.id] ?? 0 }))
      .filter(p => p.referral_count > 0)
      .sort((a, b) => b.referral_count - a.referral_count)
      .slice(0, 20)

    return { campaign, leaderboard, plan: business.plan }
  }

  async update(adminUserId: string, campaignId: string, dto: Partial<CreateReferralCampaignDto>) {
    const business = await this.getBusinessByAdmin(adminUserId)

    const { data, error } = await this.supabase.client
      .from('referral_campaigns')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', campaignId)
      .eq('business_id', business.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async deactivate(adminUserId: string, campaignId: string) {
    const business = await this.getBusinessByAdmin(adminUserId)

    const { error } = await this.supabase.client
      .from('referral_campaigns')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', campaignId)
      .eq('business_id', business.id)
      .select()

    if (error) throw new BadRequestException(error.message)
    return { success: true }
  }

  async getPublicCampaign(slug: string) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single()
    if (!business) return null

    const { data: campaign } = await this.supabase.client
      .from('referral_campaigns')
      .select('id, name, description, prizes, invite_message, milestones')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .maybeSingle()

    return campaign ?? null
  }

  async getParticipantReferralCount(participantId: string) {
    const { count, error } = await this.supabase.client
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by_participant_id', participantId)
    if (error) throw new Error(error.message)
    return { count: count ?? 0 }
  }

  async getParticipantReferralHistory(participantId: string) {
    const { data, error } = await this.supabase.client
      .from('participants')
      .select('name, registered_at')
      .eq('referred_by_participant_id', participantId)
      .order('registered_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { referrals: data ?? [] }
  }
}
