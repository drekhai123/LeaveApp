"use client";

import { useState } from "react";
import { formatDate } from "@/lib/formatters";
import { findStaffName } from "@/lib/mock-leave-management-data";
import type { LeaveRequestRecord, StaffRecord } from "@/types/leave-app";
import { EmptyState } from "./empty-state";
import { SectionHeader } from "./section-header";

export function HeadWorkspace({
  head,
  onApprove,
  onReject,
  requests,
}: {
  head: StaffRecord;
  onApprove: (requestId: number, headId: number) => void;
  onReject: (requestId: number, headId: number, rejectReason: string) => void;
  requests: LeaveRequestRecord[];
}) {
  const [rejectReasons, setRejectReasons] = useState<Record<number, string>>({});
  const pendingRequests = requests.filter((request) => request.status === "PENDING");

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <SectionHeader
        title="HEAD duyệt đơn"
        description={`${head.fullName} xử lý đơn đang chờ và tạo thông báo cho Manager.`}
      />
      {pendingRequests.length === 0 ? (
        <EmptyState title="Không có đơn chờ duyệt" description="Đơn mới của STAFF sẽ vào hàng đợi." />
      ) : (
        <div className="grid gap-3">
          {pendingRequests.map((request) => (
            <div className="rounded-md border border-slate-200 p-3" key={request.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">{findStaffName(request.staffId)}</p>
                  <p className="text-sm text-slate-600">{formatDate(request.leaveDate)}</p>
                  <p className="mt-2 text-sm text-slate-700">{request.reason}</p>
                </div>
                <button
                  className="h-9 rounded-md bg-emerald-700 px-3 text-sm font-medium text-white"
                  onClick={() => onApprove(request.id, head.id)}
                  type="button"
                >
                  Duyệt
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  onChange={(event) =>
                    setRejectReasons((current) => ({
                      ...current,
                      [request.id]: event.target.value,
                    }))
                  }
                  placeholder="Lý do từ chối"
                  value={rejectReasons[request.id] ?? ""}
                />
                <button
                  className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                  onClick={() => onReject(request.id, head.id, rejectReasons[request.id] ?? "")}
                  type="button"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
