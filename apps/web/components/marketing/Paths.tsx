import Link from "next/link";

import { Label } from "./Section";
import { LINKS } from "./links";

const PATHS = [
  {
    href: LINKS.business,
    label: "For your business",
    title: "Something in your week is done by hand",
    body: "Invoices, scheduling, reminders, spreadsheets that never match. Tell me about it in plain words and I’ll tell you what’s possible.",
    cta: "See how I help",
  },
  {
    href: LINKS.engineering,
    label: "Engineering & résumé",
    title: "Distributed systems, infrastructure, applied AI",
    body: "Production platforms, media pipelines, test infrastructure and the Linux and CI plumbing underneath them.",
    cta: "See the technical detail",
  },
];

export function Paths() {
  return (
    <section className="border-t border-ink/[.14] py-[clamp(34px,4.5vw,56px)]">
      <Label className="rv mb-6">Where to start</Label>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[clamp(18px,2.5vw,26px)]">
        {PATHS.map((path) => (
          <Link key={path.href} href={path.href} className="path rv flex flex-col gap-[13px] border border-ink/[.18] px-[30px] py-8">
            <span className="l text-accent">{path.label}</span>
            <span className="n text-[26px] leading-[1.14] tracking-[-0.02em]">{path.title}</span>
            <p className="text-body">{path.body}</p>
            <span className="l mt-1.5 text-ink">
              {path.cta} <span className="arw">&rarr;</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
