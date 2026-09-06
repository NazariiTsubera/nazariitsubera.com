import { describe, expect, it } from "vitest";

import { contrastRatio, relativeLuminance } from "./contrast";

describe("contrast", () => {
  it("computes luminance of white and black", () => {
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });

  it("gives 21:1 for black on white and 1:1 for identical colors", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#B8462B", "#FBF6EE")).toBeCloseTo(contrastRatio("#FBF6EE", "#B8462B"), 6);
  });

  it("rejects malformed hex", () => {
    expect(() => relativeLuminance("red")).toThrow(/Expected #rrggbb/);
  });
});
