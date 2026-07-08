// Shared vocabulary for statuses across the app — one source of truth for
// labels, colors, and ordering so the UI stays consistent.

export type ControlStatus = "satisfied" | "at_risk" | "failing" | "not_started";

export const CONTROL_STATUS: Record<
  ControlStatus,
  { label: string; dot: string; text: string; bg: string; ring: string; score: number }
> = {
  satisfied: {
    label: "Satisfied",
    dot: "bg-satisfied",
    text: "text-green-700",
    bg: "bg-green-50",
    ring: "ring-green-600/20",
    score: 1,
  },
  at_risk: {
    label: "At risk",
    dot: "bg-risk",
    text: "text-amber-700",
    bg: "bg-amber-50",
    ring: "ring-amber-600/20",
    score: 0.5,
  },
  failing: {
    label: "Failing",
    dot: "bg-failing",
    text: "text-red-700",
    bg: "bg-red-50",
    ring: "ring-red-600/20",
    score: 0,
  },
  not_started: {
    label: "Not started",
    dot: "bg-pending",
    text: "text-slate-600",
    bg: "bg-slate-100",
    ring: "ring-slate-500/20",
    score: 0,
  },
};

export type Priority = "critical" | "high" | "medium" | "low";

export const PRIORITY: Record<Priority, { label: string; rank: number; text: string; bg: string }> = {
  critical: { label: "Critical", rank: 0, text: "text-red-700", bg: "bg-red-50" },
  high: { label: "High", rank: 1, text: "text-amber-700", bg: "bg-amber-50" },
  medium: { label: "Medium", rank: 2, text: "text-slate-700", bg: "bg-slate-100" },
  low: { label: "Low", rank: 3, text: "text-slate-500", bg: "bg-slate-100" },
};

export function statusMeta(status: string) {
  return CONTROL_STATUS[(status as ControlStatus)] ?? CONTROL_STATUS.not_started;
}

export function priorityMeta(priority: string) {
  return PRIORITY[(priority as Priority)] ?? PRIORITY.medium;
}
