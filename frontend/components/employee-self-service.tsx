"use client";

import { useMemo, useState } from "react";
import type { Employee, LeaveRequest } from "@/types/leave-app";
import { EmptyState } from "./empty-state";
import { InlineAlert } from "./inline-alert";
import { LeaveRequestForm } from "./leave-request-form";
import { LeaveRequestTable } from "./leave-request-table";
import { SectionHeader } from "./section-header";

export function EmployeeSelfService({
  employees,
  onChanged,
  requests,
}: {
  employees: Employee[];
  onChanged: () => Promise<void>;
  requests: LeaveRequest[];
}) {
  const regularEmployees = employees.filter((employee) => employee.role === "employee");
  const fallbackEmployees = regularEmployees.length > 0 ? regularEmployees : employees;
  const [employeeId, setEmployeeId] = useState("");
  const selectedEmployee = fallbackEmployees.find((employee) => employee.id === employeeId);
  const visibleRequests = useMemo(
    () =>
      selectedEmployee
        ? requests.filter((request) => request.employeeId === selectedEmployee.id)
        : [],
    [requests, selectedEmployee],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,380px)_1fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <SectionHeader
          title="Nhan vien"
          description="Chon ten cua ban de gui va xem don nghi phep."
        />
        {employees.length === 0 ? (
          <EmptyState
            title="Chua co nhan vien"
            description="Quan ly/HR can tao nhan vien truoc khi nhan vien gui don."
          />
        ) : (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Toi la
              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-sky-500"
                onChange={(event) => setEmployeeId(event.target.value)}
                value={employeeId}
              >
                <option value="">Chon nhan vien</option>
                {fallbackEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>
            </label>
            <InlineAlert
              message="MVP mode: day la lua chon danh tinh tam thoi, chua phai dang nhap that."
              tone="info"
            />
          </div>
        )}
      </section>

      <div className="grid gap-4">
        {selectedEmployee ? (
          <>
            <LeaveRequestForm
              employees={[selectedEmployee]}
              fixedEmployeeId={selectedEmployee.id}
              onCreated={onChanged}
              title="Gui don cua toi"
            />
            <LeaveRequestTable
              requests={visibleRequests}
              title={`Don nghi phep cua ${selectedEmployee.name}`}
            />
          </>
        ) : (
          <EmptyState
            title="Chon nhan vien de bat dau"
            description="Sau khi chon ten, ban co the gui don va xem lich su don cua rieng minh."
          />
        )}
      </div>
    </div>
  );
}
