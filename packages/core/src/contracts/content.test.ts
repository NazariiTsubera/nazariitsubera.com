import { describe, expect, it } from "vitest";

import { contentJsonSchema, type ContentJson } from "./content";

function validContent(): ContentJson {
  return {
    schemaVersion: 1,
    businessName: "Pearl Street Pottery",
    tagline: "Small-batch stoneware from San Antonio",
    heroHeadline: "Mugs made for slow mornings",
    heroSub: "Wheel-thrown stoneware, glazed by hand. Find us at the Pearl every Saturday.",
    about: null,
    tone: "warm",
    heroAssetId: "scene-1",
    personAssetId: null,
    products: [
      { assetId: "p1", name: "Speckled mug", blurb: null, priceHint: null, checkoutUrl: null, source: null },
      { assetId: "p2", name: "Serving bowl", blurb: "Wide and shallow.", priceHint: "$48", checkoutUrl: "https://square.link/u/abc", source: null },
    ],
    visit: { markets: [], note: null },
    contact: { phone: "+12105550123", instagramHandle: null, ctaLabel: "Call or text" },
  };
}

describe("contentJsonSchema", () => {
  it("accepts a valid document", () => {
    expect(contentJsonSchema.parse(validContent())).toEqual(validContent());
  });

  it("rejects a tagline over 60 characters", () => {
    const c = { ...validContent(), tagline: "x".repeat(61) };
    expect(contentJsonSchema.safeParse(c).success).toBe(false);
  });

  it("rejects duplicate product asset ids", () => {
    const c = validContent();
    c.products[1] = { ...c.products[1], assetId: "p1" };
    const result = contentJsonSchema.safeParse(c);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("product assetIds must be unique");
    }
  });

  it("rejects a phone that is not E.164", () => {
    const c = validContent();
    c.contact = { ...c.contact, phone: "210-555-0123" };
    expect(contentJsonSchema.safeParse(c).success).toBe(false);
  });

  it("rejects an unknown tone", () => {
    const c = { ...validContent(), tone: "sassy" };
    expect(contentJsonSchema.safeParse(c).success).toBe(false);
  });

  it("rejects a non-URL checkout link", () => {
    const c = validContent();
    c.products[0] = { ...c.products[0], checkoutUrl: "square.link/abc" };
    expect(contentJsonSchema.safeParse(c).success).toBe(false);
  });
});
