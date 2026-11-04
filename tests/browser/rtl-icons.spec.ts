import { expect, test, type Locator } from '@playwright/test';

const mirrored = 'matrix(-1, 0, 0, 1, 0, 0)';
const transform = (icon: Locator) => icon.evaluate(node => getComputedStyle(node).transform);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nasaq-locale', 'ar'));
});

test('home navigation arrows follow the nearest direction without mirroring other symbols', async ({ page }) => {
  await page.goto('/#overview');
  const start = page.locator('.home-actions [data-icon="arrow"]');
  await expect(start).toBeVisible();
  const arrows = page.locator('main [data-icon="arrow"]');
  expect(await arrows.count()).toBeGreaterThan(8);
  for (const arrow of await arrows.all()) expect(await transform(arrow)).toBe(mirrored);
  for (const symbol of await page.locator('main .pg-icon:not(.pg-icon-directional)').all()) {
    expect(await transform(symbol)).toBe('none');
  }
  const external = page.locator('.topbar-github span');
  await expect(external).toHaveText('↗');
  expect(await transform(external)).toBe('none');

  // A local LTR region must override the surrounding Arabic page.
  await page.locator('.home-actions').evaluate(node => node.setAttribute('dir', 'ltr'));
  expect(await transform(start)).toBe('none');
  await page.locator('[data-action="locale"]').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  expect(await transform(start)).toBe('none');
  // The reverse nesting must work as well, without a second ancestor flip.
  await page.locator('.home-actions').evaluate(node => node.setAttribute('dir', 'rtl'));
  expect(await transform(start)).toBe(mirrored);
  await start.evaluate(node => node.parentElement!.setAttribute('dir', 'ltr'));
  expect(await transform(start)).toBe('none');
});

test('guide back and forward arrows reverse once while action and external symbols stay fixed', async ({ page }) => {
  await page.goto('/#component/button');
  const back = page.locator('.guide-back [data-icon="arrow-back"]');
  const forward = page.locator('.guide-pagination [data-icon="arrow"]');
  await expect(back).toBeVisible();
  expect(await transform(back)).toBe(mirrored);
  expect(await transform(forward)).toBe(mirrored);
  expect(await transform(page.locator('[data-guide-launch-editor] [data-icon="spark"]'))).toBe('none');
  const source = page.locator('.guide-title-actions a[target="_blank"]');
  await expect(source).toContainText('↗');
  expect(await transform(source)).toBe('none');
  await page.locator('[data-action="locale"]').click();
  expect(await transform(back)).toBe('none');
  expect(await transform(forward)).toBe('none');
});

test('carousel arrows and navigation respect the live preview direction switch', async ({ page }) => {
  await page.goto('/#component/carousel');
  const canvas = page.locator('[data-guide-canvas]');
  const previous = canvas.locator('[data-nq-previous]');
  const next = canvas.locator('[data-nq-next]');
  const arrow = (button: Locator) => button.evaluate(node => getComputedStyle(node, '::before').content);
  const activeSlide = canvas.locator('[data-nq-slide]:not([inert])');
  await expect(previous).toBeVisible();
  const firstSlide = await activeSlide.textContent();
  expect(await arrow(previous)).toBe('"→"');
  expect(await arrow(next)).toBe('"←"');
  await next.click();
  await expect(activeSlide).not.toHaveText(firstSlide!);
  await previous.click();
  await expect(activeSlide).toHaveText(firstSlide!);

  await page.locator('[data-guide-direction="ltr"]').click();
  await expect(canvas).toHaveAttribute('dir', 'ltr');
  expect(await arrow(previous)).toBe('"←"');
  expect(await arrow(next)).toBe('"→"');
  // The Arabic guide outside this LTR demo keeps its own navigation direction.
  expect(await transform(page.locator('.guide-back [data-icon="arrow-back"]'))).toBe(mirrored);
  await next.click();
  await expect(activeSlide).not.toHaveText(firstSlide!);
  await page.locator('[data-guide-direction="rtl"]').click();
  expect(await arrow(next)).toBe('"←"');
});
