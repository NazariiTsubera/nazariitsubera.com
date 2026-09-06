import { describe, expect, it } from "vitest";

import type { ContentJson } from "../contracts/content";
import { checkPageText, lintHtml, runGate, visibleText } from "./index";

const IMG =
  '<img src="/images/a-w960.webp" srcset="/images/a-w480.webp 480w, /images/a-w960.webp 960w, /images/a-w1440.webp 1440w" ' +
  'sizes="100vw" width="1440" height="1440" alt="Speckled mug" loading="lazy">';

function page(body = `<main><h1>Mugs</h1>${IMG}<p>Speckled mug</p><a href="tel:+12105550123">Call</a></main>`, head = ""): string {
  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>Mugs</title><meta name="description" content="Handmade mugs">${head}</head>` +
    `<body>${body}</body></html>`
  );
}

const content: ContentJson = {
  schemaVersion: 1,
  businessName: "Pearl Street Pottery",
  tagline: "Stoneware",
  heroHeadline: "Mugs",
  heroSub: "Handmade.",
  about: null,
  tone: "warm",
  heroAssetId: null,
  personAssetId: null,
  products: [{ assetId: "p1", name: "Speckled mug", blurb: null, priceHint: null, checkoutUrl: null, source: null }],
  visit: { markets: [], note: null },
  contact: { phone: "+12105550123", instagramHandle: null, ctaLabel: "Call" },
};

describe("lintHtml", () => {
  it("accepts a clean static page", () => {
    expect(lintHtml(page())).toEqual([]);
  });

  it.each([
    ["forbidden-element", `<main><h1>x</h1>${IMG}<script>alert(1)</script></main>`],
    ["forbidden-element", `<main><h1>x</h1>${IMG}<iframe src="/x"></iframe></main>`],
    ["forbidden-element", `<main><h1>x</h1>${IMG}<form action="/x"></form></main>`],
    ["inline-handler", `<main><h1>x</h1>${IMG}<button onclick="go()">go</button></main>`],
    ["javascript-url", `<main><h1>x</h1>${IMG}<a href="javascript:go()">go</a></main>`],
    ["external-url", `<main><h1>x</h1>${IMG}<img src="https://evil.example.com/a.png" srcset="https://evil.example.com/a.png 1w" width="1" height="1" alt="" loading="lazy"></main>`],
    ["missing-alt", `<main><h1>x</h1><img src="/a.webp" srcset="/a.webp 1w" width="1" height="1" loading="lazy"></main>`],
    ["missing-dimensions", `<main><h1>x</h1><img src="/a.webp" srcset="/a.webp 1w" alt="" loading="lazy"></main>`],
    ["missing-srcset", `<main><h1>x</h1><img src="/a.webp" width="1" height="1" alt="" loading="lazy"></main>`],
    ["h1-count", `<main><h1>a</h1><h1>b</h1>${IMG}</main>`],
    ["missing-main", `<div><h1>x</h1>${IMG}</div>`],
  ])("rejects %s", (rule, body) => {
    expect(lintHtml(page(body)).map((v) => v.rule)).toContain(rule);
  });

  it("rejects a missing doctype, lang, title, viewport, and description", () => {
    const rules = lintHtml("<html><body><main><h1>x</h1></main></body></html>").map((v) => v.rule);
    expect(rules).toEqual(expect.arrayContaining(["doctype", "missing-lang", "missing-title", "missing-viewport", "missing-description"]));
  });

  it("rejects an @import in the inline stylesheet", () => {
    expect(lintHtml(page(undefined, "<style>@import url(https://x.example/a.css);</style>")).map((v) => v.rule)).toContain("css-import");
  });

  it("allows relative, tel, and allowlisted absolute URLs", () => {
    const body = `<main><h1>x</h1>${IMG}<a href="tel:+12105550123">Call</a><a href="https://img.example.com/x">img</a></main>`;
    expect(lintHtml(page(body), ["img.example.com"])).toEqual([]);
  });
});

describe("visibleText and checkPageText", () => {
  it("ignores style and head content", () => {
    const text = visibleText(page(`<main><h1>Mugs</h1><p>Hello</p></main>`, "<style>body{color:red}</style>"));
    expect(text).toContain("Hello");
    expect(text).not.toContain("color:red");
  });

  it("passes when every product and the phone number appear", () => {
    expect(checkPageText(page(), content)).toEqual([]);
  });

  it("flags a product that vanished from the page", () => {
    const body = `<main><h1>Mugs</h1>${IMG}<a href="tel:+12105550123">Call</a></main>`;
    expect(checkPageText(page(body), content).map((v) => v.rule)).toContain("missing-product");
  });

  it("flags a fabricated claim that only exists in the markup", () => {
    const body = `<main><h1>Mugs</h1>${IMG}<p>Speckled mug</p><p>Free shipping on all orders.</p><a href="tel:+12105550123">Call</a></main>`;
    expect(checkPageText(page(body), content).map((v) => v.rule)).toContain("policy");
  });
});

describe("runGate", () => {
  it("passes a clean page and reports the violations of a dirty one", async () => {
    const clean = await runGate(page(), content, { skipBrowser: true });
    expect(clean.passed).toBe(true);
    expect(clean.violations).toEqual([]);

    const dirty = await runGate(page(`<main><h1>x</h1><script>x</script></main>`), content, { skipBrowser: true });
    expect(dirty.passed).toBe(false);
    expect(dirty.violations.map((v) => v.rule)).toContain("forbidden-element");
  });
});
