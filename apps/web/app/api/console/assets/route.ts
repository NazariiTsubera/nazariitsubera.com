import { z } from "zod";

import { assetService } from "@nazariitsubera/core/assets";

import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("kind"), id: z.uuid(), kind: z.enum(["product", "scene", "person"]) }),
  z.object({ action: z.literal("hero"), id: z.uuid() }),
  z.object({ action: z.literal("alt"), id: z.uuid(), alt: z.string().max(160).nullable() }),
  z.object({ action: z.literal("remove"), id: z.uuid() }),
  z.object({ action: z.literal("reorder"), vendorId: z.uuid(), ids: z.array(z.uuid()) }),
]);

export async function POST(request: Request) {
  return handle(async () => {
    const input = schema.parse(await request.json());
    switch (input.action) {
      case "kind":
        return assetService.setKind(input.id, input.kind);
      case "hero":
        return assetService.setHero(input.id);
      case "alt":
        return assetService.setAlt(input.id, input.alt);
      case "remove":
        return assetService.remove(input.id);
      case "reorder":
        await assetService.reorder(input.vendorId, input.ids);
        return { ok: true };
    }
  });
}
