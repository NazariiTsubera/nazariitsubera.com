import Image from "next/image";

import { findShot } from "@/content/projects";

/**
 * A screenshot inside an article. The file is looked up in content/projects.ts, which carries the
 * dimensions and a default caption, so an MDX body only needs `<Figure src="markomax-2.png" />`.
 */
export function Figure({ src, caption }: { src: string; caption?: string }) {
  const shot = findShot(src);
  if (!shot) throw new Error(`No screenshot named ${src} in content/projects.ts`);
  return (
    <figure>
      <Image
        src={`/work/${shot.file}`}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        sizes="(min-width: 1120px) 1024px, 100vw"
        className="h-auto w-full"
      />
      <figcaption>{caption ?? shot.caption}</figcaption>
    </figure>
  );
}
