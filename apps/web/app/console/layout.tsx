import Link from "next/link";
import { redirect } from "next/navigation";

import { getOperator } from "@/lib/operator";

export const dynamic = "force-dynamic";

export const metadata = { title: "Console", robots: { index: false, follow: false } };

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const operator = await getOperator();
  if (!operator) redirect("/console/login");

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-cream/95 px-4 py-3 backdrop-blur">
        <Link href="/console" className="font-serif text-lg">
          Console
        </Link>
        <Link
          href="/console/new"
          className="min-h-11 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-on-dark"
        >
          New capture
        </Link>
      </header>
      {children}
    </div>
  );
}
