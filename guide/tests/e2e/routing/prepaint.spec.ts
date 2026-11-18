import type { Page } from '@playwright/test';
import { test, expect, hydrated, presetMode } from '../support/fixtures';

interface Snapshot {
  interactiveMode: string | null;
  mode: string | null;
  background: string;
  canvas: string;
}

/** Records the html mode before deferred scripts run and the painted canvas at DOMContentLoaded. */
async function record(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const state: Partial<Snapshot> = {};
    (window as unknown as { __prepaint: Partial<Snapshot> }).__prepaint = state;
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'interactive') state.interactiveMode = document.documentElement.getAttribute('data-hw-mode');
    });
    document.addEventListener('DOMContentLoaded', () => {
      const html = document.documentElement;
      state.mode = html.getAttribute('data-hw-mode');
      state.background = getComputedStyle(html).backgroundColor;
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--hw-color-canvas)';
      document.body.appendChild(probe);
      state.canvas = getComputedStyle(probe).backgroundColor;
      probe.remove();
    });
  });
}

async function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => (window as unknown as { __prepaint: Snapshot }).__prepaint);
}

for (const lang of ['ar', 'en'] as const) {
  test(`stored dark mode is painted before the application starts (${lang})`, async ({ page }) => {
    await presetMode(page, 'dark');
    await record(page);
    await page.goto(`${lang}/components/`);
    const state = await snapshot(page);
    expect(state.interactiveMode).toBe('dark');
    expect(state.mode).toBe('dark');
    expect(state.background).toBe(state.canvas);
    expect(state.background).not.toBe('rgb(255, 255, 255)');
    await hydrated(page);
    await expect(page.getByRole('button', { name: lang === 'ar' ? 'الوضع الداكن' : 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
  });
}

test.describe('system dark preference without a stored mode', () => {
  test.use({ colorScheme: 'dark' });

  test('is painted before the application starts', async ({ page }) => {
    await record(page);
    await page.goto('en/components/');
    const state = await snapshot(page);
    expect(state.interactiveMode).toBe('dark');
    expect(state.mode).toBe('dark');
    expect(state.background).toBe(state.canvas);
    expect(state.background).not.toBe('rgb(255, 255, 255)');
    await hydrated(page);
    await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => localStorage.getItem('hawiyah-guide-mode'))).toBeNull();
  });
});

test('the old guide mode key is honoured and not rewritten', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('hawiyah-mode', 'dark'));
  await page.goto('ar/components/');
  await hydrated(page);
  await expect(page.locator('html')).toHaveAttribute('data-hw-mode', 'dark');
  await page.getByRole('button', { name: 'الوضع الداكن' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-hw-mode', 'light');
  expect(await page.evaluate(() => [localStorage.getItem('hawiyah-mode'), localStorage.getItem('hawiyah-guide-mode')])).toEqual(['dark', 'light']);
});

test('light is the server value and the default', async ({ page, request }) => {
  const html = await (await request.get('en/components/')).text();
  expect(html).toMatch(/<html [^>]*data-hw-mode="light"/);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('en/components/');
  await hydrated(page);
  await expect(page.locator('html')).toHaveAttribute('data-hw-mode', 'light');
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'false');
});
