"use server";

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
