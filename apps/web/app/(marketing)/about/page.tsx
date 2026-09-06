import type { Metadata } from "next";
import Image from "next/image";

import { CtaBand } from "@/components/marketing/CtaBand";
import { GRID, H2, Label, PageIntro, Section } from "@/components/marketing/Section";
import { LINKS } from "@/components/marketing/links";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nazarii Tsubera: backend and infrastructure engineer in San Antonio, computer science student at UTSA, and builder of SheetX. One person, start to finish.",
  alternates: { canonical: LINKS.about },
  openGraph: { type: "website", url: LINKS.about },
};

const FACTS = [
  ["Now", "Backend & infrastructure engineer, Global Virtual Opportunities"],
  ["Studying", "B.S. Computer Science, UTSA — class of 2028"],
  ["Based in", "San Antonio, Texas"],
  ["Building", "SheetX — spreadsheets that behave like a real API"],
  ["Interests", "Distributed systems · Linux & CI · Media pipelines · Applied AI"],
  ["Open to", "Consulting work, and engineering roles worth relocating for"],
];

export default function AboutPage() {
  return (
    <>
      <PageIntro label="Who you’re dealing with" title="One person, start to finish.">
        <p>
          I work independently, so the person who listens to the problem is the person who builds the fix and answers the
          phone afterwards. There&rsquo;s no account manager to hand you off to.
        </p>
      </PageIntro>

      <Section className={GRID.even}>
        <div className="rv">
          <Image
            src="/portrait.png"
            alt="Nazarii Tsubera"
            width={1254}
            height={1254}
            sizes="(min-width: 640px) 340px, 100vw"
            priority
            className="h-auto w-full max-w-[260px] sm:max-w-[340px]"
          />
        </div>
        <div className="rv space-y-4">
          <p className="text-body">
            By day I&rsquo;m a backend and infrastructure engineer at Global Virtual Opportunities in San Antonio, where I
            build and run the platforms behind MarkoMax and LoveFund. I&rsquo;m also a computer science student at UTSA,
            class of 2028.
          </p>
          <p className="text-body">
            Most of what I enjoy sits underneath the surface: distributed systems that stay upright under load, the Linux
            and CI plumbing that makes deployments boring, and applied AI used where it genuinely pays for itself. SheetX,
            my own product, came out of that habit of building the tool I wished existed.
          </p>
          <p className="text-body">
            The client work started the same way. Businesses around me were doing by hand what I knew could run on its
            own, and the people selling them software were making it sound harder than it is. I keep it simple: one
            person, plain language, working software in weeks.
          </p>
        </div>
      </Section>

      <Section className={GRID.side}>
        <div className="rv">
          <Label className="mb-5">At a glance</Label>
          <H2 measure={14}>The short version.</H2>
        </div>
        <dl className="rv min-w-0">
          {FACTS.map(([term, detail]) => (
            <div key={term} className="grid grid-cols-1 gap-y-1 border-t border-ink/[.14] py-3.5 sm:grid-cols-[minmax(96px,150px)_1fr] sm:gap-x-5 sm:gap-y-0">
              <dt className="l text-muted">{term}</dt>
              <dd className="m-0 text-body">{detail}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <CtaBand />
    </>
  );
}
