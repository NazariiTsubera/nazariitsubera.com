import { describe, expect, it } from "vitest";

import type { ContentJson } from "../contracts/content";
import { checkContent, checkVisibleText, describeViolations, scrubContent } from "./content-guard";

function content(over: Partial<ContentJson> = {}): ContentJson {
  return {
    schemaVersion: 1,
    businessName: "Pearl Street Pottery",
    tagline: "Small-batch stoneware",
    heroHeadline: "Mugs made for slow mornings",
    heroSub: "Wheel-thrown stoneware, glazed by hand.",
    about: "Maria throws every piece by hand in a home studio.",
    tone: "warm",
    heroAssetId: "scene-1",
    personAssetId: null,
    products: [{ assetId: "p1", name: "Speckled mug", blurb: "Twelve ounces.", priceHint: null, checkoutUrl: null, source: null }],
    visit: { markets: [], note: null },
    contact: { phone: "+12105550123", instagramHandle: null, ctaLabel: "Call or text" },
    ...over,
  };
}

describe("checkContent", () => {
  it("passes clean content", () => {
    expect(checkContent(content(), ["p1"])).toEqual([]);
  });

  it.each([
    ["price", { tagline: "Mugs from $24" }],
    ["price", { heroSub: "Bowls are 3 for 50 dollars" }],
    ["years-in-business", { about: "Serving San Antonio since 2011." }],
    ["years-in-business", { about: "She has 12 years of experience." }],
    ["award", { tagline: "Award-winning stoneware" }],
    ["award", { heroSub: "Voted best pottery in town" }],
    ["certification", { about: "All glazes are FDA-approved and food-safe." }],
    ["guarantee", { heroSub: "Satisfaction guaranteed on every piece." }],
    ["policy", { heroSub: "Free shipping on every order." }],
    ["customer-count", { about: "Trusted by thousands of customers." }],
  ])("flags a %s claim", (rule, over) => {
    const violations = checkContent(content(over as Partial<ContentJson>), ["p1"]);
    expect(violations.map((v) => v.rule)).toContain(rule);
  });

  it("flags an invented price inside a product blurb", () => {
    const c = content({ products: [{ assetId: "p1", name: "Mug", blurb: "Only $18 each", priceHint: null, checkoutUrl: null, source: null }] });
    expect(checkContent(c, ["p1"]).map((v) => v.rule)).toContain("price");
  });

  it("does not flag an operator-entered price hint", () => {
    const c = content({ products: [{ assetId: "p1", name: "Mug", blurb: "Twelve ounces.", priceHint: "$24", checkoutUrl: null, source: null }] });
    expect(checkContent(c, ["p1"])).toEqual([]);
  });

  it("rejects a product that is not one of the vendor's photos, and a photo with no product", () => {
    const c = content({ products: [{ assetId: "ghost", name: "Mug", blurb: null, priceHint: null, checkoutUrl: null, source: null }] });
    const rules = checkContent(c, ["p1"]).map((v) => v.rule);
    expect(rules).toContain("unknown-asset");
    expect(rules).toContain("missing-asset");
  });
});

describe("scrubContent", () => {
  it("nulls optional fields and replaces required ones with something plainly true", () => {
    const dirty = content({ about: "Serving since 2011.", heroSub: "Free shipping worldwide.", tagline: "Mugs from $24" });
    const scrubbed = scrubContent(dirty, checkContent(dirty, ["p1"]));

    expect(scrubbed.about).toBeNull();
    expect(scrubbed.heroSub).toBe("Find Pearl Street Pottery at the market.");
    expect(scrubbed.tagline).toBe("Pearl Street Pottery");
    expect(checkContent(scrubbed, ["p1"])).toEqual([]);
  });

  it("leaves clean content untouched", () => {
    const clean = content();
    expect(scrubContent(clean, [])).toBe(clean);
  });
});

describe("checkVisibleText", () => {
  it("catches a claim that only appears in the rendered page", () => {
    expect(checkVisibleText("Handmade mugs. Free shipping on all orders.").map((v) => v.rule)).toContain("policy");
    expect(checkVisibleText("Handmade mugs, thrown one at a time.")).toEqual([]);
  });
});

describe("describeViolations", () => {
  it("writes one actionable line per violation", () => {
    const text = describeViolations(checkContent(content({ tagline: "Mugs from $24" }), ["p1"]));
    expect(text).toMatch(/^- tagline: /);
  });
});
