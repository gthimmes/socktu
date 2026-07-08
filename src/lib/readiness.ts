// The readiness engine — SockTu's core differentiator.
// Turns raw control data into the single answer a founder cares about:
//   "How ready am I, and what exactly is blocking me?"

import { CONTROL_STATUS, type ControlStatus } from "./status";

const DAY = 24 * 60 * 60 * 1000;
export const EVIDENCE_STALE_WINDOW_DAYS = 14;

export type ControlLike = {
  id: string;
  key: string;
  name: string;
  status: string;
  weight: number;
  gating: boolean;
  criterion: { ref: string; title: string; category: { code: string; name: string; inScope: boolean } };
  owner?: { name: string } | null;
  evidence: { id: string; expiresAt: Date | null }[];
};

export type Readiness = {
  score: number; // 0-100, rounded
  weightedTotal: number;
  weightedEarned: number;
  inScopeControls: number;
  counts: Record<ControlStatus, number>;
  blockers: Blocker[];
  expiring: ExpiringEvidence[];
  byCategory: CategoryProgress[];
  auditReady: boolean;
};

export type Blocker = {
  controlId: string;
  key: string;
  name: string;
  criterionRef: string;
  status: ControlStatus;
  owner: string | null;
  reason: string;
};

export type ExpiringEvidence = {
  controlId: string;
  controlName: string;
  daysLeft: number;
  expired: boolean;
};

export type CategoryProgress = {
  code: string;
  name: string;
  score: number;
  total: number;
  satisfied: number;
};

function scoreFor(status: string): number {
  return CONTROL_STATUS[(status as ControlStatus)]?.score ?? 0;
}

export function computeReadiness(controls: ControlLike[], nowMs = Date.now()): Readiness {
  const inScope = controls.filter((c) => c.criterion.category.inScope);

  let weightedTotal = 0;
  let weightedEarned = 0;
  const counts: Record<ControlStatus, number> = {
    satisfied: 0,
    at_risk: 0,
    failing: 0,
    not_started: 0,
  };

  const catMap = new Map<string, CategoryProgress & { earned: number; weight: number }>();

  for (const c of inScope) {
    const s = (c.status as ControlStatus) ?? "not_started";
    counts[s] = (counts[s] ?? 0) + 1;

    weightedTotal += c.weight;
    weightedEarned += c.weight * scoreFor(s);

    const code = c.criterion.category.code;
    const entry =
      catMap.get(code) ??
      {
        code,
        name: c.criterion.category.name,
        score: 0,
        total: 0,
        satisfied: 0,
        earned: 0,
        weight: 0,
      };
    entry.total += 1;
    entry.weight += c.weight;
    entry.earned += c.weight * scoreFor(s);
    if (s === "satisfied") entry.satisfied += 1;
    catMap.set(code, entry);
  }

  const score = weightedTotal === 0 ? 0 : Math.round((weightedEarned / weightedTotal) * 100);

  // Blockers: gating controls that aren't satisfied. These literally block the audit.
  const blockers: Blocker[] = inScope
    .filter((c) => c.gating && c.status !== "satisfied")
    .map((c) => ({
      controlId: c.id,
      key: c.key,
      name: c.name,
      criterionRef: c.criterion.ref,
      status: c.status as ControlStatus,
      owner: c.owner?.name ?? null,
      reason:
        c.status === "failing"
          ? "Required control is failing"
          : c.status === "at_risk"
          ? "Required control has weak or stale evidence"
          : "Required control has no evidence yet",
    }))
    .sort((a, b) => blockerRank(a.status) - blockerRank(b.status));

  // Expiring / expired evidence on in-scope controls.
  const expiring: ExpiringEvidence[] = [];
  for (const c of inScope) {
    for (const e of c.evidence) {
      if (!e.expiresAt) continue;
      const daysLeft = Math.ceil((e.expiresAt.getTime() - nowMs) / DAY);
      if (daysLeft <= EVIDENCE_STALE_WINDOW_DAYS) {
        expiring.push({
          controlId: c.id,
          controlName: c.name,
          daysLeft,
          expired: daysLeft < 0,
        });
      }
    }
  }
  expiring.sort((a, b) => a.daysLeft - b.daysLeft);

  const byCategory: CategoryProgress[] = [...catMap.values()]
    .map((e) => ({
      code: e.code,
      name: e.name,
      score: e.weight === 0 ? 0 : Math.round((e.earned / e.weight) * 100),
      total: e.total,
      satisfied: e.satisfied,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  return {
    score,
    weightedTotal,
    weightedEarned,
    inScopeControls: inScope.length,
    counts,
    blockers,
    expiring,
    byCategory,
    auditReady: blockers.length === 0 && score >= 95,
  };
}

function blockerRank(status: ControlStatus): number {
  // failing first, then not_started, then at_risk
  if (status === "failing") return 0;
  if (status === "not_started") return 1;
  return 2;
}

// A friendly, human verdict for the top of the dashboard.
export function readinessVerdict(r: Readiness): { headline: string; sub: string } {
  if (r.auditReady) {
    return {
      headline: "You're audit-ready.",
      sub: "No blockers remain. Keep evidence fresh and you're good to schedule.",
    };
  }
  const n = r.blockers.length;
  if (n === 0) {
    return {
      headline: "Almost there — no hard blockers.",
      sub: `You're at ${r.score}%. Tighten the remaining at-risk controls to cross the line.`,
    };
  }
  return {
    headline: `You're ${r.score}% ready.`,
    sub: `${n} ${n === 1 ? "thing is" : "things are"} blocking your audit. Clear ${
      n === 1 ? "it" : "them"
    } and you're on track.`,
  };
}
