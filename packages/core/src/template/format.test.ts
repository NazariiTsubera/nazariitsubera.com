import { describe, expect, it } from "vitest";

import { formatPhone } from "./format";

describe("formatPhone", () => {
  it("formats a US E.164 number for display", () => {
    expect(formatPhone("+12105550123")).toBe("(210) 555-0123");
  });

  it("leaves non-US numbers unchanged", () => {
    expect(formatPhone("+442071234567")).toBe("+442071234567");
  });
});
