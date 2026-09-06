import { describe, expect, it } from "vitest";

import { THEME_IDS } from "../contracts/theme-id";
import { renderInputSchema } from "../contracts/render";
import fixture from "../../fixtures/demo-vendor/render-input.json";
import { renderSite } from "./render";

const input = renderInputSchema.parse(fixture);

describe("renderSite", () => {
  it("is deterministic and matches the snapshot", () => {
    const first = renderSite(input).html;
    const second = renderSite(input).html;
    expect(first).toBe(second);
    expect(first).toMatchSnapshot();
  });

  it("emits a full document with inlined CSS and no script", () => {
    const { html } = renderSite(input);
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="en">');
    expect(html.match(/<style>/g)).toHaveLength(1);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<link[^>]+rel="stylesheet"/i);
  });

  it("renders one card per product with a three-width srcset and explicit dimensions", () => {
    const { html } = renderSite(input);
    expect(html.match(/class="card"/g)).toHaveLength(input.content.products.length);
    expect(html).toContain('srcSet="images/product-1-w480.svg 480w, images/product-1-w960.svg 960w, images/product-1-w1440.svg 1440w"');
    expect(html).toContain('width="1440" height="1440"');
  });

  it("links a product card only when it has a checkout url", () => {
    const { html } = renderSite(input);
    expect(html).toContain('<a class="card" href="https://square.link/u/demo-bowl" target="_blank" rel="noopener">');
    expect(html.match(/<a class="card"/g)).toHaveLength(1);
  });

  it("uses a tel: link as the primary call to action and formats the number", () => {
    const { html } = renderSite(input);
    expect(html).toContain('href="tel:+12105550123"');
    expect(html).toContain("(210) 555-0123");
  });

  it("loads the hero eagerly and everything else lazily", () => {
    const { html } = renderSite(input);
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
    expect(html.match(/loading="lazy"/g)).toHaveLength(input.content.products.length + 1);
  });

  it("renders neither a banner nor a robots tag; finalizePage owns those at publish", () => {
    const { html } = renderSite(input);
    expect(html).not.toContain('name="robots"');
    expect(html).not.toContain("banner");
  });

  it("omits about and visit when they are empty", () => {
    const content = { ...input.content, about: null, personAssetId: null, visit: { markets: [], note: null } };
    const { html } = renderSite({ ...input, content });
    expect(html).not.toContain('id="about"');
    expect(html).not.toContain('id="visit"');
    expect(html).toContain('id="products"');
    expect(html).toContain('id="contact"');
  });

  it("falls back to a text-only hero when there is no hero asset", () => {
    const { html } = renderSite({ ...input, content: { ...input.content, heroAssetId: null } });
    expect(html).not.toContain('class="hero-media"');
    expect(html).toContain(input.content.heroHeadline);
  });

  it("stays under the HTML budget", () => {
    expect(renderSite(input).bytes).toBeLessThan(40_000);
  });

  it.each(THEME_IDS)("renders with theme %s", (themeId) => {
    const { html } = renderSite({ ...input, themeId });
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("@font-face");
  });

  it("rejects invalid input", () => {
    expect(() => renderSite({ ...input, themeId: "neon" as never })).toThrow();
  });
});
