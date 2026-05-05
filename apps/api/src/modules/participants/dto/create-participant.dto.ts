import { IsString, IsEmail, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParticipantDto {
  @ApiProperty()
  @IsUUID()
  business_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  google_uid?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  remember_me?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  accepted_terms?: boolean;
}
