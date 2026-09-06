import { afterEach, describe, expect, it, vi } from "vitest";

import { createLogger } from "./index";

afterEach(() => vi.restoreAllMocks());

describe("logger", () => {
  it("writes one JSON line with level, time, msg, and merged fields", () => {
    const out = vi.spyOn(console, "log").mockImplementation(() => {});
    const log = createLogger({ service: "test" });
    log.info({ vendorId: "v1" }, "published");
    expect(out).toHaveBeenCalledOnce();
    const line = JSON.parse(out.mock.calls[0]![0] as string);
    expect(line).toMatchObject({ level: "info", msg: "published", service: "test", vendorId: "v1" });
    expect(typeof line.time).toBe("string");
  });

  it("serializes errors with message and stack", () => {
    const out = vi.spyOn(console, "error").mockImplementation(() => {});
    createLogger({}).error({ err: new Error("boom") }, "failed");
    const line = JSON.parse(out.mock.calls[0]![0] as string);
    expect(line.err.message).toBe("boom");
    expect(line.err.stack).toContain("boom");
  });
});
