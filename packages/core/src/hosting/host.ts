import { RESERVED_SLUGS } from "./slug";

export type HostRoute = { kind: "app" } | { kind: "site"; slug: string } | { kind: "domain"; host: string };

const APP_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

/**
 * Decide what a Host header means. Pure and dependency free so the Next proxy can call it
 * on any runtime. rootDomains are the domains whose first-level subdomains are vendor sites.
 */
export function routeHost(rawHost: string | null, rootDomains: string[]): HostRoute {
  if (!rawHost) return { kind: "app" };
  const host = rawHost.toLowerCase().replace(/:\d+$/, "");
  if (APP_HOSTS.has(host) || host.endsWith(".up.railway.app")) return { kind: "app" };

  for (const root of rootDomains) {
    if (host === root || host === `www.${root}`) return { kind: "app" };
    if (host.endsWith(`.${root}`)) {
      const label = host.slice(0, -(root.length + 1));
      if (label.includes(".")) return { kind: "domain", host };
      return RESERVED_SLUGS.has(label) ? { kind: "app" } : { kind: "site", slug: label };
    }
  }
  return { kind: "domain", host };
}
