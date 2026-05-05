import { statusLabel } from "@/lib/formatters";
import type { LeaveRequestStatus } from "@/types/leave-app";

const statusClasses: Record<LeaveRequestStatus, string> = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-sky-200 bg-sky-50 text-sky-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

export function StatusBadge({ status }: { status: LeaveRequestStatus }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}
