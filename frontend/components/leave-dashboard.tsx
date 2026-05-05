"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getEmployees, getHealth, getLeaveRequests } from "@/lib/leave-api";
import type { Employee, HealthStatus, LeaveRequest } from "@/types/leave-app";
import { AdminWorkspace } from "./admin-workspace";
import { BackendHealth } from "./backend-health";
import { EmployeeSelfService } from "./employee-self-service";
import { InlineAlert } from "./inline-alert";
import { SummaryMetrics } from "./summary-metrics";
import { WorkspaceSwitcher, type Workspace } from "./workspace-switcher";

export function LeaveDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [health, setHealth] = useState<HealthStatus>();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [workspace, setWorkspace] = useState<Workspace>("employee");

  const refresh = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);
    try {
      const [healthStatus, employeeList, leaveRequests] = await Promise.all([
        getHealth(),
        getEmployees(),
        getLeaveRequests(),
      ]);
      setHealth(healthStatus);
      setEmployees(employeeList);
      setRequests(sortRequests(leaveRequests));
    } catch (loadError) {
      setHealth(undefined);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load LeaveApp data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackendHealth health={health} isLoading={isLoading} />
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
          disabled={isLoading}
          onClick={() => void refresh()}
          type="button"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <InlineAlert
          message={`${error}. Start the backend, then click Refresh.`}
          tone="error"
        />
      ) : null}

      <SummaryMetrics employees={employees} requests={requests} />

      <WorkspaceSwitcher activeWorkspace={workspace} onChange={setWorkspace} />

      {workspace === "employee" ? (
        <EmployeeSelfService
          employees={employees}
          onChanged={refresh}
          requests={requests}
        />
      ) : (
        <AdminWorkspace employees={employees} onChanged={refresh} requests={requests} />
      )}
    </div>
  );
}

function sortRequests(requests: LeaveRequest[]): LeaveRequest[] {
  return [...requests].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}
