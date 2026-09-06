import type { Violation } from "../ai/content-guard";

export type Viewport = { label: string; width: number; height: number };
export type Screenshot = { label: string; png: Uint8Array };

export const VIEWPORTS: Viewport[] = [
  { label: "360", width: 360, height: 800 },
  { label: "768", width: 768, height: 1024 },
  { label: "1280", width: 1280, height: 900 },
];

export const MAX_EAGER_BYTES = 400 * 1024;

export type BrowserReport = {
  ran: boolean;
  violations: Violation[];
  screenshots: Screenshot[];
  eagerBytes: number;
};

const EMPTY: BrowserReport = { ran: false, violations: [], screenshots: [], eagerBytes: 0 };

/** A 1x1 transparent PNG, served in place of every image the page asks for. */
const STUB_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

/**
 * Renders the page in headless Chromium and checks what static analysis cannot: horizontal
 * overflow, accessibility and contrast through axe in both colour schemes, and the bytes that
 * load before interaction. Screenshots go back to the author on repair.
 *
 * Subresources are fulfilled locally rather than fetched. The page's image and font URLs are
 * absolute paths that only resolve on the live site, so letting the browser chase them would
 * mean waiting out a network timeout for every one of them.
 *
 * Chromium is optional at runtime: when it is unavailable the report says so and lint plus the
 * text guard still gate the publish.
 */
export async function inspectPage(html: string): Promise<BrowserReport> {
  let chromium: typeof import("playwright-core").chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    return EMPTY;
  }

  let AxeBuilder: typeof import("@axe-core/playwright").default | null = null;
  try {
    ({ default: AxeBuilder } = await import("@axe-core/playwright"));
  } catch {
    AxeBuilder = null;
  }

  let browser: Awaited<ReturnType<typeof chromium.launch>>;
  try {
    browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  } catch {
    return EMPTY;
  }

  const violations: Violation[] = [];
  const screenshots: Screenshot[] = [];
  // The document itself always loads; assets are counted from the page's own declarations.
  const eagerBytes = new TextEncoder().encode(html).length + estimateEagerAssetBytes(html);

  try {
    for (const colorScheme of ["light", "dark"] as const) {
      const context = await browser.newContext({ viewport: VIEWPORTS[0], colorScheme });

      await context.route("**/*", (route) => {
        const type = route.request().resourceType();
        if (type === "image") return route.fulfill({ status: 200, contentType: "image/png", body: STUB_PNG });
        if (type === "font") return route.fulfill({ status: 200, contentType: "font/woff2", body: Buffer.alloc(0) });
        if (type === "document") return route.continue();
        return route.abort();
      });

      const page = await context.newPage();
      await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 10_000 });

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        // One frame is enough for layout to settle after a resize.
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (overflow > 1 && colorScheme === "light") {
          violations.push({
            field: `viewport.${viewport.label}`,
            rule: "horizontal-overflow",
            detail: `The page is ${overflow}px wider than a ${viewport.width}px viewport, so it scrolls sideways.`,
          });
        }

        if (colorScheme === "light") {
          screenshots.push({ label: viewport.label, png: new Uint8Array(await page.screenshot({ fullPage: true })) });
        }
      }

      if (AxeBuilder) {
        // Contrast and structure do not change with width; one pass per scheme is enough.
        await page.setViewportSize(VIEWPORTS[0]);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
        for (const issue of results.violations) {
          violations.push({
            field: `a11y.${colorScheme}`,
            rule: issue.id,
            detail: `${issue.help} (${issue.nodes.length} element${issue.nodes.length === 1 ? "" : "s"}): ${issue.nodes[0]?.target?.join(" ") ?? ""}`,
          });
        }
      }

      await context.close();
    }

    if (eagerBytes > MAX_EAGER_BYTES) {
      violations.push({
        field: "document",
        rule: "page-weight",
        detail: `First load is about ${Math.round(eagerBytes / 1024)}KB; the budget is ${MAX_EAGER_BYTES / 1024}KB.`,
      });
    }

    const seen = new Set<string>();
    const unique = violations.filter((v) => {
      const key = `${v.rule}:${v.detail}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return { ran: true, violations: unique, screenshots, eagerBytes };
  } finally {
    await browser.close();
  }
}

/**
 * The real page fetches its assets from the image host, which the gate does not have. Count
 * what would load eagerly instead: every preloaded font, plus each image not marked lazy at a
 * conservative 60KB apiece.
 */
function estimateEagerAssetBytes(html: string): number {
  const fonts = (html.match(/rel="preload"[^>]*as="font"/g) ?? []).length;
  const images = html.match(/<img\b[^>]*>/g) ?? [];
  const eagerImages = images.filter((tag) => !/loading="lazy"/.test(tag)).length;
  return fonts * 40 * 1024 + eagerImages * 60 * 1024;
}
