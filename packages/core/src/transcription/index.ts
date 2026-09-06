export type Transcript = { text: string; durationSec: number | null };

/** What the fake returns, so the offline pipeline still has a real conversation to work from. */
export const FIXTURE_TRANSCRIPT =
  "So I started throwing pots in a community studio about six years ago and never stopped. " +
  "Everything on the table is thrown and glazed by hand, so no two mugs come out quite the same. " +
  "The speckled mugs are what people come back for. I'm here at the Pearl most Saturdays, " +
  "usually near the fountain under the blue tent. People ask me all the time if I have a website " +
  "and I never have had one.";

/**
 * Speech to text. The endpoint is provider-agnostic: it takes raw audio bytes with a content
 * type and returns JSON. Deepgram's shape is parsed, with a couple of common fallbacks.
 */
export async function transcribe(audio: Uint8Array, mime: string): Promise<Transcript> {
  const key = process.env.TRANSCRIPTION_KEY;
  if (process.env.PROVIDERS_MODE !== "real" || !key) {
    return { text: FIXTURE_TRANSCRIPT, durationSec: null };
  }

  const endpoint = process.env.TRANSCRIPTION_URL ?? "https://api.deepgram.com/v1/listen?smart_format=true";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Token ${key}`, "Content-Type": mime },
    body: audio as BodyInit,
  });
  if (!response.ok) {
    throw new Error(`Transcription failed (${response.status}): ${await response.text().catch(() => "")}`);
  }

  const body = (await response.json()) as {
    results?: { channels?: { alternatives?: { transcript?: string }[] }[] };
    metadata?: { duration?: number };
    text?: string;
  };
  const text = body.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? body.text ?? "";
  if (!text.trim()) throw new Error("Transcription returned no text");

  return { text: text.trim(), durationSec: body.metadata?.duration ? Math.round(body.metadata.duration) : null };
}
