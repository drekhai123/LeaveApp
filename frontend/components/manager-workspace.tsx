import { formatDateTime } from "@/lib/formatters";
import { findStaffName } from "@/lib/mock-leave-management-data";
import type {
  LeaveRequestRecord,
  ManagerNotificationRecord,
  StaffRecord,
} from "@/types/leave-app";
import { EmptyState } from "./empty-state";
import { MockRequestTable } from "./mock-request-table";
import { SectionHeader } from "./section-header";

export function ManagerWorkspace({
  manager,
  notifications,
  requests,
}: {
  manager: StaffRecord;
  notifications: ManagerNotificationRecord[];
  requests: LeaveRequestRecord[];
}) {
  const managerNotifications = notifications.filter((item) => item.managerId === manager.id);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,420px)_1fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <SectionHeader
          title="Manager nhận thông báo"
          description={`${manager.fullName} theo dõi kết quả đơn nghỉ phép.`}
        />
        {managerNotifications.length === 0 ? (
          <EmptyState title="Chưa có thông báo" description="Kết quả duyệt sẽ hiển thị tại đây." />
        ) : (
          <div className="grid gap-3">
            {managerNotifications.map((notification) => (
              <div className="rounded-md border border-slate-200 p-3" key={notification.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{notification.subject}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Đơn #{notification.leaveRequestId} - {formatDateTime(notification.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Nhân viên: {findStaffName(findRequest(requests, notification.leaveRequestId)?.staffId)}
                    </p>
                  </div>
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-medium ${
                      notification.emailStatus === "SENT"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {notification.emailStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <MockRequestTable requests={requests} title="Tất cả đơn nghỉ phép" />
    </div>
  );
}

function findRequest(requests: LeaveRequestRecord[], requestId: number) {
  return requests.find((request) => request.id === requestId);
}
