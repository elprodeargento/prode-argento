import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { PaymentsService, UpgradeablePlan } from './payments.service'
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

class CheckoutDto {
  @IsEnum(['premium', 'pro'])
  plan: UpgradeablePlan
}

@ApiTags('Payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly supabase: SupabaseService,
  ) {}

  @Post('checkout')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a MercadoPago checkout preference' })
  async checkout(@Req() req: any, @Body() dto: CheckoutDto) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id, admin_email')
      .eq('admin_user_id', req.user.id)
      .single()

    if (!business) throw new Error('Business not found')

    return this.paymentsService.createCheckoutPreference(business.id, dto.plan, business.admin_email)
  }

  @Post('webhook')
  @ApiOperation({ summary: 'MercadoPago payment webhook (public)' })
  webhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body)
  }
}
