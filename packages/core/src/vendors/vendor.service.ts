import { type Vendor, type VendorStatus, type VendorTier } from "../db";
import { slugify, uniqueSlug } from "../hosting";
import { invalidateSite } from "../sites";
import { siteRepository } from "../sites/site.repository";
import { vendorRepository } from "./vendor.repository";
import { CONSENT_TEXT, type CreateVendorInput, type UpdateVendorInput } from "./vendor.schema";

export const vendorService = {
  /** Allocates a free slug, stores the consent wording verbatim, and records the event. */
  async create(input: CreateVendorInput, now = new Date()): Promise<Vendor> {
    const slug = await uniqueSlug(slugify(input.businessName), siteRepository.slugTaken);
    const vendor = await vendorRepository.create({
      businessName: input.businessName,
      contactName: input.contactName ?? null,
      phone: input.phone,
      instagramHandle: input.instagramHandle ?? null,
      bestSellerNote: input.bestSellerNote ?? null,
      slug,
      photoConsent: true,
      consentText: CONSENT_TEXT,
      consentAt: now,
      ...(input.marketId ? { market: { connect: { id: input.marketId } } } : {}),
    });
    await siteRepository.recordEvent(vendor.id, "vendor_created", { slug });
    return vendor;
  },

  get: vendorRepository.get,
  list: vendorRepository.list,

  async update(id: string, patch: UpdateVendorInput): Promise<Vendor> {
    const { marketId, ...rest } = patch;
    return vendorRepository.update(id, {
      ...rest,
      ...(marketId === undefined ? {} : marketId === null ? { market: { disconnect: true } } : { market: { connect: { id: marketId } } }),
    });
  },

  async setStatus(id: string, status: VendorStatus, tier?: VendorTier): Promise<Vendor> {
    const vendor = await vendorRepository.update(id, { status, ...(tier ? { tier } : {}) });
    if (status === "won") await siteRepository.recordEvent(id, "marked_won", { tier: tier ?? "none" });
    if (status === "lost") await siteRepository.recordEvent(id, "marked_lost");
    invalidateSite(vendor.slug);
    return vendor;
  },
};
