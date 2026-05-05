import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProcessLeaveRequestDto {
  @ApiProperty({ example: 'manager-id' })
  @IsString()
  managerId!: string;

  @ApiPropertyOptional({ example: 'Approved' })
  @IsOptional()
  @IsString()
  note?: string;
}
