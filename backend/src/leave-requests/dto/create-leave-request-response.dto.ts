import { ApiProperty } from '@nestjs/swagger';
import { LeaveRequestResponseDto } from './leave-request-response.dto';

export class CreateLeaveRequestResponseDto {
  @ApiProperty({ example: 3 })
  totalDays!: number;

  @ApiProperty({ type: LeaveRequestResponseDto, isArray: true })
  requests!: LeaveRequestResponseDto[];
}
