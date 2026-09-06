import { authorPage, generateContent, repairPage, type ContentInput, type ImagePart } from "../ai";
import { contentJsonSchema, type ContentJson } from "../contracts/content";
import type { RenderAsset } from "../contracts/render";
import { type Asset, type JobType, type Prisma, prisma } from "../db";
import { env } from "../env";
import { runGate, toStoredReport, type GateResult } from "../gate";
import { crop, normalize, productCard, removeBackground, variants, VARIANT_WIDTHS } from "../images";
import { jobRepository } from "../jobs";
import { createLogger } from "../logger";
import { finalizePage, previewDaysLeft, siteService } from "../sites";
import { storage } from "../storage";
import { themeForTone } from "../themes";
import { transcribe } from "../transcription";

const log = createLogger({ module: "pipeline" });

const MAX_REPAIRS = 2;

export type PipelineResult = { versionId: string; authored: boolean; gatePassed: boolean; repairs: number };

/**
 * What each job type actually redoes. Everything reuses one orchestration; the type only
 * decides which artifacts are reused and which are rebuilt.
 */
const PLAN: Record<JobType, { forceImages: boolean; reuseContent: boolean; reuseDesign: boolean }> = {
  generate_site: { forceImages: false, reuseContent: false, reuseDesign: false },
  reprocess_assets: { forceImages: true, reuseContent: true, reuseDesign: false },
  regenerate_content: { forceImages: false, reuseContent: false, reuseDesign: false },
  regenerate_design: { forceImages: false, reuseContent: true, reuseDesign: false },
  edit_design: { forceImages: false, reuseContent: true, reuseDesign: true },
  republish: { forceImages: false, reuseContent: true, reuseDesign: true },
};

type Derived = { variants: Record<string, string>; width: number; height: number };

/** Wraps a step so every one records its own start, finish, and error on the durable job row. */
async function step<T>(jobId: string, name: string, run: () => Promise<T>): Promise<T> {
  const startedAt = new Date().toISOString();
  await jobRepository.recordStep(jobId, { name, status: "running", startedAt });
  try {
    const result = await run();
    await jobRepository.recordStep(jobId, { name, status: "succeeded", startedAt, finishedAt: new Date().toISOString() });
    return result;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    await jobRepository.recordStep(jobId, { name, status: "failed", startedAt, finishedAt: new Date().toISOString(), error: detail });
    throw error;
  }
}

async function skipped(jobId: string, name: string): Promise<void> {
  await jobRepository.recordStep(jobId, { name, status: "skipped", startedAt: new Date().toISOString(), finishedAt: new Date().toISOString() });
}

function mediaType(contentType: string): ImagePart["mediaType"] {
  if (contentType === "image/png") return "image/png";
  if (contentType === "image/webp") return "image/webp";
  return "image/jpeg";
}

/**
 * The whole generation, in the order the design lays out. Every step writes its artifact
 * before the next begins and is skipped when that artifact already exists, so a regenerate
 * only redoes what actually changed.
 */
export async function runGenerateSite(
  jobId: string,
  vendorId: string,
  type: JobType = "generate_site",
  options: { instruction?: string } = {},
): Promise<PipelineResult> {
  const e = env();
  const store = storage();
  const plan = PLAN[type];

  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { id: vendorId },
    include: {
      market: true,
      assets: { orderBy: { orderIndex: "asc" } },
      captures: { orderBy: { createdAt: "desc" }, take: 1 },
      publishedVersion: true,
    },
  });
  const capture = vendor.captures[0] ?? null;
  const published = vendor.publishedVersion;

  // 1. Transcribe --------------------------------------------------------------------------
  let transcript = capture?.transcript ?? null;
  if (capture && !transcript) {
    transcript = await step(jobId, "transcribe", async () => {
      const audio = await store.get(capture.audioKey);
      if (!audio) throw new Error(`Recording ${capture.audioKey} is missing from storage`);
      const result = await transcribe(audio, capture.audioMime);
      await prisma.capture.update({
        where: { id: capture.id },
        data: { transcript: result.text, transcriptStatus: "done", durationSec: result.durationSec ?? capture.durationSec },
      });
      return result.text;
    });
  } else if (capture) {
    await skipped(jobId, "transcribe");
  }

  // 2-4. Images ----------------------------------------------------------------------------
  const theme = themeForTone("warm");
  const ground = theme.colors.light.ground;
  const needsWork = plan.forceImages ? vendor.assets : vendor.assets.filter((asset) => !asset.derived);

  if (needsWork.length === 0) {
    await skipped(jobId, "images");
  } else {
    await step(jobId, "images", async () => {
      for (const asset of needsWork) {
        await processAsset(asset, ground, store);
      }
    });
  }

  const assets = await prisma.asset.findMany({ where: { vendorId }, orderBy: { orderIndex: "asc" } });
  const products = assets.filter((a) => a.kind === "product");
  const scenes = assets.filter((a) => a.kind === "scene");
  const person = assets.find((a) => a.kind === "person") ?? null;
  const hero = assets.find((a) => a.isHero) ?? scenes[0] ?? null;

  const renderAssets: Record<string, RenderAsset> = {};
  for (const asset of assets) {
    const derived = asset.derived as unknown as Derived | null;
    if (!derived) continue;
    renderAssets[asset.id] = {
      id: asset.id,
      kind: asset.kind,
      alt: asset.alt ?? "",
      variants: { w480: derived.variants.w480, w960: derived.variants.w960, w1440: derived.variants.w1440 },
      width: derived.width,
      height: derived.height,
    };
  }

  // 5. Content -----------------------------------------------------------------------------
  const contentInput: ContentInput = {
    businessName: vendor.businessName,
    phone: vendor.phone,
    instagramHandle: vendor.instagramHandle,
    transcript,
    operatorPrompt: capture?.operatorPrompt ?? null,
    bestSellerNote: vendor.bestSellerNote,
    market: vendor.market
      ? { name: vendor.market.name, mapsUrl: vendor.market.mapsUrl, scheduleNote: vendor.market.scheduleNote }
      : null,
    products: await Promise.all(
      products.map(async (asset) => ({
        assetId: asset.id,
        image: await loadImagePart(asset, store),
      })),
    ),
    scenes: (await Promise.all(scenes.map((asset) => loadImagePart(asset, store)))).filter(Boolean) as ImagePart[],
    person: person ? await loadImagePart(person, store) : null,
    heroAssetId: hero?.id ?? null,
    personAssetId: person?.id ?? null,
  };

  // Reusing content is what makes "same facts, new design" and a hand edit possible.
  const reusable = plan.reuseContent && published ? contentJsonSchema.safeParse(published.contentJson) : null;
  let content: ContentJson;
  if (reusable?.success) {
    content = reusable.data;
    await skipped(jobId, "content");
  } else {
    content = await step(jobId, "content", () => generateContent(contentInput));
  }

  // 6. Design ------------------------------------------------------------------------------
  const siteUrl = `https://${vendor.slug}.${e.SITE_ROOT_DOMAIN}`;
  const designInput = {
    content,
    assets: renderAssets,
    images: contentInput.scenes.slice(0, 2),
    fonts: [
      { family: theme.fonts.heading.family, url: `/fonts/${theme.fonts.heading.file}` },
      { family: theme.fonts.body.family, url: `/fonts/${theme.fonts.body.file}` },
    ],
    designNotes: vendor.designNotes,
    context: { siteUrl, operatorName: e.OPERATOR_NAME, operatorUrl: e.NEXT_PUBLIC_APP_URL },
  };

  let html: string;
  let authored: boolean;

  if (plan.reuseDesign && published) {
    // republish keeps the page as it is; edit_design applies one instruction to it.
    if (type === "edit_design" && options.instruction) {
      html = await step(jobId, "edit", () =>
        repairPage(published.html, [{ field: "operator", rule: "instruction", detail: options.instruction! }], []),
      );
    } else {
      html = published.html;
      await skipped(jobId, "design");
    }
    authored = published.authoredBy === "model";
  } else {
    const design = await step(jobId, "design", () => authorPage(designInput));
    html = design.html;
    authored = design.authored;
  }

  // 7-9. Gate, repair, fallback --------------------------------------------------------------
  let gate: GateResult = await step(jobId, "gate", () => runGate(html, content));
  let repairs = 0;

  while (!gate.passed && authored && repairs < MAX_REPAIRS) {
    repairs += 1;
    const attempt = repairs;
    html = await step(jobId, `repair-${attempt}`, () => repairPage(html, gate.violations, gate.screenshots));
    gate = await step(jobId, `gate-${attempt}`, () => runGate(html, content));
  }

  if (!gate.passed) {
    await step(jobId, "fallback", async () => {
      const { referencePage } = await import("../ai");
      html = referencePage(designInput);
      authored = false;
      gate = await runGate(html, content);
      log.warn({ vendorId, violations: gate.violations.length }, "authored page failed the gate; using the template");
    });
  }

  // 10. Publish ------------------------------------------------------------------------------
  const version = await step(jobId, "publish", async () => {
    const now = new Date();
    const expiresAt = vendor.previewExpiresAt ?? new Date(now.getTime() + e.PREVIEW_DAYS * 86_400_000);
    const isPreview = vendor.status !== "won";
    const flags = {
      preview: isPreview,
      noindex: isPreview,
      previewDaysLeft: isPreview ? previewDaysLeft(expiresAt, now) : null,
    };
    const claimUrl = `${e.NEXT_PUBLIC_APP_URL}/claim/${vendor.slug}`;

    return siteService.publishSite({
      vendorId,
      contentJson: content as unknown as Prisma.InputJsonValue,
      html: finalizePage(html, flags, { claimUrl }),
      authoredBy: authored ? "model" : "template",
      themeId: authored ? null : theme.id,
      flags,
      gateReport: toStoredReport(gate) as unknown as Prisma.InputJsonValue,
      previewDays: e.PREVIEW_DAYS,
      now,
    });
  });

  return { versionId: version.id, authored, gatePassed: gate.passed, repairs };
}

/** Normalize, cut out if it is a product, build variants, and record the derived keys. */
async function processAsset(asset: Asset, ground: string, store: ReturnType<typeof storage>): Promise<void> {
  const original = await store.get(asset.originalKey);
  if (!original) throw new Error(`Photo ${asset.originalKey} is missing from storage`);

  const normalized = await normalize(original);
  let source = normalized.data;

  if (asset.kind === "product") {
    const cutout = await removeBackground(source);
    const cutoutKey = `assets/${asset.sha256}/cutout.png`;
    await store.put(cutoutKey, cutout, "image/png");
    await prisma.asset.update({ where: { id: asset.id }, data: { cutoutKey } });
    source = await productCard(cutout, ground);
  } else {
    source = await crop(source, asset.kind === "person" ? "4:5" : "16:9");
  }

  const built = await variants(source, VARIANT_WIDTHS);
  const keys: Record<string, string> = {};
  for (const [name, bytes] of Object.entries(built)) {
    const key = `assets/${asset.sha256}/${name}.webp`;
    await store.put(key, bytes, "image/webp");
    keys[name] = store.publicUrl(key);
  }

  const { dimensions } = await import("../images");
  const size = await dimensions(built.w1440 ?? source);
  await prisma.asset.update({
    where: { id: asset.id },
    data: { derived: { variants: keys, width: size.width, height: size.height }, status: "processed" },
  });
}

async function loadImagePart(asset: Asset, store: ReturnType<typeof storage>): Promise<ImagePart | null> {
  const bytes = await store.get(asset.originalKey);
  if (!bytes) return null;
  // Downsized so a full capture of photos fits comfortably in one request.
  const small = await variants(await normalize(bytes).then((n) => n.data), [768]);
  return { mediaType: mediaType("image/webp"), data: small.w768, label: asset.id };
}
