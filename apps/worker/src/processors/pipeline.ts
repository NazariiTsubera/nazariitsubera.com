import { jobRepository } from "@nazariitsubera/core/jobs";
import type { QueueJobData } from "@nazariitsubera/core/jobs";
import { createLogger } from "@nazariitsubera/core/logger";

const log = createLogger({ processor: "pipeline" });

/**
 * Placeholder until Plan 4 supplies the real steps. It still exercises the full contract:
 * mark the durable row running, record a step, and mark it succeeded or failed.
 */
export async function runPipelineJob(data: QueueJobData): Promise<void> {
  const { jobId, vendorId, type } = data;
  await jobRepository.markRunning(jobId);
  const startedAt = new Date().toISOString();
  try {
    await jobRepository.recordStep(jobId, { name: "accepted", status: "succeeded", startedAt, finishedAt: new Date().toISOString() });
    await jobRepository.markSucceeded(jobId);
    log.info({ jobId, vendorId, type }, "job finished");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await jobRepository.recordStep(jobId, { name: "accepted", status: "failed", startedAt, finishedAt: new Date().toISOString(), error: message });
    await jobRepository.markFailed(jobId, message);
    log.error({ jobId, vendorId, type, err: error }, "job failed");
    throw error;
  }
}
