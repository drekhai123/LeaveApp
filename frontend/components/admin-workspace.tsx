import type { Employee, LeaveRequest } from "@/types/leave-app";
import { ApprovalPanel } from "./approval-panel";
import { EmployeeForm } from "./employee-form";
import { LeaveRequestTable } from "./leave-request-table";

export function AdminWorkspace({
  employees,
  onChanged,
  requests,
}: {
  employees: Employee[];
  onChanged: () => Promise<void>;
  requests: LeaveRequest[];
}) {
  const processedRequests = requests.filter((request) => request.status !== "pending");

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <EmployeeForm onCreated={onChanged} />
        <ApprovalPanel
          employees={employees}
          onProcessed={onChanged}
          requests={requests}
        />
      </div>
      <LeaveRequestTable requests={processedRequests} />
    </div>
  );
}
