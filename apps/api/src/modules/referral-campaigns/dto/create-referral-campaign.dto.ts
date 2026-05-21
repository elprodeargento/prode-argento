import { IsString, IsOptional, IsArray, MinLength, ValidateNested, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

class PrizeDto {
  @IsInt() rank: number
  @IsString() description: string
}

class MilestoneDto {
  @IsInt() @Min(1) at: number
  @IsString() @MinLength(1) prize: string
}

export class CreateReferralCampaignDto {
  @IsString() @MinLength(3) name: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsString() invite_message?: string
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PrizeDto) prizes?: PrizeDto[]
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => MilestoneDto) milestones?: MilestoneDto[]
}
