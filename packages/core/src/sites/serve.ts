import type { VendorStatus } from "../db";
import { cached } from "./cache";
import { expiredPage, notFoundPage } from "./pages";

export type PublishedSite = {
  vendorId: string;
  slug: string;
  status: VendorStatus;
  previewToken: string;
  previewExpiresAt: Date | null;
  previewOpenedAt: Date | null;
  html: string;
  noindex: boolean;
};

export interface SiteStore {
  findPublishedBySlug(slug: string): Promise<PublishedSite | null>;
  /** Returns true the first time a vendor's preview is opened. */
  markPreviewOpened(vendorId: string): Promise<boolean>;
}

export type ServeContext = { operatorName: string; operatorPhone: string; claimBaseUrl: string };
export type ServeResult = { status: number; headers: Record<string, string>; body: string };

const BASE_HEADERS = {
  "Content-Security-Policy": "script-src 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const NOINDEX = { "X-Robots-Tag": "noindex" };

function html(status: number, body: string, extra: Record<string, string> = {}): ServeResult {
  return {
    status,
    body,
    headers: {
      ...BASE_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      ...extra,
    },
  };
}

/** The whole serving layer: a hostname slug and a path in, a response out. */
export async function serveSite(args: {
  slug: string;
  path: string;
  search: URLSearchParams;
  store: SiteStore;
  ctx: ServeContext;
  now?: Date;
}): Promise<ServeResult> {
  const { slug, path, search, store, ctx } = args;
  const now = args.now ?? new Date();

  const site = await cached(`site:${slug}`, () => store.findPublishedBySlug(slug), now.getTime());
  if (!site || site.status === "lost" || site.status === "captured") {
    return html(404, notFoundPage(), NOINDEX);
  }

  const claimUrl = `${ctx.claimBaseUrl}/${site.slug}`;
  const pastDate = site.previewExpiresAt !== null && site.previewExpiresAt <= now && site.status !== "won";
  if (site.status === "expired" || site.status === "churned" || pastDate) {
    return html(200, expiredPage({ operatorName: ctx.operatorName, operatorPhone: ctx.operatorPhone, claimUrl }), NOINDEX);
  }

  if (path === "/robots.txt") {
    return {
      status: 200,
      headers: { ...BASE_HEADERS, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
      body: site.noindex ? "User-agent: *\nDisallow: /\n" : "User-agent: *\nAllow: /\n",
    };
  }
  if (path !== "/") return html(404, notFoundPage(), NOINDEX);

  // The token exists so the operator learns the vendor opened the link. Redirect either way,
  // so the vendor never sees a URL with a token in it.
  const token = search.get("p");
  if (token !== null) {
    if (token === site.previewToken) await store.markPreviewOpened(site.vendorId);
    return { status: 302, headers: { ...BASE_HEADERS, Location: "/", "Cache-Control": "no-store" }, body: "" };
  }

  return html(200, site.html, site.noindex ? NOINDEX : {});
}
