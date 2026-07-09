"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

// Wraps the app chrome. Public share pages (/share/*) render full-width with no
// sidebar so they look like a standalone, shareable document.
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname.startsWith("/share");

  if (isPublic) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="ml-60 min-h-screen print:ml-0">
        <div className="mx-auto max-w-6xl px-8 py-8 print:max-w-none print:px-0 print:py-0">
          {children}
        </div>
      </main>
    </>
  );
}
