import type { ContentJson } from "../contracts/content";
import type { RenderAsset } from "../contracts/render";
import { createLogger } from "../logger";
import { getTheme, themeForTone } from "../themes";
import { renderSite } from "../template";
import { anthropic, anthropicEnabled, imageBlocks, model, type ImagePart } from "./client";
import type { Violation } from "./content-guard";

const log = createLogger({ module: "ai.design" });

export type DesignInput = {
  content: ContentJson;
  assets: Record<string, RenderAsset>;
  images: ImagePart[];
  fonts: { family: string; url: string }[];
  designNotes: string | null;
  context: { siteUrl: string; operatorName: string; operatorUrl: string };
};

/**
 * The rules the page must satisfy. Everything not listed here is the author's decision:
 * colour, type, layout, rhythm, and how the product images sit on the page.
 */
export function designBrief(input: DesignInput, referenceHtml: string): string {
  const fonts = input.fonts.map((f) => `- "${f.family}" at ${f.url}`).join("\n");
  const assets = Object.values(input.assets)
    .map((a) => `- ${a.id} (${a.kind}, ${a.width}x${a.height}) srcset: ${a.variants.w480} 480w, ${a.variants.w960} 960w, ${a.variants.w1440} 1440w`)
    .join("\n");

  return `Write one complete HTML document for this vendor's website. Return only the HTML,
starting with <!doctype html>. Put all CSS in a single <style> element in the head.

HARD RULES. A page that breaks any of these is rejected by an automated gate:
- No <script>, no inline event handlers (onclick and friends), no javascript: URLs.
- No <iframe>, <object>, <embed>, or <form>.
- No external requests except the image and font URLs listed below. No @import, no CDNs.
- Every <img> needs alt, width, height, a srcset with all three widths, and a sizes attribute.
  The hero image is loading="eager" fetchpriority="high"; every other image is loading="lazy".
- Exactly one <h1>. A <main> element. <html lang="en">, a viewport meta, a <title>, and a
  meta description.
- Legible at 360px wide with no horizontal scrolling. Tap targets at least 44px.
- Text must meet WCAG AA contrast in both light and dark. Either handle
  prefers-color-scheme properly or commit to one scheme with an explicit color-scheme property.
- The primary call to action is a tel: link to the phone number.
- Use the copy exactly as given. You choose typography and layout; you do not change facts,
  and you never add a claim that is not in the content below.

FONTS available, self-hosted (declare @font-face yourself):
${fonts}

IMAGES available:
${assets}

CONTENT (the only source of facts):
${JSON.stringify(input.content, null, 2)}

${input.designNotes ? `OPERATOR NOTES: ${input.designNotes}\n` : ""}
The page is at ${input.context.siteUrl}. Credit "${input.context.operatorName}" in the footer,
linking to ${input.context.operatorUrl}.

Below is a competent baseline page built from a template. It is the floor, not the target:
match its correctness and beat its design. Make something that looks like this specific
vendor and not like a template.

<reference>
${referenceHtml}
</reference>`;
}

function extractHtml(text: string): string {
  const fenced = /```(?:html)?\s*\n([\s\S]*?)```/.exec(text);
  const raw = (fenced ? fenced[1] : text).trim();
  const start = raw.search(/<!doctype html>/i);
  return start >= 0 ? raw.slice(start) : raw;
}

/** The template's own output: the fallback, and the quality bar shown to the author. */
export function referencePage(input: DesignInput): string {
  const themeId = getTheme(themeForTone(input.content.tone).id).id;
  return renderSite({
    content: input.content,
    themeId,
    assets: input.assets,
    context: {
      siteUrl: input.context.siteUrl,
      claimUrl: input.context.siteUrl,
      assetsBaseUrl: "/",
      operatorName: input.context.operatorName,
      operatorUrl: input.context.operatorUrl,
    },
  }).html;
}

/** Model-authored page. Without a configured model this returns the template's page. */
export async function authorPage(input: DesignInput): Promise<{ html: string; authored: boolean }> {
  const reference = referencePage(input);
  if (!anthropicEnabled()) return { html: reference, authored: false };

  const response = await anthropic().messages.create({
    model: model(),
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: [{ type: "text", text: "You are a senior web designer who writes hand-crafted, standards-clean HTML and CSS.", cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: [...imageBlocks(input.images), { type: "text", text: designBrief(input, reference) }] }],
  });

  if (response.stop_reason === "refusal") throw new Error("The model declined to design this page");
  const text = response.content.filter((block) => block.type === "text").map((block) => block.text).join("");
  const html = extractHtml(text);
  if (!/^<!doctype html>/i.test(html)) throw new Error("The model did not return a complete document");

  log.info({ bytes: html.length }, "page authored");
  return { html, authored: true };
}

/** One bounded repair pass: the violations, plus screenshots so it can see what a linter cannot. */
export async function repairPage(
  html: string,
  violations: Violation[],
  screenshots: { label: string; png: Uint8Array }[],
): Promise<string> {
  if (!anthropicEnabled()) return html;

  const response = await anthropic().messages.create({
    model: model(),
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    messages: [
      {
        role: "user",
        content: [
          ...imageBlocks(screenshots.map((s) => ({ mediaType: "image/png" as const, data: s.png, label: `Rendered at ${s.label}` }))),
          {
            type: "text",
            text: `This page failed automated checks. Fix only these problems and return the complete
corrected document, starting with <!doctype html>. Change nothing else.

${violations.map((v) => `- ${v.field}: ${v.detail}`).join("\n")}

<page>
${html}
</page>`,
          },
        ],
      },
    ],
  });

  const text = response.content.filter((block) => block.type === "text").map((block) => block.text).join("");
  const repaired = extractHtml(text);
  return /^<!doctype html>/i.test(repaired) ? repaired : html;
}
