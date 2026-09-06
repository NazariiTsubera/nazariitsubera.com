import Image from "next/image";
import Link from "next/link";

import { GitHubIcon, LinkedInIcon } from "./Icons";
import { H1, Label } from "./Section";
import { LINKS } from "./links";

export function Hero() {
  return (
    <section className="grid grid-cols-1 items-center gap-[clamp(30px,5vw,64px)] border-t border-ink/[.14] pb-page-bottom pt-page-top wide:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
      <div className="rv">
        <Label className="mb-5">San Antonio, Texas &mdash; automation, custom software, applied AI</Label>
        <H1 measure={14} className="mb-6">
          I build software that runs itself.
        </H1>
        <p className="mb-8 max-w-[46ch] text-[19px] leading-[1.6] text-body">
          I&rsquo;m Nazarii Tsubera, a backend and infrastructure engineer at Global Virtual Opportunities and a computer
          science student at UTSA. I take on a small number of client projects directly.
        </p>
        <div className="actions">
          <Link href={LINKS.contact} className="cta">
            Get started <span className="arw">&rarr;</span>
          </Link>
          <Link href={LINKS.work} className="cta-ghost">
            See the work
          </Link>
        </div>
        {/* gap-y-6 keeps the 44px touch targets of two wrapped rows from overlapping. */}
        <div className="mt-7 flex flex-wrap items-center gap-x-[22px] gap-y-6">
          <a href={LINKS.github} target="_blank" rel="noopener" className="go navlink tap inline-flex items-center gap-2 text-body">
            <GitHubIcon />
            GitHub
          </a>
          <a href={LINKS.linkedin} target="_blank" rel="noopener" className="go navlink tap inline-flex items-center gap-2 text-body">
            <LinkedInIcon />
            LinkedIn
          </a>
          <Link href={LINKS.engineering} className="go navlink tap inline-flex items-center text-accent">
            R&eacute;sum&eacute; &amp; engineering
          </Link>
        </div>
      </div>
      <div className="rv w-full max-w-[260px] justify-self-center sm:max-w-[300px] wide:max-w-[340px] wide:justify-self-end">
        <Image
          src="/portrait.png"
          alt="Nazarii Tsubera"
          width={1254}
          height={1254}
          sizes="(min-width: 860px) 340px, (min-width: 640px) 300px, 260px"
          priority
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}
