import { describe, expect, it } from "vitest";

import { getTheme } from "../themes";
import { buildStylesheet } from "./styles";

describe("buildStylesheet", () => {
  it("emits light tokens on :root and dark tokens under the media query", () => {
    const css = buildStylesheet(getTheme("market"), "./fonts");
    expect(css).toContain(":root{--bg:#FBF6EE;");
    expect(css).toContain("@media (prefers-color-scheme:dark){:root{--bg:#1E1814;");
  });

  it("emits one @font-face per distinct font file, pointing at the fonts base url", () => {
    const market = buildStylesheet(getTheme("market"), "https://img.example.com/fonts");
    expect(market.match(/@font-face/g)).toHaveLength(2);
    expect(market).toContain('src:url("https://img.example.com/fonts/fraunces-latin-wght-normal.woff2") format("woff2")');

    const studio = buildStylesheet(getTheme("studio"), "./fonts");
    expect(studio.match(/@font-face/g)).toHaveLength(1);
  });

  it("maps density to the spacing unit", () => {
    expect(buildStylesheet(getTheme("night"), ".")).toContain("--unit:0.875rem");
    expect(buildStylesheet(getTheme("studio"), ".")).toContain("--unit:1.25rem");
    expect(buildStylesheet(getTheme("market"), ".")).toContain("--unit:1rem");
  });

  it("contains no script and no external url other than fonts", () => {
    const css = buildStylesheet(getTheme("candy"), "./fonts");
    expect(css).not.toMatch(/<script/i);
    expect(css.match(/url\(/g)).toHaveLength(2);
  });
});
