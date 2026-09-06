import { z } from "zod";

import { captureService } from "@nazariitsubera/core/captures";

import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

const schema = z.object({ id: z.uuid(), operatorPrompt: z.string().max(2000).nullable() });

export async function POST(request: Request) {
  return handle(async () => {
    const { id, operatorPrompt } = schema.parse(await request.json());
    await captureService.setPrompt(id, operatorPrompt);
    return { ok: true };
  });
}
