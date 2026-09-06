import type { ThemeId } from "../contracts/theme-id";

export type ColorTokens = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  onAccent: string;
  ground: string;
  border: string;
};

export type FontSpec = {
  /** CSS font-family name used in @font-face and font stacks. */
  family: string;
  /** npm package that ships the woff2, for example "@fontsource-variable/inter". */
  package: string;
  /** File name inside the package's files/ directory. */
  file: string;
  /** Fallback stack appended after the family. */
  fallback: string;
};

export type Density = "compact" | "regular" | "airy";

export type Theme = {
  id: ThemeId;
  label: string;
  colors: { light: ColorTokens; dark: ColorTokens };
  fonts: { heading: FontSpec; body: FontSpec };
  radius: { sm: string; md: string; lg: string };
  density: Density;
  headingWeight: number;
  headingLetterSpacing: string;
};
