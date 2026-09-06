import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/CtaBand";
import { GRID, H2, Label, PageIntro, Section } from "@/components/marketing/Section";
import { LINKS } from "@/components/marketing/links";
import { POSTS, TOPIC_ORDER } from "@/content/writing";
import { readingTime } from "@/lib/reading-time";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on automation, applied AI and infrastructure for business owners and engineers: what to automate first, where AI pays, and how to run systems that stay up.",
  alternates: { canonical: LINKS.writing },
  openGraph: { type: "website", url: LINKS.writing },
};

const TOPIC_INTRO: Record<(typeof TOPIC_ORDER)[number], string> = {
  Automation: "For owners: which work to hand to software, and what changes when you do.",
  "Applied AI": "Where language models genuinely help a small business, and where they are a liability.",
  Engineering: "For engineers: the practices behind the systems on the work page.",
};

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function WritingPage() {
  return (
    <>
      <PageIntro label="Writing" title="Notes on building things that run themselves.">
        <p>
          Short pieces on automation, infrastructure and where AI actually earns its place. Written for owners first and
          engineers second, so skip the parts that are not for you.
        </p>
      </PageIntro>

      {TOPIC_ORDER.map((topic) => {
        const group = POSTS.filter((post) => post.topic === topic);
        if (group.length === 0) return null;
        return (
          <Section key={topic} className={GRID.side}>
            <div className="rv">
              <Label className="mb-5">Topic</Label>
              <H2 measure={14}>{topic}</H2>
              <p className="mt-4 max-w-[34ch] text-body">{TOPIC_INTRO[topic]}</p>
            </div>
            <div className="min-w-0">
              {group.map((post) => (
                <Link
                  key={post.slug}
                  href={`${LINKS.writing}/${post.slug}`}
                  className="path rv mb-[clamp(14px,2vw,18px)] flex flex-col gap-3 p-[clamp(18px,4vw,26px)]"
                >
                  <span className="l flex flex-wrap items-baseline gap-x-3 gap-y-1 text-muted">
                    <time dateTime={post.published}>{dateFormat.format(new Date(post.published))}</time>
                    <span className="text-faint">/</span>
                    <span>{readingTime(post.slug)} min read</span>
                  </span>
                  <span className="n text-[clamp(22px,4.5vw,26px)] leading-[1.15] tracking-[-0.02em] text-ink">{post.title}</span>
                  <p className="max-w-[60ch] text-body">{post.description}</p>
                  <span className="go mt-auto pt-1 text-ink">
                    Read <span className="arw">&rarr;</span>
                  </span>
                </Link>
              ))}
            </div>
          </Section>
        );
      })}

      <CtaBand />
    </>
  );
}
