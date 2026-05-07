import { useState } from "react";
import { findRoleName } from "@/lib/leave-app-helpers";
import { fetchStaffById } from "@/lib/staff-api";
import type { LeaveRequestRecord, StaffRecord } from "@/types/leave-app";
import { InlineAlert } from "./inline-alert";
import { MockRequestTable } from "./mock-request-table";
import { SectionHeader } from "./section-header";

export function AdminMockWorkspace({
  onCreateStaff,
  onDeleteStaff,
  onPageChange,
  requests,
  staffs,
  staffsPage,
  staffMeta,
}: {
  onCreateStaff: (input: {
    fullName: string;
    email: string;
    password: string;
    roleId?: number;
    leaveCredit?: number;
  }) => Promise<void>;
  onDeleteStaff: (staffId: number) => Promise<void>;
  onPageChange: (nextPage: number) => Promise<void> | void;
  requests: LeaveRequestRecord[];
  staffs: StaffRecord[];
  staffsPage: StaffRecord[];
  staffMeta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}) {
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const effectivePage = Math.min(page, totalPages);

  const [message, setMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord>();
  const [isStaffDetailOpen, setIsStaffDetailOpen] = useState(false);
  const [isLoadingStaffDetail, setIsLoadingStaffDetail] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    roleId: 1,
    leaveCredit: 12,
  });

  async function handleCreateStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setMessage("Vui lòng nhập đầy đủ họ tên, email, mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateStaff({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        roleId: Number(form.roleId),
        leaveCredit: Number(form.leaveCredit),
      });
      setForm({
        fullName: "",
        email: "",
        password: "",
        roleId: 1,
        leaveCredit: 12,
      });
      setMessage("Tạo nhân viên thành công.");
      setIsCreateModalOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tạo nhân viên thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteStaff(staffId: number) {
    setMessage(undefined);
    try {
      await onDeleteStaff(staffId);
      setMessage("Xóa nhân viên thành công.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Xóa nhân viên thất bại.");
    }
  }

  async function handleOpenStaffDetail(staffId: number) {
    setMessage(undefined);
    setIsStaffDetailOpen(true);
    setIsLoadingStaffDetail(true);
    try {
      const detail = await fetchStaffById(staffId);
      setSelectedStaff(detail);
    } catch (error) {
      setSelectedStaff(undefined);
      setMessage(error instanceof Error ? error.message : "Không tải được thông tin nhân sự.");
    } finally {
      setIsLoadingStaffDetail(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(300px,430px)_1fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <SectionHeader
          title="Dashboard Admin"
          description="Quản lý tài khoản và vai trò từ backend."
        />
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-3">
          <p className="text-sm text-slate-600">
            Tổng nhân sự: <span className="font-medium text-slate-900">{staffMeta?.totalItems ?? "-"}</span>
          </p>
          <button
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
          >
            Thêm nhân sự
          </button>
        </div>
        {message ? <InlineAlert message={message} tone={message.includes("thành công") ? "success" : "error"} /> : null}
        {staffMeta && staffMeta.totalPages > 1 ? (
          <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-600">
            <p>
              Trang <span className="font-medium text-slate-900">{staffMeta.page}</span> /{" "}
              <span className="font-medium text-slate-900">{staffMeta.totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 disabled:bg-slate-100"
                disabled={!staffMeta.hasPreviousPage}
                onClick={() => onPageChange(staffMeta.page - 1)}
                type="button"
              >
                Trước
              </button>
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 disabled:bg-slate-100"
                disabled={!staffMeta.hasNextPage}
                onClick={() => onPageChange(staffMeta.page + 1)}
                type="button"
              >
                Sau
              </button>
            </div>
          </div>
        ) : null}
        <div className="grid gap-3">
          {staffsPage.map((staff) => (
            <div className="rounded-md border border-slate-200 p-3 text-sm" key={staff.id}>
              <div className="flex items-start justify-between gap-3">
                <button
                  className="text-left"
                  onClick={() => void handleOpenStaffDetail(staff.id)}
                  type="button"
                >
                  <p className="font-medium text-slate-950">{staff.fullName}</p>
                  <p className="text-slate-600">{staff.email}</p>
                </button>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
                  {findRoleName(staff)}
                </span>
              </div>
              <p className="mt-2 text-slate-700">Ngày phép: {staff.leaveCredit}</p>
              <button
                className="mt-2 rounded-md border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                onClick={() => void handleDeleteStaff(staff.id)}
                type="button"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      </section>
      <MockRequestTable
        pagination={{
          page: effectivePage,
          pageSize,
          total: requests.length,
          onPageChange: setPage,
        }}
        requests={requests}
        staffs={staffs}
        title="Tất cả đơn trong hệ thống"
      />

      {isCreateModalOpen ? (
        <div className={modalOverlayClassName} role="dialog" aria-modal="true">
          <div className={modalCardClassName}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Thêm nhân sự</h3>
                <p className="mt-1 text-sm text-slate-600">Tạo nhân viên mới trong hệ thống.</p>
              </div>
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700"
                onClick={() => setIsCreateModalOpen(false)}
                type="button"
              >
                Đóng
              </button>
            </div>
            <form className="mt-4 grid gap-2" onSubmit={handleCreateStaff}>
              <input
                className={inputClassName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fullName: event.target.value }))
                }
                placeholder="Họ tên"
                value={form.fullName}
              />
              <input
                className={inputClassName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Email"
                type="email"
                value={form.email}
              />
              <input
                className={inputClassName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Mật khẩu (>=8 ký tự)"
                type="password"
                value={form.password}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className={inputClassName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, roleId: Number(event.target.value) }))
                  }
                  value={form.roleId}
                >
                  <option value={1}>STAFF</option>
                  <option value={2}>MANAGER</option>
                  <option value={3}>HEAD</option>
                  <option value={4}>ADMIN</option>
                </select>
                <input
                  className={inputClassName}
                  min={1}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, leaveCredit: Number(event.target.value) }))
                  }
                  type="number"
                  value={form.leaveCredit}
                />
              </div>
              <button
                className="mt-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-400"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo nhân viên"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {isStaffDetailOpen ? (
        <div className={modalOverlayClassName} role="dialog" aria-modal="true">
          <div className={modalCardClassName}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Thông tin nhân sự</h3>
                <p className="mt-1 text-sm text-slate-600">Chi tiết từ backend.</p>
              </div>
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700"
                onClick={() => setIsStaffDetailOpen(false)}
                type="button"
              >
                Đóng
              </button>
            </div>
            {isLoadingStaffDetail ? (
              <p className="mt-4 text-sm text-slate-600">Đang tải...</p>
            ) : selectedStaff ? (
              <div className="mt-4 grid gap-2 text-sm">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Họ tên</p>
                  <p className="font-medium text-slate-950">{selectedStaff.fullName}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium text-slate-950">{selectedStaff.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-slate-500">Role</p>
                    <p className="font-medium text-slate-950">{findRoleName(selectedStaff)}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-slate-500">Ngày phép</p>
                    <p className="font-medium text-slate-950">{selectedStaff.leaveCredit}</p>
                  </div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">ID</p>
                  <p className="font-medium text-slate-950">{selectedStaff.id}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">CreatedAt</p>
                  <p className="font-medium text-slate-950">{selectedStaff.createdAt}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Không có dữ liệu.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inputClassName =
  "rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500";

const modalOverlayClassName =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4";
const modalCardClassName =
  "w-full max-w-lg rounded-md border border-slate-200 bg-white p-5 shadow-xl";
