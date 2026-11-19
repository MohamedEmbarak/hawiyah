import AxeBuilder from '@axe-core/playwright';
import type { Frame, Locator, Page } from '@playwright/test';
import { expect, hydrated, type ConsoleGuard } from '../support/fixtures';

export type Lang = 'ar' | 'en';
export type Framework = 'vanilla' | 'react' | 'vue' | 'angular';

export const FRAMEWORKS: readonly Framework[] = ['vanilla', 'react', 'vue', 'angular'];

/** The main file of each framework's project and a line that logs from it. */
export const MAIN_FILES: Readonly<Record<Framework, string>> = { vanilla: 'main.js', react: 'main.tsx', vue: 'main.ts', angular: 'main.ts' };

export const editorPath = (lang: Lang, query = '') => `${lang}/editor/${query ? `?${query}` : ''}`;

export const TEXT = {
  en: {
    notRun: 'Not run yet.',
    originalRan: /^The original example ran in \d+ ms\.$/,
    yourCodeRan: /^Your code ran in \d+ ms\./,
    failed: /^The run failed: /,
    bundled: 'Bundled runtime.',
    draftRestored: 'Your earlier edits of this example were restored. They run when you press Run.',
    loopStopped: 'A loop ran for more than 2 seconds and was stopped',
  },
  ar: {
    notRun: 'لم يُشغَّل بعد.',
    originalRan: /^شُغِّل المثال الأصلي في \d+ ملّي ثانية\.$/,
    yourCodeRan: /^شُغِّلت شيفرتك في \d+ ملّي ثانية\./,
    failed: /^تعذّر التشغيل: /,
    bundled: 'بالحزمة المجمّعة.',
    draftRestored: 'استُعيدت تعديلاتك السابقة على هذا المثال، وتُشغَّل عند الضغط على «تشغيل».',
    loopStopped: 'استمرت حلقة تكرار أكثر من ثانيتين فأُوقفت',
  },
} as const;

/** The run state line of the status bar. */
export const statusLine = (page: Page): Locator => page.locator('guide-editor-status p.state');
export const logList = (page: Page): Locator => page.getByRole('log');
export const resultFrame = (page: Page): Locator => page.locator('guide-editor-page iframe');

/** Opens the editor and waits for hydration and for the first state of the run. */
export async function openEditor(page: Page, lang: Lang, query = ''): Promise<void> {
  await page.goto(editorPath(lang, query));
  await hydrated(page);
  await expect(page.locator('guide-editor-page .cm-content').first()).toBeVisible();
}

/** Waits for the original example to have run after opening. */
export async function originalRan(page: Page, lang: Lang): Promise<void> {
  await expect(statusLine(page)).toHaveText(TEXT[lang].originalRan, { timeout: 20_000 });
}

/** The code area of a file tab (selects the tab first). */
export async function codeOf(page: Page, file: string): Promise<Locator> {
  const tab = page.getByRole('tab', { name: file, exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  const code = page.locator(`#${await tab.getAttribute('aria-controls')} .cm-content`);
  await expect(code).toBeVisible();
  return code;
}

/** Appends text at the end of a file. */
export async function appendTo(page: Page, file: string, text: string): Promise<Locator> {
  const code = await codeOf(page, file);
  await code.click();
  await page.keyboard.press('Control+End');
  await page.keyboard.insertText(text);
  return code;
}

/** The frame of the current result once it reported ready. */
export async function readyResult(page: Page): Promise<Frame> {
  await expect(resultFrame(page)).toHaveCount(1);
  const handle = await resultFrame(page).elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) throw new Error('The result frame has no document');
  await frame.waitForSelector('#hawiyah-preview-root');
  return frame;
}

/**
 * Requests of the page and of every frame of its context, recorded through context
 * routing, which also sees the sandboxed result frame (as tests/e2e/frames does).
 */
export async function recordRequests(page: Page): Promise<string[]> {
  const urls: string[] = [];
  await page.context().route(/.*/, (route) => {
    urls.push(route.request().url());
    return route.fallback();
  });
  return urls;
}

/** URLs the result frame loaded (its own requests are not always routed through the context). */
export async function frameResources(frame: Frame): Promise<string[]> {
  return frame.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name));
}

/**
 * axe with the WCAG 2.2 AA tag set over the page and the result frame. axe's preload
 * fetches the stylesheets of every frame, which the frame's policy (connect-src
 * 'none') refuses, so the preload is turned off; the rules still run in the frame.
 */
export async function axeWithFrame(page: Page): Promise<string[]> {
  const axePage = page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'];
  const result = await new AxeBuilder({ page: axePage })
    // options() replaces the whole options object, so it precedes withTags().
    .options({ preload: false })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
}

/** Text of the log entries. */
export async function logTexts(page: Page): Promise<string[]> {
  return logList(page).locator('li').allInnerTexts();
}

/**
 * The browser prints the frame's own console errors (an uncaught error of the
 * reader's code) to the page console as well; they are the subject of the test and
 * are removed from the guard, which then checks the guide's own messages.
 */
export function allowFrameErrors(guard: ConsoleGuard, pattern: RegExp): void {
  const kept = guard.messages.filter((message) => !pattern.test(message));
  guard.messages.length = 0;
  guard.messages.push(...kept);
}
