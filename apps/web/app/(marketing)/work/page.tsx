import type { Metadata } from "next";

import { CtaBand } from "@/components/marketing/CtaBand";
import { H2, Label, PageIntro, Section } from "@/components/marketing/Section";
import { Shot } from "@/components/marketing/WorkGrid";
import { LINKS } from "@/components/marketing/links";
import { PROJECTS } from "@/content/projects";

export const metadata: Metadata = {
  title: "Selected work",
  description:
    "Four systems currently in use: a website and client portal for a San Antonio CPA, the MarkoMax publishing platform, the LoveFund donation platform, and SheetX, my own product.",
  alternates: { canonical: LINKS.work },
};

export default function WorkPage() {
  return (
    <>
      <PageIntro label="Selected work" title="Four systems currently in use.">
        <p>
          One for a local client, two at Global Virtual Opportunities, and one of my own. Each entry says what the system
          does for the people using it, then what is underneath.
        </p>
      </PageIntro>

      {PROJECTS.map((project) => (
        <Section
          key={project.slug}
          id={project.slug}
          className="grid grid-cols-1 items-start gap-[clamp(24px,4vw,52px)] min-[860px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
        >
          <div className="rv">
            <Shot project={project} sizes="(min-width: 860px) 55vw, 100vw" />
          </div>
          <div className="rv min-w-0">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <H2>{project.title}</H2>
              <span className="l text-muted">{project.tag}</span>
            </div>
            <p className="mb-5 max-w-[56ch] text-lg leading-[1.65] text-body">{project.summary}</p>
            <p className="max-w-[56ch] text-body">{project.detail}</p>
            {project.under ? (
              <>
                <Label className="mb-2 mt-7">Under the hood</Label>
                <ul className="max-w-[56ch]">
                  {project.under.map((line) => (
                    <li key={line} className="border-t border-ink/[.14] py-3 text-body">
                      {line}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {project.href ? (
              <p className="mt-6">
                <a href={project.href} target="_blank" rel="noopener" className="l navlink text-accent">
                  Visit {new URL(project.href).hostname} <span className="arw">&rarr;</span>
                </a>
              </p>
            ) : null}
          </div>
        </Section>
      ))}

      <CtaBand
        label="Your project"
        title="Something like this, sized for your business."
        body="Most of what I build for clients is smaller than these: one job automated, one tool that replaces the spreadsheet."
        action={{ href: LINKS.contact, text: "Start a conversation" }}
      />
    </>
  );
}
