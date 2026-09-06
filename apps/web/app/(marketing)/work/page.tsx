import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/CtaBand";
import { GRID, H2, Label, PageIntro, Section } from "@/components/marketing/Section";
import { Shot } from "@/components/marketing/WorkGrid";
import { LINKS } from "@/components/marketing/links";
import { PROJECTS, TAG_ORDER } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Systems I have built and run: a client's website and portal, the MarkoMax publishing platform, payments and infrastructure work at Global Virtual Opportunities, and my own products SheetX and Booth to MRR. Each with the technical detail.",
  alternates: { canonical: LINKS.work },
};

const GROUP_INTRO: Record<(typeof TAG_ORDER)[number], string> = {
  Client: "Projects I take on directly for local businesses.",
  "Global Virtual Opportunities": "Production systems I build and run in my day job as a backend and infrastructure engineer.",
  "My own": "Products and side projects, built because I wanted them to exist.",
};

export default function WorkPage() {
  return (
    <>
      <PageIntro label="Work" title="Systems in use, and what is underneath them.">
        <p>
          Each project has its own write-up: what the system does for the people using it, then how it is built and the
          decisions that mattered. Written for owners first and engineers second, so skip the parts that are not for you.
        </p>
      </PageIntro>

      {TAG_ORDER.map((tag) => {
        const group = PROJECTS.filter((project) => project.tag === tag);
        return (
          <Section
            key={tag}
            className={GRID.side}
          >
            <div className="rv">
              <Label className="mb-5">{tag === "My own" ? "My own products" : tag === "Client" ? "For a client" : "At work"}</Label>
              <H2 measure={16}>{tag}</H2>
              <p className="mt-4 max-w-[34ch] text-body">{GROUP_INTRO[tag]}</p>
            </div>
            <div className={`min-w-0 ${GRID.cards2}`}>
              {group.map((project) => (
                <Link
                  key={project.slug}
                  href={`${LINKS.work}/${project.slug}`}
                  className="path rv flex flex-col gap-3 border border-ink/[.18] p-[clamp(18px,4vw,22px)]"
                >
                  {project.shots?.[0] ? <Shot shot={project.shots[0]} sizes="(min-width: 860px) 33vw, 100vw" frame={false} /> : null}
                  <span className="l text-muted">{project.period}</span>
                  <span className="n text-[clamp(22px,4.5vw,24px)] leading-[1.15] tracking-[-0.02em] text-ink">{project.title}</span>
                  <p className="text-body">{project.summary}</p>
                  {project.stack ? <span className="font-mono text-[13px] text-muted">{project.stack}</span> : null}
                  <span className="go mt-auto pt-2 text-ink">
                    Read <span className="arw">&rarr;</span>
                  </span>
                </Link>
              ))}
            </div>
          </Section>
        );
      })}

      <CtaBand
        label="Your project"
        title="Something like this, sized for your business."
        body="Most of what I build for clients is smaller than these: one job automated, one tool that replaces the spreadsheet."
        action={{ href: LINKS.contact, text: "Start a conversation" }}
      />
    </>
  );
}
