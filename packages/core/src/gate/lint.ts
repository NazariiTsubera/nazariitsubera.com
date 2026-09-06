import { parse } from "parse5";
import type { DefaultTreeAdapterMap } from "parse5";

import type { Violation } from "../ai/content-guard";

type Element = DefaultTreeAdapterMap["element"];
type Node = DefaultTreeAdapterMap["node"];

export const MAX_DOCUMENT_BYTES = 120_000;

const FORBIDDEN_TAGS = new Set(["script", "iframe", "object", "embed", "form", "noscript"]);

/**
 * Attributes the browser *loads* from. These are the ones the allowlist governs: a page must
 * not pull bytes from anywhere we do not control. Plain anchor hrefs are navigation, not loads,
 * and vendor pages legitimately link out to checkout, maps, and Instagram.
 */
const LOADING_ATTRS = ["src", "srcset", "poster", "data"];
const ALL_URL_ATTRS = [...LOADING_ATTRS, "href", "action"];

function isElement(node: Node): node is Element {
  return "tagName" in node;
}

function walk(node: Node, visit: (element: Element) => void): void {
  if (isElement(node)) visit(node);
  for (const child of ("childNodes" in node ? node.childNodes : []) as Node[]) walk(child, visit);
}

function attr(element: Element, name: string): string | null {
  return element.attrs.find((a) => a.name === name)?.value ?? null;
}

function urlsIn(value: string, attrName: string): string[] {
  if (attrName !== "srcset") return [value];
  return value.split(",").map((part) => part.trim().split(/\s+/)[0]).filter(Boolean);
}

function allowedUrl(url: string, allowedHosts: string[]): boolean {
  const trimmed = url.trim();
  if (trimmed === "" || trimmed.startsWith("#")) return true;
  if (/^(tel:|mailto:|sms:)/i.test(trimmed)) return true;
  if (/^data:image\//i.test(trimmed)) return true;
  if (trimmed.startsWith("/") || !/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return true; // relative
  try {
    return allowedHosts.includes(new URL(trimmed).host);
  } catch {
    return false;
  }
}

/**
 * Everything a static, self-contained page must satisfy. Runs on model-authored pages before
 * anything is published, so a bad page never reaches a vendor.
 */
export function lintHtml(html: string, allowedHosts: string[] = []): Violation[] {
  const violations: Violation[] = [];
  const add = (field: string, rule: string, detail: string): void => {
    violations.push({ field, rule, detail });
  };

  if (!/^<!doctype html>/i.test(html.trim())) add("document", "doctype", "The page must start with <!doctype html>.");
  const bytes = new TextEncoder().encode(html).length;
  if (bytes > MAX_DOCUMENT_BYTES) add("document", "size", `The document is ${bytes} bytes; the limit is ${MAX_DOCUMENT_BYTES}.`);

  const doc = parse(html);
  let h1Count = 0;
  let hasMain = false;
  let hasTitle = false;
  let hasViewport = false;
  let hasDescription = false;
  let htmlLang = false;

  walk(doc, (element) => {
    const tag = element.tagName;

    if (FORBIDDEN_TAGS.has(tag)) {
      add(tag, "forbidden-element", `<${tag}> is not allowed; vendor pages ship no JavaScript and no embedded frames.`);
    }
    if (tag === "html" && attr(element, "lang")) htmlLang = true;
    if (tag === "h1") h1Count += 1;
    if (tag === "main") hasMain = true;
    if (tag === "title") hasTitle = true;
    if (tag === "meta") {
      const name = attr(element, "name");
      if (name === "viewport") hasViewport = true;
      if (name === "description") hasDescription = true;
    }
    if (tag === "link" && (attr(element, "rel") ?? "").includes("stylesheet")) {
      const href = attr(element, "href") ?? "";
      if (!allowedUrl(href, allowedHosts)) add("link", "external-stylesheet", `Stylesheet ${href} is not on the allowlist.`);
    }

    for (const a of element.attrs) {
      if (/^on/i.test(a.name)) add(tag, "inline-handler", `${a.name} is an inline event handler.`);
      if (!ALL_URL_ATTRS.includes(a.name)) continue;

      // A <link> href only counts as a load for rels that actually fetch something;
      // canonical and alternate are metadata.
      const rel = tag === "link" ? (attr(element, "rel") ?? "") : "";
      const linkLoads = /\b(stylesheet|preload|prefetch|preconnect|icon|manifest)\b/i.test(rel);
      const governed = LOADING_ATTRS.includes(a.name) || (tag === "link" && a.name === "href" && linkLoads);
      for (const url of urlsIn(a.value, a.name)) {
        if (/^javascript:/i.test(url)) {
          add(tag, "javascript-url", `${a.name} uses a javascript: URL.`);
        } else if (governed && !allowedUrl(url, allowedHosts)) {
          add(tag, "external-url", `${a.name}="${url}" loads from a host that is not on the allowlist.`);
        }
      }
    }

    if (tag === "img") {
      const alt = attr(element, "alt");
      const src = attr(element, "src") ?? "(no src)";
      if (alt === null) add("img", "missing-alt", `Image ${src} has no alt attribute.`);
      if (!attr(element, "width") || !attr(element, "height")) {
        add("img", "missing-dimensions", `Image ${src} needs explicit width and height.`);
      }
      if (!attr(element, "srcset")) add("img", "missing-srcset", `Image ${src} needs a srcset.`);
      if (!attr(element, "loading")) add("img", "missing-loading", `Image ${src} needs a loading attribute.`);
    }
  });

  if (!htmlLang) add("html", "missing-lang", "The <html> element needs a lang attribute.");
  if (h1Count !== 1) add("h1", "h1-count", `The page has ${h1Count} <h1> elements; it needs exactly one.`);
  if (!hasMain) add("main", "missing-main", "The page needs a <main> element.");
  if (!hasTitle) add("head", "missing-title", "The page needs a <title>.");
  if (!hasViewport) add("head", "missing-viewport", "The page needs a viewport meta tag.");
  if (!hasDescription) add("head", "missing-description", "The page needs a meta description.");

  if (/<style[^>]*>[\s\S]*@import/i.test(html)) add("style", "css-import", "@import pulls an external stylesheet.");

  return violations;
}

/** Visible text of a document, for the fabrication guard and presence checks. */
export function visibleText(html: string): string {
  const doc = parse(html);
  const parts: string[] = [];
  const skip = new Set(["style", "script", "head", "title"]);

  const collect = (node: Node, inSkipped: boolean): void => {
    if (isElement(node)) {
      const skipped = inSkipped || skip.has(node.tagName);
      for (const child of node.childNodes as Node[]) collect(child, skipped);
      return;
    }
    if (!inSkipped && "value" in node && node.nodeName === "#text") parts.push(node.value);
    for (const child of (("childNodes" in node ? node.childNodes : []) as Node[])) collect(child, inSkipped);
  };

  collect(doc, false);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
