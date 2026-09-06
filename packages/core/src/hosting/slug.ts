export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "www", "app", "api", "admin", "console", "img", "mail", "static", "claim", "storefront",
  "dev", "staging", "sites", "assets",
]);

/** Lowercase ASCII, hyphen separated, at most 40 characters, never reserved, never empty. */
export function slugify(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  if (!base) return "vendor";
  return RESERVED_SLUGS.has(base) ? `${base}-shop` : base;
}

/** Ask `taken` for successive candidates until one is free: pearl, pearl-2, pearl-3, ... */
export async function uniqueSlug(base: string, taken: (slug: string) => Promise<boolean>): Promise<string> {
  if (!(await taken(base))) return base;
  for (let n = 2; ; n += 1) {
    const candidate = `${base}-${n}`;
    if (!(await taken(candidate))) return candidate;
  }
}
