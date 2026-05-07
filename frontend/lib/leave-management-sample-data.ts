import type {
  LeaveRequestRecord,
  ManagerNotificationRecord,
  RoleRecord,
  StaffRecord,
  StaffRoleName,
} from "@/types/leave-app";

export const roles: RoleRecord[] = [
  { id: 1, name: "STAFF" },
  { id: 2, name: "MANAGER" },
  { id: 3, name: "HEAD" },
  { id: 4, name: "ADMIN" },
];

export const staffs: StaffRecord[] = [
  createStaff(1, "Nguyễn Văn An", "an@leaveapp.local", "STAFF", 10),
  createStaff(2, "Trần Thị Bình", "binh@leaveapp.local", "STAFF", 7),
  createStaff(3, "Lê Minh Quân", "quan@leaveapp.local", "MANAGER", 12),
  createStaff(4, "Phạm Thu Hà", "ha@leaveapp.local", "HEAD", 12),
  createStaff(5, "Đỗ Hoàng Nam", "nam@leaveapp.local", "ADMIN", 12),
];

export const leaveRequests: LeaveRequestRecord[] = [
  createLeaveRequest(101, 1, "2026-05-09", "Khám sức khỏe định kỳ", "PENDING"),
  createLeaveRequest(102, 2, "2026-05-12", "Việc gia đình", "APPROVED", 4),
  createLeaveRequest(
    103,
    1,
    "2026-05-14",
    "Nghỉ việc cá nhân",
    "REJECTED",
    4,
    "Trùng lịch bàn giao sprint.",
  ),
];

export const notifications: ManagerNotificationRecord[] = [
  createNotification(201, 3, 102, "Đơn nghỉ phép đã được duyệt", "SENT"),
  createNotification(202, 3, 103, "Đơn nghỉ phép bị từ chối", "FAILED"),
];

export function findRoleName(staff: StaffRecord): StaffRoleName {
  return roles.find((role) => role.id === staff.roleId)?.name ?? "STAFF";
}

export function findStaffName(staffId?: number): string {
  if (!staffId) {
    return "-";
  }

  return staffs.find((staff) => staff.id === staffId)?.fullName ?? "-";
}

function createStaff(
  id: number,
  fullName: string,
  email: string,
  roleName: StaffRoleName,
  leaveCredit: number,
): StaffRecord {
  const now = "2026-05-06T09:00:00.000Z";
  const roleId = roles.find((role) => role.name === roleName)?.id ?? 1;

  return {
    id,
    createdAt: now,
    email,
    fullName,
    leaveCredit,
    passwordHash: "sample-password-123456",
    roleId,
    updatedAt: now,
  };
}

function createLeaveRequest(
  id: number,
  staffId: number,
  leaveDate: string,
  reason: string,
  status: LeaveRequestRecord["status"],
  resolvedBy?: number,
  rejectReason?: string,
): LeaveRequestRecord {
  const resolvedAt = status === "PENDING" ? undefined : "2026-05-06T10:30:00.000Z";

  return {
    id,
    createdAt: "2026-05-06T09:30:00.000Z",
    leaveDate,
    reason,
    rejectReason,
    resolvedAt,
    resolvedBy,
    staffId,
    status,
    updatedAt: resolvedAt ?? "2026-05-06T09:30:00.000Z",
  };
}

function createNotification(
  id: number,
  managerId: number,
  leaveRequestId: number,
  subject: string,
  emailStatus: ManagerNotificationRecord["emailStatus"],
): ManagerNotificationRecord {
  return {
    id,
    createdAt: "2026-05-06T10:31:00.000Z",
    emailStatus,
    leaveRequestId,
    managerId,
    subject,
  };
}
