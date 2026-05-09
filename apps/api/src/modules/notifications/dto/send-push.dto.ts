import { IsString, IsIn, IsOptional, IsUrl } from 'class-validator'

export class SendPushDto {
  @IsString() title: string
  @IsString() body: string
  @IsIn(['all', 'no_pred', 'top10']) recipients: 'all' | 'no_pred' | 'top10' = 'all'
  @IsOptional() @IsUrl() imageUrl?: string
}
