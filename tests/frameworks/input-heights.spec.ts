import { expect, test } from '@playwright/test';

test('native fields keep control heights next to taller content', async ({ page }) => {
  await page.goto('/?preview=inputs');
  const form = page.getByTestId('input-controls').locator('form');
  await form.evaluate(node => {
    node.style.display = 'grid'; node.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    (node.firstElementChild as HTMLElement).style.minHeight = '240px';
  });
  for (const density of ['comfortable', 'mobile', 'compact']) {
    await form.evaluate((node, density) => node.setAttribute('data-nq-density', density), density);
    for (const input of await form.locator('input.nq-input').all()) {
      const size = await input.evaluate(node => ({ height: node.getBoundingClientRect().height, expected: parseFloat(getComputedStyle(node).minBlockSize) }));
      expect(size.height).toBeCloseTo(size.expected, 1);
    }
  }
});
