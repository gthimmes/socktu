import Link from "next/link";
import { notFound } from "next/navigation";
import { getControl, getOwners } from "@/lib/data";
import { StatusSelect } from "@/components/StatusSelect";
import { RemediationPanel } from "@/components/RemediationPanel";
import { PriorityBadge, Avatar } from "@/components/Badges";
import { addEvidence } from "@/app/actions";
import { formatDate, relativeDays } from "@/lib/format";

export default async function ControlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [control, owners] = await Promise.all([getControl(id), getOwners()]);
  if (!control) notFound();

  return (
    <div className="space-y-6">
      <Link href="/controls" className="text-xs font-medium text-ink-muted hover:text-ink">
        ← All controls
      </Link>

      <header className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-ink-faint">
              <span>{control.criterion.category.name}</span>
              <span>·</span>
              <span>{control.criterion.ref}</span>
              <span>·</span>
              <span>{control.criterion.title}</span>
              {control.gating && (
                <span className="pill bg-red-50 text-red-600 ring-1 ring-red-600/20">Gating control</span>
              )}
            </div>
            <h1 className="mt-1.5 text-xl font-bold text-ink">{control.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">{control.description}</p>
          </div>
          <div className="shrink-0">
            <StatusSelect controlId={control.id} status={control.status} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
          <Meta label="Owner">
            {control.owner ? (
              <span className="inline-flex items-center gap-1.5">
                <Avatar name={control.owner.name} />
                {control.owner.name}
              </span>
            ) : (
              <span className="text-ink-faint">Unassigned</span>
            )}
          </Meta>
          <Meta label="Weight">
            {control.weight === 3 ? "Critical" : control.weight === 2 ? "High" : "Standard"}
          </Meta>
          <Meta label="Last updated">{formatDate(control.updatedAt)}</Meta>
        </div>
      </header>

      {/* Guided remediation — the "clear this control" flow */}
      <RemediationPanel
        controlId={control.id}
        status={control.status}
        steps={control.steps}
        requests={control.requests}
        owners={owners}
      />

      {/* How to satisfy */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-ink">How to satisfy this</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{control.guidance}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Evidence */}
        <section className="card p-6">
          <h2 className="text-sm font-bold text-ink">Evidence</h2>
          <p className="text-xs text-ink-muted">Proof an auditor can review.</p>

          <ul className="mt-4 space-y-2">
            {control.evidence.length === 0 && (
              <li className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-ink-muted">
                No evidence yet. Add the first piece below.
              </li>
            )}
            {control.evidence.map((e) => {
              const daysLeft = e.expiresAt
                ? Math.ceil((e.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                : null;
              const stale = daysLeft !== null && daysLeft <= 14;
              return (
                <li key={e.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-ink">{e.title}</div>
                      <div className="mt-0.5 text-[11px] text-ink-faint">
                        {e.type} · {e.source} · collected {formatDate(e.collectedAt)}
                      </div>
                    </div>
                    {e.expiresAt && (
                      <span
                        className={`pill shrink-0 ring-1 ${
                          stale
                            ? "bg-amber-50 text-amber-700 ring-amber-600/20"
                            : "bg-slate-50 text-ink-muted ring-slate-500/10"
                        }`}
                      >
                        {daysLeft !== null && daysLeft < 0 ? "Expired" : `Expires ${relativeDays(e.expiresAt)}`}
                      </span>
                    )}
                  </div>
                  {e.note && <div className="mt-1.5 text-xs text-ink-muted">{e.note}</div>}
                </li>
              );
            })}
          </ul>

          {/* Add evidence */}
          <form action={addEvidence} className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            <input type="hidden" name="controlId" value={control.id} />
            <input
              name="title"
              required
              placeholder="Evidence title (e.g. 'MFA policy screenshot')"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <div className="flex gap-2">
              <select
                name="type"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink-muted focus:outline-none"
              >
                <option value="document">Document</option>
                <option value="screenshot">Screenshot</option>
                <option value="config">Config export</option>
                <option value="attestation">Attestation</option>
                <option value="log">Log</option>
              </select>
              <input
                name="expiresInDays"
                type="number"
                min="1"
                placeholder="Expires in (days)"
                className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
              />
              <button type="submit" className="btn-primary ml-auto">
                Add evidence
              </button>
            </div>
          </form>
        </section>

        {/* Tasks */}
        <section className="card p-6">
          <h2 className="text-sm font-bold text-ink">Tasks</h2>
          <p className="text-xs text-ink-muted">Work needed to get this control green.</p>
          <ul className="mt-4 space-y-2">
            {control.tasks.length === 0 && (
              <li className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-ink-muted">
                No open tasks for this control.
              </li>
            )}
            {control.tasks.map((t) => (
              <li key={t.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium text-ink">{t.title}</div>
                  <PriorityBadge priority={t.priority} />
                </div>
                {t.detail && <div className="mt-1 text-xs text-ink-muted">{t.detail}</div>}
                <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-faint">
                  {t.status === "done" ? (
                    <span className="text-green-600">Done</span>
                  ) : (
                    t.dueDate && <span>due {relativeDays(t.dueDate)}</span>
                  )}
                  {t.owner && <span>· {t.owner.name}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink">{children}</div>
    </div>
  );
}
