import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
const port = Number(process.env.HAWIYAH_TEST_PORT || 4173);
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath:
            process.env.HAWIYAH_CHROMIUM ||
            (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
          args: ["--no-sandbox"],
        },
      },
    },
  ],
  webServer: {
    command:
      `pnpm exec vite --host 127.0.0.1 --port ${port} --strictPort --config apps/playground/vite.config.ts`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
