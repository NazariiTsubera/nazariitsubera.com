import type { Tone } from "../contracts/content";
import type { ThemeId } from "../contracts/theme-id";
import { themes } from "./themes";
import type { Theme } from "./types";

export { contrastRatio, relativeLuminance } from "./contrast";
export { fontFileExists, fontFilePath } from "./fonts";
export { themes } from "./themes";
export type { ColorTokens, Density, FontSpec, Theme } from "./types";

/** Static tone-to-theme map (design 7.4). "garden" is reachable only through the operator override. */
export const TONE_THEME: Record<Tone, ThemeId> = {
  warm: "market",
  playful: "candy",
  crafted: "workshop",
  technical: "night",
  minimal: "studio",
};

export function getTheme(id: ThemeId): Theme {
  return themes[id];
}

export function themeForTone(tone: Tone): Theme {
  return themes[TONE_THEME[tone]];
}
