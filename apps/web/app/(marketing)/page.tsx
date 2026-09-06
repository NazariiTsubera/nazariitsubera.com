import type { Metadata } from "next";
import Link from "next/link";

import { AboutTeaser } from "@/components/marketing/AboutTeaser";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Hero } from "@/components/marketing/Hero";
import { Paths } from "@/components/marketing/Paths";
import { Problem } from "@/components/marketing/Problem";
import { Process } from "@/components/marketing/Process";
import { H2, Section } from "@/components/marketing/Section";
import { ServiceRows } from "@/components/marketing/ServiceRows";
import { Stats } from "@/components/marketing/Stats";
import { WorkGrid } from "@/components/marketing/WorkGrid";
import { LINKS } from "@/components/marketing/links";
import { PROJECTS } from "@/content/projects";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Paths />
      <Problem />
      <ServiceRows />
      <Process />
      <Stats />
      <Section>
        <div className="rv mb-3.5 flex flex-wrap items-baseline justify-between gap-x-[18px] gap-y-2">
          <H2 id="work">Selected work</H2>
          <Link href={LINKS.work} className="go navlink tap text-accent">
            All work <span className="arw">&rarr;</span>
          </Link>
        </div>
        <p className="rv mb-7 max-w-[54ch] text-body">
          A few of the systems I&rsquo;ve built and run &mdash; for a client, at Global Virtual Opportunities, and on my
          own. Each has a write-up with the technical detail.
        </p>
        <WorkGrid projects={PROJECTS.filter((project) => project.featured)} />
      </Section>
      <AboutTeaser />
      <CtaBand />
    </>
  );
}
