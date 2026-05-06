import { formatDate, formatDateTime, leaveStatusLabel } from "@/lib/formatters";
import { findStaffName } from "@/lib/mock-leave-management-data";
import type { LeaveRequestRecord } from "@/types/leave-app";
import { EmptyState } from "./empty-state";
import { MockLeaveCalendar } from "./mock-leave-calendar";

const statusClasses: Record<LeaveRequestRecord["status"], string> = {
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border-sky-200 bg-sky-50 text-sky-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};

export function MockRequestTable({
  requests,
  title,
}: {
  requests: LeaveRequestRecord[];
  title: string;
}) {
  if (requests.length === 0) {
    return <EmptyState title="Chưa có đơn" description="Đơn nghỉ phép sẽ hiển thị tại đây." />;
  }

  return (
    <div className="grid gap-4">
      <MockLeaveCalendar requests={requests} />
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nhân viên</th>
                <th className="px-4 py-3 font-medium">Ngày nghỉ</th>
                <th className="px-4 py-3 font-medium">Lý do</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request) => (
                <tr className="align-top" key={request.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">
                    {findStaffName(request.staffId)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(request.leaveDate)}</td>
                  <td className="max-w-sm px-4 py-3 text-slate-700">
                    {request.reason}
                    {request.rejectReason ? (
                      <p className="mt-2 text-xs text-rose-700">
                        Từ chối: {request.rejectReason}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusClasses[request.status]}`}
                    >
                      {leaveStatusLabel(request.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <p>{findStaffName(request.resolvedBy)}</p>
                    <p>{formatDateTime(request.resolvedAt)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
