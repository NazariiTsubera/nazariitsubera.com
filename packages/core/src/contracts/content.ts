import { z } from "zod";

export const CONTENT_SCHEMA_VERSION = 1 as const;

export const TONES = ["warm", "playful", "crafted", "technical", "minimal"] as const;
export const toneSchema = z.enum(TONES);
export type Tone = z.infer<typeof toneSchema>;

/** E.164: a plus sign, a non-zero country code digit, then 6 to 14 more digits. */
export const E164_PHONE = /^\+[1-9]\d{6,14}$/;

export const productSchema = z.object({
  assetId: z.string().min(1),
  name: z.string().min(1).max(32),
  blurb: z.string().min(1).max(90).nullable(),
  priceHint: z.string().min(1).max(24).nullable(),
  checkoutUrl: z.url().nullable(),
  source: z.object({ provider: z.string().min(1), itemId: z.string().min(1) }).nullable(),
});
export type Product = z.infer<typeof productSchema>;

export const marketRefSchema = z.object({
  name: z.string().min(1).max(80),
  mapsUrl: z.url().nullable(),
  scheduleNote: z.string().min(1).max(120).nullable(),
});
export type MarketRef = z.infer<typeof marketRefSchema>;

export const contentJsonSchema = z
  .object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    businessName: z.string().min(1).max(80),
    tagline: z.string().min(1).max(60),
    heroHeadline: z.string().min(1).max(48),
    heroSub: z.string().min(1).max(110),
    about: z.string().min(1).max(600).nullable(),
    tone: toneSchema,
    heroAssetId: z.string().min(1).nullable(),
    personAssetId: z.string().min(1).nullable(),
    products: z.array(productSchema).max(20),
    visit: z.object({
      markets: z.array(marketRefSchema).max(6),
      note: z.string().min(1).max(120).nullable(),
    }),
    contact: z.object({
      phone: z.string().regex(E164_PHONE, "phone must be E.164, for example +12105550123"),
      instagramHandle: z.string().min(1).max(30).nullable(),
      ctaLabel: z.string().min(1).max(20),
    }),
  })
  .refine((c) => new Set(c.products.map((p) => p.assetId)).size === c.products.length, {
    message: "product assetIds must be unique",
    path: ["products"],
  });
export type ContentJson = z.infer<typeof contentJsonSchema>;
