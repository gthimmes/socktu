import Link from "next/link";
import { getEvidence } from "@/lib/data";
import { formatDate, relativeDays } from "@/lib/format";

const SOURCE_LABEL: Record<string, string> = {
  manual: "Manual",
  aws: "AWS",
  github: "GitHub",
  okta: "Okta",
  gsuite: "Google",
};

export default async function EvidencePage() {
  const evidence = await getEvidence();
  const now = Date.now();

  const fresh = evidence.filter((e) => !e.expiresAt || e.expiresAt.getTime() - now > 14 * 86400000);
  const attention = evidence.filter((e) => e.expiresAt && e.expiresAt.getTime() - now <= 14 * 86400000);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">Evidence vault</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          Every artifact your auditor will review, in one place — with automatic freshness tracking.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total artifacts" value={evidence.length} />
        <Stat label="Needs attention" value={attention.length} tone="amber" />
        <Stat
          label="Automated sources"
          value={evidence.filter((e) => e.source !== "manual").length}
        />
      </div>

      {attention.length > 0 && (
        <Section title="Needs attention" subtitle="Expiring or expired — refresh these to stay compliant.">
          {attention.map((e) => (
            <EvidenceRow key={e.id} e={e} now={now} />
          ))}
        </Section>
      )}

      <Section title="All evidence">
        {fresh.map((e) => (
          <EvidenceRow key={e.id} e={e} now={now} />
        ))}
      </Section>
    </div>
  );
}

function EvidenceRow({
  e,
  now,
}: {
  e: Awaited<ReturnType<typeof getEvidence>>[number];
  now: number;
}) {
  const daysLeft = e.expiresAt ? Math.ceil((e.expiresAt.getTime() - now) / 86400000) : null;
  const stale = daysLeft !== null && daysLeft <= 14;
  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink">{e.title}</div>
        <div className="mt-0.5 text-[11px] text-ink-faint">
          <Link href={`/controls/${e.controlId}`} className="font-medium text-brand-700 hover:underline">
            {e.control.name}
          </Link>{" "}
          · {e.control.criterion.ref} · collected {formatDate(e.collectedAt)}
        </div>
      </div>
      <span className="hidden shrink-0 text-xs text-ink-muted sm:block">
        {SOURCE_LABEL[e.source] ?? e.source}
      </span>
      <span className="w-24 shrink-0 text-right text-xs capitalize text-ink-muted">{e.type}</span>
      <span className="w-28 shrink-0 text-right">
        {e.expiresAt ? (
          <span
            className={`pill ring-1 ${
              stale
                ? daysLeft !== null && daysLeft < 0
                  ? "bg-red-50 text-red-700 ring-red-600/20"
                  : "bg-amber-50 text-amber-700 ring-amber-600/20"
                : "bg-green-50 text-green-700 ring-green-600/20"
            }`}
          >
            {daysLeft !== null && daysLeft < 0 ? "Expired" : relativeDays(e.expiresAt)}
          </span>
        ) : (
          <span className="text-[11px] text-ink-faint">no expiry</span>
        )}
      </span>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-3.5">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "amber" }) {
  return (
    <div className="card px-5 py-4">
      <div className={`text-3xl font-bold tabular-nums ${tone === "amber" ? "text-amber-600" : "text-ink"}`}>
        {value}
      </div>
      <div className="mt-1 stat-label">{label}</div>
    </div>
  );
}
