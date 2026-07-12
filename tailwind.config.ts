import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // warm editorial base
        cream: "#f1eee6",
        ink: "#17161c",
        // text tones (warm greys)
        body: "#403c35",
        "body-2": "#4a463f",
        mono: "#7a766d",
        "mono-soft": "#8a867d",
        eyebrow: "#8a675f",
        faint: "#9a968d",
        // vivid gradient family
        blue: "#2f3bd6",
        violet: "#6d28d9",
        magenta: "#d6266e",
        "magenta-ink": "#c81d68",
        flame: "#ef6a2a",
        lilac: "#8b5cf6",
        "violet-bright": "#7c3aed",
        // dark surfaces (cta / footer)
        "ink-deep": "#0a0912",
        "on-dark": "#f4f2ee",
        "on-dark-lilac": "#b7a7f5",
        "on-dark-lilac2": "#c9bdf7",
        "on-dark-pink": "#f7a1c4",
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-newsreader)", "Georgia", "serif"],
      },
      maxWidth: {
        frame: "1240px",
      },
      backgroundImage: {
        "grad-line":
          "linear-gradient(100deg, #2f3bd6, #6d28d9 34%, #d6266e 68%, #ef6a2a)",
        "grad-mark": "linear-gradient(135deg, #6d28d9, #d6266e 55%, #ef6a2a)",
        "grad-bar": "linear-gradient(90deg, #2f3bd6, #6d28d9, #d6266e, #ef6a2a)",
      },
      boxShadow: {
        mark: "0 3px 10px rgba(109,40,217,.35)",
        card: "0 1px 0 rgba(23,22,28,.06), 0 18px 40px rgba(23,22,28,.08)",
        grad: "0 12px 30px rgba(109,40,217,.32)",
      },
      keyframes: {
        hue: {
          to: { backgroundPosition: "220% center" },
        },
        marquee: {
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        hue: "hue 9s linear infinite",
        marquee: "marquee 32s linear infinite",
        float: "float 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
