"use client";

import { useState } from "react";
import { createLeaveRequest } from "@/lib/leave-api";
import type { Employee } from "@/types/leave-app";
import { EmptyState } from "./empty-state";
import { InlineAlert } from "./inline-alert";
import { SectionHeader } from "./section-header";

export function LeaveRequestForm({
  employees,
  fixedEmployeeId,
  onCreated,
  title = "New request",
}: {
  employees: Employee[];
  fixedEmployeeId?: string;
  onCreated: () => Promise<void>;
  title?: string;
}) {
  const [employeeId, setEmployeeId] = useState(fixedEmployeeId ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    const requestEmployeeId = fixedEmployeeId ?? employeeId;
    if (!requestEmployeeId || !startDate || !endDate || !reason.trim()) {
      setMessage("Employee, dates, and reason are required.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setMessage("End date must be the same as or after start date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createLeaveRequest({
        employeeId: requestEmployeeId,
        endDate,
        reason: reason.trim(),
        startDate,
      });
      setStartDate("");
      setEndDate("");
      setReason("");
      await onCreated();
      setMessage("Leave request submitted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submit request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <SectionHeader title={title} description="Submit leave for review." />
      {employees.length === 0 ? (
        <EmptyState
          title="No employees yet"
          description="Create an employee first, then submit a leave request."
        />
      ) : (
        <form className="grid gap-3" onSubmit={handleSubmit}>
          {fixedEmployeeId ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Request for{" "}
              <span className="font-medium text-slate-950">
                {employees[0]?.name ?? "selected employee"}
              </span>
            </div>
          ) : (
            <Field label="Employee">
              <select
                className={inputClassName}
                onChange={(event) => setEmployeeId(event.target.value)}
                value={employeeId}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.role})
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Start date">
              <input
                className={inputClassName}
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                value={startDate}
              />
            </Field>
            <Field label="End date">
              <input
                className={inputClassName}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
                type="date"
                value={endDate}
              />
            </Field>
          </div>
          <Field label="Reason">
            <textarea
              className={`${inputClassName} min-h-24`}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason"
              value={reason}
            />
          </Field>
          <button
            className="rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      )}
      {message ? (
        <div className="mt-3">
          <InlineAlert message={message} />
        </div>
      ) : null}
    </section>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

const inputClassName =
  "rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-sky-500";
