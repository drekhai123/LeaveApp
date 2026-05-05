"use client";

import { useMemo, useState } from "react";
import type { Employee, LeaveRequest } from "@/types/leave-app";
import { ApprovalQueue } from "./approval-queue";
import { EmptyState } from "./empty-state";
import { SectionHeader } from "./section-header";

export function ApprovalPanel({
  employees,
  requests,
  onProcessed,
}: {
  employees: Employee[];
  requests: LeaveRequest[];
  onProcessed: () => Promise<void>;
}) {
  const approvers = useMemo(
    () => employees.filter((employee) => employee.role === "manager" || employee.role === "hr"),
    [employees],
  );
  const [approverId, setApproverId] = useState("");
  const approver = approvers.find((employee) => employee.id === approverId) ?? approvers[0];
  const pendingRequests = requests.filter((request) => request.status === "pending");

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <SectionHeader
        title="Approvals"
        description="Review pending requests as a manager or HR."
      />
      {approvers.length === 0 ? (
        <EmptyState
          title="No approver available"
          description="Create a manager or HR employee before processing requests."
        />
      ) : (
        <>
          <label className="mb-4 block text-sm font-medium text-slate-700">
            Acting approver
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
              onChange={(event) => setApproverId(event.target.value)}
              value={approver?.id ?? ""}
            >
              {approvers.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.role})
                </option>
              ))}
            </select>
          </label>
          <ApprovalQueue
            approver={approver}
            onProcessed={onProcessed}
            pendingRequests={pendingRequests}
          />
        </>
      )}
    </section>
  );
}
