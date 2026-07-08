import Link from "next/link";
import { getAllTasks } from "@/lib/data";
import { TaskCheckbox } from "@/components/TaskCheckbox";
import { PriorityBadge, Avatar } from "@/components/Badges";
import { relativeDays } from "@/lib/format";

export default async function TasksPage() {
  const tasks = await getAllTasks();
  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Task queue</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Everything standing between you and audit-ready, ranked by impact. Work top to bottom.
          </p>
        </div>
        <span className="pill bg-brand-50 text-brand-700 ring-1 ring-brand-600/20">
          {open.length} open · {done.length} done
        </span>
      </header>

      <section className="card overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {open.map((t) => (
            <li key={t.id} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-slate-50/60">
              <div className="pt-0.5">
                <TaskCheckbox taskId={t.id} done={false} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{t.title}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                {t.detail && <p className="mt-0.5 text-xs text-ink-muted">{t.detail}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint">
                  {t.control && (
                    <Link
                      href={`/controls/${t.control.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {t.control.criterion.ref} · {t.control.name}
                    </Link>
                  )}
                  {t.dueDate && (
                    <span
                      className={
                        t.dueDate.getTime() < Date.now() ? "font-medium text-red-600" : ""
                      }
                    >
                      due {relativeDays(t.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              {t.owner && (
                <div className="hidden shrink-0 items-center gap-1.5 text-xs text-ink-muted sm:flex">
                  <Avatar name={t.owner.name} />
                  <span className="hidden md:inline">{t.owner.name}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Completed
          </h2>
          <div className="card overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {done.map((t) => (
                <li key={t.id} className="flex items-center gap-3.5 px-5 py-3">
                  <TaskCheckbox taskId={t.id} done={true} />
                  <span className="text-sm text-ink-faint line-through">{t.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
