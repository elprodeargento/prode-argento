import { IsString, IsIn, IsOptional, IsUrl } from 'class-validator'

export class SendPushDto {
  @IsString() title: string
  @IsString() body: string
  @IsIn(['all', 'no_pred', 'no_pred_today', 'top10']) recipients: 'all' | 'no_pred' | 'no_pred_today' | 'top10' = 'all'
  @IsOptional() @IsUrl() imageUrl?: string
}
