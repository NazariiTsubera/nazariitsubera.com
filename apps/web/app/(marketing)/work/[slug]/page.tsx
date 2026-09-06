import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CtaBand } from "@/components/marketing/CtaBand";
import { H1, Label } from "@/components/marketing/Section";
import { Shot } from "@/components/marketing/WorkGrid";
import { LINKS, SITE_URL } from "@/components/marketing/links";
import { PROJECTS, findProject } from "@/content/projects";
import { ARTICLES } from "@/content/work";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `${LINKS.work}/${project.slug}` },
    openGraph: { type: "article", publishedTime: project.published, authors: ["Nazarii Tsubera"] },
  };
}

export default async function WorkArticlePage({ params }: Params) {
  const { slug } = await params;
  const project = findProject(slug);
  const load = ARTICLES[slug];
  if (!project || !load) notFound();
  const { default: Body } = await load();

  const index = PROJECTS.indexOf(project);
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const external = project.href && !project.href.startsWith("/") ? new URL(project.href) : null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: project.title,
    description: project.summary,
    datePublished: project.published,
    url: `${SITE_URL}${LINKS.work}/${project.slug}`,
    author: { "@type": "Person", name: "Nazarii Tsubera", url: SITE_URL },
  };

  return (
    <>
      <header className="rv border-t border-ink/[.14] pb-[clamp(30px,4vw,48px)] pt-page-top">
        <Label mark={false} className="mb-6">
          <Link href={LINKS.work} className="navlink tap">
            Work
          </Link>{" "}
          <span className="text-faint">/</span> {project.tag} <span className="text-faint">/</span> {project.period}
        </Label>
        <H1 measure={22} className="mb-6">
          {project.title}
        </H1>
        <p className="max-w-[58ch] text-lg leading-[1.65] text-body">{project.summary}</p>
        <div className="mt-7 flex flex-wrap items-baseline gap-x-8 gap-y-4">
          {project.stack ? <span className="font-mono text-[13px] text-muted">{project.stack}</span> : null}
          {external ? (
            <a href={project.href} target="_blank" rel="noopener" className="go navlink tap text-accent">
              Visit {external.hostname} <span className="arw">&rarr;</span>
            </a>
          ) : project.href ? (
            <Link href={project.href} className="go navlink tap text-accent">
              See the offer <span className="arw">&rarr;</span>
            </Link>
          ) : null}
        </div>
      </header>

      {project.file ? (
        <div className="rv mb-[clamp(30px,4vw,48px)]">
          <Shot project={project} sizes="(min-width: 1120px) 1024px, 100vw" priority />
        </div>
      ) : null}

      <article className="article rv pb-[clamp(34px,4.5vw,56px)]">
        <Body />
      </article>

      <nav aria-label="More work" className="rv border-t border-ink/[.14] py-8">
        <Label className="mb-3">Next</Label>
        <Link
          href={`${LINKS.work}/${next.slug}`}
          className="n navlink inline-block text-[clamp(22px,2.4vw,28px)] leading-[1.25] tracking-[-0.02em]"
        >
          {next.title} <span className="arw">&rarr;</span>
        </Link>
      </nav>

      {project.tag === "Client" ? (
        <CtaBand />
      ) : (
        <CtaBand
          label="Hiring or collaborating"
          title="Want to talk about work like this?"
          body="Backend, infrastructure and platform engineering. Send the role or the problem, or just say hello."
          action={{ href: LINKS.contact, text: "Get in touch" }}
          note="Or reach me directly on LinkedIn."
        />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
