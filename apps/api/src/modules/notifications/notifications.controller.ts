import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { FastifyReply } from 'fastify'
import { NotificationsService } from './notifications.service'
import { SendWhatsappDto } from './dto/send-whatsapp.dto'
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

@ApiTags('Notifications')
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name)

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  /**
   * POST /notifications/whatsapp
   * Blast a WhatsApp message to business participants.
   * Requires premium or pro plan.
   */
  @Post('whatsapp')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar mensaje de WhatsApp a participantes (premium/pro)' })
  async sendWhatsapp(@Req() req: any, @Body() dto: SendWhatsappDto) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id, plan')
      .eq('admin_user_id', req.user.id)
      .single()

    if (!business) throw new NotFoundException('Negocio no encontrado')

    if (!['premium', 'pro'].includes(business.plan)) {
      throw new ForbiddenException(
        'Los envíos por WhatsApp requieren plan Premium o Pro',
      )
    }

    return this.notificationsService.sendWhatsappBlast(business.id, dto)
  }

  /**
   * GET /notifications/whatsapp/webhook
   * Meta webhook verification challenge.
   * Meta sends this GET request when registering the webhook URL.
   * Must return hub.challenge as plain text — critical for Fastify which serializes strings as JSON.
   */
  @Get('whatsapp/webhook')
  @ApiOperation({ summary: 'Verificación de webhook Meta (pública)' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() reply: FastifyReply,
  ) {
    if (mode === 'subscribe' && token === this.config.get('app.metaVerifyToken')) {
      return reply.status(200).send(challenge)
    }
    this.logger.warn(`Webhook verification failed — token mismatch or wrong mode`)
    return reply.status(403).send({ error: 'Forbidden' })
  }

  /**
   * POST /notifications/whatsapp/webhook
   * Receives Meta webhook events: delivery status, read receipts, inbound replies.
   * Must respond 200 within 20s or Meta will retry.
   */
  @Post('whatsapp/webhook')
  @ApiOperation({ summary: 'Recibir eventos de webhook Meta (pública)' })
  receiveWebhook(@Body() body: any) {
    this.logger.log(`[WA Webhook] ${JSON.stringify(body)}`)
    return { received: true }
  }
}
