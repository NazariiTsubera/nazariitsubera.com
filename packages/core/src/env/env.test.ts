import { afterEach, describe, expect, it, vi } from "vitest";

import { assertBootEnv, env, resetEnvCache } from "./index";

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
  resetEnvCache();
  vi.restoreAllMocks();
});

describe("env", () => {
  it("parses required and defaulted variables", () => {
    process.env.DATABASE_URL = "postgresql://u:p@localhost:5432/db";
    process.env.OPERATOR_PHONE = "+12105550100";
    delete process.env.PREVIEW_DAYS;
    delete process.env.SITE_ROOT_DOMAIN;
    resetEnvCache();
    const e = env();
    expect(e.PREVIEW_DAYS).toBe(7);
    expect(e.SITE_ROOT_DOMAIN).toBe("nazariitsubera.com");
    expect(e.OPERATOR_PHONE).toBe("+12105550100");
  });

  it("throws in production when DATABASE_URL is missing", () => {
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    resetEnvCache();
    expect(() => assertBootEnv()).toThrow(/DATABASE_URL/);
  });

  it("only warns outside production", () => {
    process.env.NODE_ENV = "test";
    delete process.env.DATABASE_URL;
    resetEnvCache();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => assertBootEnv()).not.toThrow();
    expect(warn).toHaveBeenCalledOnce();
  });
});
