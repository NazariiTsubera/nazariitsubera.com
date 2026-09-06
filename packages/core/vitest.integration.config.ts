import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core-integration",
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    setupFiles: ["./src/test/integration-setup.ts"],
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
