import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: 'employee-id' })
  @IsString()
  employeeId!: string;

  @ApiProperty({ example: '2026-05-04' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-05-08' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: 'Family trip' })
  @IsString()
  reason!: string;
}
