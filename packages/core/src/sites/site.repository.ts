import { type EventType, type Prisma, prisma, type Vendor } from "../db";
import type { PublishedSite, SiteStore } from "./serve";

export type CreateVendorInput = {
  businessName: string;
  phone: string;
  slug: string;
  contactName?: string | null;
  instagramHandle?: string | null;
  photoConsent?: boolean;
  consentText?: string | null;
  consentAt?: Date | null;
};

export const siteRepository = {
  findVendorBySlug: (slug: string) => prisma.vendor.findUnique({ where: { slug } }),

  slugTaken: async (slug: string): Promise<boolean> => (await prisma.vendor.count({ where: { slug } })) > 0,

  createVendor: (data: CreateVendorInput): Promise<Vendor> => prisma.vendor.create({ data }),

  recordEvent: (vendorId: string | null, type: EventType, meta: Prisma.InputJsonValue = {}) =>
    prisma.event.create({ data: { vendorId, type, meta } }),
};

/** The SiteStore the serving layer uses in production. */
export const prismaSiteStore: SiteStore = {
  async findPublishedBySlug(slug): Promise<PublishedSite | null> {
    const vendor = await prisma.vendor.findUnique({ where: { slug }, include: { publishedVersion: true } });
    if (!vendor?.publishedVersion) return null;
    const flags = vendor.publishedVersion.renderFlags as { noindex?: boolean };
    return {
      vendorId: vendor.id,
      slug: vendor.slug,
      status: vendor.status,
      previewToken: vendor.previewToken,
      previewExpiresAt: vendor.previewExpiresAt,
      previewOpenedAt: vendor.previewOpenedAt,
      html: vendor.publishedVersion.html,
      noindex: flags.noindex ?? true,
    };
  },

  /** Conditional update, so a reload or a second visitor never records a second open. */
  async markPreviewOpened(vendorId): Promise<boolean> {
    const updated = await prisma.vendor.updateMany({
      where: { id: vendorId, previewOpenedAt: null },
      data: { previewOpenedAt: new Date() },
    });
    if (updated.count === 0) return false;
    await siteRepository.recordEvent(vendorId, "preview_opened");
    return true;
  },
};
