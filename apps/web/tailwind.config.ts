import type { Config } from "tailwindcss";

/**
 * The "Mineral" palette from the Claude Design file. The second block keeps the token names
 * the console and storefront already use, mapped onto this palette, so one theme serves all.
 */
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3f4f3",
        band: "#eaece9",
        ink: "#171a1a",
        body: "#4a4f4e",
        muted: "#636866",
        faint: "#9aa09c",
        quote: "#7d8380",
        accent: "#1a5490",
        "accent-deep": "#143f6d",
        amber: "#8a5b2e",
        "on-dark": "#f3f4f3",
        "dark-muted": "#c3ccd4",
        "dark-label": "#93a8bd",
        "foot-label": "#9dbbd8",
        "foot-link": "#dfe7f0",
        "foot-fg": "#eef3f8",

        // Names used by the console and storefront, kept stable.
        cream: "#f3f4f3",
        "body-2": "#4a4f4e",
        mono: "#636866",
        eyebrow: "#1a5490",
        "magenta-ink": "#b3261e",
        "ink-deep": "#171a1a",
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { frame: "1120px" },
      transitionTimingFunction: {
        soft: "cubic-bezier(.2,.7,.2,1)",
        out: "cubic-bezier(.19,1,.22,1)",
      },
    },
  },
  plugins: [],
};

export default config;
