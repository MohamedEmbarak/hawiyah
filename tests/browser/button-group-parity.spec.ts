import { expect, test, type Locator } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // The live editor's sandboxed frame has no storage; reading it there throws.
  await page.addInitScript(() => { if (window === window.top) localStorage.setItem('hawiyah-locale', 'ar'); });
});

/** Rounded widths of a group's buttons, and whether the group hugs them instead of stretching. */
async function geometry(group: Locator) {
  return group.evaluate(node => {
    const box = node.getBoundingClientRect();
    const buttons = [...node.querySelectorAll('.hw-button')].map(button => button.getBoundingClientRect());
    const left = Math.min(...buttons.map(b => b.left)), right = Math.max(...buttons.map(b => b.right));
    return { widths: buttons.map(b => Math.round(b.width)), hugs: Math.abs(box.width - (right - left)) < 1 };
  });
}

test('the preview and code tabs show the same button groups as the live editor', async ({ page }) => {
  await page.goto('/#component/button-group');
  const groups = page.locator('[data-guide-demo] .guide-preview .hw-button-group');
  await expect(groups).toHaveCount(2);
  await expect(groups.nth(0)).toHaveAttribute('aria-label', 'إجراءات أفقية');
  await expect(groups.nth(1)).toHaveAttribute('data-orientation', 'vertical');
  expect((await geometry(groups.nth(0))).hugs).toBe(true);
  // The style control switches every group, not only the first button.
  await page.locator('[data-guide-variant]').selectOption('default');
  await expect(groups.nth(0)).toHaveAttribute('data-variant', 'default');
  await expect(groups.nth(1)).toHaveAttribute('data-variant', 'default');
  await page.locator('[data-guide-tab="code"]').click();
  await expect(page.locator('#guide-code-panel pre code')).toContainText('إجراءات عمودية');
});

for (const framework of ['vanilla', 'react', 'vue', 'angular']) {
  test(`${framework} live editor renders the shared button group example`, async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/#component/button-group');
    await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', { timeout: 45000 });
    const frame = page.frameLocator('.hw-ide-frame');
    const groups = frame.locator('.hw-button-group');
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0)).toHaveAttribute('aria-label', 'إجراءات أفقية');
    await expect(groups.nth(1)).toHaveAttribute('aria-label', 'إجراءات عمودية');
    for (const group of await groups.all()) {
      await expect(group.locator('.hw-button')).toHaveText(['', 'معاينة', 'حذف']);
      await expect(group.locator('.hw-button').first()).toHaveAttribute('aria-label', 'بحث');
      await expect(group.locator('.hw-button').last()).toBeDisabled();
    }
    const horizontal = await geometry(groups.nth(0));
    const vertical = await geometry(groups.nth(1));
    expect(horizontal.hugs, 'horizontal group stretched past its buttons').toBe(true);
    expect(vertical.hugs, 'vertical group stretched past its buttons').toBe(true);
    expect(new Set(vertical.widths).size, `vertical widths ${vertical.widths}`).toBe(1);
    await groups.nth(1).locator('.hw-button').first().click();
    await expect(frame.locator('output')).toHaveText('search');
  });
}
