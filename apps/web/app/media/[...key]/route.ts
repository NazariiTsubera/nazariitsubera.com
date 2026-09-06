import { env } from "@nazariitsubera/core/env";
import { storage } from "@nazariitsubera/core/storage";

import { getOperator } from "@/lib/operator";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  woff2: "font/woff2",
};

/**
 * Local stand-in for the public asset host. In production ASSETS_PUBLIC_URL points at the R2
 * bucket and this route is never reached.
 *
 * Derived assets are public, because they are exactly what a published vendor page references
 * and what R2 serves openly. Originals under uploads/ are the raw capture and stay behind the
 * operator session.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  if (env().PROVIDERS_MODE === "real") return new Response("Not available", { status: 404 });

  const { key } = await params;
  const path = key.join("/");

  if (!path.startsWith("assets/") && !(await getOperator())) {
    return new Response("Not found", { status: 404 });
  }

  const body = await storage().get(path);
  if (!body) return new Response("Not found", { status: 404 });

  const extension = path.split(".").pop() ?? "";
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
      "Cache-Control": path.startsWith("assets/") ? "public, max-age=31536000, immutable" : "private, max-age=60",
    },
  });
}
