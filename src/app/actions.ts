"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function setControlStatus(controlId: string, status: string) {
  await db.control.update({ where: { id: controlId }, data: { status } });
  revalidatePath("/");
  revalidatePath("/controls");
  revalidatePath(`/controls/${controlId}`);
}

export async function toggleTask(taskId: string) {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) return;
  const next = task.status === "done" ? "todo" : "done";
  await db.task.update({ where: { id: taskId }, data: { status: next } });
  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function addEvidence(formData: FormData) {
  const controlId = String(formData.get("controlId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "document");
  if (!controlId || !title) return;

  const expiresRaw = String(formData.get("expiresInDays") ?? "").trim();
  const expiresInDays = expiresRaw ? Number(expiresRaw) : null;

  await db.evidence.create({
    data: {
      controlId,
      title,
      type,
      source: "manual",
      expiresAt:
        expiresInDays && !Number.isNaN(expiresInDays)
          ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
          : null,
    },
  });

  // Fresh evidence on a not-started/failing control nudges it to at_risk
  // until someone confirms it's fully satisfied.
  const control = await db.control.findUnique({ where: { id: controlId } });
  if (control && (control.status === "not_started" || control.status === "failing")) {
    await db.control.update({ where: { id: controlId }, data: { status: "at_risk" } });
  }

  revalidatePath("/");
  revalidatePath("/evidence");
  revalidatePath(`/controls/${controlId}`);
}

export async function createShareLink(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim() || "Audit-readiness report";
  const expiresRaw = String(formData.get("expiresInDays") ?? "").trim();
  const expiresInDays = expiresRaw ? Number(expiresRaw) : null;

  const token = randomBytes(9).toString("base64url"); // ~12 url-safe chars

  await db.shareLink.create({
    data: {
      token,
      label,
      expiresAt:
        expiresInDays && !Number.isNaN(expiresInDays)
          ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
          : null,
    },
  });

  revalidatePath("/report");
}

export async function revokeShareLink(id: string) {
  await db.shareLink.update({ where: { id }, data: { revoked: true } });
  revalidatePath("/report");
}

// --- Guided remediation ---

function revalidateControl(controlId: string) {
  revalidatePath("/");
  revalidatePath("/controls");
  revalidatePath(`/controls/${controlId}`);
}

export async function toggleStep(stepId: string) {
  const step = await db.remediationStep.findUnique({ where: { id: stepId } });
  if (!step) return;
  await db.remediationStep.update({ where: { id: stepId }, data: { done: !step.done } });
  revalidateControl(step.controlId);
}

export async function addStep(formData: FormData) {
  const controlId = String(formData.get("controlId") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  if (!controlId || !text) return;
  const count = await db.remediationStep.count({ where: { controlId } });
  await db.remediationStep.create({ data: { controlId, text, order: count } });
  revalidateControl(controlId);
}

export async function createEvidenceRequest(formData: FormData) {
  const controlId = String(formData.get("controlId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const ownerId = String(formData.get("ownerId") ?? "") || null;
  if (!controlId || !description) return;

  const dueRaw = String(formData.get("dueInDays") ?? "").trim();
  const dueInDays = dueRaw ? Number(dueRaw) : null;

  await db.evidenceRequest.create({
    data: {
      controlId,
      description,
      ownerId,
      status: "requested",
      dueDate:
        dueInDays && !Number.isNaN(dueInDays)
          ? new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000)
          : null,
    },
  });
  revalidateControl(controlId);
}

export async function updateRequestStatus(requestId: string, status: string) {
  const req = await db.evidenceRequest.update({
    where: { id: requestId },
    data: { status },
  });
  revalidateControl(req.controlId);
}

// Mark a control satisfied once its remediation is complete.
export async function markControlSatisfied(controlId: string) {
  await db.control.update({ where: { id: controlId }, data: { status: "satisfied" } });
  revalidateControl(controlId);
}
