import { z } from "zod";

import { assetService } from "@nazariitsubera/core/assets";
import { captureService } from "@nazariitsubera/core/captures";
import { ALLOWED_UPLOAD_TYPES } from "@nazariitsubera/core/storage";

import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

const schema = z.object({
  vendorId: z.uuid(),
  kind: z.enum(["asset", "capture"]),
  contentType: z.enum(Object.keys(ALLOWED_UPLOAD_TYPES) as [string, ...string[]]),
  sha256: z.string().regex(/^[0-9a-f]{64}$/, "Expected a hex sha256"),
  bytes: z.number().int().positive(),
  durationSec: z.number().int().nonnegative().nullish(),
});

/** Returns a presigned PUT so file bytes never pass through this app. */
export async function POST(request: Request) {
  return handle(async () => {
    const input = schema.parse(await request.json());
    if (input.kind === "capture") {
      const { capture, upload } = await captureService.startUpload(input);
      return { id: capture.id, upload };
    }
    const { asset, upload } = await assetService.startUpload(input);
    return { id: asset.id, upload };
  });
}
