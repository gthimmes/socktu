import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Deterministic-ish date helpers (relative to seed run time).
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * DAY);
const daysFromNow = (n: number) => new Date(now + n * DAY);

async function main() {
  console.log("🧹 Clearing existing data...");
  // Order matters for FK constraints.
  await db.evidence.deleteMany();
  await db.task.deleteMany();
  await db.control.deleteMany();
  await db.criterion.deleteMany();
  await db.category.deleteMany();
  await db.owner.deleteMany();
  await db.policy.deleteMany();
  await db.vendor.deleteMany();
  await db.readinessSnapshot.deleteMany();
  await db.shareLink.deleteMany();

  console.log("👥 Seeding owners...");
  const owners = await Promise.all([
    db.owner.create({ data: { name: "Ava Chen", email: "ava@northwind.io", role: "CTO" } }),
    db.owner.create({ data: { name: "Marcus Reed", email: "marcus@northwind.io", role: "Security Lead" } }),
    db.owner.create({ data: { name: "Priya Nair", email: "priya@northwind.io", role: "Head of People" } }),
    db.owner.create({ data: { name: "Devon Alvarez", email: "devon@northwind.io", role: "Eng Manager" } }),
  ]);
  const [ava, marcus, priya, devon] = owners;

  console.log("🗂️  Seeding Trust Services Categories...");
  const cc = await db.category.create({
    data: {
      code: "CC",
      name: "Security",
      summary:
        "The foundation of every SOC 2 report. Protects systems against unauthorized access, disclosure, and damage.",
      inScope: true,
      sortOrder: 1,
    },
  });
  const availability = await db.category.create({
    data: {
      code: "A",
      name: "Availability",
      summary: "Your systems are up and reachable, and you can prove it — uptime, monitoring, and recovery.",
      inScope: true,
      sortOrder: 2,
    },
  });
  const confidentiality = await db.category.create({
    data: {
      code: "C",
      name: "Confidentiality",
      summary: "Sensitive information is protected end to end — encryption, retention, and safe disposal.",
      inScope: true,
      sortOrder: 3,
    },
  });
  const processing = await db.category.create({
    data: {
      code: "PI",
      name: "Processing Integrity",
      summary: "System processing is complete, accurate, timely, and authorized. (Not in scope for this audit.)",
      inScope: false,
      sortOrder: 4,
    },
  });
  const privacy = await db.category.create({
    data: {
      code: "P",
      name: "Privacy",
      summary: "Personal information is collected, used, and disposed of per your privacy notice. (Not in scope.)",
      inScope: false,
      sortOrder: 5,
    },
  });

  console.log("📏 Seeding criteria + controls...");

  // Helper to create a criterion with its controls.
  type ControlSeed = {
    key: string;
    name: string;
    description: string;
    guidance: string;
    status: "satisfied" | "at_risk" | "failing" | "not_started";
    weight?: number;
    gating?: boolean;
    ownerId?: string;
  };

  async function criterion(
    categoryId: string,
    ref: string,
    title: string,
    controls: ControlSeed[]
  ) {
    const crit = await db.criterion.create({
      data: { ref, title, categoryId },
    });
    for (const c of controls) {
      await db.control.create({
        data: {
          key: c.key,
          name: c.name,
          description: c.description,
          guidance: c.guidance,
          status: c.status,
          weight: c.weight ?? 1,
          gating: c.gating ?? false,
          ownerId: c.ownerId ?? null,
          criterionId: crit.id,
        },
      });
    }
    return crit;
  }

  // ---- CC1: Control Environment ----
  await criterion(cc.id, "CC1.1", "Integrity & ethical values", [
    {
      key: "CODE-OF-CONDUCT",
      name: "Everyone agrees to a code of conduct",
      description: "Auditors want to see that all staff have read and accepted a code of conduct.",
      guidance: "Publish a code of conduct and collect a signed acknowledgment from every employee during onboarding.",
      status: "satisfied",
      ownerId: priya.id,
    },
  ]);
  await criterion(cc.id, "CC1.4", "Attracting & retaining competent people", [
    {
      key: "SEC-TRAINING",
      name: "Staff complete security awareness training",
      description: "Every employee finishes security training when they join and once a year after.",
      guidance: "Assign a short training course on onboarding, track completion, and re-assign annually.",
      status: "at_risk",
      weight: 2,
      ownerId: priya.id,
    },
    {
      key: "BG-CHECKS",
      name: "New hires pass a background check",
      description: "Background checks are run before or shortly after a new employee starts.",
      guidance: "Use a background-check vendor and store the completion record (not the raw report).",
      status: "satisfied",
      ownerId: priya.id,
    },
  ]);

  // ---- CC2: Communication & Information ----
  await criterion(cc.id, "CC2.1", "Quality information", [
    {
      key: "ASSET-INVENTORY",
      name: "You keep an up-to-date inventory of systems & data",
      description: "A current list of the systems, repos, and data stores in scope for the audit.",
      guidance: "Maintain an inventory (a spreadsheet is fine to start) and review it quarterly.",
      status: "not_started",
      weight: 1,
      gating: true,
      ownerId: marcus.id,
    },
  ]);

  // ---- CC3: Risk Assessment ----
  await criterion(cc.id, "CC3.1", "Risk identification & assessment", [
    {
      key: "RISK-ASSESSMENT",
      name: "You run a documented risk assessment each year",
      description: "A yearly exercise that identifies risks to the business and how you'll treat them.",
      guidance: "Hold a risk workshop, log risks with likelihood/impact, and record your mitigation plan.",
      status: "not_started",
      weight: 2,
      gating: true,
      ownerId: ava.id,
    },
  ]);

  // ---- CC4: Monitoring ----
  await criterion(cc.id, "CC4.1", "Ongoing monitoring", [
    {
      key: "VULN-SCAN",
      name: "You scan for vulnerabilities regularly",
      description: "Automated scanning of your infrastructure and dependencies on a set cadence.",
      guidance: "Enable a vulnerability scanner (e.g. dependency + infra scanning) and review findings weekly.",
      status: "satisfied",
      weight: 2,
      ownerId: devon.id,
    },
  ]);

  // ---- CC5: Control Activities ----
  await criterion(cc.id, "CC5.2", "Technology controls", [
    {
      key: "ENDPOINT-PROT",
      name: "Company laptops are managed and protected",
      description: "Disk encryption, screen lock, and anti-malware are enforced on all employee devices.",
      guidance: "Roll out an MDM that enforces FileVault/BitLocker, auto-lock, and endpoint protection.",
      status: "failing",
      weight: 2,
      gating: true,
      ownerId: marcus.id,
    },
  ]);

  // ---- CC6: Logical & Physical Access ----
  await criterion(cc.id, "CC6.1", "Logical access — credentials & MFA", [
    {
      key: "ACCESS-MFA",
      name: "Everyone signs in with MFA",
      description: "Multi-factor authentication is required for all company systems and the identity provider.",
      guidance: "Enforce MFA in your SSO/identity provider and require it on every critical app.",
      status: "satisfied",
      weight: 3,
      gating: true,
      ownerId: marcus.id,
    },
    {
      key: "PASSWORD-POLICY",
      name: "Strong password rules are enforced",
      description: "Minimum length, complexity, and reuse rules are enforced by your identity provider.",
      guidance: "Configure a password policy in your IdP; prefer SSO + a password manager for staff.",
      status: "satisfied",
      ownerId: marcus.id,
    },
  ]);
  await criterion(cc.id, "CC6.2", "Access provisioning & de-provisioning", [
    {
      key: "OFFBOARDING",
      name: "Access is removed the day someone leaves",
      description: "When an employee or contractor departs, all their access is revoked promptly.",
      guidance: "Use an offboarding checklist tied to your HR system; revoke SSO + app access same-day.",
      status: "failing",
      weight: 3,
      gating: true,
      ownerId: priya.id,
    },
    {
      key: "ACCESS-REVIEW",
      name: "You review who has access every quarter",
      description: "A quarterly review confirms each person still needs the access they have.",
      guidance: "Export access lists each quarter, have owners confirm or revoke, and save the sign-off.",
      status: "satisfied",
      weight: 2,
      ownerId: marcus.id,
    },
    {
      key: "LEAST-PRIVILEGE",
      name: "People only get the access they need",
      description: "Access is granted by role and follows least-privilege — no blanket admin rights.",
      guidance: "Define role-based access groups; grant admin only by exception with approval.",
      status: "satisfied",
      ownerId: marcus.id,
    },
  ]);
  await criterion(cc.id, "CC6.6", "Encryption in transit & at rest", [
    {
      key: "ENCRYPT-TRANSIT",
      name: "Data is encrypted in transit",
      description: "All traffic to your systems uses TLS; no plaintext endpoints are exposed.",
      guidance: "Enforce HTTPS everywhere, redirect HTTP, and use modern TLS on load balancers.",
      status: "satisfied",
      ownerId: devon.id,
    },
    {
      key: "ENCRYPT-REST",
      name: "Data is encrypted at rest",
      description: "Databases, object storage, and backups are encrypted at rest.",
      guidance: "Enable at-rest encryption on your database, storage buckets, and backup snapshots.",
      status: "satisfied",
      ownerId: devon.id,
    },
  ]);
  await criterion(cc.id, "CC6.7", "Physical access", [
    {
      key: "PHYSICAL-ACCESS",
      name: "Physical access to systems is controlled",
      description: "Because you're cloud-hosted, this leans on your provider's data-center controls.",
      guidance: "Keep your cloud provider's SOC 2 / ISO report on file as evidence of physical controls.",
      status: "satisfied",
      ownerId: marcus.id,
    },
  ]);

  // ---- CC7: System Operations ----
  await criterion(cc.id, "CC7.2", "Security monitoring & detection", [
    {
      key: "LOG-MONITOR",
      name: "Security logs are collected and monitored",
      description: "Key systems ship logs to a central place where suspicious activity is flagged.",
      guidance: "Centralize logs (SIEM or log platform) and set alerts on high-risk events.",
      status: "satisfied",
      weight: 2,
      ownerId: devon.id,
    },
  ]);
  await criterion(cc.id, "CC7.3", "Incident response", [
    {
      key: "INCIDENT-PLAN",
      name: "You have an incident response plan you actually test",
      description: "A written plan for handling security incidents, plus at least one test/tabletop a year.",
      guidance: "Document roles, severities, and comms; run a tabletop exercise and save the notes.",
      status: "not_started",
      weight: 2,
      gating: true,
      ownerId: marcus.id,
    },
  ]);

  // ---- CC8: Change Management ----
  await criterion(cc.id, "CC8.1", "Change management", [
    {
      key: "CODE-REVIEW",
      name: "Code changes are peer-reviewed before shipping",
      description: "Every change to production code is reviewed and approved by someone else.",
      guidance: "Require pull-request approval and branch protection on your main branch.",
      status: "satisfied",
      weight: 2,
      ownerId: devon.id,
    },
    {
      key: "CI-TESTS",
      name: "Automated tests run before deploy",
      description: "A CI pipeline runs tests and blocks broken changes from reaching production.",
      guidance: "Wire tests into CI and make a passing run required to merge/deploy.",
      status: "satisfied",
      ownerId: devon.id,
    },
  ]);

  // ---- CC9: Risk Mitigation ----
  await criterion(cc.id, "CC9.2", "Vendor & third-party risk", [
    {
      key: "VENDOR-REVIEW",
      name: "You vet vendors that touch your data",
      description: "New and existing vendors are risk-reviewed, ideally with their own SOC 2 on file.",
      guidance: "Keep a vendor register, collect their reports, and re-review high-risk vendors yearly.",
      status: "at_risk",
      ownerId: ava.id,
    },
  ]);

  // ---- A1: Availability ----
  await criterion(availability.id, "A1.2", "Backups & recovery", [
    {
      key: "BACKUPS",
      name: "Data is backed up and restores are tested",
      description: "Automated backups run, and you've proven you can actually restore from them.",
      guidance: "Automate backups, document retention, and do a test restore at least twice a year.",
      status: "at_risk",
      weight: 2,
      gating: true,
      ownerId: devon.id,
    },
  ]);
  await criterion(availability.id, "A1.1", "Capacity & uptime monitoring", [
    {
      key: "UPTIME-MONITOR",
      name: "Uptime and capacity are monitored with alerts",
      description: "You monitor availability and get paged when systems degrade or approach limits.",
      guidance: "Set up uptime + resource monitoring with on-call alerting.",
      status: "satisfied",
      ownerId: devon.id,
    },
  ]);

  // ---- C1: Confidentiality ----
  await criterion(confidentiality.id, "C1.2", "Data retention & disposal", [
    {
      key: "DATA-DISPOSAL",
      name: "Sensitive data is retained and disposed of on a schedule",
      description: "You keep confidential data only as long as needed and securely delete it after.",
      guidance: "Define retention periods per data type and automate deletion where possible.",
      status: "not_started",
      ownerId: ava.id,
    },
  ]);

  console.log("📎 Seeding evidence...");
  const controlByKey = Object.fromEntries(
    (await db.control.findMany()).map((c) => [c.key, c])
  );
  const ev = (key: string, data: Parameters<typeof db.evidence.create>[0]["data"]) =>
    db.evidence.create({ data: { ...data, controlId: controlByKey[key].id } });

  await Promise.all([
    ev("ACCESS-MFA", {
      title: "Okta MFA enforcement policy (screenshot)",
      type: "screenshot",
      source: "okta",
      note: "MFA required for all users, all apps.",
      collectedAt: daysAgo(20),
      expiresAt: daysFromNow(70),
    }),
    ev("PASSWORD-POLICY", {
      title: "Password policy configuration export",
      type: "config",
      source: "okta",
      collectedAt: daysAgo(20),
      expiresAt: daysFromNow(70),
    }),
    ev("ENCRYPT-TRANSIT", {
      title: "SSL Labs A+ report — app.northwind.io",
      type: "document",
      source: "manual",
      collectedAt: daysAgo(15),
      expiresAt: daysFromNow(75),
    }),
    ev("ENCRYPT-REST", {
      title: "RDS + S3 encryption settings",
      type: "config",
      source: "aws",
      collectedAt: daysAgo(15),
      expiresAt: daysFromNow(75),
    }),
    ev("CODE-REVIEW", {
      title: "GitHub branch protection ruleset",
      type: "config",
      source: "github",
      collectedAt: daysAgo(10),
      expiresAt: daysFromNow(80),
    }),
    ev("CI-TESTS", {
      title: "CI pipeline required-checks configuration",
      type: "config",
      source: "github",
      collectedAt: daysAgo(10),
      expiresAt: daysFromNow(80),
    }),
    ev("BG-CHECKS", {
      title: "Background check completion log (Q1–Q2)",
      type: "attestation",
      source: "manual",
      collectedAt: daysAgo(30),
      expiresAt: daysFromNow(60),
    }),
    ev("PHYSICAL-ACCESS", {
      title: "AWS SOC 2 Type II report (on file)",
      type: "document",
      source: "aws",
      collectedAt: daysAgo(40),
      expiresAt: daysFromNow(200),
    }),
    // An expiring-soon piece to show the freshness engine.
    ev("SEC-TRAINING", {
      title: "Security training completion — 82% of staff",
      type: "attestation",
      source: "manual",
      note: "3 of 17 employees still outstanding.",
      collectedAt: daysAgo(85),
      expiresAt: daysFromNow(6),
    }),
    ev("UPTIME-MONITOR", {
      title: "Datadog uptime monitors + on-call schedule",
      type: "screenshot",
      source: "manual",
      collectedAt: daysAgo(8),
      expiresAt: daysFromNow(82),
    }),
    ev("LEAST-PRIVILEGE", {
      title: "Role-based access group definitions",
      type: "config",
      source: "okta",
      collectedAt: daysAgo(22),
      expiresAt: daysFromNow(68),
    }),
    ev("CODE-OF-CONDUCT", {
      title: "Signed code of conduct acknowledgments (17/17)",
      type: "attestation",
      source: "manual",
      collectedAt: daysAgo(50),
      expiresAt: daysFromNow(150),
    }),
  ]);

  console.log("✅ Seeding tasks (the next-action queue)...");
  const task = (
    key: string | null,
    title: string,
    priority: string,
    ownerId: string | null,
    dueInDays: number | null,
    detail?: string
  ) =>
    db.task.create({
      data: {
        title,
        detail: detail ?? null,
        priority,
        status: "todo",
        dueDate: dueInDays === null ? null : daysFromNow(dueInDays),
        controlId: key ? controlByKey[key].id : null,
        ownerId,
      },
    });

  await Promise.all([
    task(
      "OFFBOARDING",
      "Stand up a same-day offboarding checklist",
      "critical",
      priya.id,
      5,
      "No documented process today. Auditors will test departed-user access directly."
    ),
    task(
      "ENDPOINT-PROT",
      "Roll out MDM to enforce disk encryption on laptops",
      "critical",
      marcus.id,
      10,
      "Currently unmanaged. Need FileVault/BitLocker + auto-lock enforced fleet-wide."
    ),
    task(
      "RISK-ASSESSMENT",
      "Run the annual risk assessment workshop",
      "critical",
      ava.id,
      14,
      "Gating control with zero evidence. Schedule a 90-minute workshop and log the risk register."
    ),
    task(
      "INCIDENT-PLAN",
      "Write the incident response plan and run a tabletop",
      "critical",
      marcus.id,
      18,
      "Draft the plan, then run one tabletop exercise and save the notes as evidence."
    ),
    task(
      "ASSET-INVENTORY",
      "Build the systems & data inventory",
      "high",
      marcus.id,
      12,
      "Start as a spreadsheet: systems, repos, data stores, owners."
    ),
    task(
      "SEC-TRAINING",
      "Chase the last 3 employees to finish security training",
      "high",
      priya.id,
      6,
      "Evidence expires in less than a week — 82% complete, need 100%."
    ),
    task(
      "ACCESS-REVIEW",
      "Complete the Q3 access review",
      "high",
      marcus.id,
      20,
      "Export access lists, get owner sign-off, save the confirmation."
    ),
    task(
      "VULN-SCAN",
      "Turn on continuous vulnerability scanning",
      "medium",
      devon.id,
      21,
      "Enable dependency + infra scanning and triage the first report."
    ),
    task(
      "BACKUPS",
      "Do a test restore and document it",
      "medium",
      devon.id,
      25,
      "Backups run, but a restore has never been proven. Do one and screenshot it."
    ),
    task(
      "LOG-MONITOR",
      "Centralize logs and add alerting on high-risk events",
      "medium",
      devon.id,
      28,
      null
    ),
    task(
      "DATA-DISPOSAL",
      "Define data retention & disposal schedule",
      "low",
      ava.id,
      35,
      null
    ),
    task(
      "VENDOR-REVIEW",
      "Collect SOC 2 reports from top-5 vendors",
      "medium",
      ava.id,
      22,
      null
    ),
  ]);

  console.log("📄 Seeding policies...");
  await Promise.all([
    db.policy.create({ data: { name: "Information Security Policy", status: "approved", version: "2.1", owner: "Marcus Reed", approvedAt: daysAgo(60), reviewBy: daysFromNow(305) } }),
    db.policy.create({ data: { name: "Access Control Policy", status: "approved", version: "1.4", owner: "Marcus Reed", approvedAt: daysAgo(60), reviewBy: daysFromNow(305) } }),
    db.policy.create({ data: { name: "Acceptable Use Policy", status: "approved", version: "1.2", owner: "Priya Nair", approvedAt: daysAgo(90), reviewBy: daysFromNow(275) } }),
    db.policy.create({ data: { name: "Incident Response Policy", status: "draft", version: "0.3", owner: "Marcus Reed" } }),
    db.policy.create({ data: { name: "Business Continuity & DR Plan", status: "needs_review", version: "1.0", owner: "Ava Chen", approvedAt: daysAgo(400), reviewBy: daysAgo(35) } }),
    db.policy.create({ data: { name: "Vendor Management Policy", status: "missing", version: "—" } }),
    db.policy.create({ data: { name: "Data Retention & Disposal Policy", status: "missing", version: "—" } }),
  ]);

  console.log("🏢 Seeding vendors...");
  await Promise.all([
    db.vendor.create({ data: { name: "Amazon Web Services", service: "Cloud hosting", risk: "high", status: "reviewed", hasSoc2: true, reviewedAt: daysAgo(40) } }),
    db.vendor.create({ data: { name: "Okta", service: "Identity & SSO", risk: "high", status: "reviewed", hasSoc2: true, reviewedAt: daysAgo(35) } }),
    db.vendor.create({ data: { name: "GitHub", service: "Source control & CI", risk: "medium", status: "reviewed", hasSoc2: true, reviewedAt: daysAgo(35) } }),
    db.vendor.create({ data: { name: "Datadog", service: "Monitoring", risk: "medium", status: "pending", hasSoc2: true } }),
    db.vendor.create({ data: { name: "Stripe", service: "Payments", risk: "high", status: "reviewed", hasSoc2: true, reviewedAt: daysAgo(20) } }),
    db.vendor.create({ data: { name: "Notion", service: "Docs & wiki", risk: "medium", status: "pending", hasSoc2: true } }),
    db.vendor.create({ data: { name: "Zoom", service: "Video conferencing", risk: "low", status: "flagged", hasSoc2: true } }),
  ]);

  console.log("📈 Seeding readiness history...");
  // Weekly snapshots trending up to today's ~63% / 6 blockers.
  const trend: [number, number][] = [
    [37, 12],
    [41, 11],
    [44, 11],
    [48, 10],
    [51, 9],
    [54, 8],
    [57, 8],
    [59, 7],
    [61, 7],
    [63, 6],
  ];
  await Promise.all(
    trend.map(([score, blockers], i) =>
      db.readinessSnapshot.create({
        data: {
          score,
          blockers,
          capturedAt: daysAgo((trend.length - 1 - i) * 7),
        },
      })
    )
  );

  console.log("🎉 Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
