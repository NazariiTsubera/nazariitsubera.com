import Image from "next/image";
import Link from "next/link";

import { GitHubIcon, LinkedInIcon } from "./Icons";
import { Label } from "./Section";
import { LINKS } from "./links";

export function Hero() {
  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-center gap-[clamp(30px,5vw,64px)] border-t border-ink/[.14] pb-[clamp(36px,5vw,60px)] pt-[clamp(40px,6vw,74px)]">
      <div className="rv">
        <Label className="mb-[26px]">San Antonio, Texas &mdash; automation, custom software, applied AI</Label>
        <h1 className="n mb-6 max-w-[19ch] text-[clamp(32px,4.8vw,54px)] leading-[1.05] tracking-[-0.026em]">
          I automate the work your business still does by hand.
        </h1>
        <p className="mb-[18px] max-w-[46ch] text-lg leading-[1.65] text-body">
          Invoices that send themselves. Schedules that fill themselves. Reports that arrive without anyone building them.
        </p>
        <p className="mb-[30px] max-w-[46ch] text-body">
          I&rsquo;m Nazarii Tsubera, a backend and infrastructure engineer at Global Virtual Opportunities and a computer
          science student at UTSA. I take on a small number of client projects directly.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3.5">
          <Link href={LINKS.contact} className="cta">
            Get started <span className="arw">&rarr;</span>
          </Link>
          <Link href={LINKS.work} className="cta-ghost">
            See the work
          </Link>
        </div>
        <div className="mt-[22px] flex flex-wrap items-baseline gap-x-[22px] gap-y-2.5">
          <a href={LINKS.github} target="_blank" rel="noopener" className="l navlink inline-flex items-center gap-2 text-body">
            <GitHubIcon />
            GitHub
          </a>
          <a href={LINKS.linkedin} target="_blank" rel="noopener" className="l navlink inline-flex items-center gap-2 text-body">
            <LinkedInIcon />
            LinkedIn
          </a>
          <Link href={LINKS.engineering} className="l navlink text-accent">
            R&eacute;sum&eacute; &amp; engineering
          </Link>
        </div>
      </div>
      <div className="rv w-full max-w-[340px] justify-self-end">
        <Image
          src="/portrait.png"
          alt="Nazarii Tsubera"
          width={1254}
          height={1254}
          sizes="(min-width: 640px) 340px, 100vw"
          priority
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}
