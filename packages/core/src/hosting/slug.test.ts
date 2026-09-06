import { describe, expect, it } from "vitest";

import { RESERVED_SLUGS, slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases, hyphenates, trims, and caps at 40 characters", () => {
    expect(slugify("  Pearl Street Pottery! ")).toBe("pearl-street-pottery");
    expect(slugify("Café Núñez & Sons")).toBe("cafe-nunez-sons");
    expect(slugify("x".repeat(60))).toHaveLength(40);
  });

  it("never returns a reserved word or an empty string", () => {
    expect(slugify("www")).toBe("www-shop");
    expect(slugify("!!!")).toBe("vendor");
    expect(RESERVED_SLUGS.has("console")).toBe(true);
  });
});

describe("uniqueSlug", () => {
  it("appends a counter until the slug is free", async () => {
    const taken = new Set(["pearl", "pearl-2"]);
    expect(await uniqueSlug("pearl", async (s) => taken.has(s))).toBe("pearl-3");
    expect(await uniqueSlug("fresh", async () => false)).toBe("fresh");
  });
});
