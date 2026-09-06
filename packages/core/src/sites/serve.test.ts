import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearSiteCache } from "./cache";
import { serveSite, type PublishedSite, type SiteStore } from "./serve";

const ctx = {
  operatorName: "Nazarii Tsubera",
  operatorPhone: "+12105550100",
  claimBaseUrl: "https://nazariitsubera.com/claim",
};
const now = new Date("2026-09-05T12:00:00Z");

function site(over: Partial<PublishedSite> = {}): PublishedSite {
  return {
    vendorId: "v1",
    slug: "pearl",
    status: "preview_live",
    previewToken: "tok",
    previewExpiresAt: new Date("2026-09-12T12:00:00Z"),
    previewOpenedAt: null,
    html: "<!doctype html>\n<html><head></head><body>pearl</body></html>",
    noindex: true,
    ...over,
  };
}

function makeStore(found: PublishedSite | null) {
  let opened = 0;
  return {
    findPublishedBySlug: vi.fn(async () => found),
    markPreviewOpened: vi.fn(async () => {
      opened += 1;
      return opened === 1;
    }),
  } satisfies SiteStore;
}

const serve = (store: SiteStore, path = "/", search = "", slug = "pearl") =>
  serveSite({ slug, path, search: new URLSearchParams(search), store, ctx, now });

beforeEach(() => clearSiteCache());

describe("serveSite", () => {
  it("returns the not-found page for unknown slugs with the security headers", async () => {
    const r = await serve(makeStore(null));
    expect(r.status).toBe(404);
    expect(r.body).toContain("Nothing here yet");
    expect(r.headers["Content-Security-Policy"]).toBe("script-src 'none'");
    expect(r.headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("serves a live preview with noindex and cache headers", async () => {
    const r = await serve(makeStore(site()));
    expect(r.status).toBe(200);
    expect(r.body).toContain("pearl");
    expect(r.headers["X-Robots-Tag"]).toBe("noindex");
    expect(r.headers["Cache-Control"]).toBe("public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    expect(r.headers["Content-Type"]).toBe("text/html; charset=utf-8");
  });

  it("omits X-Robots-Tag once the site is indexable", async () => {
    const r = await serve(makeStore(site({ status: "won", noindex: false, previewExpiresAt: null })));
    expect(r.headers["X-Robots-Tag"]).toBeUndefined();
  });

  it("serves the expired page for expired and churned vendors", async () => {
    for (const status of ["expired", "churned"] as const) {
      clearSiteCache();
      const r = await serve(makeStore(site({ status })));
      expect(r.status).toBe(200);
      expect(r.body).toContain("This preview has ended");
      expect(r.body).toContain("https://nazariitsubera.com/claim/pearl");
      expect(r.headers["X-Robots-Tag"]).toBe("noindex");
    }
  });

  it("serves the expired page once the preview date has passed", async () => {
    const r = await serve(makeStore(site({ previewExpiresAt: new Date("2026-09-01T00:00:00Z") })));
    expect(r.body).toContain("This preview has ended");
  });

  it("returns not found for lost vendors even with a published version", async () => {
    expect((await serve(makeStore(site({ status: "lost" })))).status).toBe(404);
  });

  it("records the first preview open and redirects to the clean url", async () => {
    const store = makeStore(site());
    const first = await serve(store, "/", "p=tok");
    expect(first.status).toBe(302);
    expect(first.headers.Location).toBe("/");
    expect(store.markPreviewOpened).toHaveBeenCalledWith("v1");

    const wrong = await serve(store, "/", "p=nope");
    expect(wrong.status).toBe(302);
    expect(store.markPreviewOpened).toHaveBeenCalledTimes(1);
  });

  it("answers robots.txt by indexability", async () => {
    expect((await serve(makeStore(site()), "/robots.txt")).body).toContain("Disallow: /");
    clearSiteCache();
    expect((await serve(makeStore(site({ status: "won", noindex: false })), "/robots.txt")).body).toContain("Allow: /");
  });

  it("returns 404 for any other path", async () => {
    expect((await serve(makeStore(site()), "/about")).status).toBe(404);
  });

  it("caches lookups for a slug within the ttl", async () => {
    const store = makeStore(site());
    await serve(store);
    await serve(store);
    expect(store.findPublishedBySlug).toHaveBeenCalledTimes(1);
  });
});
