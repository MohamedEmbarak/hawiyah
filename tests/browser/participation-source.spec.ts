import {expect, test} from '@playwright/test';

for (const locale of ['ar', 'en']) test(`participation source grid and heading in ${locale}`, async ({page}, info) => {
  await page.addInitScript(locale => localStorage.setItem('nasaq-locale', locale), locale);
  await page.setViewportSize({width: 1600, height: 1000});
  await page.goto('/#templates/participation');
  const grid = page.locator('[data-participation-topics]');
  await expect(grid.locator(':scope > section')).toHaveCount(8);
  await expect(grid).toHaveCSS('gap', '24px');
  await expect(grid).toHaveCSS('padding-top', '8px');
  await expect(page.locator('#participation-topics-title')).toHaveCSS('font-size', '30px');
  await expect(page.locator('#participation-topics-title')).toHaveCSS('line-height', '38px');
  await grid.screenshot({path: info.outputPath('participation-desktop.png')});
  for (const [width, columns] of [[1600, 4], [900, 2], [390, 1]]) {
    await page.setViewportSize({width, height: 1000});
    await expect.poll(() => grid.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    expect(await grid.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
});
