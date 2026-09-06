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
import { POSTS } from "@/content/writing";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/" },
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
      <Section>
        <div className="rv mb-3.5 flex flex-wrap items-baseline justify-between gap-x-[18px] gap-y-2">
          <H2 id="writing">Writing</H2>
          <Link href={LINKS.writing} className="go navlink tap text-accent">
            All writing <span className="arw">&rarr;</span>
          </Link>
        </div>
        <p className="rv mb-7 max-w-[54ch] text-body">
          Notes on automation, applied AI and infrastructure, for owners first and engineers second.
        </p>
        <div className="grid grid-cols-1 gap-[clamp(14px,2vw,18px)] sm:grid-cols-3">
          {POSTS.slice(0, 3).map((post) => (
            <Link key={post.slug} href={`${LINKS.writing}/${post.slug}`} className="path rv flex flex-col gap-3 p-[clamp(18px,4vw,24px)]">
              <span className="l text-accent">{post.topic}</span>
              <span className="n text-[22px] leading-[1.2] tracking-[-0.02em] text-ink">{post.title}</span>
              <p className="text-body">{post.description}</p>
              <span className="go mt-auto pt-1 text-ink">
                Read <span className="arw">&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      </Section>
      <AboutTeaser />
      <CtaBand />
    </>
  );
}
