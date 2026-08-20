// Maps app routes to the help articles most relevant on that page —
// surfaced as "Suggested for this page" when the help panel opens.

const ROUTE_HELP: Array<{ pattern: RegExp; articles: string[] }> = [
  { pattern: /^\/$/, articles: ["readiness-tour", "blockers-explained", "readiness-score"] },
  { pattern: /^\/controls\/[^/]+/, articles: ["control-detail", "remediation-flow", "adding-evidence", "evidence-requests"] },
  { pattern: /^\/controls/, articles: ["controls-basics", "tsc-mapping", "gating-weights"] },
  { pattern: /^\/evidence/, articles: ["evidence-basics", "evidence-freshness", "evidence-sources"] },
  { pattern: /^\/tasks/, articles: ["task-queue", "remediation-flow"] },
  { pattern: /^\/report/, articles: ["audit-report", "share-links"] },
  { pattern: /^\/policies/, articles: ["policies-help", "vendors-help"] },
  { pattern: /^\/vendors/, articles: ["vendors-help", "policies-help"] },
];

export function helpArticlesFor(pathname: string): string[] {
  return ROUTE_HELP.find((r) => r.pattern.test(pathname))?.articles ?? ["readiness-tour"];
}

// Exported for tests: every article id referenced by the map.
export function allMappedArticleIds(): string[] {
  return [...new Set(ROUTE_HELP.flatMap((r) => r.articles))];
}
