import type { StaffRecord, StaffRoleName } from "@/types/leave-app";
import { readApiErrorMessage, unwrapApiResponse as unwrapApiPayload } from "./api-response";
import { roleNameToId as mapRoleNameToId } from "./leave-app-mappers";

interface AuthStaffResponse {
  staff: {
    email: string;
    fullName: string;
    id: number;
    leaveCredit: number;
    role: StaffRoleName;
  };
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<StaffRecord> {
  const response = await fetch("/api/auth/login", {
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return readStaffResponse(response);
}

export async function getCurrentStaff(): Promise<StaffRecord | undefined> {
  const response = await fetch("/api/auth/me", {
    cache: "no-store",
    method: "GET",
  });

  if (response.status === 401) {
    return undefined;
  }

  return readStaffResponse(response);
}

export async function logoutCurrentStaff(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

async function readStaffResponse(response: Response): Promise<StaffRecord> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(readApiErrorMessage(payload, response.status));
  }

  return mapStaffResponse(readAuthStaffPayload(payload).staff);
}

function mapStaffResponse(staff: AuthStaffResponse["staff"]): StaffRecord {
  const now = new Date().toISOString();

  return {
    createdAt: now,
    email: staff.email,
    fullName: staff.fullName,
    id: staff.id,
    leaveCredit: staff.leaveCredit,
    roleId: roleNameToId(staff.role),
    updatedAt: now,
  };
}

function readAuthStaffPayload(payload: unknown): AuthStaffResponse {
  const candidate = unwrapApiResponse(payload);

  if (!isAuthStaffResponse(candidate)) {
    throw new Error("Phan hoi xac thuc tu backend khong dung dinh dang.");
  }

  return candidate;
}

function unwrapApiResponse(payload: unknown): unknown {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as WrappedApiResponse<unknown>).data
  ) {
    return (payload as WrappedApiResponse<unknown>).data;
  }

  return payload;
}

function isAuthStaffResponse(payload: unknown): payload is AuthStaffResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const value = payload as Partial<AuthStaffResponse>;

  return (
    Boolean(value.staff) &&
    typeof value.staff?.email === "string" &&
    typeof value.staff.fullName === "string" &&
    typeof value.staff.id === "number" &&
    typeof value.staff.leaveCredit === "number" &&
    typeof value.staff.role === "string"
  );
}

