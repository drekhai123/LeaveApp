import { ApiError } from "@/lib/api-error";
import {
  validateArray,
  validateEmployee,
  validateHealth,
  validateLeaveRequest,
} from "@/lib/leave-api-validators";
import type {
  CreateEmployeePayload,
  CreateLeaveRequestPayload,
  Employee,
  HealthStatus,
  LeaveRequest,
  LeaveRequestStatus,
  ProcessLeaveRequestPayload,
} from "@/types/leave-app";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/leave-app${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    throw new ApiError(readErrorMessage(body), response.status);
  }

  return body as T;
}

function requestValidated<T>(
  path: string,
  validate: (body: unknown) => T,
  init?: RequestInit,
): Promise<T> {
  return requestJson<unknown>(path, init).then(validate);
}

function readErrorMessage(body: unknown): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    if (typeof message === "string") {
      return message;
    }
  }

  return "Request failed";
}

export function getHealth(): Promise<HealthStatus> {
  return requestValidated("/health", validateHealth);
}

export function getEmployees(): Promise<Employee[]> {
  return requestValidated("/employees", (body) =>
    validateArray(body, validateEmployee),
  );
}

export function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  return requestValidated("/employees", validateEmployee, {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function getLeaveRequests(
  status?: LeaveRequestStatus,
): Promise<LeaveRequest[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return requestValidated(`/leave-requests${query}`, (body) =>
    validateArray(body, validateLeaveRequest),
  );
}

export function createLeaveRequest(
  payload: CreateLeaveRequestPayload,
): Promise<LeaveRequest> {
  return requestValidated("/leave-requests", validateLeaveRequest, {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function approveLeaveRequest(
  id: string,
  payload: ProcessLeaveRequestPayload,
): Promise<LeaveRequest> {
  return requestValidated(
    `/leave-requests/${encodeURIComponent(id)}/approve`,
    validateLeaveRequest,
    {
      body: JSON.stringify(payload),
      method: "PATCH",
    },
  );
}

export function rejectLeaveRequest(
  id: string,
  payload: ProcessLeaveRequestPayload,
): Promise<LeaveRequest> {
  return requestValidated(
    `/leave-requests/${encodeURIComponent(id)}/reject`,
    validateLeaveRequest,
    {
      body: JSON.stringify(payload),
      method: "PATCH",
    },
  );
}
