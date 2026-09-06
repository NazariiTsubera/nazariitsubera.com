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

/** Every row is a 44px touch target; the label and the rule are the same on all three columns. */
const ROW = "flink flex min-h-11 items-center border-b border-white/[.14] py-2 text-[15px] leading-snug text-foot-link";

export function SiteFooter() {
  return (
    <footer className="mt-section bg-accent-deep text-foot-fg">
      <div className="mx-auto max-w-frame px-gutter pb-10 pt-band">
        <div className="grid grid-cols-1 gap-x-[clamp(22px,3vw,40px)] gap-y-9 sm:grid-cols-2 wide:grid-cols-4">
          <div>
            <div className="n text-[26px] leading-none tracking-[-0.03em]">
              nt<span className="text-foot-label">.</span>
            </div>
            <p className="mt-4 max-w-[34ch] text-[15px] leading-normal text-foot-link">
              Backend and infrastructure engineer in San Antonio. I build production software and help local businesses
              replace the work they still do by hand.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <div className="l mb-2 text-foot-label">{column.heading}</div>
              {column.items.map((item) =>
                item.external ? (
                  <a key={item.href} href={item.href} target="_blank" rel="noopener" className={ROW}>
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.href} href={item.href} className={ROW}>
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
