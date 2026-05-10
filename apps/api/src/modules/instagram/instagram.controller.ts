import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'
import { ConfigService } from '@nestjs/config'
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard'
import { InstagramService } from './instagram.service'

@ApiTags('Instagram')
@Controller({ path: 'instagram', version: '1' })
export class InstagramController {
  private readonly logger = new Logger(InstagramController.name)

  constructor(
    private readonly instagramService: InstagramService,
    private readonly config: ConfigService,
  ) {}

  /** GET /instagram/oauth/url — protected */
  @UseGuards(SupabaseAuthGuard)
  @Get('oauth/url')
  async getOAuthUrl(@Req() req: any) {
    const userId: string = req.user.id
    // Look up the business for this user
    const status = await this.instagramService['supabase'].client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', userId)
      .maybeSingle()

    const businessId: string = status.data?.id
    if (!businessId) {
      return { url: null, error: 'Negocio no encontrado' }
    }

    const url = await this.instagramService.getOAuthUrl(businessId)
    return { url }
  }

  /** GET /instagram/oauth/callback — PUBLIC (no guard) */
  @Get('oauth/callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() reply: FastifyReply,
  ) {
    const webUrl = this.config.get<string>('app.webUrl')!
    const base = `${webUrl}/empresa/configuracion`

    try {
      const { username } = await this.instagramService.handleCallback(code, state)
      const redirectUrl = `${base}?ig_status=success&username=${encodeURIComponent(username)}`
      return reply.redirect(redirectUrl, 302)
    } catch (err: any) {
      const reason = encodeURIComponent(err?.message ?? 'Error al conectar con Instagram')
      const redirectUrl = `${base}?ig_status=error&reason=${reason}`
      return reply.redirect(redirectUrl, 302)
    }
  }

  /** GET /instagram/status — protected */
  @UseGuards(SupabaseAuthGuard)
  @Get('status')
  async getStatus(@Req() req: any) {
    const userId: string = req.user.id
    const { data } = await this.instagramService['supabase'].client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', userId)
      .maybeSingle()

    if (!data?.id) return { connected: false }
    return this.instagramService.getStatus(data.id)
  }

  /** POST /instagram/publish — protected */
  @UseGuards(SupabaseAuthGuard)
  @Post('publish')
  async publish(
    @Req() req: any,
    @Body() body: { image_url: string; caption: string },
  ) {
    const userId: string = req.user.id
    const { data } = await this.instagramService['supabase'].client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', userId)
      .maybeSingle()

    if (!data?.id) throw new Error('Negocio no encontrado')
    return this.instagramService.publishPost(data.id, body.image_url, body.caption)
  }

  /** DELETE /instagram/disconnect — protected */
  @UseGuards(SupabaseAuthGuard)
  @Delete('disconnect')
  async disconnect(@Req() req: any) {
    const userId: string = req.user.id
    const { data } = await this.instagramService['supabase'].client
      .from('businesses')
      .select('id')
      .eq('admin_user_id', userId)
      .maybeSingle()

    if (data?.id) {
      await this.instagramService.disconnect(data.id)
    }
    return { ok: true }
  }

  /** GET /instagram/webhook — Meta verification challenge (PUBLIC) */
  @Get('webhook')
  webhookVerify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() reply: FastifyReply,
  ) {
    const verifyToken = this.config.get<string>('app.metaVerifyToken')
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Instagram webhook verified')
      return reply.status(200).send(challenge)
    }
    return reply.status(403).send({ error: 'Forbidden' })
  }

  /** POST /instagram/webhook — Meta real-time events (PUBLIC) */
  @Post('webhook')
  @HttpCode(200)
  webhookEvents(@Body() body: any) {
    this.logger.log(`Instagram webhook event: ${body?.object} / ${body?.entry?.[0]?.changes?.[0]?.field ?? '?'}`)
    return { received: true }
  }
}
