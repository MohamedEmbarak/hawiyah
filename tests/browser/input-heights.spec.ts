import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'en']) test(`mixed-height input rows preserve control sizing in ${locale}`, async ({ page }, testInfo) => {
  await page.addInitScript(locale => localStorage.setItem('nasaq-locale', locale), locale);
  await page.goto('/#inputs');
  const form = page.locator('#native-input-lab');
  for (const width of [1800, 1100, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(form).toBeVisible();
    const controls = await form.locator('input.nq-input:not([type=file])').evaluateAll(nodes => nodes.map(node => ({
      name: (node as HTMLInputElement).name || node.getAttribute('data-nq-date-input'),
      height: node.getBoundingClientRect().height,
      expected: parseFloat(getComputedStyle(node).minBlockSize),
    })));
    for (const control of controls) expect(control.height, `${width}px ${control.name}`).toBeCloseTo(control.expected, 1);
    for (const wrapper of await form.locator('.nq-date-picker-control, .nq-password-control, .nq-search-control').all()) {
      const input = wrapper.locator('input'); const action = wrapper.locator('button');
      if (!await action.isVisible()) continue;
      const fieldBox = (await input.boundingBox())!; const actionBox = (await action.boundingBox())!;
      expect(actionBox.y).toBeGreaterThanOrEqual(fieldBox.y);
      expect(actionBox.y + actionBox.height).toBeLessThanOrEqual(fieldBox.y + fieldBox.height + 1);
    }
    if (width === 1800) await form.screenshot({ path: testInfo.outputPath(`input-heights-${locale}.png`) });
  }
});
