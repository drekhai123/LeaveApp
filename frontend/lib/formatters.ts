import type { EmployeeRole, LeaveRequestStatus } from "@/types/leave-app";

export function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function roleLabel(role: EmployeeRole): string {
  const labels: Record<EmployeeRole, string> = {
    employee: "Employee",
    hr: "HR",
    manager: "Manager",
  };

  return labels[role];
}

export function statusLabel(status: LeaveRequestStatus): string {
  const labels: Record<LeaveRequestStatus, string> = {
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
  };

  return labels[status];
}
