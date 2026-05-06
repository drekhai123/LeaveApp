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

  return mapLoginResponse(payload as LoginResponse);
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
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    if (status === 401) {
      return "Email hoặc mật khẩu không đúng.";
    }

    return payload.message;
  }

  return "Đăng nhập thất bại. Vui lòng thử lại.";
}
