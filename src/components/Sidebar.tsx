"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Readiness", icon: "◎" },
  { href: "/controls", label: "Controls", icon: "▤" },
  { href: "/evidence", label: "Evidence", icon: "▣" },
  { href: "/tasks", label: "Task queue", icon: "✓" },
  { href: "/policies", label: "Policies", icon: "§" },
  { href: "/vendors", label: "Vendors", icon: "⬡" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
          S
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-bold text-ink">SockTu</div>
          <div className="text-[11px] text-ink-faint">SOC 2, made clear</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:bg-slate-50 hover:text-ink"
              }`}
            >
              <span className={`w-4 text-center ${active ? "text-brand-600" : "text-ink-faint"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-ink-muted">
            NW
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-ink">Northwind Inc.</div>
            <div className="text-[11px] text-ink-faint">SOC 2 Type I · in progress</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
