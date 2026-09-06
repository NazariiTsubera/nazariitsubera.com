import { z } from "zod";

export const THEME_IDS = ["market", "studio", "garden", "night", "candy", "workshop"] as const;
export const themeIdSchema = z.enum(THEME_IDS);
export type ThemeId = z.infer<typeof themeIdSchema>;
