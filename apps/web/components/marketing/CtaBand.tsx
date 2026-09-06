import Link from "next/link";

import { Band, Label } from "./Section";
import { LINKS } from "./links";

export function CtaBand({
  label = "Start here",
  title = "Let’s find the hours hiding in your week.",
  body = "Tell me where the friction is. I’ll tell you what’s possible, in plain language, at no cost.",
  action = { href: LINKS.contact, text: "Get started" },
  note = "No sales team. A personal reply from me.",
}: {
  label?: string;
  title?: string;
  body?: string;
  action?: { href: string; text: string };
  note?: string;
}) {
  return (
    <Band className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-end gap-[clamp(24px,4vw,52px)] !py-[clamp(44px,6vw,76px)]">
      <div className="rv">
        <Label className="mb-5">{label}</Label>
        <h2 className="n mb-5 max-w-[16ch] text-[clamp(28px,4vw,44px)] leading-[1.06] tracking-[-0.026em]">{title}</h2>
        <p className="max-w-[44ch] text-body">{body}</p>
      </div>
      <div className="rv flex flex-col items-start gap-3.5">
        <Link href={action.href} className="cta">
          {action.text} <span className="arw">&rarr;</span>
        </Link>
        <span className="l text-muted">{note}</span>
      </div>
    </Band>
  );
}
