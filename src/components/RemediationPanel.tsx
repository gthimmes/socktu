"use client";

import { useTransition } from "react";
import {
  toggleStep,
  addStep,
  createEvidenceRequest,
  updateRequestStatus,
  markControlSatisfied,
} from "@/app/actions";
import { relativeDays } from "@/lib/format";

type Step = { id: string; text: string; done: boolean };
type Request = {
  id: string;
  description: string;
  status: string;
  dueDate: Date | null;
  owner: { name: string } | null;
};
type Owner = { id: string; name: string; role: string };

const REQ_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  requested: { label: "Requested", bg: "bg-slate-100", text: "text-slate-600" },
  submitted: { label: "Submitted", bg: "bg-amber-50", text: "text-amber-700" },
  accepted: { label: "Accepted", bg: "bg-green-50", text: "text-green-700" },
};

export function RemediationPanel({
  controlId,
  status,
  steps,
  requests,
  owners,
}: {
  controlId: string;
  status: string;
  steps: Step[];
  requests: Request[];
  owners: Owner[];
}) {
  const [pending, startTransition] = useTransition();
  const done = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = total > 0 && done === total;
  const isSatisfied = status === "satisfied";

  return (
    <section className="card overflow-hidden border-brand-200">
      <div className="border-b border-brand-100 bg-brand-50/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink">
              {isSatisfied ? "Keep this control healthy" : "Clear this control"}
            </h2>
            <p className="text-xs text-ink-muted">
              {isSatisfied
                ? "Steps and evidence that keep this satisfied."
                : "Work these steps and gather evidence to turn this control green."}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold tabular-nums text-brand-700">
              {done}/{total} steps
            </div>
            <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2">
        {/* Steps */}
        <div>
          <h3 className="stat-label mb-2">Remediation steps</h3>
          <ul className="space-y-1.5">
            {steps.map((s) => (
              <li key={s.id} className="flex items-start gap-2.5">
                <button
                  aria-label={s.done ? "Mark step not done" : "Mark step done"}
                  disabled={pending}
                  onClick={() => startTransition(() => void toggleStep(s.id))}
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    s.done ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white hover:border-brand-500"
                  }`}
                >
                  {s.done && <span className="text-[9px] leading-none">✓</span>}
                </button>
                <span className={`text-sm ${s.done ? "text-ink-faint line-through" : "text-ink-soft"}`}>
                  {s.text}
                </span>
              </li>
            ))}
            {steps.length === 0 && (
              <li className="text-sm text-ink-muted">No steps yet — add the first one below.</li>
            )}
          </ul>

          <form action={addStep} className="mt-3 flex gap-2">
            <input type="hidden" name="controlId" value={controlId} />
            <input
              name="text"
              required
              placeholder="Add a step…"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <button type="submit" className="btn-ghost border border-slate-200 py-1.5 text-xs">
              Add
            </button>
          </form>

          {allDone && !isSatisfied && (
            <button
              disabled={pending}
              onClick={() => startTransition(() => void markControlSatisfied(controlId))}
              className="btn-primary mt-4 w-full"
            >
              ✓ All steps done — mark this control satisfied
            </button>
          )}
        </div>

        {/* Evidence requests */}
        <div className="md:border-l md:border-slate-100 md:pl-6">
          <h3 className="stat-label mb-2">Evidence requests</h3>
          <ul className="space-y-2">
            {requests.map((r) => {
              const m = REQ_STATUS[r.status] ?? REQ_STATUS.requested;
              return (
                <li key={r.id} className="rounded-lg border border-slate-100 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-ink">{r.description}</span>
                    <span className={`pill shrink-0 ${m.bg} ${m.text}`}>{m.label}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-ink-faint">
                      {r.owner ? r.owner.name : "Unassigned"}
                      {r.dueDate && ` · due ${relativeDays(r.dueDate)}`}
                    </span>
                    <select
                      value={r.status}
                      disabled={pending}
                      onChange={(e) =>
                        startTransition(() => void updateRequestStatus(r.id, e.target.value))
                      }
                      className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-ink-muted focus:outline-none"
                    >
                      <option value="requested">Requested</option>
                      <option value="submitted">Submitted</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </div>
                </li>
              );
            })}
            {requests.length === 0 && (
              <li className="text-sm text-ink-muted">No evidence requested yet.</li>
            )}
          </ul>

          <form action={createEvidenceRequest} className="mt-3 space-y-2">
            <input type="hidden" name="controlId" value={controlId} />
            <input
              name="description"
              required
              placeholder="What evidence do you need?"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <div className="flex gap-2">
              <select
                name="ownerId"
                className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-ink-muted focus:outline-none"
              >
                <option value="">Assign to…</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.role})
                  </option>
                ))}
              </select>
              <input
                name="dueInDays"
                type="number"
                min="1"
                placeholder="Due (days)"
                className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none"
              />
              <button type="submit" className="btn-ghost border border-slate-200 py-1.5 text-xs">
                Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
