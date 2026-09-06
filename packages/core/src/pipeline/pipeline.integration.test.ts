import sharp from "sharp";
import { beforeEach, describe, expect, it } from "vitest";

import { assetService } from "../assets";
import { captureService } from "../captures";
import { prisma } from "../db";
import { lintHtml } from "../gate";
import { jobRepository } from "../jobs";
import { seedMarkets } from "../markets";
import { clearSiteCache, prismaSiteStore, serveSite } from "../sites";
import { storage } from "../storage";
import { createVendorSchema } from "../vendors";
import { vendorService } from "../vendors/vendor.service";
import { runGenerateSite } from "./generate-site";

/** A product-like photo: a coloured subject on the white foam board the playbook recommends. */
async function photo(colour: string, width = 600, height = 600): Promise<Uint8Array> {
  const subject = await sharp({
    create: { width: Math.round(width / 2), height: Math.round(height / 2), channels: 3, background: colour },
  })
    .png()
    .toBuffer();
  const data = await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
    .composite([{ input: subject, left: Math.round(width / 4), top: Math.round(height / 4) }])
    .jpeg()
    .toBuffer();
  return new Uint8Array(data);
}

async function addAsset(vendorId: string, bytes: Uint8Array, sha: string, kind: "product" | "scene" | "person") {
  const { asset } = await assetService.startUpload({ vendorId, contentType: "image/jpeg", sha256: sha, bytes: bytes.length });
  await storage().put(asset.originalKey, bytes, "image/jpeg");
  await assetService.setKind(asset.id, kind);
  return asset;
}

async function seedVendor() {
  await seedMarkets();
  const market = await prisma.market.findFirstOrThrow();
  const vendor = await vendorService.create(
    createVendorSchema.parse({
      businessName: `Pipeline Vendor ${Date.now()}`,
      phone: "+12105550123",
      consent: true,
      marketId: market.id,
    }),
  );

  const scene = await addAsset(vendor.id, await photo("#B9C6B0", 800, 600), "s".repeat(64), "scene");
  await assetService.setHero(scene.id);
  await addAsset(vendor.id, await photo("#B8462B"), "a".repeat(64), "product");
  await addAsset(vendor.id, await photo("#2F6B3A"), "b".repeat(64), "product");

  const audio = new Uint8Array([1, 2, 3, 4]);
  const { capture } = await captureService.startUpload({
    vendorId: vendor.id,
    contentType: "audio/webm",
    sha256: "c".repeat(64),
    bytes: audio.length,
  });
  await storage().put(capture.audioKey, audio, "audio/webm");
  return vendor;
}

beforeEach(async () => {
  await prisma.event.deleteMany();
  await prisma.job.deleteMany();
  await prisma.vendor.updateMany({ data: { publishedVersionId: null } });
  await prisma.siteVersion.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.capture.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.market.deleteMany();
  clearSiteCache();
});

describe("runGenerateSite", () => {
  it("takes a capture all the way to a published, gate-clean preview", async () => {
    const vendor = await seedVendor();
    const job = await jobRepository.create(vendor.id, "generate_site", {});

    const result = await runGenerateSite(job.id, vendor.id);
    expect(result.gatePassed).toBe(true);

    const after = await prisma.vendor.findUniqueOrThrow({ where: { id: vendor.id }, include: { publishedVersion: true } });
    expect(after.status).toBe("preview_live");
    expect(after.publishedVersionId).toBe(result.versionId);
    expect(after.previewExpiresAt).toBeInstanceOf(Date);

    const html = after.publishedVersion!.html;
    expect(html).toContain("<!doctype html>");
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain("nt:banner");
    expect(html).toContain('name="robots"');

    // The published page still satisfies the static rules once the banner is injected.
    expect(lintHtml(html).filter((v) => v.rule !== "size")).toEqual([]);

    const transcript = await prisma.capture.findFirstOrThrow({ where: { vendorId: vendor.id } });
    expect(transcript.transcriptStatus).toBe("done");
    expect(transcript.transcript).toBeTruthy();
  }, 120_000);

  it("cuts out products, writes derived variants, and skips that work on a rerun", async () => {
    const vendor = await seedVendor();
    const first = await jobRepository.create(vendor.id, "generate_site", {});
    await runGenerateSite(first.id, vendor.id);

    const product = await prisma.asset.findFirstOrThrow({ where: { vendorId: vendor.id, kind: "product" } });
    expect(product.status).toBe("processed");
    expect(product.cutoutKey).toBeTruthy();

    const derived = product.derived as unknown as { variants: Record<string, string>; width: number; height: number };
    expect(Object.keys(derived.variants).sort()).toEqual(["w1440", "w480", "w960"]);
    expect(derived.width).toBe(derived.height); // product cards are square

    const second = await jobRepository.create(vendor.id, "generate_site", {});
    await runGenerateSite(second.id, vendor.id);

    const steps = (await jobRepository.get(second.id))!.steps as unknown as { name: string; status: string }[];
    expect(steps.find((s) => s.name === "images")?.status).toBe("skipped");
    expect(steps.find((s) => s.name === "transcribe")?.status).toBe("skipped");
    expect(steps.find((s) => s.name === "publish")?.status).toBe("succeeded");

    expect(await prisma.siteVersion.count({ where: { vendorId: vendor.id } })).toBe(2);
  }, 180_000);

  it("serves the generated site on its subdomain", async () => {
    const vendor = await seedVendor();
    const job = await jobRepository.create(vendor.id, "generate_site", {});
    await runGenerateSite(job.id, vendor.id);
    clearSiteCache();

    const response = await serveSite({
      slug: vendor.slug,
      path: "/",
      search: new URLSearchParams(),
      store: prismaSiteStore,
      ctx: { operatorName: "Nazarii Tsubera", operatorPhone: "+12105550100", claimBaseUrl: "https://nazariitsubera.com/claim" },
    });

    expect(response.status).toBe(200);
    expect(response.headers["X-Robots-Tag"]).toBe("noindex");
    expect(response.headers["Content-Security-Policy"]).toBe("script-src 'none'");
    expect(response.body).toContain(vendor.businessName);
  }, 120_000);

  it("reuses content for a design regenerate and reuses the page for a republish", async () => {
    const vendor = await seedVendor();
    const first = await jobRepository.create(vendor.id, "generate_site", {});
    await runGenerateSite(first.id, vendor.id, "generate_site");

    const original = await prisma.vendor.findUniqueOrThrow({ where: { id: vendor.id }, include: { publishedVersion: true } });
    const originalContent = JSON.stringify(original.publishedVersion!.contentJson);

    const design = await jobRepository.create(vendor.id, "regenerate_design", {});
    await runGenerateSite(design.id, vendor.id, "regenerate_design");
    const designSteps = (await jobRepository.get(design.id))!.steps as unknown as { name: string; status: string }[];
    expect(designSteps.find((s) => s.name === "content")?.status).toBe("skipped");
    expect(designSteps.find((s) => s.name === "design")?.status).toBe("succeeded");

    const afterDesign = await prisma.vendor.findUniqueOrThrow({ where: { id: vendor.id }, include: { publishedVersion: true } });
    expect(JSON.stringify(afterDesign.publishedVersion!.contentJson)).toBe(originalContent);

    const republish = await jobRepository.create(vendor.id, "republish", {});
    await runGenerateSite(republish.id, vendor.id, "republish");
    const republishSteps = (await jobRepository.get(republish.id))!.steps as unknown as { name: string; status: string }[];
    expect(republishSteps.find((s) => s.name === "design")?.status).toBe("skipped");

    expect(await prisma.siteVersion.count({ where: { vendorId: vendor.id } })).toBe(3);
  }, 180_000);

  it("forces image work for reprocess_assets", async () => {
    const vendor = await seedVendor();
    const first = await jobRepository.create(vendor.id, "generate_site", {});
    await runGenerateSite(first.id, vendor.id, "generate_site");

    const reprocess = await jobRepository.create(vendor.id, "reprocess_assets", {});
    await runGenerateSite(reprocess.id, vendor.id, "reprocess_assets");
    const steps = (await jobRepository.get(reprocess.id))!.steps as unknown as { name: string; status: string }[];
    expect(steps.find((s) => s.name === "images")?.status).toBe("succeeded");
  }, 180_000);
});
