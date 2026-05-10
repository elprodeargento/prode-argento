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
import { SendPushDto } from './dto/send-push.dto'
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
      throw new ForbiddenException('Los envíos por WhatsApp requieren plan Premium o Pro')
    }

    return this.notificationsService.sendWhatsappBlast(business.id, dto)
  }

  @Post('push')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar push web a participantes (premium/pro)' })
  async sendPush(@Req() req: any, @Body() dto: SendPushDto) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id, plan')
      .eq('admin_user_id', req.user.id)
      .single()

    if (!business) throw new NotFoundException('Negocio no encontrado')

    if (!['premium', 'pro'].includes(business.plan)) {
      throw new ForbiddenException('Las notificaciones push requieren plan Premium o Pro')
    }

    return this.notificationsService.sendPushBlast(business.id, dto)
  }

  @Get('history')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Historial de notificaciones enviadas' })
  async getHistory(@Req() req: any) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', req.user.id)
      .single()

    if (!business) throw new NotFoundException('Negocio no encontrado')
    return this.notificationsService.getNotificationHistory(business.id)
  }

  @Post('fcm-token')
  @ApiOperation({ summary: 'Registrar token FCM de participante (público)' })
  async registerParticipantToken(
    @Body() body: { participantId: string; token: string },
  ) {
    await this.notificationsService.registerParticipantToken(body.participantId, body.token)
    return { ok: true }
  }

  @Post('admin-fcm-token')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar token FCM del admin (autenticado)' })
  async registerAdminToken(@Req() req: any, @Body() body: { token: string }) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', req.user.id)
      .single()

    if (!business) throw new NotFoundException('Negocio no encontrado')

    await this.notificationsService.registerAdminToken(business.id, body.token)
    return { ok: true }
  }

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

  @Post('whatsapp/webhook')
  @ApiOperation({ summary: 'Recibir eventos de webhook Meta (pública)' })
  receiveWebhook(@Body() body: any) {
    this.logger.log(`[WA Webhook] ${JSON.stringify(body)}`)
    return { received: true }
  }
}
