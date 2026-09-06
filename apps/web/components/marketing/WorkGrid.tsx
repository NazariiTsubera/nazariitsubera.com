import { existsSync } from "node:fs";
import path from "node:path";

import Image from "next/image";
import Link from "next/link";

import type { Project } from "@/content/projects";

import { LINKS } from "./links";

/** Screenshots are 3230x1626. Until a file lands in public/work, a labelled frame holds its place. */
export function Shot({ project, sizes }: { project: Project; sizes: string }) {
  const present = existsSync(path.join(process.cwd(), "public", "work", project.file));
  const image = present ? (
    <Image src={`/work/${project.file}`} alt={project.alt} width={3230} height={1626} sizes={sizes} className="h-auto w-full" />
  ) : (
    <div className="flex aspect-[3230/1626] items-center justify-center bg-band px-4 text-center">
      <span className="l text-muted">Screenshot pending: work/{project.file}</span>
    </div>
  );
  if (!project.href) return <div className="shot border border-ink/[.16]">{image}</div>;
  return (
    <a href={project.href} target="_blank" rel="noopener" className="shot block border border-ink/[.16]">
      {image}
    </a>
  );
}

/** Compact grid for the landing page; every card leads to its entry on /work. */
export function WorkGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[clamp(24px,3.5vw,40px)]">
      {projects.map((project) => (
        <figure key={project.slug} className="rv m-0">
          <Shot project={project} sizes="(min-width: 700px) 50vw, 100vw" />
          <figcaption className="pt-[15px]">
            <div className="flex items-baseline justify-between gap-3">
              <Link href={`${LINKS.work}#${project.slug}`} className="n navlink text-[19px]">
                {project.title}
              </Link>
              <span className="l flex-none text-muted">{project.tag}</span>
            </div>
            <p className="mt-2 text-body">{project.summary}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
