import { storage } from "@nazariitsubera/core/storage";

import { requireOperator } from "@/lib/operator";

export const dynamic = "force-dynamic";

/**
 * Receives presigned PUTs from the local storage adapter in development. In production the
 * browser talks to R2 directly and this route is never called.
 */
export async function PUT(request: Request) {
  await requireOperator();
  if (process.env.PROVIDERS_MODE === "real") return new Response("Not available", { status: 404 });

  const key = new URL(request.url).searchParams.get("key");
  if (!key) return new Response("Missing key", { status: 400 });

  const body = new Uint8Array(await request.arrayBuffer());
  await storage().put(key, body, request.headers.get("content-type") ?? "application/octet-stream");
  return new Response(null, { status: 204 });
}
