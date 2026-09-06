import { beforeEach, describe, expect, it } from "vitest";

import { assetService } from "../assets";
import { captureService } from "../captures";
import { prisma } from "../db";
import { seedMarkets } from "../markets";
import { createVendorSchema } from "./vendor.schema";
import { vendorService } from "./vendor.service";

const base = { businessName: "Pearl Street Pottery", phone: "(210) 555-0123", consent: true as const };
const make = (over: Record<string, unknown> = {}) => createVendorSchema.parse({ ...base, ...over });

beforeEach(async () => {
  await prisma.event.deleteMany();
  await prisma.vendor.updateMany({ data: { publishedVersionId: null } });
  await prisma.siteVersion.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.capture.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.market.deleteMany();
});

describe("vendorService", () => {
  it("stores consent verbatim and records the event", async () => {
    const vendor = await vendorService.create(make());
    expect(vendor.slug).toBe("pearl-street-pottery");
    expect(vendor.photoConsent).toBe(true);
    expect(vendor.consentText).toContain("phone number");
    expect(vendor.consentAt).toBeInstanceOf(Date);
    expect(await prisma.event.count({ where: { vendorId: vendor.id, type: "vendor_created" } })).toBe(1);
  });

  it("allocates a free slug when the name collides", async () => {
    await vendorService.create(make());
    const second = await vendorService.create(make());
    expect(second.slug).toBe("pearl-street-pottery-2");
  });

  it("connects and disconnects a market", async () => {
    await seedMarkets();
    const market = await prisma.market.findFirstOrThrow();
    const vendor = await vendorService.create(make({ marketId: market.id }));
    expect(vendor.marketId).toBe(market.id);
    expect((await vendorService.update(vendor.id, { marketId: null })).marketId).toBeNull();
  });
});

describe("assets and captures", () => {
  it("is idempotent per vendor and content hash, and orders uploads", async () => {
    const vendor = await vendorService.create(make());
    const one = await assetService.startUpload({ vendorId: vendor.id, contentType: "image/jpeg", sha256: "aaa", bytes: 100 });
    const again = await assetService.startUpload({ vendorId: vendor.id, contentType: "image/jpeg", sha256: "aaa", bytes: 100 });
    const two = await assetService.startUpload({ vendorId: vendor.id, contentType: "image/jpeg", sha256: "bbb", bytes: 100 });

    expect(again.asset.id).toBe(one.asset.id);
    expect([one.asset.orderIndex, two.asset.orderIndex]).toEqual([0, 1]);
    expect(await prisma.asset.count({ where: { vendorId: vendor.id } })).toBe(2);
    expect(one.upload.url).toContain(encodeURIComponent(one.asset.originalKey));
  });

  it("keeps exactly one hero and rewrites order contiguously", async () => {
    const vendor = await vendorService.create(make());
    const a = (await assetService.startUpload({ vendorId: vendor.id, contentType: "image/jpeg", sha256: "a", bytes: 1 })).asset;
    const b = (await assetService.startUpload({ vendorId: vendor.id, contentType: "image/jpeg", sha256: "b", bytes: 1 })).asset;
    const c = (await assetService.startUpload({ vendorId: vendor.id, contentType: "image/jpeg", sha256: "c", bytes: 1 })).asset;

    await assetService.setHero(a.id);
    await assetService.setHero(b.id);
    expect(await prisma.asset.count({ where: { vendorId: vendor.id, isHero: true } })).toBe(1);
    expect((await prisma.asset.findUniqueOrThrow({ where: { id: b.id } })).isHero).toBe(true);

    await assetService.reorder(vendor.id, [c.id, b.id, a.id]);
    const ordered = await assetService.list(vendor.id);
    expect(ordered.map((x) => x.id)).toEqual([c.id, b.id, a.id]);
    expect(ordered.map((x) => x.orderIndex)).toEqual([0, 1, 2]);
  });

  it("records a capture as pending transcription and returns the newest first", async () => {
    const vendor = await vendorService.create(make());
    const first = await captureService.startUpload({ vendorId: vendor.id, contentType: "audio/webm", sha256: "c1", bytes: 10, durationSec: 30 });
    expect(first.capture.transcriptStatus).toBe("pending");

    await new Promise((r) => setTimeout(r, 5));
    const second = await captureService.startUpload({ vendorId: vendor.id, contentType: "audio/webm", sha256: "c2", bytes: 10 });
    expect((await captureService.latest(vendor.id))?.id).toBe(second.capture.id);

    await captureService.setPrompt(second.capture.id, "Lean warm and playful");
    await captureService.setTranscript(second.capture.id, "She has been throwing pots for six years.");
    const stored = await prisma.capture.findUniqueOrThrow({ where: { id: second.capture.id } });
    expect(stored.operatorPrompt).toBe("Lean warm and playful");
    expect(stored.transcriptStatus).toBe("done");
  });

  it("rejects a photo over the size limit", async () => {
    const vendor = await vendorService.create(make());
    await expect(
      assetService.startUpload({ vendorId: vendor.id, contentType: "image/jpeg", sha256: "big", bytes: 26 * 1024 * 1024 }),
    ).rejects.toThrow(/larger than/);
  });
});
