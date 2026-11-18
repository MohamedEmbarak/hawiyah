import AxeBuilder from '@axe-core/playwright';
import { test as base, expect, type ConsoleMessage, type Page } from '@playwright/test';

export { expect };

/** Console and page-error capture. Any error fails the test unless allowed below. */
export interface ConsoleGuard {
  /** The messages of type error or warning and the uncaught page errors seen so far. */
  readonly messages: string[];
  /** Every console message, of any type. */
  readonly all: ConsoleMessage[];
  /**
   * On a fallback route the browser logs 'Failed to load resource: ... 404' for the
   * 404.html document itself; this allows that one entry for the given document URL.
   */
  allowDocument404(url: string | RegExp): void;
}

const NOT_FOUND = /Failed to load resource: the server responded with a status of 404/;

export const test = base.extend<{ guard: ConsoleGuard }>({
  guard: [
    async ({ page }, use) => {
      const messages: string[] = [];
      const all: ConsoleMessage[] = [];
      const allowed: (string | RegExp)[] = [];
      // Documents without an icon link (redirect pages, NOTICE.txt) make the browser ask
      // the origin for /favicon.ico, outside the base path; GitHub Pages answers 404 too.
      const favicon = (url: string) => new URL(url, 'http://localhost').pathname === '/favicon.ico';
      const isAllowed = (message: ConsoleMessage) =>
        NOT_FOUND.test(message.text()) &&
        (favicon(message.location().url) ||
          allowed.some((rule) => (typeof rule === 'string' ? message.location().url === rule : rule.test(message.location().url))));
      page.on('console', (message) => {
        all.push(message);
        if ((message.type() === 'error' || message.type() === 'warning') && !isAllowed(message)) {
          messages.push(`${message.type()}: ${message.text()} (${message.location().url})`);
        }
      });
      page.on('pageerror', (error) => messages.push(`pageerror: ${error.message}`));
      await use({ messages, all, allowDocument404: (url) => allowed.push(url) });
      expect(messages, 'console errors, warnings and page errors').toEqual([]);
      expect(all.filter((m) => /\bNG0?5\d\d\b/.test(m.text())).map((m) => m.text()), 'hydration messages').toEqual([]);
    },
    { auto: true },
  ],
});

/** axe with the WCAG 2.2 AA tag set; returns the violations as readable lines. */
export async function axe(page: Page): Promise<string[]> {
  // @axe-core/playwright is typed against its own playwright-core copy; the objects are the same at run time.
  const axePage = page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'];
  const result = await new AxeBuilder({ page: axePage }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
}

/** Stores a colour mode before any document script runs. */
export async function presetMode(page: Page, mode: 'light' | 'dark'): Promise<void> {
  await page.addInitScript((value) => {
    try {
      window.localStorage.setItem('hawiyah-guide-mode', value);
    } catch {
      // Storage unavailable: the pre-paint script falls back to the system preference.
    }
  }, mode);
}

/** Stores a guide language before any document script runs. */
export async function presetStorage(page: Page, entries: Record<string, string>): Promise<void> {
  await page.addInitScript((values) => {
    for (const [key, value] of Object.entries(values)) window.localStorage.setItem(key, value);
  }, entries);
}

/** Emulates reduced motion (also the default of the configuration). */
export async function reduceMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

/** Waits until Angular has bootstrapped and hydrated the document. */
export async function hydrated(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const root = document.querySelector('app-root');
    return Boolean(root && !root.hasAttribute('ngh') && document.readyState === 'complete');
  });
  // app-root loses ngh before event replay ends; a key pressed while nodes still carry
  // jsaction is queued and replayed (see tests/e2e/tabs/tabs.spec.ts).
  await page.waitForFunction(() => document.querySelector('[jsaction]') === null);
}

/** Marks the current document so that a later check can tell a client navigation from a reload. */
export async function markDocument(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __guideMarker?: boolean }).__guideMarker = true;
  });
}

export async function sameDocument(page: Page): Promise<boolean> {
  return page.evaluate(() => (window as unknown as { __guideMarker?: boolean }).__guideMarker === true);
}

/**
 * Serves the root document with the pre-paint redirect call disabled, so that the
 * prerendered language choice can be checked (and hydrated) in a browser.
 */
export async function keepRootDocument(page: Page): Promise<void> {
  await page.route(/\/hawiyah\/(?:index\.html)?$/, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace('location.replace(base + mapLegacyHash', 'void (base + mapLegacyHash');
    await route.fulfill({ response, body });
  });
}
