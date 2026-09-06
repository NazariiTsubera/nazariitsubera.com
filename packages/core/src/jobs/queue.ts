import { Queue } from "bullmq";
import IORedis, { type Redis } from "ioredis";

import { QUEUE_NAME } from "./types";

let connection: Redis | null = null;
let queue: Queue | null = null;

export function redisUrl(): string | null {
  return process.env.REDIS_URL ?? null;
}

/**
 * One shared non-blocking connection for producers. Commands fail fast instead of buffering,
 * so an enqueue against a dead Redis is an error the console can show rather than a silent hang.
 */
export function producerConnection(): Redis {
  const url = redisUrl();
  if (!url) throw new Error("REDIS_URL is not set");
  connection ??= new IORedis(url, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    commandTimeout: 5000,
  });
  return connection;
}

/** Workers need their own connection: BullMQ's blocking commands cannot be multiplexed. */
export function workerConnection(): Redis {
  const url = redisUrl();
  if (!url) throw new Error("REDIS_URL is not set");
  return new IORedis(url, { maxRetriesPerRequest: null });
}

export function pipelineQueue(): Queue {
  queue ??= new Queue(QUEUE_NAME, {
    connection: producerConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 200,
      removeOnFail: 500,
    },
  });
  return queue;
}

export async function closeQueue(): Promise<void> {
  await queue?.close();
  queue = null;
  connection?.disconnect();
  connection = null;
}
