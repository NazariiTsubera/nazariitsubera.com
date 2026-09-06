import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/node_modules/**",
    "**/next-env.d.ts",
  ]),
  {
    files: ["apps/web/**/*.{js,jsx,mjs,ts,tsx}"],
    extends: [nextVitals, nextTs],
    settings: {
      next: { rootDir: "apps/web" },
    },
  },
]);
