import { expect, test } from '@playwright/test';
import { box, computed, openCase, section } from './support';

// FEEDBACK-06: the choices stay in one row and the comment step takes the full
// width below them, for the text, icon and icon-text choices, LTR and RTL, at
// 320px and on a desktop width; the pressed outline is visible in forced colours.
for (const lang of ['en', 'ar'] as const) {
  for (const width of [320, 1280]) {
    test(`FEEDBACK-06 vanilla: choices in one row and the comment step full width below them (${lang}, ${width}px)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openCase(page, 'FEEDBACK-06', { lang, adapters: ['vanilla'], viewport: { width, height: 1600 } });
      for (const variant of ['text', 'icon', 'icon-text']) {
        const feedback = section(page, 'vanilla').locator(`.hw-feedback[data-choice-variant="${variant}"]`);
        const choices = feedback.locator('.hw-feedback-actions > button');
        await expect(choices).toHaveCount(2);
        await choices.first().click();
        await expect(choices.first()).toHaveAttribute('aria-pressed', 'true');
        const comment = feedback.locator('[data-hw-feedback-comment]');
        await expect(comment).toBeVisible();
        const [a, b] = [await box(choices.nth(0)), await box(choices.nth(1))];
        expect(Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)), `${variant}: one row`).toBeLessThan(2);
        expect(a.right <= b.left + 1 || b.right <= a.left + 1, `${variant}: side by side`).toBe(true);
        const step = await box(comment);
        expect(step.top, `${variant}: comment below the choices`).toBeGreaterThanOrEqual(Math.max(a.bottom, b.bottom));
        const content = await feedback.evaluate((node) => {
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return { left: rect.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft), right: rect.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight) };
        });
        expect(Math.abs(step.left - content.left), `${variant}: comment from the start edge`).toBeLessThanOrEqual(1);
        expect(Math.abs(step.right - content.right), `${variant}: comment to the end edge`).toBeLessThanOrEqual(1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    });
  }
}

test('FEEDBACK-06 vanilla: the pressed choice keeps a visible outline in forced colours', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openCase(page, 'FEEDBACK-06', { adapters: ['vanilla'] });
  for (const variant of ['text', 'icon', 'icon-text']) {
    const feedback = section(page, 'vanilla').locator(`.hw-feedback[data-choice-variant="${variant}"]`);
    const pressed = feedback.locator('.hw-feedback-actions > button').first();
    await pressed.click();
    await expect(pressed).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.mouse.move(0, 0);
    const style = await computed(pressed, ['outline-style', 'outline-width']);
    expect(style['outline-style'], variant).not.toBe('none');
    expect(parseFloat(style['outline-width']!), variant).toBeGreaterThan(0);
    const unpressed = await computed(feedback.locator('.hw-feedback-actions > button').nth(1), ['outline-style']);
    expect(unpressed['outline-style'], `${variant}: only the pressed choice`).toBe('none');
  }
});
