type Entry = { value: unknown; expires: number };

const TTL_MS = 30_000;
const entries = new Map<string, Entry>();

/** Tiny in-process TTL cache for slug lookups. The TTL covers publishes from another process. */
export async function cached<T>(key: string, load: () => Promise<T>, now = Date.now()): Promise<T> {
  const hit = entries.get(key);
  if (hit && hit.expires > now) return hit.value as T;
  const value = await load();
  entries.set(key, { value, expires: now + TTL_MS });
  return value;
}

export function invalidateSite(slug: string): void {
  entries.delete(`site:${slug}`);
}

export function clearSiteCache(): void {
  entries.clear();
}
