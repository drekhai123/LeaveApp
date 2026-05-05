export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
