import { env } from "@nazariitsubera/core/env";
import { storage } from "@nazariitsubera/core/storage";

import { requireOperator } from "@/lib/operator";

export const dynamic = "force-dynamic";

/**
 * Serves originals from local development storage so the console can show thumbnails.
 * In production ASSETS_PUBLIC_URL points at R2 and this route is never reached.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  if (env().PROVIDERS_MODE === "real") return new Response("Not available", { status: 404 });
  await requireOperator();

  const { key } = await params;
  const body = await storage().get(key.join("/"));
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": "application/octet-stream", "Cache-Control": "private, max-age=60" },
  });
}
