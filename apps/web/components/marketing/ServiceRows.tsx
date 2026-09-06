import Link from "next/link";

import { SERVICES } from "@/content/services";

import { H2, Label } from "./Section";
import { LINKS } from "./links";

/** The three services in brief; each row opens its full description on /business. */
export function ServiceRows() {
  return (
    <section className="grid grid-cols-1 items-start gap-[clamp(24px,4vw,52px)] border-t border-ink/[.14] py-[clamp(34px,4.5vw,56px)] min-[860px]:grid-cols-[minmax(240px,1fr)_minmax(0,1.9fr)]">
      <div className="rv">
        <Label className="mb-5">What I do</Label>
        <H2 id="services" className="mb-4 max-w-[18ch]">
          Three ways I take work off your plate.
        </H2>
        <p className="mb-6 max-w-[38ch] text-body">Most engagements are one of these, or two of them together.</p>
        <Link href={LINKS.business} className="l navlink text-accent">
          For your business <span className="arw">&rarr;</span>
        </Link>
      </div>
      <div className="min-w-0">
        {SERVICES.map((service) => (
          <Link key={service.id} href={`${LINKS.business}#${service.id}`} className="svc rv">
            <span className="l svc-i text-muted">{service.n}</span>
            <span>
              <span className="n mb-2 block text-[22px] leading-[1.2] tracking-[-0.02em] text-ink">{service.title}</span>
              <span className="mb-2 block max-w-[52ch] text-body">{service.summary}</span>
              <span className="block font-mono text-[13px] text-muted">{service.tags}</span>
            </span>
            <span className="arw l self-center text-accent">&rarr;</span>
          </Link>
        ))}
        <div className="rv mt-[26px] flex flex-wrap items-center justify-between gap-x-[26px] gap-y-[18px] border border-accent/30 bg-accent/5 px-[26px] py-6">
          <div>
            <h3 className="n mb-1.5 text-xl tracking-[-0.02em]">Not sure which one you need?</h3>
            <p className="max-w-[44ch] text-body">
              Describe the part of your week that annoys you most. I&rsquo;ll tell you which of the three it is.
            </p>
          </div>
          <Link href={LINKS.contact} className="inkbtn flex-none">
            Ask me
          </Link>
        </div>
      </div>
    </section>
  );
}
