import { IsString, IsUUID, IsArray, ValidateNested, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class PredictionItemDto {
  @ApiProperty() @IsInt() matchId!: number
  @ApiProperty() @IsInt() @Min(0) @Max(30) homeScore!: number
  @ApiProperty() @IsInt() @Min(0) @Max(30) awayScore!: number
}

export class SavePredictionsDto {
  @ApiProperty() @IsUUID() participantId!: string
  @ApiProperty({ type: [PredictionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PredictionItemDto)
  predictions!: PredictionItemDto[]
}
