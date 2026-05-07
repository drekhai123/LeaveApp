import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProcessLeaveRequestDto {
  @ApiPropertyOptional({ example: 'Trùng lịch họp' })
  @IsOptional()
  @IsString()
  note?: string;
}
