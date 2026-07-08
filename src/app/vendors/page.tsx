import { getVendors } from "@/lib/data";
import { formatDate } from "@/lib/format";

const RISK: Record<string, { text: string; bg: string }> = {
  high: { text: "text-red-700", bg: "bg-red-50" },
  medium: { text: "text-amber-700", bg: "bg-amber-50" },
  low: { text: "text-slate-600", bg: "bg-slate-100" },
};

const VENDOR_STATUS: Record<string, { label: string; text: string; bg: string; ring: string }> = {
  reviewed: { label: "Reviewed", text: "text-green-700", bg: "bg-green-50", ring: "ring-green-600/20" },
  pending: { label: "Pending", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-600/20" },
  flagged: { label: "Flagged", text: "text-red-700", bg: "bg-red-50", ring: "ring-red-600/20" },
};

export default async function VendorsPage() {
  const vendors = await getVendors();
  const reviewed = vendors.filter((v) => v.status === "reviewed").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">Vendors</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          Third parties that touch your data — {reviewed}/{vendors.length} reviewed.
        </p>
      </header>

      <section className="card overflow-hidden">
        <div className="grid grid-cols-[1fr,auto,auto,auto,auto] items-center gap-4 border-b border-slate-100 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          <span>Vendor</span>
          <span className="w-20 text-right">Risk</span>
          <span className="w-20 text-center">SOC 2</span>
          <span className="w-28 text-right">Reviewed</span>
          <span className="w-24 text-right">Status</span>
        </div>
        <ul className="divide-y divide-slate-100">
          {vendors.map((v) => {
            const risk = RISK[v.risk] ?? RISK.low;
            const st = VENDOR_STATUS[v.status] ?? VENDOR_STATUS.pending;
            return (
              <li
                key={v.id}
                className="grid grid-cols-[1fr,auto,auto,auto,auto] items-center gap-4 px-5 py-3 hover:bg-slate-50/60"
              >
                <div>
                  <div className="text-sm font-medium text-ink">{v.name}</div>
                  <div className="text-[11px] text-ink-faint">{v.service}</div>
                </div>
                <span className="w-20 text-right">
                  <span className={`pill ${risk.bg} ${risk.text} capitalize`}>{v.risk}</span>
                </span>
                <span className="w-20 text-center text-sm">
                  {v.hasSoc2 ? <span className="text-green-600">✓</span> : <span className="text-ink-faint">—</span>}
                </span>
                <span className="w-28 text-right text-xs text-ink-muted">
                  {v.reviewedAt ? formatDate(v.reviewedAt) : "—"}
                </span>
                <span className="w-24 text-right">
                  <span className={`pill ring-1 ${st.bg} ${st.text} ${st.ring}`}>{st.label}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
