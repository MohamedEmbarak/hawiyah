import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// Two projects: prod tests the production build in dist/browser and dev runs the
// hydration check on the development build in dist-dev/browser. Both are served
// by scripts/serve.mjs, which behaves like GitHub Pages under /hawiyah/.
const base = '/hawiyah/';
const prodPort = Number(process.env['GUIDE_E2E_PORT'] ?? 4300);
const devPort = Number(process.env['GUIDE_E2E_DEV_PORT'] ?? 4301);

function chromium(): string | undefined {
  const explicit = process.env['HAWIYAH_CHROMIUM'];
  if (explicit) return explicit;
  const browsers = process.env['PLAYWRIGHT_BROWSERS_PATH'];
  if (browsers) {
    const linked = join(browsers, 'chromium');
    if (existsSync(linked)) return linked;
  }
  return undefined;
}

const executablePath = chromium();

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: process.env['GUIDE_TEST_OUTPUT'] ?? join(tmpdir(), 'hawiyah-guide-e2e'),
  globalSetup: './tests/e2e/support/global-setup.ts',
  // The union of the per-page structure results (README.md, "The styling rule").
  globalTeardown: './tests/e2e/support/global-teardown.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  workers: process.env['CI'] ? 2 : 2,
  reporter: 'line',
  timeout: 60_000,
  use: {
    trace: 'off',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    {
      name: 'prod',
      testIgnore: ['hydration/**'],
      use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${prodPort}${base}` },
    },
    {
      name: 'dev',
      testMatch: ['hydration/**/*.spec.ts'],
      use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${devPort}${base}` },
    },
  ],
  webServer: [
    {
      command: `node scripts/serve.mjs --dir dist/browser --base ${base} --port ${prodPort}`,
      port: prodPort,
      reuseExistingServer: false,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: `node scripts/serve.mjs --dir dist-dev/browser --base ${base} --port ${devPort}`,
      port: devPort,
      reuseExistingServer: false,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
