import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const forbidNextInCore = {
  group: ["next", "next/*", "@/*"],
  message: "packages/core must not depend on the Next app (design 4.3).",
};

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
  {
    files: ["packages/core/**/*.{ts,tsx}"],
    extends: [nextTs],
  },
  {
    files: ["packages/core/src/**/*.{ts,tsx}"],
    ignores: ["packages/core/src/template/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-dom/server",
              message: "Only packages/core/src/template may render React (design 4.3).",
            },
          ],
          patterns: [forbidNextInCore],
        },
      ],
    },
  },
  {
    files: ["packages/core/src/template/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [forbidNextInCore] }],
    },
  },
]);
