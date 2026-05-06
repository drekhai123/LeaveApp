import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsString, Min } from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  staffId!: number;

  @ApiProperty({ example: '2026-05-04' })
  @IsDateString()
  leaveDate!: string;

  @ApiProperty({ example: 'Family trip' })
  @IsString()
  reason!: string;
}
