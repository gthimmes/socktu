import Link from "next/link";
import { getReadiness, getNextActions } from "@/lib/data";
import { readinessVerdict } from "@/lib/readiness";
import { ReadinessRing } from "@/components/ReadinessRing";
import { StatusBadge, PriorityBadge, Avatar } from "@/components/Badges";
import { statusMeta } from "@/lib/status";
import { relativeDays } from "@/lib/format";

export default async function DashboardPage() {
  const [readiness, nextActions] = await Promise.all([getReadiness(), getNextActions(4)]);
  const verdict = readinessVerdict(readiness);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Readiness</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Northwind Inc. · SOC 2 Type I · targeting audit in ~6 weeks
          </p>
        </div>
        <Link href="/tasks" className="btn-primary">
          Work the queue →
        </Link>
      </header>

      {/* HERO */}
      <section className="card overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-[auto,1fr]">
          <div className="flex items-center justify-center md:border-r md:border-slate-100 md:pr-6">
            <ReadinessRing score={readiness.score} />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-bold text-ink">{verdict.headline}</h2>
            <p className="mt-1 text-sm text-ink-muted">{verdict.sub}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCount label="Satisfied" value={readiness.counts.satisfied} tone="satisfied" />
              <StatCount label="At risk" value={readiness.counts.at_risk} tone="at_risk" />
              <StatCount label="Failing" value={readiness.counts.failing} tone="failing" />
              <StatCount label="Not started" value={readiness.counts.not_started} tone="not_started" />
            </div>

            {/* Category breakdown */}
            <div className="mt-5 space-y-2.5">
              {readiness.byCategory.map((c) => (
                <div key={c.code} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-ink-muted">{c.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-ink">
                    {c.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* BLOCKERS — the core value */}
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink">What&apos;s blocking your audit</h3>
              <p className="text-xs text-ink-muted">Required controls that must be satisfied first.</p>
            </div>
            <span className="pill bg-red-50 text-red-700 ring-1 ring-red-600/20">
              {readiness.blockers.length} blocker{readiness.blockers.length === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {readiness.blockers.length === 0 && (
              <li className="rounded-lg bg-green-50 px-4 py-6 text-center text-sm text-green-700">
                🎉 No blockers. Every gating control is satisfied.
              </li>
            )}
            {readiness.blockers.map((b) => (
              <li key={b.controlId}>
                <Link
                  href={`/controls/${b.controlId}`}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${statusMeta(b.status).dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink">{b.name}</span>
                      <span className="shrink-0 text-[11px] font-medium text-ink-faint">{b.criterionRef}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted">{b.reason}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={b.status} />
                    {b.owner && <div className="mt-1 text-[11px] text-ink-faint">{b.owner}</div>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* NEXT ACTIONS */}
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink">Your next moves</h3>
              <p className="text-xs text-ink-muted">The highest-impact things to do right now.</p>
            </div>
            <Link href="/tasks" className="text-xs font-semibold text-brand-700 hover:underline">
              View all →
            </Link>
          </div>

          <ol className="mt-4 space-y-2">
            {nextActions.map((t, i) => (
              <li
                key={t.id}
                className="flex items-start gap-3 rounded-lg border border-slate-100 p-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-ink-muted">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink">{t.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint">
                    <PriorityBadge priority={t.priority} />
                    {t.dueDate && <span>due {relativeDays(t.dueDate)}</span>}
                    {t.owner && (
                      <span className="inline-flex items-center gap-1">
                        <Avatar name={t.owner.name} />
                        {t.owner.name}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* EVIDENCE FRESHNESS */}
      {readiness.expiring.length > 0 && (
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink">Evidence needing attention</h3>
              <p className="text-xs text-ink-muted">
                Controls can silently fall out of compliance when evidence goes stale.
              </p>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {readiness.expiring.map((e, i) => (
              <li key={i} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-ink">{e.controlName}</span>
                <span
                  className={`pill ring-1 ${
                    e.expired
                      ? "bg-red-50 text-red-700 ring-red-600/20"
                      : "bg-amber-50 text-amber-700 ring-amber-600/20"
                  }`}
                >
                  {e.expired ? "Expired" : `Expires in ${e.daysLeft}d`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatCount({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  const m = statusMeta(tone);
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${m.dot}`} />
        <span className="text-2xl font-bold tabular-nums text-ink">{value}</span>
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-ink-muted">{label}</div>
    </div>
  );
}
