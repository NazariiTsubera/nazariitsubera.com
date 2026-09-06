import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderInputSchema, themeIdSchema } from "../src/contracts";
import { prisma } from "../src/db";
import { env } from "../src/env";
import { slugify, uniqueSlug } from "../src/hosting";
import { finalizePage, previewDaysLeft, siteRepository, siteService } from "../src/sites";
import { renderSite } from "../src/template";

const coreRoot = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);

function opt(name: string, fallback: string): string {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

async function main(): Promise<void> {
  const e = env();
  const fixtureDir = path.resolve(coreRoot, opt("fixture", "fixtures/demo-vendor"));
  const raw = JSON.parse(readFileSync(path.join(fixtureDir, "render-input.json"), "utf8")) as Record<string, unknown>;
  const themeArg = opt("theme", "");
  const parsed = renderInputSchema.parse(themeArg ? { ...raw, themeId: themeIdSchema.parse(themeArg) } : raw);

  const baseSlug = slugify(parsed.content.businessName);
  const existing = await siteRepository.findVendorBySlug(baseSlug);
  const vendor =
    existing ??
    (await siteRepository.createVendor({
      businessName: parsed.content.businessName,
      phone: parsed.content.contact.phone,
      slug: await uniqueSlug(baseSlug, siteRepository.slugTaken),
    }));

  const siteUrl = `https://${vendor.slug}.${e.SITE_ROOT_DOMAIN}`;
  const claimUrl = `${e.NEXT_PUBLIC_APP_URL}/claim/${vendor.slug}`;
  // Images are served from the site's own origin; fonts live at /fonts on every host.
  const input = {
    ...parsed,
    context: { ...parsed.context, siteUrl, claimUrl, assetsBaseUrl: "/", operatorName: e.OPERATOR_NAME },
  };
  const { html } = renderSite(input);

  const now = new Date();
  const expiresAt = vendor.previewExpiresAt ?? new Date(now.getTime() + e.PREVIEW_DAYS * 86_400_000);
  const flags = { preview: true, noindex: true, previewDaysLeft: previewDaysLeft(expiresAt, now) };

  const version = await siteService.publishSite({
    vendorId: vendor.id,
    contentJson: input.content,
    html: finalizePage(html, flags, { claimUrl }),
    authoredBy: "template",
    themeId: input.themeId,
    flags,
    previewDays: e.PREVIEW_DAYS,
    now,
  });

  console.log(`Published ${vendor.businessName} v${version.version} as ${vendor.slug}`);
  console.log(`  live:  ${siteUrl}/?p=${vendor.previewToken}`);
  console.log(`  local: http://${vendor.slug}.localhost:3000/?p=${vendor.previewToken}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
