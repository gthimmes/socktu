import Link from "next/link";
import { getControlsGrouped } from "@/lib/data";
import { StatusSelect } from "@/components/StatusSelect";
import { Avatar } from "@/components/Badges";

export default async function ControlsPage() {
  const categories = await getControlsGrouped();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">Controls</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          Every control in plain English, mapped to the Trust Services Criteria. Change a status inline.
        </p>
      </header>

      {categories.map((cat) => {
        const controls = cat.criteria.flatMap((cr) => cr.controls);
        const satisfied = controls.filter((c) => c.status === "satisfied").length;
        return (
          <section key={cat.id} className="card overflow-hidden">
            <div
              className={`flex items-center justify-between border-b border-slate-100 px-5 py-3.5 ${
                cat.inScope ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                  {cat.code}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-ink">{cat.name}</h2>
                    {!cat.inScope && (
                      <span className="pill bg-slate-100 text-slate-500">Out of scope</span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted">{cat.summary}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-muted">
                {satisfied}/{controls.length} satisfied
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {cat.criteria.map((cr) =>
                cr.controls.map((control) => (
                  <div
                    key={control.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60"
                  >
                    <Link href={`/controls/${control.id}`} className="min-w-0 flex-1 group">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-ink group-hover:text-brand-700">
                          {control.name}
                        </span>
                        {control.gating && (
                          <span className="pill bg-red-50 text-red-600 ring-1 ring-red-600/20">
                            Gating
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-faint">
                        <span className="font-medium">{cr.ref}</span>
                        <span>·</span>
                        <span className="truncate">{cr.title}</span>
                        <span>·</span>
                        <span>
                          {control.evidence.length} evidence · {control.tasks.length} task
                          {control.tasks.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </Link>

                    {control.owner && (
                      <div className="hidden shrink-0 items-center gap-1.5 text-xs text-ink-muted sm:flex">
                        <Avatar name={control.owner.name} />
                        <span className="hidden md:inline">{control.owner.name}</span>
                      </div>
                    )}

                    <div className="shrink-0">
                      <StatusSelect controlId={control.id} status={control.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
