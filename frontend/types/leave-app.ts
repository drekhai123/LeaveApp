export const EMPLOYEE_ROLES = ["employee", "manager", "hr"] as const;
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export const LEAVE_REQUEST_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type LeaveRequestStatus = (typeof LEAVE_REQUEST_STATUSES)[number];

export interface HealthStatus {
  app: string;
  status: string;
  version: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  annualLeaveDays: number;
  active: boolean;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  role?: EmployeeRole;
  annualLeaveDays?: number;
}

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

export interface CreateLeaveRequestPayload {
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ProcessLeaveRequestPayload {
  managerId: string;
  note?: string;
}
