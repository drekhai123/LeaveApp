"use client";

import { useEffect, useState } from "react";
import { getCurrentStaff, logoutCurrentStaff } from "@/lib/auth-api";
import {
  findRoleName,
  mockLeaveRequests,
  mockStaffs,
} from "@/lib/mock-leave-management-data";
import type {
  LeaveRequestRecord,
  StaffRecord,
  StaffRoleName,
} from "@/types/leave-app";
import { AdminMockWorkspace } from "./admin-mock-workspace";
import { HeadWorkspace } from "./head-workspace";
import { LoginScreen } from "./login-screen";
import { MockMetrics } from "./mock-metrics";
import { StaffWorkspace } from "./staff-workspace";

export function LeaveDashboard() {
  const [requests, setRequests] = useState<LeaveRequestRecord[]>(mockLeaveRequests);
  const [staffs, setStaffs] = useState<StaffRecord[]>(mockStaffs);
  const [currentUser, setCurrentUser] = useState<StaffRecord>();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const currentRole = currentUser ? findRoleName(currentUser) : undefined;

  useEffect(() => {
    let isMounted = true;

    getCurrentStaff()
      .then((staff) => {
        if (!isMounted || !staff) {
          return;
        }

        handleLogin(staff);
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isCheckingSession) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
        Dang kiem tra phien dang nhap...
      </div>
    );
  }

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
        <AdminMockWorkspace
          requests={requests}
          staffs={staffs}
          title="Manager quan ly he thong"
        />
      ) : null}
      {currentRole === "ADMIN" ? (
        <AdminMockWorkspace
          canCreateUser
          onCreateStaff={handleCreateStaff}
          requests={requests}
          staffs={staffs}
          title="Admin quan ly he thong"
        />
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
    void logoutCurrentStaff();
    setCurrentUser(undefined);
  }

  function handleCreateStaff(staff: {
    email: string;
    fullName: string;
    leaveCredit: number;
    roleName: StaffRoleName;
  }) {
    const now = new Date().toISOString();
    const nextId = Math.max(...staffs.map((item) => item.id)) + 1;

    setStaffs((current) => [
      {
        id: nextId,
        createdAt: now,
        email: staff.email,
        fullName: staff.fullName,
        leaveCredit: staff.leaveCredit,
        roleId: roleNameToId(staff.roleName),
        updatedAt: now,
      },
      ...current,
    ]);
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
