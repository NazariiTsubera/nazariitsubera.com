import type { ThemeId } from "../contracts/theme-id";
import type { FontSpec, Theme } from "./types";

const SANS_FALLBACK = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SERIF_FALLBACK = "Georgia, 'Times New Roman', serif";

const FONTS = {
  fraunces: { family: "Fraunces Variable", package: "@fontsource-variable/fraunces", file: "fraunces-latin-wght-normal.woff2", fallback: SERIF_FALLBACK },
  sourceSans: { family: "Source Sans 3 Variable", package: "@fontsource-variable/source-sans-3", file: "source-sans-3-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  inter: { family: "Inter Variable", package: "@fontsource-variable/inter", file: "inter-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  lora: { family: "Lora Variable", package: "@fontsource-variable/lora", file: "lora-latin-wght-normal.woff2", fallback: SERIF_FALLBACK },
  nunitoSans: { family: "Nunito Sans Variable", package: "@fontsource-variable/nunito-sans", file: "nunito-sans-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  spaceGrotesk: { family: "Space Grotesk Variable", package: "@fontsource-variable/space-grotesk", file: "space-grotesk-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  bricolage: { family: "Bricolage Grotesque Variable", package: "@fontsource-variable/bricolage-grotesque", file: "bricolage-grotesque-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  nunito: { family: "Nunito Variable", package: "@fontsource-variable/nunito", file: "nunito-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  playfair: { family: "Playfair Display Variable", package: "@fontsource-variable/playfair-display", file: "playfair-display-latin-wght-normal.woff2", fallback: SERIF_FALLBACK },
  workSans: { family: "Work Sans Variable", package: "@fontsource-variable/work-sans", file: "work-sans-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
} satisfies Record<string, FontSpec>;

export const themes: Record<ThemeId, Theme> = {
  market: {
    id: "market",
    label: "Market",
    colors: {
      light: { bg: "#FBF6EE", surface: "#FFFFFF", ink: "#2B2118", muted: "#6B5D50", accent: "#B8462B", onAccent: "#FFFFFF", ground: "#F3EBDF", border: "#E7DCCB" },
      dark: { bg: "#1E1814", surface: "#2A221C", ink: "#F5EDE2", muted: "#C9B9A6", accent: "#E4845F", onAccent: "#1E1814", ground: "#33291F", border: "#3D3129" },
    },
    fonts: { heading: FONTS.fraunces, body: FONTS.sourceSans },
    radius: { sm: "6px", md: "12px", lg: "20px" },
    density: "regular",
    headingWeight: 600,
    headingLetterSpacing: "-0.015em",
  },
  studio: {
    id: "studio",
    label: "Studio",
    colors: {
      light: { bg: "#FFFFFF", surface: "#F6F6F4", ink: "#111111", muted: "#5E5E5E", accent: "#111111", onAccent: "#FFFFFF", ground: "#F1F1EE", border: "#E4E4E1" },
      dark: { bg: "#0F0F0F", surface: "#1A1A1A", ink: "#F2F2F2", muted: "#B3B3B3", accent: "#F2F2F2", onAccent: "#0F0F0F", ground: "#202020", border: "#2C2C2C" },
    },
    fonts: { heading: FONTS.inter, body: FONTS.inter },
    radius: { sm: "2px", md: "4px", lg: "8px" },
    density: "airy",
    headingWeight: 500,
    headingLetterSpacing: "-0.03em",
  },
  garden: {
    id: "garden",
    label: "Garden",
    colors: {
      light: { bg: "#F4F6F0", surface: "#FFFFFF", ink: "#1F2A1D", muted: "#56634F", accent: "#2F6B3A", onAccent: "#FFFFFF", ground: "#EAEFE3", border: "#D9E0D0" },
      dark: { bg: "#161C15", surface: "#1F2A1E", ink: "#EDF2E8", muted: "#B9C6B0", accent: "#8FCB93", onAccent: "#161C15", ground: "#26332A", border: "#33402F" },
    },
    fonts: { heading: FONTS.lora, body: FONTS.nunitoSans },
    radius: { sm: "8px", md: "14px", lg: "24px" },
    density: "regular",
    headingWeight: 600,
    headingLetterSpacing: "-0.01em",
  },
  night: {
    id: "night",
    label: "Night",
    colors: {
      light: { bg: "#F4F4F8", surface: "#FFFFFF", ink: "#15151F", muted: "#575768", accent: "#3B3BD9", onAccent: "#FFFFFF", ground: "#ECECF4", border: "#DCDCE8" },
      dark: { bg: "#0B0B12", surface: "#15151F", ink: "#EEEEF6", muted: "#A9A9BD", accent: "#8B8BFF", onAccent: "#0B0B12", ground: "#1B1B28", border: "#262636" },
    },
    fonts: { heading: FONTS.spaceGrotesk, body: FONTS.inter },
    radius: { sm: "4px", md: "8px", lg: "12px" },
    density: "compact",
    headingWeight: 600,
    headingLetterSpacing: "-0.02em",
  },
  candy: {
    id: "candy",
    label: "Candy",
    colors: {
      light: { bg: "#FFF7FA", surface: "#FFFFFF", ink: "#2A1B22", muted: "#6E5560", accent: "#C2185B", onAccent: "#FFFFFF", ground: "#FDECF2", border: "#F5D7E2" },
      dark: { bg: "#1C1218", surface: "#281A22", ink: "#FBEFF4", muted: "#D2B7C3", accent: "#FF7AA8", onAccent: "#1C1218", ground: "#33212B", border: "#3F2A35" },
    },
    fonts: { heading: FONTS.bricolage, body: FONTS.nunito },
    radius: { sm: "10px", md: "18px", lg: "28px" },
    density: "regular",
    headingWeight: 700,
    headingLetterSpacing: "-0.02em",
  },
  workshop: {
    id: "workshop",
    label: "Workshop",
    colors: {
      light: { bg: "#F7F3EC", surface: "#FFFFFF", ink: "#23201B", muted: "#625B50", accent: "#6B4E2E", onAccent: "#FFFFFF", ground: "#EFE7DA", border: "#E1D7C6" },
      dark: { bg: "#1A1714", surface: "#26211C", ink: "#F2EBE0", muted: "#C5B9A8", accent: "#D2A46E", onAccent: "#1A1714", ground: "#302922", border: "#3A322A" },
    },
    fonts: { heading: FONTS.playfair, body: FONTS.workSans },
    radius: { sm: "3px", md: "6px", lg: "10px" },
    density: "regular",
    headingWeight: 600,
    headingLetterSpacing: "-0.01em",
  },
};
