import type { ContentJson } from "../contracts/content";

export type Violation = { field: string; rule: string; detail: string };

/**
 * Claims a model must never invent on a real business's website. These are liability, not
 * style: an absent section always beats a fabricated one. Each rule is a pattern plus the
 * name of the thing it is protecting against.
 */
const RULES: { rule: string; pattern: RegExp }[] = [
  { rule: "price", pattern: /(?:\$|€|£)\s?\d|(?:\b\d+\s?(?:dollars|bucks)\b)|\b\d+\s?(?:for|\/)\s?\$?\d/i },
  { rule: "years-in-business", pattern: /\b(?:since|est\.?|established)\s+(?:19|20)\d{2}\b|\b\d+\+?\s+years?\s+(?:of\s+)?(?:experience|in business|serving)\b/i },
  { rule: "award", pattern: /\b(?:award[- ]winning|award winner|voted\s+(?:best|#?1)|best of|as seen (?:in|on)|featured in|prize[- ]winning)\b/i },
  { rule: "certification", pattern: /\b(?:fda[- ]approved|food[- ]safe|usda|certified organic|certified\b|licensed and insured|non[- ]gmo certified|iso ?\d)/i },
  { rule: "guarantee", pattern: /\b(?:guarantee[ds]?|money[- ]back|satisfaction guaranteed|warrant(?:y|ied))\b/i },
  { rule: "policy", pattern: /\b(?:free shipping|ships? (?:free|worldwide|nationwide|in \d)|free returns|\d+[- ]day returns?|return policy|refund policy)\b/i },
  { rule: "customer-count", pattern: /\b(?:\d[\d,]{2,}|thousands|hundreds) of (?:customers|clients|orders|happy)\b|\b\d+[\d,]*\+ (?:customers|orders|sold)\b/i },
];

function scanText(field: string, value: string | null | undefined): Violation[] {
  if (!value) return [];
  return RULES.filter(({ pattern }) => pattern.test(value)).map(({ rule }) => ({
    field,
    rule,
    detail: `"${value.slice(0, 80)}" reads as a ${rule} claim, which was not established by the operator.`,
  }));
}

/**
 * Every text field the model wrote, plus the invariant that products must be exactly the
 * vendor's own assets. `priceHint` is exempt: the operator types it, the model never does.
 */
export function checkContent(content: ContentJson, allowedAssetIds: string[]): Violation[] {
  const violations: Violation[] = [
    ...scanText("tagline", content.tagline),
    ...scanText("heroHeadline", content.heroHeadline),
    ...scanText("heroSub", content.heroSub),
    ...scanText("about", content.about),
    ...scanText("visit.note", content.visit.note),
    ...scanText("contact.ctaLabel", content.contact.ctaLabel),
  ];

  content.products.forEach((product, index) => {
    violations.push(...scanText(`products.${index}.name`, product.name));
    violations.push(...scanText(`products.${index}.blurb`, product.blurb));
  });

  const allowed = new Set(allowedAssetIds);
  const seen = new Set<string>();
  for (const [index, product] of content.products.entries()) {
    if (!allowed.has(product.assetId)) {
      violations.push({
        field: `products.${index}.assetId`,
        rule: "unknown-asset",
        detail: `${product.assetId} is not one of this vendor's product photos.`,
      });
    }
    seen.add(product.assetId);
  }
  for (const id of allowed) {
    if (!seen.has(id)) {
      violations.push({ field: "products", rule: "missing-asset", detail: `${id} has no product entry.` });
    }
  }

  return violations;
}

/** Same rules over the visible text of a rendered page, so a rewrite cannot smuggle a claim back in. */
export function checkVisibleText(text: string): Violation[] {
  return scanText("page", text);
}

/**
 * Last resort after the model has had its retry: drop the offending value rather than publish
 * it. Required fields fall back to something plainly true; optional ones become null.
 */
export function scrubContent(content: ContentJson, violations: Violation[]): ContentJson {
  const bad = new Set(violations.filter((v) => v.rule !== "unknown-asset" && v.rule !== "missing-asset").map((v) => v.field));
  if (bad.size === 0) return content;

  const next: ContentJson = {
    ...content,
    tagline: bad.has("tagline") ? content.businessName : content.tagline,
    heroHeadline: bad.has("heroHeadline") ? content.businessName : content.heroHeadline,
    heroSub: bad.has("heroSub") ? `Find ${content.businessName} at the market.` : content.heroSub,
    about: bad.has("about") ? null : content.about,
    visit: { ...content.visit, note: bad.has("visit.note") ? null : content.visit.note },
    contact: { ...content.contact, ctaLabel: bad.has("contact.ctaLabel") ? "Call or text" : content.contact.ctaLabel },
    products: content.products.map((product, index) => ({
      ...product,
      name: bad.has(`products.${index}.name`) ? "Handmade item" : product.name,
      blurb: bad.has(`products.${index}.blurb`) ? null : product.blurb,
    })),
  };
  return next;
}

/** One line per violation, for the retry message and the job log. */
export function describeViolations(violations: Violation[]): string {
  return violations.map((v) => `- ${v.field}: ${v.detail}`).join("\n");
}
