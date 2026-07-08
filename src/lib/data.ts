import { db } from "./db";
import { computeReadiness, type ControlLike } from "./readiness";
import { priorityMeta } from "./status";

// Full control include shape used for readiness + control views.
const controlInclude = {
  criterion: { include: { category: true } },
  owner: true,
  evidence: true,
} as const;

export async function getReadiness() {
  const controls = await db.control.findMany({ include: controlInclude });
  return computeReadiness(controls as unknown as ControlLike[]);
}

// The prioritized "one next action" queue.
export async function getNextActions(limit?: number) {
  const tasks = await db.task.findMany({
    where: { status: { not: "done" } },
    include: { owner: true, control: { include: { criterion: true } } },
  });

  const sorted = tasks.sort((a, b) => {
    const pr = priorityMeta(a.priority).rank - priorityMeta(b.priority).rank;
    if (pr !== 0) return pr;
    const ad = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bd = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return ad - bd;
  });

  return limit ? sorted.slice(0, limit) : sorted;
}

export async function getControlsGrouped() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      criteria: {
        orderBy: { ref: "asc" },
        include: {
          controls: {
            orderBy: { name: "asc" },
            include: { owner: true, evidence: true, tasks: true },
          },
        },
      },
    },
  });
  return categories;
}

export async function getControl(id: string) {
  return db.control.findUnique({
    where: { id },
    include: {
      criterion: { include: { category: true } },
      owner: true,
      evidence: { orderBy: { collectedAt: "desc" } },
      tasks: { include: { owner: true } },
    },
  });
}

export async function getEvidence() {
  return db.evidence.findMany({
    orderBy: { collectedAt: "desc" },
    include: { control: { include: { criterion: true } } },
  });
}

export async function getAllTasks() {
  const tasks = await db.task.findMany({
    include: { owner: true, control: { include: { criterion: true } } },
  });
  return tasks.sort((a, b) => {
    // done tasks sink to the bottom
    if ((a.status === "done") !== (b.status === "done")) return a.status === "done" ? 1 : -1;
    const pr = priorityMeta(a.priority).rank - priorityMeta(b.priority).rank;
    if (pr !== 0) return pr;
    const ad = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bd = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return ad - bd;
  });
}

export async function getOwners() {
  return db.owner.findMany({ orderBy: { name: "asc" } });
}

export async function getPolicies() {
  return db.policy.findMany({ orderBy: { name: "asc" } });
}

export async function getVendors() {
  return db.vendor.findMany({ orderBy: { name: "asc" } });
}
