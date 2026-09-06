import { createVendorSchema, vendorService } from "@nazariitsubera/core/vendors";

import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(async () => {
    const input = createVendorSchema.parse(await request.json());
    const vendor = await vendorService.create(input);
    return { id: vendor.id, slug: vendor.slug };
  });
}
