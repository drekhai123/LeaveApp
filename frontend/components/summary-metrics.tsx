import type { Employee, LeaveRequest } from "@/types/leave-app";

export function SummaryMetrics({
  employees,
  requests,
}: {
  employees: Employee[];
  requests: LeaveRequest[];
}) {
  const metrics = [
    { label: "Employees", value: employees.length },
    {
      label: "Pending",
      value: requests.filter((request) => request.status === "pending").length,
    },
    {
      label: "Approved",
      value: requests.filter((request) => request.status === "approved").length,
    },
    {
      label: "Rejected",
      value: requests.filter((request) => request.status === "rejected").length,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          className="rounded-md border border-slate-200 bg-white p-4"
          key={metric.label}
        >
          <p className="text-sm text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}
