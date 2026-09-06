import Link from "next/link";
import { redirect } from "next/navigation";

import { getOperator } from "@/lib/operator";

export const dynamic = "force-dynamic";

export const metadata = { title: "Console", robots: { index: false, follow: false } };

/**
 * Guards every console page. The login page deliberately sits outside this route group:
 * if it were inside, signing out would redirect it to itself forever.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const operator = await getOperator();
  if (!operator) redirect("/console/login");

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-console items-center justify-between gap-3 px-4">
          <Link href="/console" className="flex h-full items-center font-serif text-lg">
            Console
          </Link>
          <Link href="/console/new" className="ui-btn ui-btn-primary">
            New capture
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-console">{children}</div>
    </div>
  );
}
