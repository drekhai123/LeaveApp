import type { StaffRecord, StaffRoleName } from "@/types/leave-app";

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

interface WrappedApiResponse<T> {
  data?: T;
  message?: string | string[];
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
    throw new Error(readErrorMessage(payload, response.status));
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
      roleId: roleNameToId(payload.staff.role),
      updatedAt: now,
    },
  };
}

function readLoginPayload(payload: unknown): LoginResponse {
  const candidate = unwrapApiResponse(payload);

  if (!isLoginResponse(candidate)) {
    throw new Error("Phan hoi dang nhap tu backend khong dung dinh dang.");
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

function roleNameToId(roleName: StaffRoleName): number {
  const roleIds: Record<StaffRoleName, number> = {
    ADMIN: 4,
    HEAD: 3,
    MANAGER: 2,
    STAFF: 1,
  };

  return roleIds[roleName];
}

function readErrorMessage(payload: unknown, status: number): string {
  const candidate = unwrapApiResponse(payload);

  if (
    candidate &&
    typeof candidate === "object" &&
    "message" in candidate
  ) {
    const message = (candidate as WrappedApiResponse<unknown>).message;

    if (status === 401) {
      return "Email hoac mat khau khong dung.";
    }

    return Array.isArray(message) ? message.join(", ") : String(message);
  }

  return "Dang nhap that bai. Vui long thu lai.";
}
