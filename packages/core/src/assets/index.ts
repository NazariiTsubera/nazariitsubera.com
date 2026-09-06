import { type Asset, type AssetKind, prisma } from "../db";
import { siteRepository } from "../sites/site.repository";
import { storage, uploadKey } from "../storage";
import type { PresignedUpload } from "../storage";

export type StartUploadInput = {
  vendorId: string;
  contentType: string;
  sha256: string;
  bytes: number;
  alt?: string | null;
};

export const MAX_ASSET_BYTES = 25 * 1024 * 1024;

export const assetService = {
  /**
   * Content addressed and idempotent: re-uploading the same bytes for the same vendor
   * returns the existing row rather than creating a duplicate.
   */
  async startUpload(input: StartUploadInput): Promise<{ asset: Asset; upload: PresignedUpload }> {
    if (input.bytes > MAX_ASSET_BYTES) throw new Error(`Photo is larger than ${MAX_ASSET_BYTES} bytes`);
    const key = uploadKey(input.vendorId, input.sha256, input.contentType);
    const store = storage();

    const existing = await prisma.asset.findUnique({
      where: { vendorId_sha256: { vendorId: input.vendorId, sha256: input.sha256 } },
    });
    if (existing) {
      return { asset: existing, upload: await store.presignUpload(key, input.contentType, input.bytes) };
    }

    const last = await prisma.asset.aggregate({ where: { vendorId: input.vendorId }, _max: { orderIndex: true } });
    const asset = await prisma.asset.create({
      data: {
        vendorId: input.vendorId,
        originalKey: key,
        contentType: input.contentType,
        bytes: input.bytes,
        sha256: input.sha256,
        alt: input.alt ?? null,
        orderIndex: (last._max.orderIndex ?? -1) + 1,
      },
    });
    await siteRepository.recordEvent(input.vendorId, "asset_uploaded", { assetId: asset.id });
    return { asset, upload: await store.presignUpload(key, input.contentType, input.bytes) };
  },

  list: (vendorId: string) => prisma.asset.findMany({ where: { vendorId }, orderBy: { orderIndex: "asc" } }),

  setKind: (id: string, kind: AssetKind) => prisma.asset.update({ where: { id }, data: { kind } }),

  setAlt: (id: string, alt: string | null) => prisma.asset.update({ where: { id }, data: { alt } }),

  /** Exactly one hero per vendor. */
  async setHero(id: string): Promise<Asset> {
    const asset = await prisma.asset.findUniqueOrThrow({ where: { id } });
    return prisma.$transaction(async (tx) => {
      await tx.asset.updateMany({ where: { vendorId: asset.vendorId }, data: { isHero: false } });
      return tx.asset.update({ where: { id }, data: { isHero: true } });
    });
  },

  /** Rewrites order indexes to be contiguous in the order given. */
  async reorder(vendorId: string, ids: string[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, index) => prisma.asset.updateMany({ where: { id, vendorId }, data: { orderIndex: index } })),
    );
  },

  remove: (id: string) => prisma.asset.delete({ where: { id } }),
};
