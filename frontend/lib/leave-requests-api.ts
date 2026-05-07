import type { LeaveRequestRecord } from "@/types/leave-app";
import { readApiErrorMessage, unwrapApiResponse } from "./api-response";
import { mapLeaveRequestFromApi } from "./leave-app-mappers";
import { readAccessToken } from "./session";

type LeaveRequestApiDto = {
  id: number;
  staffId: number;
  leaveDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
  resolvedByStaffId?: number;
  processedAt?: string;
  createdAt: string;
};

type CreateLeaveRequestResponse = {
  requests: LeaveRequestApiDto[];
  totalDays: number;
};

export async function fetchLeaveRequests(): Promise<LeaveRequestRecord[]> {
  const response = await authorizedFetch("/api/leave-requests", { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(readApiErrorMessage(payload, response.status));
  }

  const data = unwrapApiResponse<LeaveRequestApiDto[]>(payload);
  return data.map(mapLeaveRequestFromApi);
}

export async function approveLeaveRequest(id: number, note?: string): Promise<LeaveRequestRecord> {
  const response = await authorizedFetch(`/api/leave-requests/${id}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note ? { note } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(readApiErrorMessage(payload, response.status));
  }

  return mapLeaveRequestFromApi(unwrapApiResponse<LeaveRequestApiDto>(payload));
}

export async function rejectLeaveRequest(id: number, note: string): Promise<LeaveRequestRecord> {
  const response = await authorizedFetch(`/api/leave-requests/${id}/reject`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(readApiErrorMessage(payload, response.status));
  }

  return mapLeaveRequestFromApi(unwrapApiResponse<LeaveRequestApiDto>(payload));
}

export async function createLeaveRequest(input: {
  staffId: number;
  leaveDate: string;
  reason: string;
}): Promise<LeaveRequestRecord[]> {
  const response = await authorizedFetch("/api/leave-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      staffId: input.staffId,
      startDate: input.leaveDate,
      endDate: input.leaveDate,
      reason: input.reason,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(readApiErrorMessage(payload, response.status));
  }

  const data = unwrapApiResponse<CreateLeaveRequestResponse>(payload);
  return data.requests.map(mapLeaveRequestFromApi);
}

async function authorizedFetch(url: string, init: RequestInit): Promise<Response> {
  const token = readAccessToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, { ...init, headers });
}
