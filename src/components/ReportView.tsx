import type { ReportData } from "@/lib/data";
import { readinessVerdict } from "@/lib/readiness";
import { statusMeta } from "@/lib/status";
import { StatusBadge } from "./Badges";
import { Sparkline } from "./Sparkline";
import { formatDate } from "@/lib/format";

// The audit-readiness report. Rendered identically for the internal /report
// page and the public /share/[token] page.
export function ReportView({ data }: { data: ReportData }) {
  const { company, readiness, categories, trend, generatedAt } = data;
  const verdict = readinessVerdict(readiness);
  const scored = statusMeta("satisfied");
  const inScope = categories.filter((c) => c.inScope);

  return (
    <article className="mx-auto max-w-4xl bg-white text-ink print:max-w-none">
      {/* Header */}
      <header className="flex items-start justify-between border-b-2 border-ink pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              S
            </div>
            <span className="text-sm font-bold text-ink">SockTu</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-ink">Audit-Readiness Report</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {company.name} · {company.framework}
          </p>
          <p className="text-xs text-ink-faint">Scope: {company.scope}</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold tabular-nums" style={{ color: scoreColor(readiness.score) }}>
            {readiness.score}%
          </div>
          <div className="stat-label mt-1">Ready</div>
          <div className="mt-2 text-[11px] text-ink-faint">Generated {formatDate(generatedAt)}</div>
        </div>
      </header>

      {/* Executive summary */}
      <section className="mt-6 break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wide text-ink-faint">Executive summary</h2>
        <div className="mt-2 rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-lg font-bold text-ink">{verdict.headline}</p>
              <p className="mt-1 text-sm text-ink-muted">{verdict.sub}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <Count label="Satisfied" value={readiness.counts.satisfied} tone="satisfied" />
                <Count label="At risk" value={readiness.counts.at_risk} tone="at_risk" />
                <Count label="Failing" value={readiness.counts.failing} tone="failing" />
                <Count label="Not started" value={readiness.counts.not_started} tone="not_started" />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[11px] font-medium text-ink-faint">Readiness over time</div>
              <Sparkline points={trend.map((t) => ({ score: t.score, capturedAt: t.capturedAt }))} />
              <div className="text-[11px] text-ink-faint">
                {trend.length > 1 && (
                  <>
                    +{readiness.score - trend[0].score} pts over {trend.length} weeks
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Category bars */}
          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
            {readiness.byCategory.map((c) => (
              <div key={c.code} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs font-medium text-ink-muted">{c.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${c.score}%` }} />
                </div>
                <span className="w-24 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                  {c.satisfied}/{c.total} · {c.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open blockers */}
      <section className="mt-6 break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Open blockers ({readiness.blockers.length})
        </h2>
        {readiness.blockers.length === 0 ? (
          <p className="mt-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            No open blockers — every gating control is satisfied.
          </p>
        ) : (
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="py-1.5 font-semibold">Control</th>
                <th className="py-1.5 font-semibold">Criterion</th>
                <th className="py-1.5 font-semibold">Owner</th>
                <th className="py-1.5 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {readiness.blockers.map((b) => (
                <tr key={b.controlId} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-medium text-ink">{b.name}</td>
                  <td className="py-2 pr-3 text-ink-muted">{b.criterionRef}</td>
                  <td className="py-2 pr-3 text-ink-muted">{b.owner ?? "—"}</td>
                  <td className="py-2 text-right">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Control detail by category */}
      <section className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Controls &amp; evidence
        </h2>
        <div className="mt-2 space-y-5">
          {inScope.map((cat) => {
            const controls = cat.criteria.flatMap((cr) =>
              cr.controls.map((ctrl) => ({ ...ctrl, ref: cr.ref }))
            );
            const satisfied = controls.filter((c) => c.status === "satisfied").length;
            return (
              <div key={cat.id} className="break-inside-avoid">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h3 className="text-sm font-bold text-ink">
                    <span className="mr-2 text-brand-700">{cat.code}</span>
                    {cat.name}
                  </h3>
                  <span className="text-xs tabular-nums text-ink-muted">
                    {satisfied}/{controls.length} satisfied
                  </span>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {controls.map((ctrl) => (
                      <tr key={ctrl.id} className="border-b border-slate-100 align-top">
                        <td className="w-14 py-2 pr-2 text-[11px] text-ink-faint">{ctrl.ref}</td>
                        <td className="py-2 pr-3">
                          <div className="font-medium text-ink">{ctrl.name}</div>
                          {ctrl.evidence.length > 0 ? (
                            <ul className="mt-1 space-y-0.5">
                              {ctrl.evidence.map((e) => (
                                <li key={e.id} className="text-[11px] text-ink-muted">
                                  <span className="text-brand-700">◦</span> {e.title}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="mt-0.5 text-[11px] italic text-ink-faint">No evidence yet</div>
                          )}
                        </td>
                        <td className="w-28 py-2 text-right">
                          <span
                            className={`pill ${statusMeta(ctrl.status).bg} ${statusMeta(ctrl.status).text}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta(ctrl.status).dot}`} />
                            {statusMeta(ctrl.status).label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-4 text-[11px] text-ink-faint">
        <p>
          Generated by SockTu on {formatDate(generatedAt)}. This report reflects self-assessed control status
          and attached evidence. Confidential — intended for the named recipient only.
        </p>
      </footer>
    </article>
  );
}

function Count({ label, value, tone }: { label: string; value: number; tone: string }) {
  const m = statusMeta(tone);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${m.dot}`} />
      <span className="font-bold tabular-nums text-ink">{value}</span>
      <span className="text-ink-muted">{label}</span>
    </span>
  );
}

function scoreColor(score: number): string {
  return score >= 90 ? "#16a34a" : score >= 70 ? "#1eae82" : score >= 45 ? "#d97706" : "#dc2626";
}
