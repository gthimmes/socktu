import { notFound } from "next/navigation";
import { buildReport, getShareLink } from "@/lib/data";
import { ReportView } from "@/components/ReportView";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await getShareLink(token);
  if (!link) notFound();

  const data = await buildReport();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <span className="text-xs text-ink-muted">
            🔒 Read-only shared report · {link.label}
          </span>
          <span className="text-[11px] text-ink-faint">
            Shared {formatDate(link.createdAt)}
            {link.expiresAt && ` · expires ${formatDate(link.expiresAt)}`}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8 print:px-0 print:py-0">
        <div className="card p-8 print:border-0 print:shadow-none print:p-0">
          <ReportView data={data} />
        </div>
        <p className="no-print mt-4 text-center text-[11px] text-ink-faint">
          Powered by <span className="font-semibold text-brand-700">SockTu</span> — SOC 2, made clear
        </p>
      </div>
    </div>
  );
}
