import { defineConfig, devices } from '@playwright/test';

// Package browser tests on the fixture host (apps/fixture-host), which renders
// the built workspace packages with the four adapters on one page. Run
// `pnpm build:packages` first. Locally, pass --output outside the repository.
const port = Number(process.env.HAWIYAH_HOST_PORT || 4190);
// `pnpm test:host -- --output <dir>` hands the option to Playwright after a
// literal `--`, where Playwright does not read it; honour it here.
const outputFlag = process.argv.lastIndexOf('--output');
// The workers load this file again without the option, so it travels in the environment.
if (outputFlag > 0 && process.argv[outputFlag + 1]) process.env.HAWIYAH_HOST_OUTPUT = process.argv[outputFlag + 1];
const outputDir = process.env.HAWIYAH_HOST_OUTPUT || 'test-results/host';

export default defineConfig({
  testDir: './tests/host',
  testMatch: '*.spec.ts',
  outputDir,
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: process.env.HAWIYAH_CHROMIUM || undefined,
          args: ['--no-sandbox'],
        },
      },
    },
  ],
  webServer: {
    command: `pnpm --filter @hawiyah/fixture-host exec vite --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
