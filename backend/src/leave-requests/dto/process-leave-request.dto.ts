import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ProcessLeaveRequestDto {
  @ApiProperty({ example: 4, description: 'HEAD/MANAGER/ADMIN staff id' })
  @IsInt()
  @Min(1)
  managerId!: number;

  @ApiPropertyOptional({ example: 'Trùng lịch họp' })
  @IsOptional()
  @IsString()
  note?: string;
}
