import { Worker } from "bullmq";

import { prisma } from "@nazariitsubera/core/db";
import { assertBootEnv } from "@nazariitsubera/core/env";
import {
  QUEUE_NAME,
  SWEEP_INTERVAL_MS,
  SWEEP_JOB_NAME,
  SWEEP_SCHEDULE_ID,
  closeQueue,
  pipelineQueue,
  redisUrl,
  workerConnection,
} from "@nazariitsubera/core/jobs";
import type { QueueJobData } from "@nazariitsubera/core/jobs";
import { createLogger } from "@nazariitsubera/core/logger";

import { runExpirySweep } from "./processors/expiry-sweep";
import { runPipelineJob } from "./processors/pipeline";

const log = createLogger({ service: "worker" });

async function main(): Promise<void> {
  assertBootEnv();

  // The worker cannot do anything without Redis, so it refuses to start in every environment.
  if (!redisUrl()) {
    log.error({}, "REDIS_URL is not set; worker cannot start");
    process.exit(1);
  }

  // Idempotent: restarts do not create duplicate schedules.
  await pipelineQueue().upsertJobScheduler(SWEEP_SCHEDULE_ID, { every: SWEEP_INTERVAL_MS }, { name: SWEEP_JOB_NAME });

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      if (job.name === SWEEP_JOB_NAME) return runExpirySweep();
      return runPipelineJob(job.data as QueueJobData);
    },
    { connection: workerConnection(), concurrency: Number(process.env.WORKER_CONCURRENCY ?? 3) },
  );

  worker.on("failed", (job, err) => log.error({ jobId: job?.id, name: job?.name, err }, "queue job failed"));
  worker.on("error", (err) => log.error({ err }, "worker error"));

  log.info({ queue: QUEUE_NAME, sweepIntervalMs: SWEEP_INTERVAL_MS }, "worker started");

  let shuttingDown = false;
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    log.info({ signal }, "worker shutting down");
    try {
      await worker.close();
      await closeQueue();
      await prisma.$disconnect();
    } catch (error) {
      log.error({ err: error }, "error during shutdown");
    }
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((error: unknown) => {
  log.error({ err: error }, "worker failed to start");
  process.exit(1);
});
