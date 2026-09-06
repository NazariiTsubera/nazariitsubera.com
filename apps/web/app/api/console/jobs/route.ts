import { z } from "zod";

import { jobService } from "@nazariitsubera/core/jobs";

import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Polled by the console while a generation runs. Reads Postgres, never Redis. */
export async function GET(request: Request) {
  return handle(async () => {
    const vendorId = z.uuid().parse(new URL(request.url).searchParams.get("vendorId"));
    const job = await jobService.latestForVendor(vendorId);
    return job ? { id: job.id, status: job.status, steps: job.steps, error: job.error } : { id: null };
  });
}
