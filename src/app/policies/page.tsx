import { getPolicies } from "@/lib/data";
import { formatDate } from "@/lib/format";

const POLICY_STATUS: Record<string, { label: string; text: string; bg: string; ring: string }> = {
  approved: { label: "Approved", text: "text-green-700", bg: "bg-green-50", ring: "ring-green-600/20" },
  draft: { label: "Draft", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-600/20" },
  needs_review: { label: "Needs review", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-600/20" },
  missing: { label: "Missing", text: "text-red-700", bg: "bg-red-50", ring: "ring-red-600/20" },
};

export default async function PoliciesPage() {
  const policies = await getPolicies();
  const approved = policies.filter((p) => p.status === "approved").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">Policies</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          The written policies auditors expect — {approved}/{policies.length} approved.
        </p>
      </header>

      <section className="card overflow-hidden">
        <div className="grid grid-cols-[1fr,auto,auto,auto] items-center gap-4 border-b border-slate-100 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          <span>Policy</span>
          <span className="w-16 text-right">Version</span>
          <span className="w-32 text-right">Next review</span>
          <span className="w-28 text-right">Status</span>
        </div>
        <ul className="divide-y divide-slate-100">
          {policies.map((p) => {
            const m = POLICY_STATUS[p.status] ?? POLICY_STATUS.missing;
            const overdue = p.reviewBy && p.reviewBy.getTime() < Date.now();
            return (
              <li
                key={p.id}
                className="grid grid-cols-[1fr,auto,auto,auto] items-center gap-4 px-5 py-3 hover:bg-slate-50/60"
              >
                <div>
                  <div className="text-sm font-medium text-ink">{p.name}</div>
                  {p.owner && <div className="text-[11px] text-ink-faint">{p.owner}</div>}
                </div>
                <span className="w-16 text-right text-xs tabular-nums text-ink-muted">{p.version}</span>
                <span
                  className={`w-32 text-right text-xs ${overdue ? "font-medium text-red-600" : "text-ink-muted"}`}
                >
                  {p.reviewBy ? formatDate(p.reviewBy) : "—"}
                </span>
                <span className="w-28 text-right">
                  <span className={`pill ring-1 ${m.bg} ${m.text} ${m.ring}`}>{m.label}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
