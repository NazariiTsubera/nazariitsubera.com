import { type Job, type JobType, type Prisma, prisma } from "../db";
import type { JobStep } from "./types";

export const jobRepository = {
  get: (id: string) => prisma.job.findUnique({ where: { id } }),

  latestForVendor: (vendorId: string) =>
    prisma.job.findFirst({ where: { vendorId }, orderBy: { createdAt: "desc" } }),

  listForVendor: (vendorId: string) =>
    prisma.job.findMany({ where: { vendorId }, orderBy: { createdAt: "desc" }, take: 20 }),

  create: (vendorId: string, type: JobType, payload: Prisma.InputJsonValue): Promise<Job> =>
    prisma.job.create({ data: { vendorId, type, payload } }),

  setBullJobId: (id: string, bullJobId: string) => prisma.job.update({ where: { id }, data: { bullJobId } }),

  markRunning: (id: string) =>
    prisma.job.update({ where: { id }, data: { status: "running", startedAt: new Date(), attempts: { increment: 1 } } }),

  markSucceeded: (id: string) =>
    prisma.job.update({ where: { id }, data: { status: "succeeded", finishedAt: new Date(), error: null } }),

  markFailed: (id: string, error: string) =>
    prisma.job.update({ where: { id }, data: { status: "failed", finishedAt: new Date(), error } }),

  /** Steps are an append-and-update list on the row, so the console can show progress. */
  async recordStep(id: string, step: JobStep): Promise<void> {
    const job = await prisma.job.findUniqueOrThrow({ where: { id } });
    const steps = (job.steps as unknown as JobStep[]) ?? [];
    const index = steps.findIndex((s) => s.name === step.name);
    if (index >= 0) steps[index] = { ...steps[index], ...step };
    else steps.push(step);
    await prisma.job.update({ where: { id }, data: { steps: steps as unknown as Prisma.InputJsonValue } });
  },
};
