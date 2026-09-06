import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./job.repository", () => ({
  jobRepository: {
    create: vi.fn(async (vendorId: string, type: string) => ({ id: "job-1", vendorId, type, status: "queued" })),
    setBullJobId: vi.fn(async () => undefined),
    markFailed: vi.fn(async () => undefined),
  },
}));

const add = vi.fn();
vi.mock("./queue", () => ({ pipelineQueue: () => ({ add }) }));

const { jobRepository } = await import("./job.repository");
const { enqueue } = await import("./job.service");

beforeEach(() => {
  vi.clearAllMocks();
  add.mockReset();
});

describe("enqueue", () => {
  it("writes the durable row before touching the queue, then stores the queue id", async () => {
    add.mockResolvedValue({ id: "bull-9" });

    const job = await enqueue("v1", "generate_site", { probe: true });

    expect(job.id).toBe("job-1");
    expect(jobRepository.create).toHaveBeenCalledWith("v1", "generate_site", { probe: true });
    expect(add).toHaveBeenCalledWith("generate_site", { jobId: "job-1", vendorId: "v1", type: "generate_site" });
    expect(jobRepository.setBullJobId).toHaveBeenCalledWith("job-1", "bull-9");
    expect(jobRepository.markFailed).not.toHaveBeenCalled();
  });

  it("marks the row failed and rethrows when the queue is unreachable", async () => {
    add.mockRejectedValue(new Error("connect ECONNREFUSED"));

    await expect(enqueue("v1", "republish")).rejects.toThrow(/ECONNREFUSED/);

    expect(jobRepository.create).toHaveBeenCalledOnce();
    expect(jobRepository.markFailed).toHaveBeenCalledWith("job-1", expect.stringContaining("Could not reach the queue"));
  });
});
