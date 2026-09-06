import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { contentJsonSchema, type ContentJson, type Tone } from "../contracts/content";
import { createLogger } from "../logger";
import { anthropic, anthropicEnabled, imageBlocks, model, type ImagePart } from "./client";
import { checkContent, describeViolations, scrubContent } from "./content-guard";

const log = createLogger({ module: "ai.content" });

export type ContentInput = {
  businessName: string;
  phone: string;
  instagramHandle: string | null;
  transcript: string | null;
  operatorPrompt: string | null;
  bestSellerNote: string | null;
  market: { name: string; mapsUrl: string | null; scheduleNote: string | null } | null;
  products: { assetId: string; image: ImagePart | null }[];
  scenes: ImagePart[];
  person: ImagePart | null;
  heroAssetId: string | null;
  personAssetId: string | null;
};

const SYSTEM = `You write the words for a small vendor's one-page website.

You are given a transcript of a conversation with the owner, their photos, and a few facts the
operator typed. Write copy that sounds like this specific person, not like marketing.

HARD CONSTRAINTS. These are liability, not style:
- Never invent prices, dimensions, materials, or ingredients.
- Never invent shipping, returns, warranty, or any policy.
- Never invent awards, press mentions, years in business, or customer counts.
- Never invent certifications such as "food safe", "FDA approved", or "organic".
- Use only facts present in the transcript or the operator's notes. If you do not know
  something, leave the field null. An absent section is always better than a fabricated claim.

STYLE:
- Plain, warm, concrete. Short sentences. No superlatives, no "nestled", no "artisanal".
- The tagline says what they make. The headline is evocative but honest.
- The about paragraph is their story in their register, 2 to 3 sentences, or null if the
  transcript gives you nothing real to work with.
- Product names are what a customer would call the thing. Blurbs are one concrete detail, or null.
- Choose the tone that matches how the owner actually speaks.

Return exactly one product entry per product photo you are given, in the order given.`;

function userText(input: ContentInput): string {
  const lines = [
    `Business name: ${input.businessName}`,
    `Phone: ${input.phone}`,
    input.instagramHandle ? `Instagram: @${input.instagramHandle}` : null,
    input.market ? `Market: ${input.market.name}${input.market.scheduleNote ? ` (${input.market.scheduleNote})` : ""}` : null,
    input.bestSellerNote ? `Owner says the best seller is: ${input.bestSellerNote}` : null,
    input.operatorPrompt ? `\nOperator notes:\n${input.operatorPrompt}` : null,
    input.transcript ? `\nTranscript of the conversation:\n${input.transcript}` : "\nNo transcript was recorded.",
    `\nProduct photos, in order: ${input.products.map((p) => p.assetId).join(", ")}`,
  ];
  return lines.filter(Boolean).join("\n");
}

/** Deterministic content when no model is configured, so the pipeline runs offline. */
export function fallbackContent(input: ContentInput): ContentJson {
  return contentJsonSchema.parse({
    schemaVersion: 1,
    businessName: input.businessName,
    tagline: `Handmade by ${input.businessName}`,
    heroHeadline: input.businessName.slice(0, 48),
    heroSub: input.market
      ? `Find ${input.businessName} at ${input.market.name}.`.slice(0, 110)
      : `Made by hand. Call or text to order.`,
    about: input.transcript ? input.transcript.split(/(?<=\.)\s+/).slice(0, 3).join(" ").slice(0, 600) : null,
    tone: "warm" as Tone,
    heroAssetId: input.heroAssetId,
    personAssetId: input.personAssetId,
    products: input.products.map((product, index) => ({
      assetId: product.assetId,
      name: `Item ${index + 1}`,
      blurb: null,
      priceHint: null,
      checkoutUrl: null,
      source: null,
    })),
    visit: {
      markets: input.market ? [{ name: input.market.name, mapsUrl: input.market.mapsUrl, scheduleNote: input.market.scheduleNote }] : [],
      note: null,
    },
    contact: { phone: input.phone, instagramHandle: input.instagramHandle, ctaLabel: "Call or text" },
  });
}

/**
 * One structured-output call, then the guard. A violation earns exactly one retry with the
 * violations named; if the retry still fails, the offending fields are scrubbed rather than
 * published. The pipeline never stops because of a guard failure.
 */
export async function generateContent(input: ContentInput): Promise<ContentJson> {
  const allowedIds = input.products.map((p) => p.assetId);
  if (!anthropicEnabled()) return fallbackContent(input);

  const images = [
    ...input.scenes.map((scene) => ({ ...scene, label: `Scene photo (${scene.label})` })),
    ...(input.person ? [{ ...input.person, label: `The owner (${input.person.label})` }] : []),
    ...input.products.flatMap((p) => (p.image ? [{ ...p.image, label: `Product photo ${p.assetId}` }] : [])),
  ];

  const ask = async (extra?: string): Promise<ContentJson> => {
    const response = await anthropic().messages.parse({
      model: model(),
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: zodOutputFormat(contentJsonSchema) },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks(images),
            { type: "text", text: userText(input) + (extra ? `\n\n${extra}` : "") },
          ],
        },
      ],
    });
    if (response.stop_reason === "refusal") throw new Error("The model declined to write this content");
    const parsed = response.parsed_output;
    if (!parsed) throw new Error("The model returned no usable content");
    return parsed;
  };

  const first = await ask();
  const violations = checkContent(first, allowedIds);
  if (violations.length === 0) return first;

  log.warn({ violations: violations.length }, "content guard violation; retrying once");
  const second = await ask(
    `Your previous answer broke these rules. Rewrite it without them:\n${describeViolations(violations)}`,
  );
  const remaining = checkContent(second, allowedIds);
  if (remaining.length === 0) return second;

  log.warn({ violations: remaining.length }, "content guard violation after retry; scrubbing");
  return scrubContent(second, remaining);
}
