import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // light, airy surfaces
        paper: "#fcfcfd",
        canvas: "#faf9f7",
        panel: "#ffffff",
        // ink + text
        ink: "#141318",
        muted: "#5b5966",
        "muted-soft": "#8a8794",
        line: "#e7e5ea",
        "line-strong": "#d7d4dc",
        // dark surfaces (footer / contrast blocks)
        "ink-deep": "#0f0e13",
        "ink-panel": "#18161d",
        "ink-line": "#2c2933",
        "on-dark": "#efedf4",
        "on-dark-soft": "#a7a3b3",
        // vivid gradient family
        indigo: "#3b1fd6",
        violet: "#7b2ff2",
        magenta: "#d61f8f",
        flame: "#f2711f",
        accent: "#6d28e0",
        "accent-ink": "#4f1bb0",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      maxWidth: {
        frame: "1180px",
      },
      borderRadius: {
        pill: "6px",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(20, 16, 40, 0.10)",
        glow: "0 30px 90px -20px rgba(123, 47, 242, 0.45)",
        inset: "inset 0 2px 6px rgba(20, 16, 40, 0.06)",
      },
      backgroundImage: {
        "vivid-blend":
          "radial-gradient(60% 80% at 18% 30%, rgba(59,31,214,0.85) 0%, rgba(59,31,214,0) 60%), radial-gradient(55% 75% at 62% 55%, rgba(123,47,242,0.85) 0%, rgba(123,47,242,0) 62%), radial-gradient(50% 70% at 82% 40%, rgba(214,31,143,0.75) 0%, rgba(214,31,143,0) 60%), radial-gradient(45% 60% at 5% 78%, rgba(242,113,31,0.6) 0%, rgba(242,113,31,0) 58%)",
        "vivid-line":
          "linear-gradient(96deg, #3b1fd6 0%, #7b2ff2 42%, #d61f8f 78%, #f2711f 100%)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -3%, 0) scale(1.08)" },
        },
      },
      animation: {
        drift: "drift 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
