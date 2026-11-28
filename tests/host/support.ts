import { expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';

const gaps: unknown = JSON.parse(readFileSync(new URL('./gaps.json', import.meta.url), 'utf8'));

export type Adapter = 'vanilla' | 'react' | 'vue' | 'angular';
export const ADAPTERS: readonly Adapter[] = ['vanilla', 'react', 'vue', 'angular'];

export interface OpenOptions {
  lang?: 'ar' | 'en';
  dir?: 'rtl' | 'ltr';
  mode?: 'light' | 'dark';
  adapters?: readonly Adapter[];
  viewport?: { width: number; height: number };
}

/** Opens one fixture case and waits until every requested adapter has mounted. */
export async function openCase(page: Page, id: string, options: OpenOptions = {}): Promise<void> {
  const lang = options.lang ?? 'en';
  const params = new URLSearchParams({
    case: id,
    lang,
    dir: options.dir ?? (lang === 'ar' ? 'rtl' : 'ltr'),
    mode: options.mode ?? 'light',
    adapters: (options.adapters ?? ADAPTERS).join(','),
  });
  if (options.viewport) await page.setViewportSize(options.viewport);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/?${params}`);
  await page.waitForFunction(() => document.body.dataset.fixtureReady === 'true' || document.body.dataset.fixtureError !== undefined);
  const failure = await page.evaluate(() => document.body.dataset.fixtureError ?? null);
  expect(failure, `fixture ${id} failed to mount`).toBeNull();
  expect(errors, `page errors while mounting ${id}`).toEqual([]);
}

/** The section that holds one adapter's rendering. */
export function section(page: Page, adapter: Adapter): Locator {
  return page.locator(`section[data-adapter="${adapter}"]`);
}

interface GapEntry {
  id: string;
  case: string;
  adapter: string;
  observed: string;
  expected: string;
  evidence: string;
}

/**
 * Marks the running test as an expected failure for a known package defect
 * recorded in tests/host/gaps.json. Playwright fails the test once the defect
 * is fixed, which forces the marker and the gaps entry to be removed.
 */
export function knownGap(id: string): GapEntry {
  const entry = (gaps as { gaps: GapEntry[] }).gaps.find((gap) => gap.id === id);
  if (!entry) throw new Error(`tests/host/gaps.json has no entry ${id}.`);
  return entry;
}

/** Computed style values of one element, in a fixed property order. */
export async function computed(locator: Locator, properties: readonly string[], pseudo?: string): Promise<Record<string, string>> {
  return locator.evaluate(
    (node, [names, pseudoElement]) => {
      const style = getComputedStyle(node, pseudoElement ?? undefined);
      return Object.fromEntries((names as string[]).map((name) => [name, style.getPropertyValue(name)]));
    },
    [properties, pseudo ?? null] as const,
  );
}

/** Rounded border box of an element relative to the viewport. */
export async function box(locator: Locator): Promise<{ left: number; top: number; right: number; bottom: number; width: number; height: number }> {
  return locator.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const round = (value: number) => Math.round(value * 10) / 10;
    return { left: round(rect.left), top: round(rect.top), right: round(rect.right), bottom: round(rect.bottom), width: round(rect.width), height: round(rect.height) };
  });
}

/** Gives the next programmatic focus the keyboard modality, so :focus-visible matches. */
export async function keyboardFocus(page: Page, locator: Locator): Promise<void> {
  await page.keyboard.press('Shift');
  await locator.focus();
  expect(await locator.evaluate((node) => node.matches(':focus-visible'))).toBe(true);
}

/** Colours (rgba strings) of the middle pixel row of a PNG screenshot, decoded in the page. */
export async function middleRow(page: Page, png: Buffer): Promise<string[]> {
  return page.evaluate(async (source) => {
    const image = new Image();
    image.src = `data:image/png;base64,${source}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const row = Math.floor(image.naturalHeight / 2);
    const data = context.getImageData(0, row, image.naturalWidth, 1).data;
    const colours: string[] = [];
    for (let index = 0; index < data.length; index += 4) colours.push(`${data[index]},${data[index + 1]},${data[index + 2]},${data[index + 3]}`);
    return colours;
  }, png.toString('base64'));
}
