import { ApiError } from "@/lib/api-error";
import type { Employee, HealthStatus, LeaveRequest } from "@/types/leave-app";
import { EMPLOYEE_ROLES, LEAVE_REQUEST_STATUSES } from "@/types/leave-app";

export function validateArray<T>(
  body: unknown,
  validateItem: (item: unknown) => T,
): T[] {
  if (!Array.isArray(body)) {
    throw new ApiError("Unexpected API response", 502);
  }

  return body.map(validateItem);
}

export function validateHealth(body: unknown): HealthStatus {
  const record = readRecord(body);
  return {
    app: readString(record, "app"),
    status: readString(record, "status"),
    version: readString(record, "version"),
  };
}

export function validateEmployee(body: unknown): Employee {
  const record = readRecord(body);
  const role = readString(record, "role") as Employee["role"];
  if (!EMPLOYEE_ROLES.includes(role)) {
    throw new ApiError("Unexpected API response", 502);
  }

  return {
    active: readBoolean(record, "active"),
    annualLeaveDays: readNumber(record, "annualLeaveDays"),
    email: readString(record, "email"),
    id: readString(record, "id"),
    name: readString(record, "name"),
    role,
  };
}

export function validateLeaveRequest(body: unknown): LeaveRequest {
  const record = readRecord(body);
  const status = readString(record, "status") as LeaveRequest["status"];
  if (!LEAVE_REQUEST_STATUSES.includes(status)) {
    throw new ApiError("Unexpected API response", 502);
  }

  return {
    createdAt: readString(record, "createdAt"),
    employeeEmail: readString(record, "employeeEmail"),
    employeeId: readString(record, "employeeId"),
    employeeName: readString(record, "employeeName"),
    endDate: readString(record, "endDate"),
    id: readString(record, "id"),
    managerNote: readOptionalString(record, "managerNote"),
    processedAt: readOptionalString(record, "processedAt"),
    processedBy: readOptionalString(record, "processedBy"),
    reason: readString(record, "reason"),
    startDate: readString(record, "startDate"),
    status,
    totalDays: readNumber(record, "totalDays"),
  };
}

function readRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError("Unexpected API response", 502);
  }

  return body as Record<string, unknown>;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") {
    throw new ApiError("Unexpected API response", 502);
  }

  return value;
}

function readOptionalString(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new ApiError("Unexpected API response", 502);
  }

  return value;
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number") {
    throw new ApiError("Unexpected API response", 502);
  }

  return value;
}

function readBoolean(record: Record<string, unknown>, key: string): boolean {
  const value = record[key];
  if (typeof value !== "boolean") {
    throw new ApiError("Unexpected API response", 502);
  }

  return value;
}
