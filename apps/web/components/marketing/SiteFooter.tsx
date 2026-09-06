import Link from "next/link";

import { LINKS, NAV } from "./links";

const PAGES = [
  { href: LINKS.home, label: "Home" },
  ...NAV,
  { href: LINKS.contact, label: "Contact" },
  { href: LINKS.storefront, label: "Websites for market vendors" },
];

const COLUMNS = [
  {
    heading: "Pages",
    items: PAGES.map((page) => ({ ...page, external: false })),
  },
  {
    heading: "Contact",
    items: [
      { href: LINKS.email, label: LINKS.emailText, external: false },
      { href: LINKS.phone, label: LINKS.phoneText, external: false },
    ],
  },
  {
    heading: "Elsewhere",
    items: [
      { href: LINKS.github, label: "GitHub", external: true },
      { href: LINKS.linkedin, label: "LinkedIn", external: true },
      { href: LINKS.resume, label: "Résumé (PDF)", external: false },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-[clamp(34px,4.5vw,56px)] bg-accent-deep text-foot-fg">
      <div className="mx-auto max-w-frame px-[clamp(20px,5vw,48px)] pb-10 pt-[clamp(44px,6vw,70px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[clamp(22px,3vw,40px)]">
          <div>
            <div className="n text-[26px] tracking-[-0.03em]">
              nt<span className="text-foot-label">.</span>
            </div>
            <p className="mt-3 max-w-[30ch] text-[15px] leading-normal text-foot-link">
              Backend and infrastructure engineer in San Antonio. I build production software and help local businesses
              replace the work they still do by hand.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <div className="l mb-2.5 text-foot-label">{column.heading}</div>
              {column.items.map((item) =>
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener"
                    className="flink block border-b border-white/[.14] py-[9px] text-[15px] leading-normal text-foot-link"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flink block border-b border-white/[.14] py-[9px] text-[15px] leading-normal text-foot-link"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
        <div className="l mt-[clamp(36px,5vw,56px)] flex flex-wrap items-baseline justify-between gap-x-[30px] gap-y-4 border-t border-white/20 pt-[26px] text-foot-label">
          <span>© {new Date().getFullYear()} Nazarii Tsubera</span>
          <span>San Antonio, Texas</span>
        </div>
      </div>
    </footer>
  );
}
