import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function anthropicEnabled(): boolean {
  return process.env.PROVIDERS_MODE === "real" && Boolean(process.env.ANTHROPIC_API_KEY);
}

export function anthropic(): Anthropic {
  if (!anthropicEnabled()) throw new Error("Anthropic is not configured (set PROVIDERS_MODE=real and ANTHROPIC_API_KEY)");
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export function model(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-opus-5";
}

export type ImagePart = { mediaType: "image/jpeg" | "image/png" | "image/webp"; data: Uint8Array; label: string };

/** Base64 image blocks preceded by a label, so the model knows which asset it is looking at. */
export function imageBlocks(images: ImagePart[]): Anthropic.ContentBlockParam[] {
  return images.flatMap((image) => [
    { type: "text" as const, text: image.label },
    {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: image.mediaType,
        data: Buffer.from(image.data).toString("base64"),
      },
    },
  ]);
}
