import Link from "next/link";

import { Band, GRID, Label } from "./Section";
import { LINKS } from "./links";

export function CtaBand({
  label,
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
    <Band className={`${GRID.even} wide:items-end`}>
      <div className="rv">
        {label ? <Label className="mb-5">{label}</Label> : null}
        <h2 className="n measure mb-5 text-[clamp(28px,4vw,44px)] leading-[1.06] tracking-[-0.026em] [--measure:16ch]">
          {title}
        </h2>
        <p className="max-w-[44ch] text-body">{body}</p>
      </div>
      <div className="rv flex flex-col gap-3.5">
        <div className="actions">
          <Link href={action.href} className="cta">
            {action.text} <span className="arw">&rarr;</span>
          </Link>
        </div>
        <span className="text-[14px] text-muted">{note}</span>
      </div>
    </Band>
  );
}
