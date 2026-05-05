import { formatDate } from "@/lib/formatters";
import type { Employee, LeaveRequest } from "@/types/leave-app";
import { EmptyState } from "./empty-state";
import { RequestActionForm } from "./request-action-form";

export function ApprovalQueue({
  approver,
  pendingRequests,
  onProcessed,
}: {
  approver?: Employee;
  pendingRequests: LeaveRequest[];
  onProcessed: () => Promise<void>;
}) {
  if (pendingRequests.length === 0) {
    return (
      <EmptyState
        title="No pending requests"
        description="New leave requests will appear in this queue."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {pendingRequests.map((request) => (
        <article
          className="rounded-md border border-slate-200 bg-white p-4"
          key={request.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-medium text-slate-950">{request.employeeName}</h3>
              <p className="text-sm text-slate-600">
                {formatDate(request.startDate)} - {formatDate(request.endDate)} |{" "}
                {request.totalDays} business day(s)
              </p>
            </div>
            <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
              Pending
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{request.reason}</p>
          <RequestActionForm
            approver={approver}
            onProcessed={onProcessed}
            request={request}
          />
        </article>
      ))}
    </div>
  );
}
