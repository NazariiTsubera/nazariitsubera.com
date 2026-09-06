import type { Config } from "tailwindcss";

/**
 * The "Mineral" palette from the Claude Design file. The second block keeps the token names
 * the console and storefront already use, mapped onto this palette, so one theme serves all.
 */
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    // Declared in full, in ascending order, so `wide` (the marketing two-column switch) and `xs`
    // (the point a row of buttons stops being full width) sort correctly against the defaults.
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      wide: "860px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Four grounds, each a step the eye can actually see: cards sit above the page, the
        // page sits above the band, and the ink band closes a run of sections. The old
        // paper/band pair differed by 9/255 and read as one uninterrupted sheet.
        paper: "#f3f4f3",
        raised: "#fbfcfb",
        band: "#e2e6e2",
        ink: "#171a1a",
        body: "#4a4f4e",
        // Darkened with the band: 4.9:1 on #e2e6e2, so the 11.5px labels stay AA.
        muted: "#5c625f",
        faint: "#868c88",
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
        "magenta-ink": "#b3261e",
        eyebrow: "#1a5490",
        "ink-deep": "#171a1a",
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      // The one spacing scale of the marketing shell; the values live in globals.css so the
      // sticky header can measure itself against the same numbers.
      spacing: {
        gutter: "var(--gutter)",
        section: "var(--section-y)",
        band: "var(--band-y)",
        "page-top": "var(--page-top)",
        "page-bottom": "var(--page-bottom)",
        header: "var(--header-h)",
      },
      maxWidth: { frame: "1120px", console: "760px" },
      transitionTimingFunction: {
        soft: "cubic-bezier(.2,.7,.2,1)",
        out: "cubic-bezier(.19,1,.22,1)",
      },
    },
  },
  plugins: [],
};

export default config;
