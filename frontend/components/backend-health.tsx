import type { HealthStatus } from "@/types/leave-app";

export function BackendHealth({
  health,
  isLoading,
}: {
  health?: HealthStatus;
  isLoading: boolean;
}) {
  const isOnline = health?.status === "ok";

  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isLoading ? "bg-amber-400" : isOnline ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      <span className="font-medium text-slate-900">
        {isLoading ? "Checking backend" : isOnline ? "Backend online" : "Backend offline"}
      </span>
      {health?.version ? (
        <span className="text-slate-500">v{health.version}</span>
      ) : null}
    </div>
  );
}
