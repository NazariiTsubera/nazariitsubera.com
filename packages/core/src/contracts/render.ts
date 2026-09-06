import { z } from "zod";

import { contentJsonSchema } from "./content";
import { themeIdSchema } from "./theme-id";

export const assetKindSchema = z.enum(["product", "scene", "person"]);
export type AssetKind = z.infer<typeof assetKindSchema>;

/** One image as the template needs it: three widths plus the intrinsic size of the largest. */
export const renderAssetSchema = z.object({
  id: z.string().min(1),
  kind: assetKindSchema,
  alt: z.string().max(160),
  variants: z.object({
    w480: z.string().min(1),
    w960: z.string().min(1),
    w1440: z.string().min(1),
  }),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type RenderAsset = z.infer<typeof renderAssetSchema>;

export const renderFlagsSchema = z.object({
  preview: z.boolean(),
  noindex: z.boolean(),
  previewDaysLeft: z.number().int().nonnegative().nullable(),
});
export type RenderFlags = z.infer<typeof renderFlagsSchema>;

/** Everything about the surrounding world the page needs: where it lives, where to claim it, where assets are. */
export const renderContextSchema = z.object({
  siteUrl: z.string().min(1),
  claimUrl: z.string().min(1),
  assetsBaseUrl: z.string().min(1),
  operatorName: z.string().min(1),
  operatorUrl: z.string().min(1),
});
export type RenderContext = z.infer<typeof renderContextSchema>;

/** Input to the template. Flags (preview, noindex) are not here: finalizePage applies them at publish. */
export const renderInputSchema = z.object({
  content: contentJsonSchema,
  themeId: themeIdSchema,
  assets: z.record(z.string(), renderAssetSchema),
  context: renderContextSchema,
});
export type RenderInput = z.infer<typeof renderInputSchema>;
