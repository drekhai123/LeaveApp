export type Workspace = "employee" | "admin";

export function WorkspaceSwitcher({
  activeWorkspace,
  onChange,
}: {
  activeWorkspace: Workspace;
  onChange: (workspace: Workspace) => void;
}) {
  return (
    <div className="inline-grid grid-cols-2 rounded-md border border-slate-200 bg-white p-1">
      <button
        className={buttonClassName(activeWorkspace === "employee")}
        onClick={() => onChange("employee")}
        type="button"
      >
        Nhan vien
      </button>
      <button
        className={buttonClassName(activeWorkspace === "admin")}
        onClick={() => onChange("admin")}
        type="button"
      >
        Quan ly / HR
      </button>
    </div>
  );
}

function buttonClassName(isActive: boolean): string {
  return [
    "rounded px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-slate-950 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");
}
