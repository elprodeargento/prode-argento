import { IsString, IsUUID, IsArray, ValidateNested, IsInt, IsOptional, IsIn, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class PredictionItemDto {
  @ApiProperty() @IsInt() matchId!: number
  @ApiProperty() @IsInt() @Min(0) @Max(30) homeScore!: number
  @ApiProperty() @IsInt() @Min(0) @Max(30) awayScore!: number
  @ApiPropertyOptional({ enum: ['HOME', 'AWAY'] })
  @IsOptional() @IsIn(['HOME', 'AWAY'])
  penaltyPred?: 'HOME' | 'AWAY'
}

export class SavePredictionsDto {
  @ApiProperty() @IsUUID() participantId!: string
  @ApiProperty({ type: [PredictionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PredictionItemDto)
  predictions!: PredictionItemDto[]
}
