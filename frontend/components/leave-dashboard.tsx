"use client";

<<<<<<< HEAD
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
=======
import { useEffect, useState } from "react";
import { getCurrentStaff, logoutCurrentStaff } from "@/lib/auth-api";
import {
  findRoleName,
  mockLeaveRequests,
  mockStaffs,
} from "@/lib/mock-leave-management-data";
>>>>>>> e83db78b535da6bf2213ca0e3f32afb1dcababf1
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
<<<<<<< HEAD
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
=======
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
>>>>>>> e83db78b535da6bf2213ca0e3f32afb1dcababf1

  if (!currentUser || !currentRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  async function handleSubmit(staffId: number, leaveDate: string, reason: string) {
    const createdRequests = await createLeaveRequest({ staffId, leaveDate, reason });
    setRequests((current) => [...createdRequests, ...current]);
  }

<<<<<<< HEAD
  async function handleApprove(requestId: number) {
    const request = await approveLeaveRequest(requestId);
    updateRequest(request);
=======
  function handleApprove(requestId: number, headId: number) {
    const request = findPendingRequest(requests, requestId);
    if (!request) {
      return;
    }

    resolveRequest(requestId, headId, "APPROVED");
    decreaseLeaveCredit(requestId);
>>>>>>> e83db78b535da6bf2213ca0e3f32afb1dcababf1
  }

  async function handleReject(requestId: number, rejectReason: string) {
    if (!rejectReason.trim()) {
      return;
    }

    const request = await rejectLeaveRequest(requestId, rejectReason.trim());
    updateRequest(request);
  }

<<<<<<< HEAD
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
=======
    resolveRequest(requestId, headId, "REJECTED", rejectReason.trim());
>>>>>>> e83db78b535da6bf2213ca0e3f32afb1dcababf1
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
<<<<<<< HEAD
        <ManagerWorkspace
          manager={currentUser}
          requests={requests}
          staffs={staffs}
=======
        <AdminMockWorkspace
          requests={requests}
          staffs={staffs}
          title="Manager quan ly he thong"
>>>>>>> e83db78b535da6bf2213ca0e3f32afb1dcababf1
        />
      ) : null}
      {currentRole === "ADMIN" ? (
        <AdminMockWorkspace
<<<<<<< HEAD
          onCreateStaff={handleCreateStaff}
          onDeleteStaff={handleDeleteStaff}
          onPageChange={(nextPage) => reloadAdminStaffPage(nextPage)}
          staffMeta={adminStaffMeta}
          requests={requests}
          staffs={staffs}
          staffsPage={adminStaffs}
=======
          canCreateUser
          onCreateStaff={handleCreateStaff}
          requests={requests}
          staffs={staffs}
          title="Admin quan ly he thong"
>>>>>>> e83db78b535da6bf2213ca0e3f32afb1dcababf1
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
<<<<<<< HEAD
    clearAccessToken();
    setStaffs([]);
    setRequests([]);
    setCurrentUser(undefined);
  }

  function updateRequest(nextRequest: LeaveRequestRecord) {
=======
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

>>>>>>> e83db78b535da6bf2213ca0e3f32afb1dcababf1
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

<<<<<<< HEAD
=======
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
>>>>>>> e83db78b535da6bf2213ca0e3f32afb1dcababf1
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
