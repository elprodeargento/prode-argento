import { IsString, IsOptional, IsArray, MinLength, ValidateNested, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

class PrizeDto {
  @IsInt() rank: number
  @IsString() description: string
}

export class CreateReferralCampaignDto {
  @IsString() @MinLength(3) name: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsString() invite_message?: string
  @IsArray() @ValidateNested({ each: true }) @Type(() => PrizeDto) prizes: PrizeDto[]
  @IsOptional() @IsInt() @Min(1) milestone_every?: number
  @IsOptional() @IsString() milestone_prize?: string
}
