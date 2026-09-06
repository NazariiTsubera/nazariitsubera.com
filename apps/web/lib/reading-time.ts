import { readFileSync } from "node:fs";
import path from "node:path";

/** Minutes to read a post, from its MDX source, at a comfortable 230 words a minute. */
export function readingTime(slug: string) {
  const source = readFileSync(path.join(process.cwd(), "content", "writing", `${slug}.mdx`), "utf8");
  const words = source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/<[^>]+>/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
