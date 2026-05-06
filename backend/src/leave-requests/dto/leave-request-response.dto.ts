import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  LEAVE_REQUEST_STATUSES,
  type LeaveRequestStatus,
} from '../leave-request.model';

export class LeaveRequestResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  staffId!: number;

  @ApiProperty({ example: 'Nguyen Van A' })
  staffName!: string;

  @ApiProperty({ example: 'a@company.local' })
  staffEmail!: string;

  @ApiProperty({ example: '2026-05-04' })
  leaveDate!: string;

  @ApiProperty({ example: 'Family trip' })
  reason!: string;

  @ApiProperty({ enum: LEAVE_REQUEST_STATUSES, example: 'PENDING' })
  status!: LeaveRequestStatus;

  @ApiPropertyOptional({ example: 'Trùng lịch họp' })
  rejectReason?: string;

  @ApiPropertyOptional({ example: 4 })
  resolvedBy?: number;

  @ApiPropertyOptional({ example: '2026-05-05T10:00:00.000Z' })
  resolvedAt?: string;

  @ApiProperty({ example: '2026-05-05T09:00:00.000Z' })
  createdAt!: string;
}
