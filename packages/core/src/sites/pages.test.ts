import { describe, expect, it } from "vitest";

import { expiredPage, notFoundPage } from "./pages";

describe("static pages", () => {
  it("not found is a complete document without scripts", () => {
    const html = notFoundPage();
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<title>Not found</title>");
    expect(html).not.toMatch(/<script/i);
  });

  it("expired names the operator, links the phone, and links the claim page", () => {
    const html = expiredPage({
      operatorName: "Nazarii Tsubera",
      operatorPhone: "+12105550100",
      claimUrl: "https://nazariitsubera.com/claim/pearl",
    });
    expect(html).toContain("Nazarii Tsubera");
    expect(html).toContain('href="tel:+12105550100"');
    expect(html).toContain('href="https://nazariitsubera.com/claim/pearl"');
    expect(html).toContain('<meta name="robots" content="noindex">');
  });
});
