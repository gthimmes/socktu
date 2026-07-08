"use client";

import { useTransition } from "react";
import { setControlStatus } from "@/app/actions";
import { CONTROL_STATUS, type ControlStatus } from "@/lib/status";

const ORDER: ControlStatus[] = ["satisfied", "at_risk", "failing", "not_started"];

export function StatusSelect({ controlId, status }: { controlId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const m = CONTROL_STATUS[(status as ControlStatus)] ?? CONTROL_STATUS.not_started;

  return (
    <div className={`relative inline-flex items-center ${pending ? "opacity-60" : ""}`}>
      <span className={`pointer-events-none absolute left-2.5 h-1.5 w-1.5 rounded-full ${m.dot}`} />
      <select
        value={status}
        disabled={pending}
        onChange={(e) =>
          startTransition(() => {
            void setControlStatus(controlId, e.target.value);
          })
        }
        className={`appearance-none rounded-lg border border-slate-200 py-1.5 pl-6 pr-8 text-xs font-medium ${m.text} ${m.bg} cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-300`}
      >
        {ORDER.map((s) => (
          <option key={s} value={s} className="bg-white text-ink">
            {CONTROL_STATUS[s].label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-ink-faint">▾</span>
    </div>
  );
}
