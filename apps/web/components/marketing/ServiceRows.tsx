import Link from "next/link";

import { SERVICES } from "@/content/services";

import { SERVICE_ICONS } from "./Icons";
import { GRID, H2 } from "./Section";
import { LINKS } from "./links";

/** The three services in brief; each row opens its full description on /business. */
export function ServiceRows() {
  return (
    <section className={`${GRID.side} border-t border-ink/[.14] py-section`}>
      <div className="rv">
        <H2 id="services" measure={18} className="mb-4">
          Three ways I take work off your plate.
        </H2>
        <p className="mb-6 max-w-[38ch] text-body">Most engagements are one of these, or two of them together.</p>
        <Link href={LINKS.business} className="go navlink tap text-accent">
          For your business <span className="arw">&rarr;</span>
        </Link>
      </div>
      <div className="min-w-0">
        {SERVICES.map((service) => (
          <Link key={service.id} href={`${LINKS.business}#${service.id}`} className="svc rv">
            <span className="chip chip-sm svc-i">{SERVICE_ICONS[service.id]}</span>
            <span>
              <span className="n mb-2 block text-[23px] leading-[1.2] tracking-[-0.02em] text-ink">{service.title}</span>
              <span className="mb-2 block max-w-[52ch] text-body">{service.summary}</span>
              <span className="block font-mono text-[13px] text-muted">{service.tags}</span>
            </span>
            <span className="svc-go arw text-accent">&rarr;</span>
          </Link>
        ))}
        <div className="rv mt-7 flex flex-col gap-5 border border-accent/25 bg-accent/[.06] px-[clamp(20px,5vw,26px)] py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-[26px]">
          <div>
            <h3 className="n mb-1.5 text-[22px] tracking-[-0.02em]">Not sure which one you need?</h3>
            <p className="max-w-[44ch] text-body">
              Describe the part of your week that annoys you most. I&rsquo;ll tell you which of the three it is.
            </p>
          </div>
          <Link href={LINKS.contact} className="inkbtn flex-none self-start">
            Ask me
          </Link>
        </div>
      </div>
    </section>
  );
}
