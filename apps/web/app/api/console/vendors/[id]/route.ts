import { updateVendorSchema, vendorService } from "@nazariitsubera/core/vendors";

import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return handle(async () => {
    const { id } = await params;
    const patch = updateVendorSchema.parse(await request.json());
    await vendorService.update(id, patch);
    return { ok: true };
  });
}
