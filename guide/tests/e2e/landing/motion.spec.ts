import type { Page } from '@playwright/test';
import { test, expect } from '../support/fixtures';
import { TEXT, choose, ready } from './support';

// Landing motion (landing.motion): under reduced motion no animation exists after
// load and after each control change; with motion allowed every animation uses the
// duration tokens and finishes within 500 ms.

const t = TEXT.en;

/** Changes the controls of the containers and the chooser, one at a time. */
const changes: ((page: Page) => Promise<void>)[] = [
  (page) => choose(page.getByRole('group', { name: t.language }), 'العربية'),
  (page) => choose(page.getByRole('group', { name: t.mode }), 'Dark'),
  (page) => choose(page.getByRole('group', { name: t.density }), 'Compact'),
  (page) => page.getByRole('button', { name: t.reset }).click(),
  (page) => choose(page.locator('#install').getByRole('group', { name: t.framework }), 'React'),
  (page) => choose(page.locator('#install').getByRole('group', { name: t.manager }), 'yarn'),
];

const animations = (page: Page) =>
  page.evaluate(() =>
    document.getAnimations().map((animation) => ({
      name: (animation as CSSAnimation).animationName ?? (animation as CSSTransition).transitionProperty ?? '',
      duration: Number(animation.effect?.getTiming().duration ?? 0),
      delay: Number(animation.effect?.getTiming().delay ?? 0),
    })),
  );

const tokens = (page: Page) =>
  page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return ['fast', 'normal', 'slow'].map((name) => {
      const value = style.getPropertyValue(`--hw-duration-${name}`).trim();
      return value.endsWith('ms') ? parseFloat(value) : Math.round(parseFloat(value) * 1000);
    });
  });

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('no animation after load and after each control change', async ({ page }) => {
    await page.goto('en/');
    await ready(page);
    expect(await animations(page)).toEqual([]);
    for (const change of changes) {
      await change(page);
      expect(await animations(page)).toEqual([]);
    }
  });
});

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('every animation uses the duration tokens and finishes within 500 ms', async ({ page }) => {
    await page.addInitScript(() => {
      const starts: string[] = [];
      (window as unknown as { __starts: string[] }).__starts = starts;
      document.addEventListener('animationstart', (event) => starts.push(event.animationName), true);
    });
    await page.goto('en/');
    const durations = await tokens(page);
    expect(durations).toEqual([120, 180, 280]);
    const check = async (expectSome: boolean) => {
      const list = await animations(page);
      if (expectSome) expect(list.length).toBeGreaterThan(0);
      for (const item of list) {
        expect(durations, item.name).toContain(item.duration);
        expect(item.duration + item.delay, item.name).toBeLessThanOrEqual(durations[2]! + durations[0]!);
      }
      const started = Date.now();
      await page.waitForFunction(() => document.getAnimations().every((a) => a.playState === 'finished' || a.playState === 'idle'), null, { timeout: 2000 });
      expect(Date.now() - started).toBeLessThan(500);
    };
    await check(false);
    await ready(page);
    // Both containers settled once on load.
    const starts = await page.evaluate(() => (window as unknown as { __starts: string[] }).__starts);
    expect(starts.filter((name) => name.includes('guide-pane-settle'))).toHaveLength(2);
    for (const change of changes) {
      await change(page);
      await check(false);
    }
  });

  test('each step of the lead rotation fades on the duration tokens within 500 ms', async ({ page }) => {
    await page.addInitScript(() => {
      const starts: string[] = [];
      (window as unknown as { __fades: string[] }).__fades = starts;
      document.addEventListener('animationstart', (event) => starts.push(event.animationName), true);
    });
    // Real time: CSS animations run on real time, so the clock is not faked.
    await page.goto('en/');
    await ready(page);
    const durations = await tokens(page);
    const lead = page.locator('guide-landing-lead');
    await lead.locator('.rotator').scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await expect(lead.getByRole('button', { name: t.pause })).toBeVisible();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    await page.evaluate(() => (window as unknown as { __fades: string[] }).__fades.splice(0));
    for (let i = 0; i < 4; i += 1) {
      await page.waitForFunction(() => document.getAnimations().some((a) => /command-fade-in-(odd|even)$/.test((a as CSSAnimation).animationName ?? '')), null, { timeout: 5000 });
      const list = await animations(page);
      expect(list.length).toBeGreaterThan(0);
      for (const item of list) {
        expect(durations, item.name).toContain(item.duration);
        expect(item.duration + item.delay, item.name).toBeLessThanOrEqual(durations[2]! + durations[0]!);
      }
      const started = Date.now();
      await page.waitForFunction(() => document.getAnimations().every((a) => a.playState === 'finished' || a.playState === 'idle'), null, { timeout: 2000 });
      expect(Date.now() - started).toBeLessThan(500);
      // Each step faded the one listing in again (its text changed in place), and nothing
      // else; the two keyframe names alternate so that every step restarts the fade.
      // Keyframe names carry the component's scope prefix.
      const fades = await page.evaluate(() => (window as unknown as { __fades: string[] }).__fades.splice(0));
      expect(fades.filter((name) => !name.includes('guide-pane-settle')).map((name) => name.replace(/^.*(command-fade-in-(?:odd|even))$/, '$1'))).toEqual([
        i % 2 === 0 ? 'command-fade-in-odd' : 'command-fade-in-even',
      ]);
    }
  });

  test('a container change replays only that container', async ({ page }) => {
    await page.addInitScript(() => {
      const starts: { name: string; lang: string | null }[] = [];
      (window as unknown as { __paneStarts: typeof starts }).__paneStarts = starts;
      document.addEventListener(
        'animationstart',
        (event) => starts.push({ name: event.animationName, lang: (event.target as Element).getAttribute('lang') }),
        true,
      );
    });
    await page.goto('en/');
    await ready(page);
    await page.waitForFunction(() => document.getAnimations().length === 0);
    await page.evaluate(() => (window as unknown as { __paneStarts: unknown[] }).__paneStarts.splice(0));
    await choose(page.getByRole('group', { name: t.density }), 'Compact');
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __paneStarts: { name: string; lang: string | null }[] }).__paneStarts.filter((s) => s.name.includes('guide-pane-change'))))
      // On the English page the controls start on container A (Arabic).
      .toEqual([{ name: expect.stringContaining('guide-pane-change'), lang: 'ar' }]);
  });
});
