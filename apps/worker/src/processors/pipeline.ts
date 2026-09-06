import { prisma } from "@nazariitsubera/core/db";
import { jobRepository } from "@nazariitsubera/core/jobs";
import type { QueueJobData } from "@nazariitsubera/core/jobs";
import { createLogger } from "@nazariitsubera/core/logger";
import { runGenerateSite } from "@nazariitsubera/core/pipeline";

const log = createLogger({ processor: "pipeline" });

/**
 * A first generation that fails returns the vendor to `captured` so the operator can retry.
 * A later job that fails leaves the vendor's status and published version untouched, so a
 * live site never goes down because a regenerate went wrong.
 */
async function markVendorFailed(vendorId: string): Promise<void> {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { publishedVersionId: true } });
  if (!vendor?.publishedVersionId) {
    await prisma.vendor.update({ where: { id: vendorId }, data: { status: "captured" } });
  }
}

export async function runPipelineJob(data: QueueJobData): Promise<void> {
  const { jobId, vendorId, type } = data;
  await jobRepository.markRunning(jobId);
  await prisma.vendor.update({ where: { id: vendorId }, data: { status: "generating" } }).catch(() => undefined);
  await prisma.event.create({ data: { vendorId, type: "generation_started", meta: { jobId, jobType: type } } });

  try {
    const result = await runGenerateSite(jobId, vendorId);
    await jobRepository.markSucceeded(jobId);
    await prisma.event.create({
      data: { vendorId, type: "generation_succeeded", meta: { jobId, ...result } },
    });
    log.info({ jobId, vendorId, type, ...result }, "generation finished");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await jobRepository.markFailed(jobId, message);
    await markVendorFailed(vendorId);
    await prisma.event.create({ data: { vendorId, type: "generation_failed", meta: { jobId, error: message } } });
    log.error({ jobId, vendorId, type, err: error }, "generation failed");
    throw error;
  }
}
