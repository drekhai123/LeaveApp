import type { StaffRecord, StaffRoleName } from "@/types/leave-app";
import { readApiErrorMessage, unwrapApiResponse as unwrapApiPayload } from "./api-response";
import { roleNameToId as mapRoleNameToId } from "./leave-app-mappers";

interface LoginResponse {
  accessToken: string;
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
): Promise<{ accessToken: string; staff: StaffRecord }> {
  const response = await fetch("/api/auth/login", {
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(readApiErrorMessage(payload, response.status));
  }

  return mapLoginResponse(readLoginPayload(payload));
}

function mapLoginResponse(payload: LoginResponse) {
  const now = new Date().toISOString();

  return {
    accessToken: payload.accessToken,
    staff: {
      createdAt: now,
      email: payload.staff.email,
      fullName: payload.staff.fullName,
      id: payload.staff.id,
      leaveCredit: payload.staff.leaveCredit,
      roleId: mapRoleNameToId(payload.staff.role),
      updatedAt: now,
    },
  };
}

function readLoginPayload(payload: unknown): LoginResponse {
  const candidate = unwrapApiPayload(payload);

  if (!isLoginResponse(candidate)) {
    throw new Error("Phan hoi dang nhap tu backend khong dung dinh dang.");
  }

  return candidate;
}

function isLoginResponse(payload: unknown): payload is LoginResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const value = payload as Partial<LoginResponse>;

  return (
    typeof value.accessToken === "string" &&
    Boolean(value.staff) &&
    typeof value.staff?.email === "string" &&
    typeof value.staff.fullName === "string" &&
    typeof value.staff.id === "number" &&
    typeof value.staff.leaveCredit === "number" &&
    typeof value.staff.role === "string"
  );
}

