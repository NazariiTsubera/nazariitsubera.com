import type { JobType } from "../db";

export type JobStep = {
  name: string;
  status: "running" | "succeeded" | "failed" | "skipped";
  startedAt: string;
  finishedAt?: string;
  error?: string;
};

export type JobPayload = Record<string, unknown>;

export const QUEUE_NAME = "pipeline";
export const SWEEP_JOB_NAME = "expiry_sweep";
export const SWEEP_SCHEDULE_ID = "expiry-sweep";
export const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

/** The name a BullMQ job carries; pipeline jobs use the JobType, the sweep is its own name. */
export type QueueJobName = JobType | typeof SWEEP_JOB_NAME;

export type QueueJobData = { jobId: string; vendorId: string; type: JobType };
