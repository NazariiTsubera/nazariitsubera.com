import { describe, expect, it } from "vitest";

import { CONSENT_TEXT, createVendorSchema } from "./vendor.schema";

const valid = { businessName: "Pearl Street Pottery", phone: "(210) 555-0123", consent: true as const };

describe("createVendorSchema", () => {
  it("normalizes a US phone number to E.164", () => {
    expect(createVendorSchema.parse(valid).phone).toBe("+12105550123");
    expect(createVendorSchema.parse({ ...valid, phone: "210-555-0123" }).phone).toBe("+12105550123");
    expect(createVendorSchema.parse({ ...valid, phone: "+12105550123" }).phone).toBe("+12105550123");
  });

  it("strips a leading @ from the instagram handle", () => {
    expect(createVendorSchema.parse({ ...valid, instagramHandle: "@pearl" }).instagramHandle).toBe("pearl");
  });

  it("requires consent", () => {
    const result = createVendorSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it("rejects an unusable phone number and an empty business name", () => {
    expect(createVendorSchema.safeParse({ ...valid, phone: "123" }).success).toBe(false);
    expect(createVendorSchema.safeParse({ ...valid, businessName: "  " }).success).toBe(false);
  });

  it("states the consent wording that gets stored", () => {
    expect(CONSENT_TEXT).toContain("phone number");
    expect(CONSENT_TEXT).toContain("portfolio");
  });
});
