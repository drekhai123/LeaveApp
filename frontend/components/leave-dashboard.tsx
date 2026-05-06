"use client";

import { useMemo, useState } from "react";
import {
  findRoleName,
  mockLeaveRequests,
  mockNotifications,
  mockStaffs,
} from "@/lib/mock-leave-management-data";
import type {
  LeaveRequestRecord,
  ManagerNotificationRecord,
  StaffRecord,
} from "@/types/leave-app";
import { AdminMockWorkspace } from "./admin-mock-workspace";
import { HeadWorkspace } from "./head-workspace";
import { LoginScreen } from "./login-screen";
import { ManagerWorkspace } from "./manager-workspace";
import { MockMetrics } from "./mock-metrics";
import { StaffWorkspace } from "./staff-workspace";

export function LeaveDashboard() {
  const [notifications, setNotifications] =
    useState<ManagerNotificationRecord[]>(mockNotifications);
  const [requests, setRequests] = useState<LeaveRequestRecord[]>(mockLeaveRequests);
  const [staffs, setStaffs] = useState<StaffRecord[]>(mockStaffs);
  const [currentUser, setCurrentUser] = useState<StaffRecord>();

  const currentRole = currentUser ? findRoleName(currentUser) : undefined;
  const manager = useMemo(() => findByRole(staffs, "MANAGER"), [staffs]);

  if (!currentUser || !currentRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  function handleSubmit(staffId: number, leaveDate: string, reason: string) {
    if (hasExistingRequestForDate(requests, staffId, leaveDate)) {
      return;
    }

    const now = new Date().toISOString();
    const nextId = Math.max(...requests.map((request) => request.id)) + 1;

    setRequests((current) => [
      {
        id: nextId,
        createdAt: now,
        leaveDate,
        reason,
        staffId,
        status: "PENDING",
        updatedAt: now,
      },
      ...current,
    ]);
  }

  function handleApprove(requestId: number, headId: number) {
    const request = findPendingRequest(requests, requestId);
    if (!request) {
      return;
    }

    resolveRequest(requestId, headId, "APPROVED");
    decreaseLeaveCredit(requestId);
    createManagerNotification(requestId, "Đơn nghỉ phép đã được duyệt", "SENT");
  }

  function handleReject(requestId: number, headId: number, rejectReason: string) {
    if (!rejectReason.trim()) {
      return;
    }

    const request = findPendingRequest(requests, requestId);
    if (!request) {
      return;
    }

    resolveRequest(requestId, headId, "REJECTED", rejectReason.trim());
    createManagerNotification(requestId, "Đơn nghỉ phép bị từ chối", "FAILED");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Dữ liệu mô phỏng UI - schema MySQL
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Dashboard {currentRole}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Đăng nhập: {currentUser.fullName} ({currentUser.email}). Hệ thống
            điều hướng theo vai trò sau khi đăng nhập.
          </p>
        </div>
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={handleLogout}
          type="button"
        >
          Đăng xuất
        </button>
      </div>

      {currentRole !== "STAFF" ? (
        <MockMetrics requests={requests} staffs={staffs} />
      ) : null}

      {currentRole === "STAFF" ? (
        <StaffWorkspace onSubmit={handleSubmit} requests={requests} staff={currentUser} />
      ) : null}
      {currentRole === "HEAD" ? (
        <HeadWorkspace
          head={currentUser}
          onApprove={handleApprove}
          onReject={handleReject}
          requests={requests}
        />
      ) : null}
      {currentRole === "MANAGER" ? (
        <ManagerWorkspace
          manager={currentUser}
          notifications={notifications}
          requests={requests}
        />
      ) : null}
      {currentRole === "ADMIN" ? (
        <AdminMockWorkspace requests={requests} staffs={staffs} />
      ) : null}
    </div>
  );

  function handleLogin(staff: StaffRecord) {
    setStaffs((current) =>
      current.some((item) => item.id === staff.id) ? current : [staff, ...current],
    );
    setCurrentUser(staff);
  }

  function handleLogout() {
    localStorage.removeItem("leave_app_access_token");
    setCurrentUser(undefined);
  }

  function resolveRequest(
    requestId: number,
    headId: number,
    status: LeaveRequestRecord["status"],
    rejectReason?: string,
  ) {
    const now = new Date().toISOString();

    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              rejectReason,
              resolvedAt: now,
              resolvedBy: headId,
              status,
              updatedAt: now,
            }
          : request,
      ),
    );
  }

  function decreaseLeaveCredit(requestId: number) {
    const request = requests.find((item) => item.id === requestId);
    if (!request) {
      return;
    }

    setStaffs((current) =>
      current.map((item) =>
        item.id === request.staffId
          ? { ...item, leaveCredit: Math.max(0, item.leaveCredit - 1) }
          : item,
      ),
    );
  }

  function createManagerNotification(
    requestId: number,
    subject: string,
    emailStatus: ManagerNotificationRecord["emailStatus"],
  ) {
    setNotifications((current) => [
      {
        id: Math.max(...current.map((item) => item.id)) + 1,
        createdAt: new Date().toISOString(),
        emailStatus,
        leaveRequestId: requestId,
        managerId: manager.id,
        subject,
      },
      ...current,
    ]);
  }
}

function findByRole(staffs: StaffRecord[], roleName: ReturnType<typeof findRoleName>) {
  return staffs.find((staff) => findRoleName(staff) === roleName) ?? staffs[0];
}

function hasExistingRequestForDate(
  requests: LeaveRequestRecord[],
  staffId: number,
  leaveDate: string,
) {
  return requests.some(
    (request) => request.staffId === staffId && request.leaveDate === leaveDate,
  );
}

function findPendingRequest(requests: LeaveRequestRecord[], requestId: number) {
  return requests.find(
    (request) => request.id === requestId && request.status === "PENDING",
  );
}
