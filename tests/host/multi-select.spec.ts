import { expect, test } from '@playwright/test';
import { ADAPTERS, box, computed, openCase, section } from './support';

// MULTISELECT-03: the selected row tint and the 16rem scroll of the option list
// apply in every adapter; a row is 40px high.
for (const adapter of ADAPTERS) {
  test(`MULTISELECT-03 ${adapter}: selected rows are tinted, the list scrolls at 16rem and rows are 40px high`, async ({ page }) => {
    await openCase(page, 'MULTISELECT-03', { adapters: [adapter] });
    const root = section(page, adapter);
    const list = root.locator('.hw-multi-select-options');
    const style = await computed(list, ['max-block-size', 'overflow-y']);
    expect(style['max-block-size']).toBe('256px');
    expect(['auto', 'scroll']).toContain(style['overflow-y']);
    const sizes = await list.evaluate((node) => ({ scroll: node.scrollHeight, client: node.clientHeight }));
    expect(sizes.client).toBeLessThanOrEqual(256);
    expect(sizes.scroll).toBeGreaterThan(sizes.client);
    const rows = list.locator('label.hw-choice');
    await expect(rows).toHaveCount(12);
    const checked = list.locator('label.hw-choice:has(input:checked)');
    const unchecked = list.locator('label.hw-choice:not(:has(input:checked))');
    await expect(checked).toHaveCount(2);
    const tint = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--hw-color-primary-subtle)';
      document.querySelector('section[data-adapter] .hw-multi-select')!.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    });
    expect((await computed(checked.first(), ['background-color']))['background-color']).toBe(tint);
    expect((await computed(unchecked.first(), ['background-color']))['background-color']).not.toBe(tint);
    for (const index of [0, 1, 5]) expect((await box(rows.nth(index))).height, `row ${index}`).toBeCloseTo(40, 0);
  });
}
