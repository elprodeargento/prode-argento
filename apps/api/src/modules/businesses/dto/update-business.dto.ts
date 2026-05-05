import { PartialType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
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
}
