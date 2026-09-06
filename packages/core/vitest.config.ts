import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core",
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // The integration lane has its own config and needs a live database.
    exclude: ["**/node_modules/**", "src/**/*.integration.test.ts"],
  },
});
