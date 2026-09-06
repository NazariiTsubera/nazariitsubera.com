import { describe, expect, it } from "vitest";

import { THEME_IDS } from "../contracts/theme-id";
import { TONES } from "../contracts/content";
import { contrastRatio } from "./contrast";
import { fontFileExists } from "./fonts";
import { TONE_THEME, getTheme, themeForTone, themes } from "./index";
import type { ColorTokens } from "./types";

const TEXT_PAIRS: Array<[keyof ColorTokens, keyof ColorTokens, number]> = [
  ["ink", "bg", 4.5],
  ["ink", "surface", 4.5],
  ["ink", "ground", 4.5],
  ["muted", "bg", 4.5],
  ["muted", "surface", 4.5],
  ["onAccent", "accent", 4.5],
  ["accent", "bg", 3],
  ["accent", "surface", 3],
];

describe("themes", () => {
  it("defines every theme id exactly once", () => {
    expect(Object.keys(themes).sort()).toEqual([...THEME_IDS].sort());
    for (const id of THEME_IDS) expect(getTheme(id).id).toBe(id);
  });

  it.each(THEME_IDS)("%s passes WCAG AA in light and dark", (id) => {
    const theme = getTheme(id);
    for (const mode of ["light", "dark"] as const) {
      const c = theme.colors[mode];
      for (const [fg, bg, min] of TEXT_PAIRS) {
        const ratio = contrastRatio(c[fg], c[bg]);
        expect(ratio, `${id}/${mode}: ${fg} on ${bg} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(min);
      }
    }
  });

  it("maps every tone to an existing theme", () => {
    for (const tone of TONES) {
      expect(THEME_IDS).toContain(TONE_THEME[tone]);
      expect(themeForTone(tone).id).toBe(TONE_THEME[tone]);
    }
  });

  it.each(THEME_IDS)("%s font files are installed", (id) => {
    const { heading, body } = getTheme(id).fonts;
    expect(fontFileExists(heading), `${heading.package}/files/${heading.file}`).toBe(true);
    expect(fontFileExists(body), `${body.package}/files/${body.file}`).toBe(true);
  });
});
