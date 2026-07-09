# SockTu — SOC 2, made clear

**The SOC 2 tracker that answers the only question that matters:**
_"Am I ready for my audit, and what exactly is blocking me?"_

Vanta and Drata are powerful but overwhelming — hundreds of noisy controls and
jargon nobody reads. SockTu wins on **radical clarity**: one screen tells you your
readiness score, the handful of things blocking your audit, and your single next
move. Plain-English controls. Evidence capture in seconds. Nothing to decode.

> Run `npm run dev` and open the dashboard to see it: a readiness ring, live
> status counts, per-category progress, your audit blockers, and a ranked
> next-moves queue — all on one screen.

## What's inside

- **Readiness dashboard** — a weighted readiness score, live status counts, a
  per-category breakdown, the exact controls blocking your audit, and a ranked
  "next moves" queue.
- **Controls** — every control written in plain English, mapped to the Trust
  Services Criteria (CC / A / C / PI / P). Change any status inline.
- **Evidence vault** — every artifact an auditor will review, with automatic
  freshness tracking so nothing silently goes stale.
- **Task queue** — everything between you and audit-ready, ranked by impact.
- **Audit report** — a clean, printable posture report (readiness + trend, open
  blockers, and the full control→evidence mapping) you can **export to PDF** or
  hand to an auditor via a **read-only share link** (`/share/[token]`, no login).
- **Policies & Vendors** — policy approval/review tracking and third-party risk.

## The readiness engine

The differentiator lives in [`src/lib/readiness.ts`](src/lib/readiness.ts):

- **Score** = weighted % of controls satisfied (`satisfied` = full credit,
  `at_risk` = half, `failing`/`not_started` = none), across in-scope categories only.
- **Blockers** = *gating* controls that aren't satisfied — the things that will
  literally fail your audit.
- **Freshness** = evidence expiring within 14 days resurfaces automatically.
- **Verdict** = a plain-English headline generated from the above.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · SQLite.

## Run it

```bash
npm install
npm run setup     # generate client, create db, seed a realistic company
npm run dev       # http://localhost:3000
```

Handy scripts:

| Script            | Does                                          |
| ----------------- | --------------------------------------------- |
| `npm run setup`   | One-shot: generate + reset DB + seed          |
| `npm run db:seed` | Re-seed the demo company (Northwind Inc.)     |
| `npm run db:reset`| Wipe and re-seed                              |
| `npm run build`   | Production build + typecheck                  |

The seed models **Northwind Inc.**, a startup mid-journey: ~63% ready with 6
real audit blockers — the state where SockTu is most useful.

## Data model

`Category → Criterion → Control → { Evidence, Task }`, plus `Owner`, `Policy`,
and `Vendor`. Evidence has a `source` field (`manual`, `aws`, `github`, `okta`…)
so live integrations can feed the *same* pipeline later — automated evidence is
just evidence with a non-manual source and an expiry.

## Where this goes next

1. ~~**Auditor portal** — a read-only, shareable view of controls + evidence.~~ ✅ Done — see the Audit report.
2. **Integrations** — pull evidence automatically from AWS, GitHub, Okta, etc.
3. **Guided remediation** — turn each blocker into a step-by-step fix with an assignable evidence request.
4. **Multi-framework** — reuse the control engine for ISO 27001, HIPAA.
5. **Continuous mode** — Type II monitoring windows and drift alerts.
