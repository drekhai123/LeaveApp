import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  LEAVE_REQUEST_STATUSES,
  type LeaveRequestStatus,
} from '../leave-request.model';

export class LeaveRequestResponseDto {
  @ApiProperty({ example: 'leave-request-id' })
  id!: string;

  @ApiProperty({ example: 'employee-id' })
  employeeId!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  employeeName!: string;

  @ApiProperty({ example: 'a@company.local' })
  employeeEmail!: string;

  @ApiProperty({ example: '2026-05-04' })
  startDate!: string;

  @ApiProperty({ example: '2026-05-08' })
  endDate!: string;

  @ApiProperty({ example: 5 })
  totalDays!: number;

  @ApiProperty({ example: 'Family trip' })
  reason!: string;

  @ApiProperty({ enum: LEAVE_REQUEST_STATUSES, example: 'pending' })
  status!: LeaveRequestStatus;

  @ApiPropertyOptional({ example: 'Approved' })
  managerNote?: string;

  @ApiPropertyOptional({ example: 'manager-id' })
  processedBy?: string;

  @ApiPropertyOptional({ example: '2026-05-05T10:00:00.000Z' })
  processedAt?: string;

  @ApiProperty({ example: '2026-05-05T09:00:00.000Z' })
  createdAt!: string;
}
