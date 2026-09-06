import Image from "next/image";
import Link from "next/link";

import type { Project, Shot as ShotData } from "@/content/projects";

import { GRID } from "./Section";
import { LINKS } from "./links";

/** One screenshot from content/projects.ts, in a hairline frame. */
export function Shot({
  shot,
  sizes,
  priority = false,
  frame = true,
}: {
  shot: ShotData;
  sizes: string;
  priority?: boolean;
  frame?: boolean;
}) {
  return (
    <div className={frame ? "shot border border-ink/[.14]" : "border border-ink/[.14]"}>
      <Image
        src={`/work/${shot.file}`}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        sizes={sizes}
        priority={priority}
        className="h-auto w-full"
      />
    </div>
  );
}

/** Compact grid for the landing page; every card opens its article. */
export function WorkGrid({ projects }: { projects: Project[] }) {
  return (
    <div className={GRID.cards2}>
      {projects.map((project) => (
        <Link key={project.slug} href={`${LINKS.work}/${project.slug}`} className="rv group block">
          {project.shots?.[0] ? <Shot shot={project.shots[0]} sizes="(min-width: 640px) 50vw, 100vw" /> : null}
          <div className="pt-4">
            {/* The tag wraps to its own line rather than being clipped: "Global Virtual
                Opportunities" does not fit beside a title on a 320px screen. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="n text-[20px] transition-colors group-hover:text-accent">{project.title}</span>
              <span className="l text-muted">{project.tag}</span>
            </div>
            <p className="mt-2 text-body">{project.summary}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
