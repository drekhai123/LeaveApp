import { formatDate, formatDateTime } from "@/lib/formatters";
import type { LeaveRequest } from "@/types/leave-app";
import { EmptyState } from "./empty-state";
import { StatusBadge } from "./status-badge";

export function LeaveRequestTable({
  requests,
  title = "Request history",
}: {
  requests: LeaveRequest[];
  title?: string;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title="No leave requests"
        description="Submitted requests will appear here with their status."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Dates</th>
              <th className="px-4 py-3 font-medium">Days</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Processed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => (
              <tr key={request.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-950">{request.employeeName}</p>
                  <p className="text-xs text-slate-500">{request.employeeEmail}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                </td>
                <td className="px-4 py-3 text-slate-700">{request.totalDays}</td>
                <td className="max-w-xs px-4 py-3 text-slate-700">
                  {request.reason}
                  {request.managerNote ? (
                    <p className="mt-2 text-xs text-slate-500">Note: {request.managerNote}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDateTime(request.processedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
