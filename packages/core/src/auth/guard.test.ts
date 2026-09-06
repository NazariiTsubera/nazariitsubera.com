import { describe, expect, it, vi } from "vitest";

import { UnauthorizedError, operatorFrom } from "./guard";

const session = { user: { id: "u1", email: "operator@example.com" } };

describe("operatorFrom", () => {
  it("returns the session when one exists", async () => {
    const get = vi.fn(async () => session);
    await expect(operatorFrom(get)).resolves.toEqual(session);
  });

  it("throws UnauthorizedError when there is no session", async () => {
    await expect(operatorFrom(async () => null)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws when the session has no user", async () => {
    await expect(operatorFrom(async () => ({ user: null }) as never)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
