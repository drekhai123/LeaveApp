import { findRoleName } from "@/lib/mock-leave-management-data";
import type { LeaveRequestRecord, StaffRecord } from "@/types/leave-app";
import { MockRequestTable } from "./mock-request-table";
import { SectionHeader } from "./section-header";

export function AdminMockWorkspace({
  requests,
  staffs,
}: {
  requests: LeaveRequestRecord[];
  staffs: StaffRecord[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(300px,430px)_1fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <SectionHeader
          title="Dashboard Admin"
          description="Quản lý tài khoản và vai trò trong dữ liệu mô phỏng."
        />
        <div className="grid gap-3">
          {staffs.map((staff) => (
            <div className="rounded-md border border-slate-200 p-3 text-sm" key={staff.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">{staff.fullName}</p>
                  <p className="text-slate-600">{staff.email}</p>
                </div>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
                  {findRoleName(staff)}
                </span>
              </div>
              <p className="mt-2 text-slate-700">Ngày phép: {staff.leaveCredit}</p>
            </div>
          ))}
        </div>
      </section>
      <MockRequestTable requests={requests} title="Tất cả đơn trong hệ thống" />
    </div>
  );
}
