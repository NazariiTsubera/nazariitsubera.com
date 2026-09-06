import { type Job, type JobType, type Prisma } from "../db";
import { createLogger } from "../logger";
import { jobRepository } from "./job.repository";
import { pipelineQueue } from "./queue";
import type { JobPayload } from "./types";

const log = createLogger({ module: "jobs" });

/**
 * The durable Postgres row is written first and is the record the console reads.
 * Redis only ever holds work in flight, so a lost Redis loses progress, never history.
 */
export async function enqueue(vendorId: string, type: JobType, payload: JobPayload = {}): Promise<Job> {
  const job = await jobRepository.create(vendorId, type, payload as Prisma.InputJsonValue);
  try {
    const queued = await pipelineQueue().add(type, { jobId: job.id, vendorId, type });
    if (queued.id) await jobRepository.setBullJobId(job.id, queued.id);
    log.info({ jobId: job.id, vendorId, type }, "job enqueued");
    return job;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await jobRepository.markFailed(job.id, `Could not reach the queue: ${message}`);
    log.error({ jobId: job.id, vendorId, type, err: error }, "enqueue failed");
    throw error;
  }
}

export const jobService = {
  enqueue,
  get: jobRepository.get,
  latestForVendor: jobRepository.latestForVendor,
  listForVendor: jobRepository.listForVendor,
};
