import type { Metadata } from "next";

import { ContactForm } from "@/components/marketing/ContactForm";
import { GitHubIcon, LinkedInIcon } from "@/components/marketing/Icons";
import { GRID, Label, PageIntro, Section } from "@/components/marketing/Section";
import { LINKS } from "@/components/marketing/links";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell me where the friction is in your week and I’ll tell you what’s possible, in plain language, at no cost. Email, phone, or the form. A personal reply from me.",
  alternates: { canonical: LINKS.contact },
};

const DIRECT: { label: string; text: string; href?: string }[] = [
  { label: "Email", href: LINKS.email, text: LINKS.emailText },
  { label: "Call or text", href: LINKS.phone, text: LINKS.phoneText },
  { label: "In person", text: "San Antonio, Texas. Remote anywhere." },
];

export default function ContactPage() {
  return (
    <>
      <PageIntro label="Start here" title="Tell me where the friction is.">
        <p>
          Describe the part of your week that annoys you most, in your own words. I&rsquo;ll tell you what&rsquo;s
          possible and what it would take. No sales team, no jargon, and the first conversation costs nothing.
        </p>
      </PageIntro>

      <Section className={GRID.side}>
        <div className="rv">
          <Label className="mb-5">Directly</Label>
          <dl>
            {DIRECT.map((row) => (
              <div key={row.label} className="border-t border-ink/[.14] py-3.5">
                <dt className="l mb-1 text-muted">{row.label}</dt>
                <dd className="m-0 text-body">
                  {row.href ? (
                    <a href={row.href} className="navlink tap text-ink">
                      {row.text}
                    </a>
                  ) : (
                    row.text
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex flex-wrap items-center gap-x-[22px] gap-y-4">
            <a href={LINKS.linkedin} target="_blank" rel="noopener" className="go navlink tap inline-flex items-center gap-2 text-body">
              <LinkedInIcon /> LinkedIn
            </a>
            <a href={LINKS.github} target="_blank" rel="noopener" className="go navlink tap inline-flex items-center gap-2 text-body">
              <GitHubIcon /> GitHub
            </a>
          </div>
        </div>
        <div className="rv min-w-0">
          <Label className="mb-5">Or write it here</Label>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
