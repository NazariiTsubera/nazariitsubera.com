import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/CtaBand";
import { Faq } from "@/components/marketing/Faq";
import { Process } from "@/components/marketing/Process";
import { GRID, H2, Label, PageIntro, Section } from "@/components/marketing/Section";
import { LINKS, SITE_URL } from "@/components/marketing/links";
import { SERVICES } from "@/content/services";

export const metadata: Metadata = {
  title: "Automation for San Antonio businesses",
  description:
    "I automate the work your business still does by hand: invoicing, scheduling, reminders, reporting and the tools you keep improvising. Fixed price, plain language.",
  alternates: { canonical: LINKS.business },
  openGraph: { type: "website", url: LINKS.business },
};

const service = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Nazarii Tsubera — automation and custom software",
  url: `${SITE_URL}${LINKS.business}`,
  telephone: "+1-210-980-6600",
  email: "hello@nazariitsubera.com",
  areaServed: { "@type": "City", name: "San Antonio" },
  founder: { "@type": "Person", name: "Nazarii Tsubera" },
  serviceType: ["Business process automation", "Custom software development", "Applied AI"],
};

export default function BusinessPage() {
  return (
    <>
      <PageIntro
        label="For your business"
        title="Automation and custom software for businesses that run on people."
        actions={
          <>
            <Link href={LINKS.contact} className="cta">
              Tell me what’s done by hand <span className="arw">&rarr;</span>
            </Link>
            <a href="#faq" className="cta-ghost">
              Common questions
            </a>
          </>
        }
      >
        <p>
          You know which parts of your week should be automatic. You just don&rsquo;t have time to work out how, or
          patience for people who talk over your head. Tell me about the work in plain words and I&rsquo;ll tell you what
          is possible, what it would cost, and whether it is worth doing at all.
        </p>
      </PageIntro>

      {SERVICES.map((item) => (
        <Section
          key={item.id}
          id={item.id}
          className={GRID.side}
        >
          <div className="rv">
            <Label className="mb-5">{item.n}</Label>
            <H2 measure={16} className="mb-4">
              {item.title}
            </H2>
            <p className="font-mono text-[13px] text-muted">{item.tags}</p>
          </div>
          <div className="rv min-w-0">
            <p className="mb-6 max-w-[60ch] text-lg leading-[1.65] text-body">{item.detail}</p>
            <Label mark={false} className="mb-3">For example</Label>
            <ul className="max-w-[60ch]">
              {item.examples.map((example) => (
                <li key={example} className="border-t border-ink/[.14] py-3 text-body">
                  {example}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ))}

      <Process />

      <Section className="rv">
        <Link
          href={LINKS.storefront}
          className="path flex flex-col gap-5 border border-ink/[.18] px-[clamp(20px,5vw,30px)] py-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-8"
        >
          <div>
            <span className="l mb-3 block text-accent">Market vendors</span>
            <span className="n block text-[clamp(23px,4.5vw,26px)] leading-[1.14] tracking-[-0.02em]">
              A real website for your booth, live the same day.
            </span>
            <p className="mt-3 max-w-[52ch] text-body">
              If you sell at San Antonio markets, this is the fastest way to get a real website: I come to you.
            </p>
          </div>
          <span className="go flex-none text-ink">
            See how it works <span className="arw">&rarr;</span>
          </span>
        </Link>
      </Section>

      <Faq />
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
    </>
  );
}
