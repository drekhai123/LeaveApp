export const LEAVE_REQUEST_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
] as const;
export type LeaveRequestStatus = (typeof LEAVE_REQUEST_STATUSES)[number];

export interface LeaveRequest {
  id: number;
  rejectReason?: string;
  reason: string;
  resolvedAt?: string;
  resolvedBy?: number;
  staffEmail: string;
  staffId: number;
  staffName: string;
  leaveDate: string;
  status: LeaveRequestStatus;
  createdAt: string;
}
