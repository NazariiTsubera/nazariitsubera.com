import type { RenderFlags } from "../contracts/render";
import { type AuthoredBy, type Prisma, prisma, type SiteVersion } from "../db";
import { invalidateSite } from "./cache";
import { siteRepository } from "./site.repository";

const DAY_MS = 24 * 60 * 60 * 1000;

export type PublishInput = {
  vendorId: string;
  contentJson: Prisma.InputJsonValue;
  html: string;
  authoredBy: AuthoredBy;
  themeId: string | null;
  flags: RenderFlags;
  gateReport?: Prisma.InputJsonValue;
  previewDays?: number;
  now?: Date;
};

/** Whole days remaining, floored at zero. Null when there is no expiry. */
export function previewDaysLeft(expiresAt: Date | null, now: Date): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS));
}

export const siteService = {
  /**
   * New immutable version plus an atomic pointer swap. The first publish starts the preview
   * clock; a vendor who has already bought keeps no expiry.
   */
  async publishSite(input: PublishInput): Promise<SiteVersion> {
    const now = input.now ?? new Date();
    const previewDays = input.previewDays ?? 7;

    const { created, slug } = await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.findUniqueOrThrow({ where: { id: input.vendorId } });
      const last = await tx.siteVersion.aggregate({ where: { vendorId: vendor.id }, _max: { version: true } });
      const version = await tx.siteVersion.create({
        data: {
          vendorId: vendor.id,
          version: (last._max.version ?? 0) + 1,
          contentJson: input.contentJson,
          authoredBy: input.authoredBy,
          themeId: input.themeId,
          html: input.html,
          renderFlags: { preview: input.flags.preview, noindex: input.flags.noindex },
          gateReport: input.gateReport,
        },
      });
      const won = vendor.status === "won";
      await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          publishedVersionId: version.id,
          status: won ? "won" : "preview_live",
          previewExpiresAt: won ? null : (vendor.previewExpiresAt ?? new Date(now.getTime() + previewDays * DAY_MS)),
        },
      });
      await tx.event.create({
        data: {
          vendorId: vendor.id,
          type: "preview_published",
          meta: { version: version.version, authoredBy: input.authoredBy },
        },
      });
      return { created: version, slug: vendor.slug };
    });

    invalidateSite(slug);
    return created;
  },

  /** Repeatable sweep: previews past their date expire; won vendors past a grace date churn. */
  async expirePreviews(now = new Date()): Promise<{ expired: number; churned: number }> {
    const toExpire = await prisma.vendor.findMany({
      where: { status: "preview_live", previewExpiresAt: { lte: now } },
      select: { id: true, slug: true },
    });
    const toChurn = await prisma.vendor.findMany({
      where: { status: "won", previewExpiresAt: { lte: now } },
      select: { id: true, slug: true },
    });

    for (const vendor of toExpire) {
      await prisma.vendor.update({ where: { id: vendor.id }, data: { status: "expired" } });
      await siteRepository.recordEvent(vendor.id, "preview_expired");
      invalidateSite(vendor.slug);
    }
    for (const vendor of toChurn) {
      await prisma.vendor.update({ where: { id: vendor.id }, data: { status: "churned" } });
      invalidateSite(vendor.slug);
    }
    return { expired: toExpire.length, churned: toChurn.length };
  },

  async extendPreview(vendorId: string, days: number, now = new Date()): Promise<Date> {
    const previewExpiresAt = new Date(now.getTime() + days * DAY_MS);
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { previewExpiresAt, status: "preview_live" },
    });
    await siteRepository.recordEvent(vendorId, "preview_extended", { days });
    invalidateSite(vendor.slug);
    return previewExpiresAt;
  },

  async unpublish(vendorId: string): Promise<void> {
    const vendor = await prisma.vendor.update({ where: { id: vendorId }, data: { publishedVersionId: null } });
    await siteRepository.recordEvent(vendorId, "unpublished");
    invalidateSite(vendor.slug);
  },
};
