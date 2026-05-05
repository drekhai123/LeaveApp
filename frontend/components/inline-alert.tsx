type AlertTone = "error" | "info" | "success";

const toneClasses: Record<AlertTone, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function InlineAlert({
  message,
  tone = "info",
}: {
  message: string;
  tone?: AlertTone;
}) {
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${toneClasses[tone]}`}>
      {message}
    </div>
  );
}
