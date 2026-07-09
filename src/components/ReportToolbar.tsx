"use client";

import { useState, useTransition } from "react";
import { createShareLink, revokeShareLink } from "@/app/actions";
import { formatDate } from "@/lib/format";

type Link = {
  id: string;
  token: string;
  label: string;
  revoked: boolean;
  expiresAt: Date | null;
  createdAt: Date;
};

export function ReportToolbar({ links }: { links: Link[] }) {
  const [open, setOpen] = useState(false);
  const active = links.filter((l) => !l.revoked);

  return (
    <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-ink">Audit report</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          A clean, shareable snapshot of your posture — ready to hand to an auditor or a prospect.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen((v) => !v)} className="btn-ghost border border-slate-200">
          🔗 Share {active.length > 0 && `(${active.length})`}
        </button>
        <button onClick={() => window.print()} className="btn-primary">
          ⤓ Export PDF
        </button>
      </div>

      {open && (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <h3 className="text-sm font-bold text-ink">Share this report</h3>
          <p className="text-xs text-ink-muted">
            Anyone with the link sees a read-only copy — no login required. Revoke anytime.
          </p>

          <form action={createShareLink} className="mt-3 flex flex-wrap gap-2">
            <input
              name="label"
              placeholder="Who's this for? (e.g. Prescient Audit LLC)"
              className="min-w-[240px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <input
              name="expiresInDays"
              type="number"
              min="1"
              placeholder="Expires in (days)"
              className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
            />
            <button type="submit" className="btn-primary">
              Create link
            </button>
          </form>

          {active.length > 0 && (
            <ul className="mt-4 space-y-2">
              {active.map((l) => (
                <ShareRow key={l.id} link={l} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ShareRow({ link }: { link: Link }) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const url = typeof window !== "undefined" ? `${window.location.origin}/share/${link.token}` : "";

  return (
    <li className="flex items-center gap-2 rounded-lg border border-slate-100 p-2.5">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">{link.label}</div>
        <div className="truncate text-[11px] text-ink-faint">
          {url}
          {link.expiresAt && ` · expires ${formatDate(link.expiresAt)}`}
        </div>
      </div>
      <button
        onClick={() => {
          void navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="btn-ghost border border-slate-200 py-1.5 text-xs"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => void revokeShareLink(link.id))}
        className="btn-ghost py-1.5 text-xs text-red-600 hover:bg-red-50"
      >
        Revoke
      </button>
    </li>
  );
}
