import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../db";
import { clearSiteCache } from "./cache";
import { serveSite } from "./serve";
import { prismaSiteStore, siteRepository } from "./site.repository";
import { siteService } from "./site.service";

const ctx = {
  operatorName: "Nazarii Tsubera",
  operatorPhone: "+12105550100",
  claimBaseUrl: "https://nazariitsubera.com/claim",
};
const content = { schemaVersion: 1, businessName: "Pearl" };
const now = new Date("2026-09-05T12:00:00Z");
const flags = { preview: true, noindex: true, previewDaysLeft: 7 };

const newVendor = () => siteRepository.createVendor({ businessName: "Pearl", phone: "+12105550123", slug: "pearl" });

const publish = (vendorId: string, html: string) =>
  siteService.publishSite({ vendorId, contentJson: content, html, authoredBy: "template", themeId: "market", flags, now });

beforeEach(async () => {
  await prisma.event.deleteMany();
  await prisma.vendor.updateMany({ data: { publishedVersionId: null } });
  await prisma.siteVersion.deleteMany();
  await prisma.vendor.deleteMany();
  clearSiteCache();
});

describe("publish and serve against Postgres", () => {
  it("publishes immutable versions and swaps the pointer", async () => {
    const vendor = await newVendor();
    const v1 = await publish(vendor.id, "<html><body>one</body></html>");
    const v2 = await publish(vendor.id, "<html><body>two</body></html>");
    expect([v1.version, v2.version]).toEqual([1, 2]);

    const after = await prisma.vendor.findUniqueOrThrow({ where: { id: vendor.id } });
    expect(after.publishedVersionId).toBe(v2.id);
    expect(after.status).toBe("preview_live");
    expect(after.previewExpiresAt?.toISOString()).toBe("2026-09-12T12:00:00.000Z");
    expect(await prisma.siteVersion.count({ where: { vendorId: vendor.id } })).toBe(2);
    expect(await prisma.event.count({ where: { vendorId: vendor.id, type: "preview_published" } })).toBe(2);
  });

  it("serves the published html through the Prisma store and tracks the first open", async () => {
    const vendor = await newVendor();
    await publish(vendor.id, "<html><body>served</body></html>");

    const page = await serveSite({ slug: "pearl", path: "/", search: new URLSearchParams(), store: prismaSiteStore, ctx, now });
    expect(page.status).toBe(200);
    expect(page.body).toContain("served");

    const opened = await serveSite({
      slug: "pearl",
      path: "/",
      search: new URLSearchParams(`p=${vendor.previewToken}`),
      store: prismaSiteStore,
      ctx,
      now,
    });
    expect(opened.status).toBe(302);
    expect(await prismaSiteStore.markPreviewOpened(vendor.id)).toBe(false);
    expect(await prisma.event.count({ where: { vendorId: vendor.id, type: "preview_opened" } })).toBe(1);
  });

  it("expires previews past their date, then extend brings them back", async () => {
    const vendor = await newVendor();
    await publish(vendor.id, "<html><body>x</body></html>");

    const later = new Date("2026-09-13T12:00:00Z");
    expect(await siteService.expirePreviews(later)).toEqual({ expired: 1, churned: 0 });
    clearSiteCache();
    const page = await serveSite({ slug: "pearl", path: "/", search: new URLSearchParams(), store: prismaSiteStore, ctx, now: later });
    expect(page.body).toContain("This preview has ended");

    const extendedTo = await siteService.extendPreview(vendor.id, 7, later);
    expect(extendedTo.toISOString()).toBe("2026-09-20T12:00:00.000Z");
    expect((await prisma.vendor.findUniqueOrThrow({ where: { id: vendor.id } })).status).toBe("preview_live");
  });

  it("unpublish clears the pointer and serving returns not found", async () => {
    const vendor = await newVendor();
    await publish(vendor.id, "<html><body>x</body></html>");
    await siteService.unpublish(vendor.id);
    clearSiteCache();
    const page = await serveSite({ slug: "pearl", path: "/", search: new URLSearchParams(), store: prismaSiteStore, ctx, now });
    expect(page.status).toBe(404);
  });
});
