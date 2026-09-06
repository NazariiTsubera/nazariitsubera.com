import { checkVisibleText, type Violation } from "../ai/content-guard";
import type { ContentJson } from "../contracts/content";
import { inspectPage, type Screenshot } from "./browser";
import { lintHtml, visibleText } from "./lint";

export { MAX_EAGER_BYTES, VIEWPORTS, inspectPage } from "./browser";
export type { BrowserReport, Screenshot, Viewport } from "./browser";
export { finalizePage } from "../sites/finalize-page";
export { MAX_DOCUMENT_BYTES, lintHtml, visibleText } from "./lint";

export type GateReport = {
  passed: boolean;
  violations: Violation[];
  browserRan: boolean;
  eagerBytes: number;
  checkedAt: string;
};

export type GateResult = GateReport & { screenshots: Screenshot[] };

/**
 * Every fact on the page must have come from the content JSON. This catches a rewrite that
 * drops a product or smuggles a claim into markup the content guard never saw.
 */
export function checkPageText(html: string, content: ContentJson): Violation[] {
  const text = visibleText(html);

  // Prices the operator typed are facts, not fabrications, so they are removed before the
  // fabrication scan. Anything price-shaped that remains was invented by the page.
  const operatorPrices = content.products.map((p) => p.priceHint).filter((p): p is string => Boolean(p));
  const scannable = operatorPrices.reduce((acc, price) => acc.split(price).join(" "), text);
  const violations: Violation[] = checkVisibleText(scannable);

  for (const product of content.products) {
    if (!text.includes(product.name)) {
      violations.push({
        field: "page",
        rule: "missing-product",
        detail: `The product "${product.name}" does not appear in the visible text.`,
      });
    }
  }
  // The number may be the visible label or, more usually, only the tel: link behind a "Call" button.
  const digits = content.contact.phone.replace(/\D/g, "");
  const reachable =
    text.replace(/\D/g, "").includes(digits) || html.replace(/\D/g, "").includes(digits);
  if (!reachable) {
    violations.push({
      field: "page",
      rule: "missing-phone",
      detail: "The phone number is neither shown nor linked; it is the primary call to action.",
    });
  }
  return violations;
}

/** Lint, then the text guard, then the browser. Cheap checks first so a broken page fails fast. */
export async function runGate(
  html: string,
  content: ContentJson,
  options: { allowedHosts?: string[]; skipBrowser?: boolean } = {},
): Promise<GateResult> {
  const violations = [...lintHtml(html, options.allowedHosts ?? []), ...checkPageText(html, content)];

  if (options.skipBrowser) {
    return {
      passed: violations.length === 0,
      violations,
      browserRan: false,
      eagerBytes: 0,
      screenshots: [],
      checkedAt: new Date().toISOString(),
    };
  }

  const browser = await inspectPage(html);
  const all = [...violations, ...browser.violations];
  return {
    passed: all.length === 0,
    violations: all,
    browserRan: browser.ran,
    eagerBytes: browser.eagerBytes,
    screenshots: browser.screenshots,
    checkedAt: new Date().toISOString(),
  };
}

/** The report shape stored on the site version; screenshots live in storage, not the row. */
export function toStoredReport(result: GateResult): GateReport {
  return {
    passed: result.passed,
    violations: result.violations,
    browserRan: result.browserRan,
    eagerBytes: result.eagerBytes,
    checkedAt: result.checkedAt,
  };
}
