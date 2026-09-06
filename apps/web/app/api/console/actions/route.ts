import { z } from "zod";

import { env } from "@nazariitsubera/core/env";
import { enqueue } from "@nazariitsubera/core/jobs";
import { siteService } from "@nazariitsubera/core/sites";
import { vendorService } from "@nazariitsubera/core/vendors";

import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("generate"), vendorId: z.uuid() }),
  z.object({ action: z.literal("republish"), vendorId: z.uuid() }),
  z.object({ action: z.literal("extend"), vendorId: z.uuid() }),
  z.object({ action: z.literal("unpublish"), vendorId: z.uuid() }),
  z.object({ action: z.literal("won"), vendorId: z.uuid(), tier: z.enum(["free", "storefront"]) }),
  z.object({ action: z.literal("lost"), vendorId: z.uuid() }),
]);

export async function POST(request: Request) {
  return handle(async () => {
    const input = schema.parse(await request.json());
    switch (input.action) {
      case "generate":
        return { jobId: (await enqueue(input.vendorId, "generate_site")).id };
      case "republish":
        return { jobId: (await enqueue(input.vendorId, "republish")).id };
      case "extend":
        return { expiresAt: await siteService.extendPreview(input.vendorId, env().PREVIEW_DAYS) };
      case "unpublish":
        await siteService.unpublish(input.vendorId);
        return { ok: true };
      case "won":
        await vendorService.setStatus(input.vendorId, "won", input.tier);
        return { ok: true };
      case "lost":
        await vendorService.setStatus(input.vendorId, "lost");
        return { ok: true };
    }
  });
}
