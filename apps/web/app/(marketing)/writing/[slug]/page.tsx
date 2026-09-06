import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CtaBand } from "@/components/marketing/CtaBand";
import { H1, Label } from "@/components/marketing/Section";
import { LINKS, SITE_URL } from "@/components/marketing/links";
import { findProject } from "@/content/projects";
import { POSTS, findPost } from "@/content/writing";
import { WRITING } from "@/content/writing/index";
import { readingTime } from "@/lib/reading-time";
import { JsonLd, breadcrumbs } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = findPost((await params).slug);
  if (!post) return {};
  const path = `${LINKS.writing}/${post.slug}`;
  return {
    title: post.metaTitle ?? post.title,
    description: post.description,
    alternates: { canonical: path },
    openGraph: { type: "article", url: path, publishedTime: post.published, authors: ["Nazarii Tsubera"], section: post.topic },
  };
}

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function WritingArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = findPost(slug);
  const load = WRITING[slug];
  if (!post || !load) notFound();
  const { default: Body } = await load();

  const index = POSTS.indexOf(post);
  const next = POSTS[(index + 1) % POSTS.length];
  const related = (post.related ?? []).map(findProject).filter((project) => project !== undefined);
  const url = `${SITE_URL}${LINKS.writing}/${post.slug}`;
  const author = { "@type": "Person", name: "Nazarii Tsubera", url: SITE_URL };

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    articleSection: post.topic,
    datePublished: post.published,
    dateModified: post.published,
    url,
    mainEntityOfPage: url,
    author,
    publisher: author,
  };
  const crumbs = breadcrumbs([
    { name: "Writing", path: LINKS.writing },
    { name: post.metaTitle ?? post.title, path: `${LINKS.writing}/${post.slug}` },
  ]);

  return (
    <>
      <header className="rv border-t border-ink/[.14] pb-[clamp(30px,4vw,48px)] pt-page-top">
        <Label mark={false} className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Link href={LINKS.writing} className="navlink tap">
            Writing
          </Link>
          <span className="text-faint">/</span>
          <span>{post.topic}</span>
          <span className="text-faint">/</span>
          <time dateTime={post.published}>{dateFormat.format(new Date(post.published))}</time>
          <span className="text-faint">/</span>
          <span>{readingTime(post.slug)} min read</span>
        </Label>
        <H1 measure={24} className="mb-6">
          {post.title}
        </H1>
        <p className="max-w-[58ch] text-[19px] leading-[1.6] text-body">{post.description}</p>
      </header>

      <article className="article rv pb-[clamp(34px,4.5vw,56px)]">
        <Body />
      </article>

      {related.length > 0 ? (
        <aside className="rv border-t border-ink/[.14] py-8">
          <Label className="mb-3">From the work</Label>
          <ul className="flex flex-col gap-2">
            {related.map((project) => (
              <li key={project.slug}>
                <Link href={`${LINKS.work}/${project.slug}`} className="n navlink inline-block text-[clamp(20px,2.2vw,24px)] leading-[1.25] tracking-[-0.02em]">
                  {project.title} <span className="arw">&rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      <nav aria-label="More writing" className="rv border-t border-ink/[.14] py-8">
        <Label className="mb-3">Next</Label>
        <Link
          href={`${LINKS.writing}/${next.slug}`}
          className="n navlink inline-block text-[clamp(22px,2.4vw,28px)] leading-[1.25] tracking-[-0.02em]"
        >
          {next.title} <span className="arw">&rarr;</span>
        </Link>
      </nav>

      {post.topic === "Engineering" ? (
        <CtaBand
          label="Hiring or collaborating"
          title="Want to talk about work like this?"
          body="Backend, infrastructure and platform engineering. Send the role or the problem, or just say hello."
          action={{ href: LINKS.contact, text: "Get in touch" }}
          note="Or reach me directly on LinkedIn."
        />
      ) : (
        <CtaBand />
      )}
      <JsonLd data={schema} />
      <JsonLd data={crumbs} />
    </>
  );
}
