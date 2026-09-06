import Link from "next/link";

import { LINKS, NAV } from "./links";

export function SiteHeader() {
  return (
    <header className="relative flex items-center gap-5 pb-6 pt-[26px]">
      <Link href={LINKS.home} className="mr-auto flex items-baseline gap-[11px]">
        <span className="n text-2xl font-normal tracking-[-0.03em]">
          nt<span className="text-accent">.</span>
        </span>
        <span className="n text-lg font-normal tracking-[-0.01em]">Nazarii Tsubera</span>
      </Link>

      <nav aria-label="Primary" className="hidden items-baseline gap-6 md:flex">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="l navlink whitespace-nowrap text-body">
            {item.label}
          </Link>
        ))}
      </nav>
      <Link href={LINKS.contact} className="inkbtn hidden md:inline-flex">
        Contact
      </Link>

      {/* No-JavaScript menu for small screens. */}
      <details className="group md:hidden">
        <summary className="inkbtn cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Menu</span>
          <span className="hidden group-open:inline">Close</span>
        </summary>
        <nav
          aria-label="Primary"
          className="absolute left-0 right-0 top-full z-10 mt-2 flex flex-col border border-ink/[.18] bg-paper p-2 shadow-[0_18px_40px_-24px_rgba(22,26,26,.4)]"
        >
          {[...NAV, { href: LINKS.contact, label: "Contact" }].map((item) => (
            <Link key={item.href} href={item.href} className="l px-4 py-3.5 text-ink hover:bg-band">
              {item.label}
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
