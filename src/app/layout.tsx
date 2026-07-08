import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "SockTu — SOC 2, made clear",
  description: "Radically clear SOC 2 compliance tracking. Know your readiness and your next move.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Sidebar />
        <main className="ml-60 min-h-screen">
          <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
