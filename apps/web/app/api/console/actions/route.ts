import { z } from "zod";

import { contentJsonSchema } from "@nazariitsubera/core/contracts";
import { prisma } from "@nazariitsubera/core/db";
import { env } from "@nazariitsubera/core/env";
import { enqueue } from "@nazariitsubera/core/jobs";
import { siteService } from "@nazariitsubera/core/sites";
import { THEME_IDS } from "@nazariitsubera/core/contracts";
import { vendorService } from "@nazariitsubera/core/vendors";

import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

const vendorId = z.uuid();

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("generate"), vendorId }),
  z.object({ action: z.literal("regenerate_content"), vendorId }),
  z.object({ action: z.literal("regenerate_design"), vendorId }),
  z.object({ action: z.literal("reprocess_assets"), vendorId }),
  z.object({ action: z.literal("edit_design"), vendorId, instruction: z.string().trim().min(4).max(500) }),
  z.object({ action: z.literal("republish"), vendorId }),
  z.object({ action: z.literal("extend"), vendorId }),
  z.object({ action: z.literal("unpublish"), vendorId }),
  z.object({ action: z.literal("won"), vendorId, tier: z.enum(["free", "storefront"]) }),
  z.object({ action: z.literal("lost"), vendorId }),
  z.object({ action: z.literal("portfolio"), vendorId, show: z.boolean() }),
  z.object({ action: z.literal("theme"), vendorId, themeId: z.enum(THEME_IDS).nullable() }),
  z.object({ action: z.literal("notes"), vendorId, designNotes: z.string().trim().max(500).nullable() }),
  z.object({ action: z.literal("content"), vendorId, content: z.unknown() }),
]);

export async function POST(request: Request) {
  return handle(async () => {
    const input = schema.parse(await request.json());

    switch (input.action) {
      case "generate":
        return { jobId: (await enqueue(input.vendorId, "generate_site")).id };
      case "regenerate_content":
        return { jobId: (await enqueue(input.vendorId, "regenerate_content")).id };
      case "regenerate_design":
        return { jobId: (await enqueue(input.vendorId, "regenerate_design")).id };
      case "reprocess_assets":
        return { jobId: (await enqueue(input.vendorId, "reprocess_assets")).id };
      case "edit_design":
        return { jobId: (await enqueue(input.vendorId, "edit_design", { instruction: input.instruction })).id };
      case "republish":
        return { jobId: (await enqueue(input.vendorId, "republish")).id };

      case "extend":
        return { expiresAt: await siteService.extendPreview(input.vendorId, env().PREVIEW_DAYS) };
      case "unpublish":
        await siteService.unpublish(input.vendorId);
        return { ok: true };
      case "won":
        await vendorService.setStatus(input.vendorId, "won", input.tier);
        return { jobId: (await enqueue(input.vendorId, "republish")).id };
      case "lost":
        await vendorService.setStatus(input.vendorId, "lost");
        return { ok: true };

      case "portfolio":
        await prisma.vendor.update({ where: { id: input.vendorId }, data: { showInPortfolio: input.show } });
        return { ok: true };
      case "theme":
        await prisma.vendor.update({ where: { id: input.vendorId }, data: { themeOverride: input.themeId } });
        return { ok: true };
      case "notes":
        await prisma.vendor.update({ where: { id: input.vendorId }, data: { designNotes: input.designNotes } });
        return { ok: true };

      case "content": {
        // Validated before it is stored, then republished so the gate runs exactly as it does
        // for a generation. A hand edit can never put an invalid document live.
        const content = contentJsonSchema.parse(input.content);
        const vendor = await prisma.vendor.findUniqueOrThrow({
          where: { id: input.vendorId },
          select: { publishedVersionId: true },
        });
        if (!vendor.publishedVersionId) throw new Error("Generate the site before editing its content");
        await prisma.siteVersion.update({
          where: { id: vendor.publishedVersionId },
          data: { contentJson: content },
        });
        return { jobId: (await enqueue(input.vendorId, "regenerate_design")).id };
      }
    }
  });
}
