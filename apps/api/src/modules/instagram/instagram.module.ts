import { Module } from '@nestjs/common'
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module'
import { InstagramController } from './instagram.controller'
import { InstagramScheduler } from './instagram.scheduler'
import { InstagramService } from './instagram.service'

@Module({
  imports: [SupabaseModule],
  controllers: [InstagramController],
  providers: [InstagramService, InstagramScheduler],
})
export class InstagramModule {}
