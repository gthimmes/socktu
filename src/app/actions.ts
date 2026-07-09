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
