import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['ar', 'en']) test(`ready examples expose all statuses without navigating the guide in ${locale}`, async ({ page, context }) => {
  await page.addInitScript(locale => { localStorage.setItem('nasaq-locale', locale); localStorage.setItem('nasaq-mode', 'light'); }, locale);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#component/alert');
  const tones = ['neutral', 'info', 'success', 'warning', 'danger'];
  for (const tone of tones) {
    await expect(page.locator(`[data-guide-canvas] .nq-alert[data-tone="${tone}"]`)).toBeVisible();
    await expect(page.locator(`#component-examples .nq-alert[data-tone="${tone}"]`)).toHaveCount(3);
  }
  await expect(page.locator('#component-examples [role="alert"]')).toHaveCount(0);
  expect((await new AxeBuilder({page}).include('#component-examples').analyze()).violations).toEqual([]);
  for (const component of ['badge', 'chip', 'toast-region']) {
    await page.goto(`/#component/${component}`);
    for (const tone of tones) await expect(page.locator(`[data-guide-canvas] [data-tone="${tone}"]`)).toBeVisible();
  }
  await expect(page.locator('[data-guide-canvas] [data-tone="neutral"] [data-nq-dismiss]')).toHaveCount(0);
  const toast = page.locator('[data-guide-canvas] [data-tone="info"]');
  await toast.locator('button').click(); await expect(toast).toBeHidden();
  await page.goto('/#component/portal-header');
  const preview = page.locator('#component-examples [data-demo-preview]');
  const href = page.url();
  const service = preview.locator('a[href="/services"]');
  await service.click(); await expect(page).toHaveURL(href);
  await expect(preview.locator('[data-demo-result]')).toBeVisible();
  await service.focus(); await page.keyboard.press('Enter'); await expect(page).toHaveURL(href);
  await service.click({ modifiers: ['Control'] });
  await service.click({ button: 'middle' });
  expect(context.pages()).toHaveLength(1);
  await expect(page).toHaveURL(href);
  // Skip links resolve only inside their preview and keep the guide's URL.
  await preview.locator('.nq-skip-link').focus(); await page.keyboard.press('Enter');
  await expect(preview.locator('#ready-header-main')).toBeFocused();
  await expect(page).toHaveURL(href);
  await page.setViewportSize({width:390,height:900});
  await preview.locator('[data-nq-portal-toggle]').click();
  await expect(preview.locator('[data-nq-portal-navigation]')).toBeVisible();
  await service.click(); await expect(page).toHaveURL(href);
  await expect(preview.locator('[data-nq-portal-toggle]')).toHaveAttribute('aria-expanded','false');
  await page.goto('/#component/portal-footer');
  await page.locator('#component-examples a[href="/privacy"]').click();
  await expect(page).toHaveURL(/#component\/portal-footer$/);
  // Actual guide links remain usable.
  await page.locator('.guide-back').click(); await expect(page).toHaveURL(/#components$/);
  expect(errors).toEqual([]);
});

test('component gallery uses responsive masonry and keeps expanded examples intact', async ({page}) => {
  await page.setViewportSize({width:1600,height:1000});
  await page.goto('/#components');
  const grid = page.locator('.component-grid');
  await expect(grid).toHaveCSS('display','block');
  await expect(grid).toHaveCSS('column-width','384px');
  const cards = grid.locator(':scope > .component-card');
  const columns = await cards.evaluateAll(nodes => new Set(nodes.map(node => Math.round(node.getBoundingClientRect().x))).size);
  expect(columns).toBeGreaterThan(1);
  await expect(cards.first()).toHaveCSS('break-inside','avoid');
  const details = cards.first().locator('.source-details');
  await details.locator('summary').click(); await expect(details).toHaveAttribute('open','');
  const bounds = await cards.first().boundingBox();
  expect(bounds!.height).toBeGreaterThan(300);
  await page.setViewportSize({width:390,height:900});
  await expect(grid).toHaveCSS('column-count','1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const linkCard = page.locator('.component-card').filter({has: page.locator('h2 a[href="#component/link"]')});
  await linkCard.locator('.component-preview a').first().click(); await expect(page).toHaveURL(/#components$/);
  await linkCard.locator('.component-card-docs').click(); await expect(page).toHaveURL(/#component\/link$/);
});

test('white button previews and copied markup include their required dark surface', async ({page}) => {
  await page.goto('/#component/button');
  await page.locator('[data-guide-variant]').selectOption('outline-white');
  await expect(page.locator('[data-guide-canvas]')).toHaveCSS('background-color','rgb(20, 87, 58)');
  await expect(page.locator('#guide-code-panel pre code')).toContainText('background:#14573a');
  await page.locator('[data-guide-variant]').selectOption('primary');
  await expect(page.locator('[data-guide-canvas]')).not.toHaveAttribute('data-button-surface','dark');
});
