import { buildReport, getShareLinks } from "@/lib/data";
import { ReportView } from "@/components/ReportView";
import { ReportToolbar } from "@/components/ReportToolbar";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const [data, links] = await Promise.all([buildReport(), getShareLinks()]);

  return (
    <div>
      <ReportToolbar links={links} />
      <div className="card p-8 print:border-0 print:shadow-none print:p-0">
        <ReportView data={data} />
      </div>
    </div>
  );
}
