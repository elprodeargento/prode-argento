import { Controller, Post, Body, UseGuards, Req, Headers, Query, UnauthorizedException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { createHmac, timingSafeEqual } from 'crypto'
import { ConfigService } from '@nestjs/config'
import { FastifyRequest } from 'fastify'
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
    private readonly config: ConfigService,
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
  webhook(
    @Req() req: FastifyRequest,
    @Body() body: any,
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
    @Query('topic') topic: string,
  ) {
    console.log('--- 🔔 WEBHOOK INCOMING ---');
    console.log('Request ID:', xRequestId);
    console.log('Signature:', xSignature);

    // IPN-style legacy notifications don't carry x-signature — pass through
    if (topic) {
      console.log('⏩ IPN-style notification, skipping signature check');
      return this.paymentsService.handleWebhook(body)
    }

    const secret = this.config.get<string>('app.mercadopagoWebhookSecret')

    // Skip validation if secret not configured (dev/testing)
    if (secret) {
      if (!xSignature || !xRequestId) {
        throw new UnauthorizedException('Missing MP signature headers')
      }

      // Parse ts and v1 from "ts=...,v1=..."
      const parts = Object.fromEntries(
        xSignature.split(',').map(p => p.split('=') as [string, string])
      )
      const ts = parts['ts']
      const v1 = parts['v1']

      if (!ts || !v1) throw new UnauthorizedException('Malformed x-signature')

      // MP signs using data.id from the query string (not the body)
      const dataId = (req.query as any)['data.id'] ?? body?.data?.id ?? ''
      const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`

      const expected = createHmac('sha256', secret).update(template).digest('hex')

      console.log(`🔐 Template: ${template}`)
      console.log(`🔐 Expected: ${expected.slice(0, 8)}... | Received: ${v1.slice(0, 8)}...`)

      const match = timingSafeEqual(Buffer.from(v1), Buffer.from(expected))
      if (!match) {
        console.error('❌ Invalid MP Signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }
      console.log('✅ Signature verified');
    }

    return this.paymentsService.handleWebhook(body)
  }
}
