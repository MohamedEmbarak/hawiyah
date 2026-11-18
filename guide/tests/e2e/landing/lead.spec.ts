import type { Locator, Page } from '@playwright/test';
import { test, expect, axe, presetMode } from '../support/fixtures';
import { FRAMEWORKS, TEXT, choose, ready, type Lang } from './support';

// The lead install block (landing.lead rotation): a selector of the four frameworks,
// one listing, and one round of the four commands every 3 s once the block is in view;
// a pause button, holds on hover and focus, a stop on every reader action, no rotation
// under reduced motion, one height for all four commands, and the list of all four
// commands without JavaScript. Time is driven by Playwright's clock: it is paused once
// the round runs, so each runFor(PERIOD) is exactly one step.

const PERIOD = 3000;
const command = (id: string, verb = 'npm install') => `${verb} @hawiyah/styles@0.3.0 @hawiyah/${id}@0.3.0`;
const ORDER = ['vanilla', 'react', 'vue', 'angular'] as const;

function parts(page: Page, lang: Lang) {
  const t = TEXT[lang];
  const lead = page.locator('guide-landing-lead');
  return {
    lead,
    rotator: lead.locator('.rotator'),
    selector: lead.getByRole('group', { name: t.leadFramework }),
    shown: lead.locator('.rotator .cell:not(.command-leave) pre'),
    pause: lead.getByRole('button', { name: t.pause }),
    resume: lead.getByRole('button', { name: t.resume }),
    control: lead.locator('.rotator .pause'),
    install: page.locator('#install'),
  };
}

/** Lets the application render after an action while the clock is paused. */
const settle = (page: Page) => page.clock.runFor(100);

/** One step of the rotation. */
async function step(page: Page): Promise<void> {
  await page.clock.runFor(PERIOD);
  await settle(page);
}

/**
 * Opens the page with motion allowed and a controllable clock, waits until the round
 * runs, then pauses the clock. The pointer rests outside the block.
 */
async function rotating(page: Page, lang: Lang): Promise<ReturnType<typeof parts>> {
  await page.clock.install();
  await page.goto(`${lang}/`);
  await ready(page);
  const p = parts(page, lang);
  await p.rotator.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(p.pause).toBeVisible();
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 20);
  await expect(p.shown).toHaveText(command('angular'));
  return p;
}

/** The text of every live region of the page that has any (a new listing brings an empty one). */
const liveTexts = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[aria-live], [role="status"], [role="alert"]'), (node) => node.textContent ?? '').filter((text) => text.trim() !== ''),
  );

async function checked(group: Locator): Promise<string> {
  return group.locator('label:has(input:checked)').innerText();
}

for (const lang of ['ar', 'en'] as const) {
  const t = TEXT[lang];

  test.describe(`lead rotation ${lang}`, () => {
    test.use({ reducedMotion: 'no-preference' });

    test('shows each command in turn, one round, and ends on the first; the Install section keeps its framework', async ({ page }) => {
      const p = await rotating(page, lang);
      await expect(p.selector.locator('label')).toHaveText(FRAMEWORKS.map((fw) => fw.label));
      const live = await liveTexts(page);
      for (const id of ORDER) {
        await step(page);
        await expect(p.shown).toHaveText(command(id));
        expect(await checked(p.selector)).toBe(FRAMEWORKS.find((fw) => fw.id === id)!.label);
        // The Install section keeps the reader's framework (the default).
        await expect(p.install.getByRole('radio', { name: 'Angular' })).toBeChecked();
        await expect(p.install.locator('ol.steps > li').first().locator('.cell:not(.command-leave) pre')).toHaveText(command('angular'));
        // Automatic changes are not announced.
        expect(await liveTexts(page)).toEqual(live);
      }
      // The round is complete: the button goes and nothing changes any more.
      await expect(p.control).toHaveClass(/\boff\b/);
      await expect(p.pause).toHaveCount(0);
      await step(page);
      await step(page);
      await expect(p.shown).toHaveText(command('angular'));
    });

    test('the pause button stops and resumes the round, by keyboard', async ({ page }) => {
      const p = await rotating(page, lang);
      await step(page);
      await expect(p.shown).toHaveText(command('vanilla'));
      // From the heading before the block, Tab reaches the selector, then the button.
      await page.locator('#lead-title').focus();
      await page.keyboard.press('Tab');
      await expect(p.selector.locator('input:checked')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(p.pause).toBeFocused();
      await page.keyboard.press('Enter');
      await settle(page);
      await expect(p.resume).toBeFocused();
      // Keyboard focus in the block holds the round anyway; move it out to see that the pause holds.
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(p.rotator.locator(':focus')).toHaveCount(0);
      await step(page);
      await step(page);
      await expect(p.shown).toHaveText(command('vanilla'));
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(p.resume).toBeFocused();
      await page.keyboard.press('Space');
      await settle(page);
      await expect(p.pause).toBeFocused();
      // The round continues once the focus leaves the block.
      await step(page);
      await expect(p.shown).toHaveText(command('vanilla'));
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(p.rotator.locator(':focus')).toHaveCount(0);
      await step(page);
      await expect(p.shown).toHaveText(command('react'));
    });

    test('the pause button works with the pointer; hover and focus hold the round', async ({ page }) => {
      const p = await rotating(page, lang);
      await p.pause.click();
      await settle(page);
      await expect(p.resume).toBeVisible();
      await page.mouse.move(0, 0);
      await step(page);
      await expect(p.shown).toHaveText(command('angular'));
      await p.resume.click();
      await settle(page);
      // The pointer is still over the block.
      await step(page);
      await expect(p.shown).toHaveText(command('angular'));
      await page.mouse.move(0, 0);
      await step(page);
      await expect(p.shown).toHaveText(command('vanilla'));
      // Hover holds, leaving continues.
      await p.shown.hover();
      await step(page);
      await step(page);
      await expect(p.shown).toHaveText(command('vanilla'));
      await page.mouse.move(0, 0);
      await step(page);
      await expect(p.shown).toHaveText(command('react'));
      // Keyboard focus holds, leaving continues.
      await page.locator('#lead-title').focus();
      await page.keyboard.press('Tab');
      await expect(p.selector.locator('input:checked')).toBeFocused();
      await step(page);
      await step(page);
      await expect(p.shown).toHaveText(command('react'));
      await page.keyboard.press('Shift+Tab');
      await expect(p.rotator.locator(':focus')).toHaveCount(0);
      await step(page);
      await expect(p.shown).toHaveText(command('vue'));
    });

    test('a framework chosen in the lead stops the round and the Install section shows it', async ({ page }) => {
      const p = await rotating(page, lang);
      await step(page);
      await expect(p.shown).toHaveText(command('vanilla'));
      await choose(p.selector, 'Vue');
      await settle(page);
      await expect(p.shown).toHaveText(command('vue'));
      await expect(p.control).toHaveClass(/\boff\b/);
      await expect(p.install.getByRole('radio', { name: 'Vue' })).toBeChecked();
      await expect(p.install.locator('ol.steps > li').first().locator('.cell:not(.command-leave) pre')).toHaveText(command('vue'));
      await page.mouse.move(0, 0);
      await step(page);
      await step(page);
      await expect(p.shown).toHaveText(command('vue'));
    });

    test('a framework chosen in the Install section stops the round and the lead shows it', async ({ page }) => {
      const p = await rotating(page, lang);
      await step(page);
      await choose(p.install.getByRole('group', { name: t.framework }), 'React');
      await settle(page);
      await expect(p.shown).toHaveText(command('react'));
      expect(await checked(p.selector)).toBe('React');
      await page.mouse.move(0, 0);
      await page.locator('#lead-title').scrollIntoViewIfNeeded();
      await step(page);
      await step(page);
      await expect(p.shown).toHaveText(command('react'));
      await expect(p.control).toHaveClass(/\boff\b/);
    });

    test('a package manager change stops the round and keeps the shown framework', async ({ page }) => {
      const p = await rotating(page, lang);
      await step(page);
      await step(page);
      await expect(p.shown).toHaveText(command('react'));
      await choose(p.install.getByRole('group', { name: t.manager }), 'pnpm');
      await settle(page);
      await expect(p.shown).toHaveText(command('react', 'pnpm add'));
      await page.mouse.move(0, 0);
      await step(page);
      await expect(p.shown).toHaveText(command('react', 'pnpm add'));
      await expect(p.control).toHaveClass(/\boff\b/);
    });

    test('copy copies the visible command and stops the round', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const p = await rotating(page, lang);
      await step(page);
      await step(page);
      await expect(p.shown).toHaveText(command('react'));
      await p.rotator.locator('.cell:not(.command-leave)').getByRole('button', { name: t.copy }).click();
      await settle(page);
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(command('react'));
      await expect(p.control).toHaveClass(/\boff\b/);
      await page.mouse.move(0, 0);
      await step(page);
      await expect(p.shown).toHaveText(command('react'));
    });

    for (const width of [1280, 390, 320]) {
      test(`one height for all four commands and no horizontal scroll at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const p = await rotating(page, lang);
        const box = async () => {
          const block = await p.rotator.boundingBox();
          const notes = await p.lead.locator('.notes').boundingBox();
          return { height: block?.height ?? 0, notes: notes?.y ?? 0 };
        };
        const first = await box();
        expect(first.height).toBeGreaterThan(0);
        for (const id of ORDER) {
          await step(page);
          await expect(p.shown).toHaveText(command(id));
          expect(await box()).toEqual(first);
          expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
        }
        // The command scrolls inside its listing; the selector stays inside the block.
        const fits = await p.rotator.evaluate((block) => {
          const outer = block.getBoundingClientRect();
          return Array.from(block.querySelectorAll('fieldset, button, figure'), (node) => {
            const r = node.getBoundingClientRect();
            return r.left >= outer.left - 0.5 && r.right <= outer.right + 0.5;
          }).every(Boolean);
        });
        expect(fits).toBe(true);
      });
    }

    for (const mode of ['light', 'dark'] as const) {
      test(`axe while rotating and when stopped (${mode})`, async ({ page }) => {
        await presetMode(page, mode);
        const p = await rotating(page, lang);
        await step(page);
        await expect(p.shown).toHaveText(command('vanilla'));
        // Let the fade end (CSS animations run on real time), hold the round with the
        // pointer and let the clock run again: axe waits on timers.
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        await p.shown.hover();
        await page.clock.resume();
        await expect(p.pause).toBeVisible();
        expect(await axe(page)).toEqual([]);
        await p.pause.click();
        await settle(page);
        expect(await axe(page)).toEqual([]);
        await expect(p.resume).toBeVisible();
        await choose(p.selector, 'React');
        await expect(p.control).toHaveClass(/\boff\b/);
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        expect(await axe(page)).toEqual([]);
      });
    }
  });

  test.describe(`lead under reduced motion ${lang}`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('no rotation, no pause button, no animation; the selector works', async ({ page }) => {
      await page.clock.install();
      await page.goto(`${lang}/`);
      await ready(page);
      const p = parts(page, lang);
      await page.clock.runFor(PERIOD * 5);
      await expect(p.shown).toHaveText(command('angular'));
      await expect(p.control).toBeHidden();
      await expect(p.pause).toHaveCount(0);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
      await choose(p.selector, 'JavaScript');
      await expect(p.shown).toHaveText(command('vanilla'));
      await expect(p.lead.locator('.cell pre')).toHaveCount(1);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
      await expect(p.install.getByRole('radio', { name: 'JavaScript' })).toBeChecked();
    });
  });

  test.describe(`lead without JavaScript ${lang}`, () => {
    test.use({ javaScriptEnabled: false });

    test('lists all four commands with their framework names', async ({ page }) => {
      await page.goto(`${lang}/`);
      const lead = page.locator('guide-landing-lead');
      await expect(lead.locator('.rotator')).toBeHidden();
      const list = lead.getByRole('group', { name: t.allCommands });
      await expect(list).toBeVisible();
      await expect(list.locator('dt')).toHaveText(FRAMEWORKS.map((fw) => fw.label));
      await expect(list.locator('dd')).toHaveText(FRAMEWORKS.map((fw) => command(fw.id)));
      for (const code of await list.locator('dd code').all()) {
        await expect(code).toBeVisible();
        await expect(code).toHaveAttribute('dir', 'ltr');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    });
  });
}

test.describe('lead with JavaScript', () => {
  test('the list of all commands is not shown once scripting is enabled', async ({ page }) => {
    await page.goto('en/');
    const lead = page.locator('guide-landing-lead');
    await expect(lead.locator('.all')).toBeHidden();
    await expect(lead.locator('.rotator')).toBeVisible();
  });
});
