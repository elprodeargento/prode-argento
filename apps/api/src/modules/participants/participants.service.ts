import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';
import { CreateParticipantDto } from './dto/create-participant.dto';

@Injectable()
export class ParticipantsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createParticipantDto: CreateParticipantDto) {
    // Basic limit check - assumes checking business plan limits is required here.
    // We get the business plan.
    const { data: business, error: bizError } = await this.supabase.client
      .from('businesses')
      .select('plan')
      .eq('id', createParticipantDto.business_id)
      .single();

    if (bizError || !business) {
      throw new BadRequestException('Business not found');
    }

    if (business.plan === 'free') {
      const { count, error: countError } = await this.supabase.client
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', createParticipantDto.business_id);

      if (countError) throw new Error(countError.message);
      
      if (count && count >= 5) {
        throw new BadRequestException('Free plan limit reached (max 5 participants). Please upgrade.');
      }
    }

    const { data, error } = await this.supabase.client
      .from('participants')
      .insert(createParticipantDto)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already registered for this business');
      }
      throw new Error(error.message);
    }
    
    return data;
  }

  async findAllByBusiness(businessId: string) {
    const { data, error } = await this.supabase.client
      .from('participants')
      .select('*')
      .eq('business_id', businessId);

    if (error) throw new Error(error.message);
    return data;
  }
}
