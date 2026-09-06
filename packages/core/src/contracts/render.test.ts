import { describe, expect, it } from "vitest";

import { renderAssetSchema, renderFlagsSchema, renderInputSchema } from "./render";

describe("render contracts", () => {
  it("accepts a render asset with three variants", () => {
    const asset = {
      id: "p1",
      kind: "product",
      alt: "Speckled mug",
      variants: { w480: "images/p1-w480.webp", w960: "images/p1-w960.webp", w1440: "images/p1-w1440.webp" },
      width: 1440,
      height: 1440,
    };
    expect(renderAssetSchema.parse(asset)).toEqual(asset);
  });

  it("rejects an asset missing a variant", () => {
    const asset = {
      id: "p1",
      kind: "product",
      alt: "",
      variants: { w480: "a", w960: "b" },
      width: 1,
      height: 1,
    };
    expect(renderAssetSchema.safeParse(asset).success).toBe(false);
  });

  it("requires previewDaysLeft to be null or a non-negative integer", () => {
    expect(renderFlagsSchema.safeParse({ preview: true, noindex: true, previewDaysLeft: 6 }).success).toBe(true);
    expect(renderFlagsSchema.safeParse({ preview: false, noindex: false, previewDaysLeft: null }).success).toBe(true);
    expect(renderFlagsSchema.safeParse({ preview: true, noindex: true, previewDaysLeft: -1 }).success).toBe(false);
  });

  it("rejects an unknown theme id on the render input", () => {
    const result = renderInputSchema.safeParse({
      content: {},
      themeId: "neon",
      assets: {},
      context: { siteUrl: "x", claimUrl: "x", assetsBaseUrl: ".", operatorName: "N", operatorUrl: "x" },
    });
    expect(result.success).toBe(false);
  });
});
