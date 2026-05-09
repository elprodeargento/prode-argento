import { IsString, IsOptional, IsUrl, IsIn } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SendWhatsappDto {
  @ApiProperty({ description: 'Texto del mensaje a enviar' })
  @IsString()
  message: string

  @ApiPropertyOptional({ description: 'URL pública de imagen adjunta (Cloudflare R2)' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string

  @ApiProperty({
    enum: ['all', 'no_pred', 'top10'],
    default: 'all',
    description: 'all = todos los participantes · no_pred = sin pronósticos · top10 = ranking top 10',
  })
  @IsIn(['all', 'no_pred', 'top10'])
  recipients: 'all' | 'no_pred' | 'top10' = 'all'
}
