import sharp from "sharp";

import { assetService } from "../src/assets";
import { captureService } from "../src/captures";
import { contentJsonSchema } from "../src/contracts";
import { prisma } from "../src/db";
import { env } from "../src/env";
import { enqueue, jobRepository } from "../src/jobs";
import { seedMarkets } from "../src/markets";
import { storage } from "../src/storage";
import { createVendorSchema } from "../src/vendors";
import { vendorService } from "../src/vendors/vendor.service";

/**
 * Builds a complete demo vendor and drives it through the real pipeline, so the whole loop can
 * be seen without going to a market. Photos are generated: a coloured subject on the white foam
 * board the field playbook recommends, which is exactly what the local cutout keys out.
 */

const PRODUCTS = [
  { name: "Speckled mug", blurb: "Twelve ounces with a wide handle.", colour: "#B8462B", shape: "round" },
  { name: "Serving bowl", blurb: "Wide and shallow, made for a full table.", colour: "#2F6B3A", shape: "wide" },
  { name: "Bud vase", blurb: "Holds one stem and a lot of attention.", colour: "#6B4E2E", shape: "tall" },
  { name: "Pour-over set", blurb: "Dripper and carafe, glazed to match.", colour: "#3B3BD9", shape: "tall" },
  { name: "Salt cellar", blurb: null, colour: "#C2185B", shape: "round" },
  { name: "Dinner plate", blurb: "Ten inches, stackable, quietly speckled.", colour: "#8B7355", shape: "wide" },
] as const;

const TRANSCRIPT =
  "I started throwing pots in a community studio about six years ago and never stopped. " +
  "Everything on this table is thrown and glazed by hand, so no two come out quite the same. " +
  "The speckled mugs are what people come back for. I'm at the Pearl most Saturdays, near the " +
  "fountain under the blue tent. People ask me all the time if I have a website.";

async function photo(colour: string, shape: string): Promise<Uint8Array> {
  const size = 900;
  const [w, h] = shape === "wide" ? [520, 300] : shape === "tall" ? [260, 560] : [420, 420];
  const subject = await sharp({ create: { width: w, height: h, channels: 4, background: colour } })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${Math.min(w, h) / 6}" fill="${colour}"/></svg>`,
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const data = await sharp({ create: { width: size, height: size, channels: 3, background: "#f7f7f5" } })
    .composite([{ input: subject, left: Math.round((size - w) / 2), top: Math.round((size - h) / 2) }])
    .jpeg({ quality: 92 })
    .toBuffer();
  return new Uint8Array(data);
}

async function scenePhoto(): Promise<Uint8Array> {
  const data = await sharp({ create: { width: 1600, height: 900, channels: 3, background: "#9CAF9A" } })
    .composite([
      { input: Buffer.from(`<svg width="1600" height="900"><rect x="0" y="620" width="1600" height="280" fill="#8B7355"/><rect x="220" y="300" width="1160" height="330" rx="18" fill="#B7C4B4"/></svg>`), top: 0, left: 0 },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
  return new Uint8Array(data);
}

async function upload(vendorId: string, bytes: Uint8Array, kind: "product" | "scene" | "person", alt: string) {
  const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as unknown as ArrayBuffer))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const { asset } = await assetService.startUpload({ vendorId, contentType: "image/jpeg", sha256: sha, bytes: bytes.length, alt });
  await storage().put(asset.originalKey, bytes, "image/jpeg");
  await assetService.setKind(asset.id, kind);
  return asset;
}

async function waitForJob(jobId: string, label: string): Promise<void> {
  for (let i = 0; i < 120; i += 1) {
    const job = await jobRepository.get(jobId);
    if (job?.status === "succeeded") return;
    if (job?.status === "failed") throw new Error(`${label} failed: ${job.error}`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`${label} did not finish in time`);
}

async function main(): Promise<void> {
  const e = env();
  await seedMarkets();
  const market = await prisma.market.findFirstOrThrow({ where: { slug: "pearl-farmers-market" } });

  const name = "Pearl Street Pottery";
  const existing = await prisma.vendor.findFirst({ where: { businessName: name } });
  if (existing) await prisma.vendor.delete({ where: { id: existing.id } });

  const vendor = await vendorService.create(
    createVendorSchema.parse({
      businessName: name,
      contactName: "Maria",
      phone: "(210) 555-0123",
      instagramHandle: "@pearlstreetpottery",
      marketId: market.id,
      bestSellerNote: "The speckled mugs",
      consent: true,
    }),
  );
  console.log(`vendor ${vendor.slug}`);

  const scene = await upload(vendor.id, await scenePhoto(), "scene", "The Pearl Street Pottery booth");
  await assetService.setHero(scene.id);
  const productAssets = [];
  for (const product of PRODUCTS) {
    productAssets.push(await upload(vendor.id, await photo(product.colour, product.shape), "product", product.name));
  }
  console.log(`uploaded ${productAssets.length + 1} photos`);

  const audio = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);
  const { capture } = await captureService.startUpload({
    vendorId: vendor.id,
    contentType: "audio/webm",
    sha256: [...audio].map(() => "ab").join("").padEnd(64, "c").slice(0, 64),
    bytes: audio.length,
    durationSec: 96,
  });
  await storage().put(capture.audioKey, audio, "audio/webm");
  await captureService.setPrompt(capture.id, "Warm and unhurried. She is proud of the speckle.");

  console.log("generating…");
  const first = await enqueue(vendor.id, "generate_site");
  await waitForJob(first.id, "generation");

  // Without an API key the fake content generator produces placeholder names. Stand in for the
  // model by writing the copy a real generation would produce, then regenerate the design from it
  // through the same content-editor path the console uses.
  const version = await prisma.siteVersion.findFirstOrThrow({ where: { vendorId: vendor.id }, orderBy: { createdAt: "desc" } });
  const content = contentJsonSchema.parse({
    schemaVersion: 1,
    businessName: name,
    tagline: "Small-batch stoneware from San Antonio",
    heroHeadline: "Mugs made for slow mornings",
    heroSub: "Thrown and glazed by hand in a home studio. Find us at the Pearl most Saturdays.",
    about:
      "Maria started throwing pots in a community studio six years ago and never stopped. " +
      "Every piece is thrown, trimmed, and glazed by hand, so no two are quite the same. " +
      "Most weekends you will find her at the Pearl with a table full of new work.",
    tone: "warm",
    heroAssetId: scene.id,
    personAssetId: null,
    products: productAssets.map((asset, index) => ({
      assetId: asset.id,
      name: PRODUCTS[index].name,
      blurb: PRODUCTS[index].blurb,
      priceHint: null,
      checkoutUrl: null,
      source: null,
    })),
    visit: {
      markets: [{ name: market.name, mapsUrl: market.mapsUrl, scheduleNote: market.scheduleNote }],
      note: "Look for the blue tent near the fountain.",
    },
    contact: { phone: vendor.phone, instagramHandle: "pearlstreetpottery", ctaLabel: "Call or text" },
  });
  await prisma.siteVersion.update({ where: { id: version.id }, data: { contentJson: content } });
  await prisma.capture.update({ where: { id: capture.id }, data: { transcript: TRANSCRIPT, transcriptStatus: "done" } });

  const second = await enqueue(vendor.id, "regenerate_design");
  await waitForJob(second.id, "redesign");

  const published = await prisma.vendor.findUniqueOrThrow({ where: { id: vendor.id }, include: { publishedVersion: true } });
  const report = published.publishedVersion?.gateReport as { passed?: boolean; browserRan?: boolean } | null;

  console.log(`\ngate passed: ${report?.passed} (browser checks ran: ${report?.browserRan})`);
  console.log(`console: ${e.NEXT_PUBLIC_APP_URL}/console/${vendor.id}`);
  console.log(`site:    http://${vendor.slug}.localhost:3000/`);
  console.log(`live:    https://${vendor.slug}.${e.SITE_ROOT_DOMAIN}/`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
