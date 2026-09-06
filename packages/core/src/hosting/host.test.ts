import { describe, expect, it } from "vitest";

import { routeHost } from "./host";

const roots = ["nazariitsubera.com", "localhost"];

describe("routeHost", () => {
  it("treats the apex, www, railway, and localhost as the app", () => {
    for (const h of [
      "nazariitsubera.com",
      "www.nazariitsubera.com",
      "nazariitsuberacom-production.up.railway.app",
      "localhost:3000",
      "127.0.0.1:3000",
      null,
    ]) {
      expect(routeHost(h, roots)).toEqual({ kind: "app" });
    }
  });

  it("maps a first-level subdomain to a site slug, ignoring port and case", () => {
    expect(routeHost("Pearl-Street-Pottery.nazariitsubera.com", roots)).toEqual({
      kind: "site",
      slug: "pearl-street-pottery",
    });
    expect(routeHost("pearl.localhost:3000", roots)).toEqual({ kind: "site", slug: "pearl" });
  });

  it("treats reserved subdomains as the app", () => {
    expect(routeHost("app.nazariitsubera.com", roots)).toEqual({ kind: "app" });
    expect(routeHost("img.nazariitsubera.com", roots)).toEqual({ kind: "app" });
  });

  it("treats nested subdomains and unknown hosts as custom domains", () => {
    expect(routeHost("a.b.nazariitsubera.com", roots)).toEqual({ kind: "domain", host: "a.b.nazariitsubera.com" });
    expect(routeHost("pearlpottery.com", roots)).toEqual({ kind: "domain", host: "pearlpottery.com" });
  });
});
