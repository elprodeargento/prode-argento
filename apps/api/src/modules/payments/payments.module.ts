import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module'

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
