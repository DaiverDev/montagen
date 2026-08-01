import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/schema",
      "packages/core",
      "packages/server",
      "packages/player",
      "packages/ui",
      "packages/cli",
      "packages/mcp",
    ],
  },
});
