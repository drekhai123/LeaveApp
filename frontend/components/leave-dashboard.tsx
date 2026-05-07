"use client";

import { useCallback, useMemo, useState } from "react";
import {
  approveLeaveRequest,
  createLeaveRequest,
  fetchLeaveRequests,
  rejectLeaveRequest,
} from "@/lib/leave-requests-api";
import { findRoleName } from "@/lib/leave-app-helpers";
import { clearAccessToken } from "@/lib/session";
import {
  createStaff,
  deleteStaff,
  fetchAllStaffs,
  fetchStaffsPage,
} from "@/lib/staff-api";
import type {
  LeaveRequestRecord,
  StaffRecord,
} from "@/types/leave-app";
import { AdminMockWorkspace } from "./admin-mock-workspace";
import { HeadWorkspace } from "./head-workspace";
import { LoginScreen } from "./login-screen";
import { ManagerWorkspace } from "./manager-workspace";
import { MockMetrics } from "./mock-metrics";
import { StaffWorkspace } from "./staff-workspace";

export function LeaveDashboard() {
  const [requests, setRequests] = useState<LeaveRequestRecord[]>([]);
  const [staffs, setStaffs] = useState<StaffRecord[]>([]);
  const [adminStaffs, setAdminStaffs] = useState<StaffRecord[]>([]);
  const [adminStaffMeta, setAdminStaffMeta] = useState<{
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>();
  const [adminStaffPage, setAdminStaffPage] = useState(1);
  const adminStaffPageSize = 10;
  const [currentUser, setCurrentUser] = useState<StaffRecord>();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [message, setMessage] = useState<string>();

  const currentRole = currentUser ? findRoleName(currentUser) : undefined;
  void useMemo(() => findByRole(staffs, "MANAGER"), [staffs]);

  const reloadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [staffData, leaveData] = await Promise.all([
        fetchAllStaffs({ pageSize: 100 }),
        fetchLeaveRequests(),
      ]);
      setStaffs(staffData);
      setRequests(leaveData);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được dữ liệu backend.");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const reloadAdminStaffPage = useCallback(
    async (page: number) => {
      const { staffs: pageStaffs, meta } = await fetchStaffsPage({
        page,
        limit: adminStaffPageSize,
      });
      setAdminStaffs(pageStaffs);
      setAdminStaffMeta(meta);
      setAdminStaffPage(page);
    },
    [adminStaffPageSize],
  );

  if (!currentUser || !currentRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  async function handleSubmit(staffId: number, leaveDate: string, reason: string) {
    const createdRequests = await createLeaveRequest({ staffId, leaveDate, reason });
    setRequests((current) => [...createdRequests, ...current]);
  }

  async function handleApprove(requestId: number) {
    const request = await approveLeaveRequest(requestId);
    updateRequest(request);
  }

  async function handleReject(requestId: number, rejectReason: string) {
    if (!rejectReason.trim()) {
      return;
    }

    const request = await rejectLeaveRequest(requestId, rejectReason.trim());
    updateRequest(request);
  }

  async function handleCreateStaff(input: {
    fullName: string;
    email: string;
    password: string;
    roleId?: number;
    leaveCredit?: number;
  }) {
    const created = await createStaff(input);
    setStaffs((current) => [created, ...current]);
    if (currentRole === "ADMIN") {
      await reloadAdminStaffPage(adminStaffPage);
    }
  }

  async function handleDeleteStaff(staffId: number) {
    await deleteStaff(staffId);
    setStaffs((current) => current.filter((staff) => staff.id !== staffId));
    if (currentRole === "ADMIN") {
      const targetPage = adminStaffPage;
      await reloadAdminStaffPage(targetPage);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Dữ liệu từ backend - schema MySQL
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Dashboard {currentRole}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Đăng nhập: {currentUser.fullName} ({currentUser.email}). Hệ thống
            điều hướng theo vai trò sau khi đăng nhập.
          </p>
          {message ? <p className="mt-2 text-sm text-rose-700">{message}</p> : null}
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
      {isLoadingData ? (
        <p className="text-sm text-slate-600">Đang tải dữ liệu từ backend...</p>
      ) : null}

      {currentRole === "STAFF" ? (
        <StaffWorkspace
          onSubmit={handleSubmit}
          requests={requests}
          staff={currentUser}
          staffs={staffs}
        />
      ) : null}
      {currentRole === "HEAD" ? (
        <HeadWorkspace
          head={currentUser}
          onApprove={handleApprove}
          onReject={handleReject}
          requests={requests}
          staffs={staffs}
        />
      ) : null}
      {currentRole === "MANAGER" ? (
        <ManagerWorkspace
          manager={currentUser}
          requests={requests}
          staffs={staffs}
        />
      ) : null}
      {currentRole === "ADMIN" ? (
        <AdminMockWorkspace
          onCreateStaff={handleCreateStaff}
          onDeleteStaff={handleDeleteStaff}
          onPageChange={(nextPage) => reloadAdminStaffPage(nextPage)}
          staffMeta={adminStaffMeta}
          requests={requests}
          staffs={staffs}
          staffsPage={adminStaffs}
        />
      ) : null}
    </div>
  );

  function handleLogin(staff: StaffRecord) {
    setCurrentUser(staff);
    void reloadData().then(async () => {
      if (findRoleName(staff) === "ADMIN") {
        try {
          await reloadAdminStaffPage(1);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Không tải được danh sách nhân sự.");
        }
      }
    });
  }

  function handleLogout() {
    clearAccessToken();
    setStaffs([]);
    setRequests([]);
    setCurrentUser(undefined);
  }

  function updateRequest(nextRequest: LeaveRequestRecord) {
    setRequests((current) =>
      current.map((request) =>
        request.id === nextRequest.id
          ? {
              ...request,
              ...nextRequest,
            }
          : request,
      ),
    );
  }

}

function findByRole(staffs: StaffRecord[], roleName: ReturnType<typeof findRoleName>) {
  return staffs.find((staff) => findRoleName(staff) === roleName) ?? staffs[0];
}
