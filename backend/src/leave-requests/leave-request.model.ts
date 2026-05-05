export const LEAVE_REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
] as const;
export type LeaveRequestStatus = (typeof LEAVE_REQUEST_STATUSES)[number];

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  managerNote?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}
