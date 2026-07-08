"use client";

import { useTransition } from "react";
import { toggleTask } from "@/app/actions";

export function TaskCheckbox({ taskId, done }: { taskId: string; done: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      aria-label={done ? "Mark task not done" : "Mark task done"}
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          void toggleTask(taskId);
        })
      }
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
        done
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-slate-300 bg-white hover:border-brand-500"
      } ${pending ? "opacity-50" : ""}`}
    >
      {done && <span className="text-xs leading-none">✓</span>}
    </button>
  );
}
