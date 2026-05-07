"use client";

import { useState } from "react";
import type { LeaveRequestPaginationMeta } from "@/lib/leave-requests-api";
import type { LeaveRequestRecord, StaffRecord } from "@/types/leave-app";
import { InlineAlert } from "./inline-alert";
import { RequestTable } from "./request-table";
import { SectionHeader } from "./section-header";

export function StaffWorkspace({
  onRequestsPageChange,
  onSubmit,
  onViewRequest,
  requests,
  requestsMeta,
  requestsPage,
  staff,
  staffs,
}: {
  onRequestsPageChange: (nextPage: number) => Promise<void> | void;
  onSubmit: (staffId: number, leaveDate: string, reason: string) => Promise<void>;
  onViewRequest?: (request: LeaveRequestRecord) => void;
  requests: LeaveRequestRecord[];
  requestsMeta?: LeaveRequestPaginationMeta;
  requestsPage: LeaveRequestRecord[];
  staff: StaffRecord;
  staffs: StaffRecord[];
}) {
  const [leaveDate, setLeaveDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string>();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    if (!leaveDate || !reason.trim()) {
      setMessage("Cần nhập ngày nghỉ và lý do.");
      return;
    }
    if (staff.leaveCredit <= 0) {
      setMessage("Nhân viên đã hết ngày phép.");
      return;
    }
    if (hasExistingRequestForDate(requests, staff.id, leaveDate)) {
      setMessage("Bạn đã có đơn nghỉ phép cho ngày này.");
      return;
    }

    try {
      await onSubmit(staff.id, leaveDate, reason.trim());
      setLeaveDate("");
      setReason("");
      setMessage("Đã gửi đơn cho HEAD duyệt.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gửi đơn thất bại.");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <SectionHeader
          title="Staff gửi đơn"
          description="Giao diện theo dữ liệu backend (staffs và leave_requests)."
        />
        <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="font-medium text-slate-950">{staff.fullName}</p>
          <p className="text-slate-600">{staff.email}</p>
          <p className="mt-2 text-slate-700">Ngày phép còn lại: {staff.leaveCredit}</p>
        </div>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Ngày nghỉ
            <input
              className={inputClassName}
              lang="en-GB"
              onChange={(event) => setLeaveDate(event.target.value)}
              type="date"
              value={leaveDate}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Lý do
            <textarea
              className={`${inputClassName} min-h-24`}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do xin nghỉ"
              value={reason}
            />
          </label>
          <button className="rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white">
            Gửi đơn
          </button>
        </form>
        {message ? (
          <div className="mt-3">
            <InlineAlert message={message} tone={message.startsWith("Đã") ? "success" : "error"} />
          </div>
        ) : null}
      </section>

      <RequestTable
        calendarRequests={requests}
        onRequestClick={onViewRequest}
        pagination={
          requestsMeta
            ? {
                page: requestsMeta.page,
                pageSize: requestsMeta.limit,
                total: requestsMeta.totalItems,
                onPageChange: onRequestsPageChange,
              }
            : undefined
        }
        requests={requestsPage}
        staffs={staffs}
        title={`Đơn của ${staff.fullName}`}
      />
    </div>
  );
}

const inputClassName =
  "rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-sky-500";

function hasExistingRequestForDate(
  requests: LeaveRequestRecord[],
  staffId: number,
  leaveDate: string,
) {
  return requests.some(
    (request) => request.staffId === staffId && request.leaveDate === leaveDate,
  );
}
