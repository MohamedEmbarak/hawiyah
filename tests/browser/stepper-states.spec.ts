import { expect, test } from '@playwright/test';

for (const direction of ['rtl', 'ltr']) {
  test(`Stepper updates progress and independent active/previous styles (${direction})`, async ({ page }) => {
    await page.goto('/#component/stepper');
    const demo = page.locator('[data-stepper-demo]').first(); await expect(demo).toBeVisible();
    await demo.evaluate((node, dir) => node.setAttribute('dir', dir), direction);
    const items = demo.locator('.hw-step');
    const states = () => items.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-state')));
    expect(await states()).toEqual(['complete', 'current', 'upcoming']);
    await demo.locator('[data-stepper-index]').selectOption('2'); expect(await states()).toEqual(['complete', 'complete', 'current']);
    await demo.locator('[data-stepper-color="current"]').selectOption('#175cd3');
    await demo.locator('[data-stepper-color="complete"]').selectOption('#6941c6');
    const backgrounds = await items.evaluateAll(nodes => nodes.map(node => getComputedStyle(node, '::before').backgroundColor));
    expect(backgrounds).toEqual(['rgb(105, 65, 198)', 'rgb(105, 65, 198)', 'rgb(23, 92, 211)']);
    await expect(items.nth(2)).toHaveAttribute('aria-current', 'step');
    await demo.locator('[data-stepper-status]').selectOption('upcoming'); expect(await states()).toEqual(['upcoming', 'complete', 'current']);
    await demo.locator('[data-stepper-status]').selectOption('');
    await demo.locator('[data-stepper-index]').selectOption('3'); expect(await states()).toEqual(['complete', 'complete', 'complete']);
    await expect(demo.locator('[aria-current]')).toHaveCount(0);
    await demo.locator('[data-stepper-index]').selectOption('-1'); expect(await states()).toEqual(['upcoming', 'upcoming', 'upcoming']);
    await demo.locator('[data-stepper-index]').selectOption('0'); expect(await states()).toEqual(['current', 'upcoming', 'upcoming']);
    await expect(demo.locator('.hw-step button, .hw-step a, .hw-step[tabindex]')).toHaveCount(0);
  });
}
