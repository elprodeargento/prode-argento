import { PartialType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
  // Declarados explícitamente para que whitelist:true + forbidNonWhitelisted no los descarte
  // y para que @Transform corra correctamente (PartialType no siempre copia class-transformer)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) =>
    String(value)
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  )
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]{1,2}$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  primary_color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  background_url?: string;

  @ApiProperty({ required: false, enum: ['free', 'premium', 'pro'] })
  @IsOptional()
  @IsEnum(['free', 'premium', 'pro'])
  plan?: 'free' | 'premium' | 'pro';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  welcome_msg?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  registration_deadline?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  weekly_prize_description?: string;

  @ApiProperty({ required: false, enum: ['all', 'daily'] })
  @IsOptional()
  @IsEnum(['all', 'daily'])
  match_visibility?: 'all' | 'daily';

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(60)
  close_minutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ig_hashtags?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  auto_post_ig?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notify_reminders?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notify_results?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notify_ranking?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notify_whatsapp?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  require_email?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  require_phone?: boolean;
}
