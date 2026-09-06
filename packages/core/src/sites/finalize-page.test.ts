import { describe, expect, it } from "vitest";

import { finalizePage } from "./finalize-page";

const base = "<!doctype html>\n<html><head><title>x</title></head><body><main>hi</main></body></html>";
const ctx = { claimUrl: "https://nazariitsubera.com/claim/pearl?x=1&y=2" };

describe("finalizePage", () => {
  it("injects noindex and a banner for previews", () => {
    const out = finalizePage(base, { preview: true, noindex: true, previewDaysLeft: 6 }, ctx);
    expect(out).toContain('<meta name="robots" content="noindex">');
    expect(out).toContain("Expires in 6 days.");
    expect(out).toContain('href="https://nazariitsubera.com/claim/pearl?x=1&amp;y=2"');
    expect(out.indexOf("<!--nt:banner-->")).toBeGreaterThan(out.indexOf("<main>"));
    expect(out).not.toMatch(/<script/i);
  });

  it("is idempotent and removes both when flags are off", () => {
    const preview = finalizePage(base, { preview: true, noindex: true, previewDaysLeft: 1 }, ctx);
    const again = finalizePage(preview, { preview: true, noindex: true, previewDaysLeft: 1 }, ctx);
    expect(again).toBe(preview);
    expect(again.match(/nt:banner-->/g)).toHaveLength(2);

    const live = finalizePage(preview, { preview: false, noindex: false, previewDaysLeft: null }, ctx);
    expect(live).toBe(base);
  });

  it("words the expiry for today and tomorrow", () => {
    expect(finalizePage(base, { preview: true, noindex: false, previewDaysLeft: 0 }, ctx)).toContain("Expires today.");
    expect(finalizePage(base, { preview: true, noindex: false, previewDaysLeft: 1 }, ctx)).toContain("Expires tomorrow.");
    expect(finalizePage(base, { preview: true, noindex: false, previewDaysLeft: null }, ctx)).not.toContain("Expires");
  });
});
