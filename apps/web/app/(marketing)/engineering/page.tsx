import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/CtaBand";
import { GitHubIcon, LinkedInIcon } from "@/components/marketing/Icons";
import { GRID, H2, Label, PageIntro, Section } from "@/components/marketing/Section";
import { LINKS } from "@/components/marketing/links";
import { EDUCATION, EXPERIENCE, SIDE_PROJECTS, SKILLS } from "@/content/resume";

export const metadata: Metadata = {
  title: "Engineering & résumé",
  description:
    "Backend and infrastructure engineer: distributed systems, media pipelines, test infrastructure and the Linux and CI plumbing underneath. Résumé and experience.",
  alternates: { canonical: LINKS.engineering },
  openGraph: { type: "website", url: LINKS.engineering },
};

export default function EngineeringPage() {
  return (
    <>
      <PageIntro
        label="Engineering & résumé"
        title="Backend and infrastructure engineer."
        actions={
          <>
            <a href={LINKS.resume} className="cta">
              Download résumé <span className="arw">&rarr;</span>
            </a>
            <a href={LINKS.github} target="_blank" rel="noopener" className="cta-ghost gap-2.5">
              <GitHubIcon /> GitHub
            </a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener" className="cta-ghost gap-2.5">
              <LinkedInIcon /> LinkedIn
            </a>
          </>
        }
      >
        <p>
          I build and run production systems at Global Virtual Opportunities in San Antonio: a social-media orchestration
          platform producing ten thousand posts a day, the infrastructure under a hundred and forty Linux servers, and the
          test harness around a legacy payments monolith. I study computer science at UTSA and ship my own product,
          SheetX, on the side.
        </p>
      </PageIntro>

      <Section id="experience" className={GRID.side}>
        <div className="rv">
          <Label className="mb-5">Experience</Label>
          <H2 measure={14} className="mb-3">
            {EXPERIENCE.company}
          </H2>
          <p className="text-body">{EXPERIENCE.role}</p>
          <p className="l mt-3 text-muted">
            {EXPERIENCE.period}
            <br />
            {EXPERIENCE.place}
          </p>
          <p className="mt-4 font-mono text-[13px] text-muted">{EXPERIENCE.products}</p>
        </div>
        <ul className="rv min-w-0 max-w-[64ch]">
          {EXPERIENCE.bullets.map((bullet) => (
            <li key={bullet} className="border-t border-ink/[.14] py-3.5 text-body">
              {bullet}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="projects" className={GRID.side}>
        <div className="rv">
          <Label className="mb-5">Projects</Label>
          <H2 measure={14}>Things I built because I wanted them to exist.</H2>
        </div>
        <div className="rv min-w-0">
          {SIDE_PROJECTS.map((project) => (
            <article key={project.title} className="border-t border-ink/[.14] py-6">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
                <Link href={`${LINKS.work}/${project.slug}`} className="n navlink tap text-[22px] tracking-[-0.02em]">
                  {project.title}
                </Link>
                <span className="font-mono text-[13px] text-muted">{project.stack}</span>
              </div>
              <p className="max-w-[62ch] text-body">{project.body}</p>
            </article>
          ))}
          <p className="pt-6">
            <Link href={LINKS.work} className="go navlink tap text-accent">
              All work, with the detail <span className="arw">&rarr;</span>
            </Link>
          </p>
        </div>
      </Section>

      <Section id="skills" className={GRID.side}>
        <div className="rv">
          <Label className="mb-5">Skills</Label>
          <H2 measure={14}>What I reach for.</H2>
        </div>
        <dl className="rv min-w-0">
          {SKILLS.map((row) => (
            <div key={row.group} className="grid grid-cols-1 gap-y-1 border-t border-ink/[.14] py-3.5 sm:grid-cols-[minmax(96px,160px)_1fr] sm:gap-x-5 sm:gap-y-0">
              <dt className="l text-muted">{row.group}</dt>
              <dd className="m-0 text-body">{row.items}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="education" className={GRID.side}>
        <div className="rv">
          <Label className="mb-5">Education</Label>
          <H2 measure={14}>Studying full time and shipping anyway.</H2>
        </div>
        <div className="rv min-w-0">
          {EDUCATION.map((entry) => (
            <div
              key={entry.school}
              className="flex flex-col gap-1 border-t border-ink/[.14] py-4 sm:grid sm:grid-cols-[1fr_auto] sm:gap-x-6"
            >
              <div className="order-2 sm:order-none">
                <div className="n text-[21px] leading-[1.25] tracking-[-0.02em]">{entry.school}</div>
                <div className="text-body">{entry.degree}</div>
                {entry.note ? <div className="mt-1 text-sm text-muted">{entry.note}</div> : null}
              </div>
              <div className="l order-1 text-muted sm:order-none">{entry.when}</div>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand
        label="Hiring or collaborating"
        title="Open to engineering roles worth relocating for."
        body="Backend, infrastructure and platform work. Send the role, or just say hello."
        action={{ href: LINKS.contact, text: "Get in touch" }}
        note="Or reach me directly on LinkedIn."
      />
    </>
  );
}
