import { statusMeta, priorityMeta } from "@/lib/status";

export function StatusBadge({ status }: { status: string }) {
  const m = statusMeta(status);
  return (
    <span className={`pill ${m.bg} ${m.text} ring-1 ${m.ring}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const m = priorityMeta(priority);
  return <span className={`pill ${m.bg} ${m.text}`}>{m.label}</span>;
}

export function Avatar({ name }: { name: string }) {
  const init = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
      {init}
    </span>
  );
}
