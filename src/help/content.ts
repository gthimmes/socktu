import type { HelpContent } from "help-navigator";

// The in-app help corpus: categories + markdown articles, rendered by the
// help-navigator widget mounted in the app shell.
export const helpContent: HelpContent = {
  categories: [
    {
      id: "getting-started",
      title: "Getting started",
      icon: "🧭",
      description: "The readiness dashboard, the score, statuses, and blockers.",
    },
    {
      id: "controls",
      title: "Controls & criteria",
      icon: "▤",
      description: "Plain-English controls mapped to the Trust Services Criteria.",
    },
    {
      id: "evidence",
      title: "Evidence vault",
      icon: "▣",
      description: "Capturing evidence, freshness tracking, and sources.",
    },
    {
      id: "remediation",
      title: "Tasks & remediation",
      icon: "✓",
      description: "The ranked task queue and the guided \"Clear this control\" flow.",
    },
    {
      id: "report",
      title: "Audit report & sharing",
      icon: "❏",
      description: "The printable posture report, PDF export, and read-only share links.",
    },
    {
      id: "policies-vendors",
      title: "Policies & vendors",
      icon: "§",
      description: "Policy approval tracking and third-party vendor risk.",
    },
  ],
  articles: [
    // ---------- Getting started ----------
    {
      id: "readiness-tour",
      title: "The readiness dashboard in two minutes",
      category: "getting-started",
      featured: true,
      tags: ["overview", "tour", "basics", "dashboard", "readiness"],
      body: `SockTu answers one question on one screen: **"Am I ready for my audit, and what exactly is blocking me?"**

The **Readiness** dashboard shows:

1. **The readiness ring** — your weighted readiness score, 0–100
2. **Live status counts** — how many controls are satisfied, at risk, failing, or not started
3. **Per-category progress** — a bar per Trust Services category
4. **What's blocking your audit** — the gating controls that must be satisfied first
5. **Your next moves** — the highest-impact open tasks, ranked
6. **Evidence needing attention** — anything expiring soon or already expired

Everything links onward: click a blocker to open its control, or **Work the queue** to jump into the full task list.

> Press **F1** anytime to open this help panel.`,
      related: ["readiness-score", "blockers-explained", "task-queue"],
    },
    {
      id: "readiness-score",
      title: "How the readiness score is computed",
      category: "getting-started",
      featured: true,
      tags: ["score", "weighted", "percentage", "engine", "audit-ready"],
      body: `The score is a **weighted percentage of controls satisfied**, computed over in-scope categories only:

- **Satisfied** — full credit
- **At risk** — half credit
- **Failing** or **Not started** — no credit

Each control also carries a **weight** (Critical, High, or Standard), so a critical control moves the score more than a routine one. Categories marked *out of scope* are excluded entirely — they never help or hurt the number.

## When are you audit-ready?

SockTu calls you **audit-ready** when two things are true:

1. **Zero blockers** — every gating control is satisfied
2. **Score ≥ 95%**

The verdict headline at the top of the dashboard is generated from exactly these rules, in plain English.`,
      related: ["statuses-explained", "blockers-explained", "gating-weights"],
    },
    {
      id: "statuses-explained",
      title: "The four control statuses",
      category: "getting-started",
      tags: ["status", "satisfied", "at-risk", "failing", "not-started"],
      body: `Every control is in exactly one of four states:

- **Satisfied** (green) — the control is in place with evidence to prove it. Full score credit.
- **At risk** (amber) — the control exists but is shaky: weak, stale, or unconfirmed evidence. Half credit.
- **Failing** (red) — the control is actively broken. No credit, and the loudest kind of blocker.
- **Not started** (grey) — nothing in place yet. No credit.

Change a status inline from the **Controls** list or a control's detail page — the dashboard, score, and blockers update immediately.

One nuance to know: adding fresh evidence to a *not started* or *failing* control automatically nudges it to **at risk** — a human still has to confirm it's fully satisfied.`,
      related: ["readiness-score", "controls-basics", "adding-evidence"],
    },
    {
      id: "blockers-explained",
      title: "What's blocking your audit",
      category: "getting-started",
      featured: true,
      tags: ["blockers", "gating", "required", "audit"],
      body: `**Blockers** are gating controls that aren't satisfied — the things that will literally fail your audit, regardless of your overall score.

The dashboard lists them worst-first: **failing** controls, then **not started**, then **at risk**. Each blocker shows:

- The control name and its criterion reference (like CC6.1)
- **Why** it's blocking — failing, no evidence yet, or weak/stale evidence
- Its **owner**, so you know who to chase
- **Step progress** — how far its remediation checklist has gotten

Click any blocker to open the control and its guided **Clear this control** flow. When the last blocker clears and your score crosses 95%, the verdict flips to *"You're audit-ready."*`,
      related: ["gating-weights", "remediation-flow", "readiness-score"],
    },

    // ---------- Controls & criteria ----------
    {
      id: "controls-basics",
      title: "Working the controls list",
      category: "controls",
      featured: true,
      tags: ["controls", "list", "inline", "status", "owner"],
      body: `The **Controls** page is every control in plain English — no jargon to decode — grouped by Trust Services category, then by criterion.

Each row shows:

- The control name, with a red **Gating** pill if it can block your audit
- Its criterion reference and title (e.g. *CC6.1 — Logical access security*)
- Counts of attached **evidence** and **tasks**
- The **owner** responsible for it
- A **status dropdown** — change the status right from the list, no page-hop needed

Each category header shows its satisfied/total tally, and out-of-scope categories render dimmed with an *Out of scope* pill. Click a control's name to open its detail page.`,
      related: ["control-detail", "tsc-mapping", "statuses-explained"],
    },
    {
      id: "tsc-mapping",
      title: "Trust Services Criteria and scope",
      category: "controls",
      tags: ["tsc", "criteria", "categories", "scope", "cc"],
      body: `SOC 2 is organized around the **Trust Services Criteria**. SockTu mirrors that structure: **Category → Criterion → Control**.

The category codes you'll see:

- **CC** — Security (the Common Criteria; always in scope)
- **A** — Availability
- **C** — Confidentiality
- **PI** — Processing Integrity
- **P** — Privacy

## Scope

Not every company includes every category in its audit. Categories marked **out of scope** appear dimmed on the Controls page and are **excluded from the readiness score and blockers** — you can see what's there without being penalized for it.

Every control carries its criterion reference (like *CC6.1*), which is exactly the language your auditor will use.`,
      related: ["controls-basics", "readiness-score"],
    },
    {
      id: "gating-weights",
      title: "Gating controls and weights",
      category: "controls",
      tags: ["gating", "weight", "critical", "required"],
      body: `Two attributes decide how much a control matters:

## Gating

A **gating** control is one your audit cannot pass without. Any gating control that isn't satisfied appears on the dashboard as a **blocker**, no matter what your overall score says. The red *Gating* pill marks these everywhere.

## Weight

Every control has a weight — **Critical**, **High**, or **Standard** — that scales its contribution to the readiness score. A critical control counts three times as much as a standard one.

The two are independent: a control can be heavy but not gating (it drags your score without blocking the audit), or gating but standard-weight (it must be green, even if it barely moves the number).`,
      related: ["blockers-explained", "readiness-score", "controls-basics"],
    },
    {
      id: "control-detail",
      title: "Anatomy of a control page",
      category: "controls",
      tags: ["detail", "guidance", "owner", "how-to-satisfy"],
      body: `Click any control to open its detail page — the single place to get that control to green:

- **Header** — the category, criterion reference, plain-English description, owner, weight, and last-updated date, plus the same inline **status dropdown**
- **Clear this control** — the guided remediation panel: a step checklist with live progress and assignable evidence requests
- **How to satisfy this** — practical guidance written for this specific control
- **Evidence** — every artifact attached to the control, with freshness pills, and a form to add more
- **Tasks** — the open work items tied to this control, with priority, due date, and owner

For a control that's already satisfied, the remediation panel switches to *"Keep this control healthy"* — the same checklist, now guarding against drift.`,
      related: ["remediation-flow", "adding-evidence", "controls-basics"],
    },

    // ---------- Evidence vault ----------
    {
      id: "evidence-basics",
      title: "The evidence vault",
      category: "evidence",
      featured: true,
      tags: ["evidence", "vault", "artifacts", "auditor"],
      body: `**Evidence** is every artifact an auditor will review — the proof behind your controls. The vault shows all of it in one place:

- **Total artifacts**, how many **need attention**, and how many came from **automated sources**
- Each artifact's title, its **control** (linked), criterion reference, collection date, source, and type
- A freshness pill: green while fresh, amber when expiring soon, red once **expired**

Artifacts come in five types: **document**, **screenshot**, **config export**, **attestation**, and **log**.

Evidence always belongs to a control — you add it from the control's detail page, and clicking an artifact's control name takes you straight there.`,
      related: ["evidence-freshness", "adding-evidence", "evidence-sources"],
    },
    {
      id: "evidence-freshness",
      title: "Freshness tracking: nothing goes stale silently",
      category: "evidence",
      featured: true,
      tags: ["freshness", "stale", "expiring", "expired", "14-days"],
      body: `Compliance quietly rots: an access review from last year proves nothing about today. SockTu tracks an optional **expiry date** on every piece of evidence and resurfaces it before it's a problem.

## The 14-day window

Evidence expiring within **14 days** (or already expired) is flagged everywhere:

- The **Evidence vault** pulls it into a *Needs attention* section at the top
- The **dashboard** shows an *Evidence needing attention* panel with days remaining
- The control's own evidence list shows the amber/red pill

## What to do

Re-collect the artifact — a fresh screenshot, a new config export, this quarter's review — and add it to the control. Evidence without an expiry is treated as always fresh, so reserve that for things that genuinely don't age.`,
      related: ["evidence-basics", "adding-evidence"],
    },
    {
      id: "adding-evidence",
      title: "Adding evidence to a control",
      category: "evidence",
      tags: ["add", "upload", "capture", "expiry"],
      body: `Evidence is added from the **control detail page** — the form sits right under the control's evidence list:

1. Give it a **title** an auditor would recognize (e.g. *"MFA policy screenshot"*)
2. Pick a **type** — document, screenshot, config export, attestation, or log
3. Optionally set **expires in (days)** so freshness tracking watches it

## The at-risk nudge

Adding evidence to a **not started** or **failing** control automatically moves it to **at risk** — the evidence exists, but a person still needs to review it and set the control to *satisfied*. That last confirmation is deliberately manual: evidence proves activity, a human confirms sufficiency.`,
      related: ["evidence-basics", "evidence-freshness", "statuses-explained"],
    },
    {
      id: "evidence-sources",
      title: "Evidence sources: manual and automated",
      category: "evidence",
      tags: ["sources", "aws", "github", "okta", "integrations", "automated"],
      body: `Every artifact records a **source** — where it came from:

- **Manual** — a person captured and uploaded it (everything you add through the form)
- **AWS**, **GitHub**, **Okta**, **Google** — pulled from the system that owns the truth

The vault's **Automated sources** stat counts the non-manual artifacts. In the seeded demo you'll see a mix, modeling where integrations plug in: automated evidence is just evidence with a non-manual source and an expiry, flowing through the **same pipeline** — same freshness tracking, same control attachment, same auditor view.

That's the design bet: when live integrations land, nothing about how you review or present evidence changes.`,
      related: ["evidence-basics", "evidence-freshness"],
    },

    // ---------- Tasks & remediation ----------
    {
      id: "task-queue",
      title: "The task queue: work top to bottom",
      category: "remediation",
      featured: true,
      tags: ["tasks", "queue", "priority", "due", "ranked"],
      body: `The **Task queue** is everything standing between you and audit-ready, ranked by impact — **priority first** (critical → high → medium → low), then **due date**. Overdue dates show in red. Completed tasks sink into a separate *Completed* section.

Each task shows its priority badge, its **control** (linked, with criterion reference), due date, and owner.

## Working it

Don't cherry-pick: the ranking exists so the top item is always the best use of the next hour. Check the box when a task is done — it updates the dashboard's **Your next moves** panel, which is simply the top of this same queue.`,
      related: ["remediation-flow", "readiness-tour", "blockers-explained"],
    },
    {
      id: "remediation-flow",
      title: "Guided remediation: clearing a control",
      category: "remediation",
      featured: true,
      tags: ["remediation", "steps", "checklist", "clear", "satisfied"],
      body: `Every control has a **Clear this control** panel — a guided flow that turns "this is failing" into a finishable checklist:

1. **Remediation steps** — a plain-English checklist with a live progress bar. Tick steps off as you go, and add your own with the *Add a step* field.
2. **Evidence requests** — ask a teammate for the proof you need (see the dedicated article).
3. **Mark satisfied** — once *every* step is done, a one-click **"All steps done — mark this control satisfied"** button appears.

Blockers on the dashboard show their step progress (like *2/5 steps*), so partial remediation is visible progress, not invisible effort.

For controls already satisfied, the panel becomes **"Keep this control healthy"** — the same steps, kept green.`,
      related: ["evidence-requests", "blockers-explained", "control-detail"],
    },
    {
      id: "evidence-requests",
      title: "Evidence requests: assign the ask",
      category: "remediation",
      tags: ["requests", "assign", "owner", "due", "submitted", "accepted"],
      body: `Half of compliance work is asking someone else for proof. **Evidence requests** (in each control's remediation panel) make the ask trackable:

- **Describe** what you need — *"Screenshot of MFA enforced for all admins"*
- **Assign** it to an owner and give it a **due date**

Each request moves through three statuses:

1. **Requested** — waiting on the assignee
2. **Submitted** — they've provided it; you review
3. **Accepted** — it's good; attach it as evidence on the control

Update the status from the dropdown on the request itself. Requests live with their control, so when an auditor (or your future self) asks *"where did this come from?"*, the trail is right there.`,
      related: ["remediation-flow", "adding-evidence"],
    },

    // ---------- Audit report & sharing ----------
    {
      id: "audit-report",
      title: "The audit report and PDF export",
      category: "report",
      featured: true,
      tags: ["report", "pdf", "export", "print", "posture", "trend"],
      body: `The **Audit report** is a clean, printable snapshot of your entire posture — built to hand to an auditor or a prospect:

- The **readiness score** with its trend over time
- **Open blockers** — the honest list of what's not done
- The full **control → evidence mapping**, category by category

## Export to PDF

Click **Export PDF** — it uses your browser's print dialog, and the app's print styles strip the navigation so you get just the document. Choose *Save as PDF* as the destination.

The report regenerates from live data on every view, so it's never stale — what you export is what's true right now.`,
      related: ["share-links", "readiness-score", "blockers-explained"],
    },
    {
      id: "share-links",
      title: "Read-only share links for auditors",
      category: "report",
      tags: ["share", "link", "token", "auditor", "revoke", "read-only"],
      body: `Instead of emailing PDFs back and forth, hand your auditor a **live, read-only link**.

## Creating one

On the Audit report, click **Share**, label the link with who it's for (e.g. *"Prescient Audit LLC"*), optionally set an expiry in days, and **Create link**. Copy the URL from the list.

## What the recipient sees

The link opens at \`/share/<token>\` — the same report, full-width, clearly badged *Read-only shared report*, with **no login required** and no access to anything else in the app.

## Staying in control

- Links can carry an **expiry date** — after it passes, the link dead-ends
- **Revoke** any link instantly from the same Share panel
- Each link is separately labeled, so you always know which audience you're cutting off`,
      related: ["audit-report"],
    },

    // ---------- Policies & vendors ----------
    {
      id: "policies-help",
      title: "Tracking policies",
      category: "policies-vendors",
      tags: ["policies", "approved", "draft", "review", "version"],
      body: `Auditors expect a set of **written policies** — information security, access control, incident response, and friends. The **Policies** page tracks each one's lifecycle:

- **Approved** (green) — current and signed off
- **Draft** (amber) — written but not yet approved
- **Needs review** (amber) — approved once, but due for its periodic re-read
- **Missing** (red) — expected by auditors, doesn't exist yet

Each policy also shows its **version**, its **owner**, and its **next review date** — overdue review dates turn red. The page header keeps the running tally (*approved / total*), which is the number an auditor will effectively ask for on day one.`,
      related: ["vendors-help", "readiness-tour"],
    },
    {
      id: "vendors-help",
      title: "Vendor risk tracking",
      category: "policies-vendors",
      tags: ["vendors", "third-party", "risk", "soc2", "reviewed"],
      body: `Your compliance is only as strong as the third parties touching your data. The **Vendors** page tracks each one:

- **Risk level** — high, medium, or low, based on what data the vendor touches
- **SOC 2** — a checkmark if the vendor holds its own SOC 2 report
- **Reviewed date** — when you last assessed them
- **Status** — **Reviewed** (assessed and fine), **Pending** (assessment not done yet), or **Flagged** (something needs action)

Auditors reliably ask two questions here: *do you know your vendors?* and *do the risky ones have their own reports?* Work the high-risk, non-reviewed rows first — those are the ones that turn into audit findings.`,
      related: ["policies-help", "readiness-tour"],
    },
  ],
};
