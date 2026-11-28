import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['ar', 'en']) {
  test(`navigation drawer preserves native disclosure and modal behavior (${locale})`, async ({ page }, testInfo) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 320, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(locale => localStorage.setItem('hawiyah-locale', locale), locale);
    await page.goto('/#component/navigation-drawer');
    const trigger = page.locator('.guide-preview [data-hw-dialog-open]');
    const dialog = page.locator('.guide-preview dialog');
    for (const theme of ['dga', 'hawiyah', 'custom']) for (const mode of ['light', 'dark']) {
      await dialog.evaluate((node, [theme, mode]) => { (node as HTMLElement).dataset.hwTheme = theme; (node as HTMLElement).dataset.hwMode = mode; }, [theme, mode]);
      await trigger.click();
      expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(true);
      const bounds = await dialog.boundingBox(); expect(bounds!.width).toBeLessThanOrEqual(304); expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
      expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      const current = dialog.locator('[aria-current="page"]');
      expect((await current.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(await current.evaluate(node => getComputedStyle(node, '::before').width)).toBe('6px');
      await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
    }
    await trigger.click();
    const summary = dialog.locator('summary'); await summary.focus(); await summary.press('Enter');
    await expect(dialog.locator('details')).toHaveAttribute('open');
    await page.keyboard.press('Tab'); await expect(dialog.locator('details a').first()).toBeFocused();
    await expect(dialog.locator('[aria-disabled="true"]')).not.toHaveAttribute('href');
    expect((await new AxeBuilder({ page }).include('.guide-preview dialog').analyze()).violations).toEqual([]);
    await page.emulateMedia({ forcedColors: 'active' }); await summary.focus(); await expect(summary).toHaveCSS('outline-style', 'solid');
    await page.emulateMedia({ forcedColors: 'none' });
    await page.screenshot({ path: testInfo.outputPath(`navigation-drawer-${locale}.png`) });
    const current = dialog.locator('a[aria-current="page"]');
    await expect(current).toHaveAttribute('href', '#components');
    const action = (await current.getAttribute('aria-label')) || (await current.innerText()).trim();
    await current.click();
    await expect(page).toHaveURL(/#component\/navigation-drawer$/);
    await expect(page.locator('[data-demo-result]')).toHaveText((locale === 'ar' ? 'معاينة الإجراء: ' : 'Preview action: ') + action);
  });
}

// A user click runs microtasks as soon as one listener returns, before listeners on ancestors, so the drawer
// must decide after the dispatch has finished. element.click() in a unit test cannot show the difference.
test('a user click that an ancestor listener prevents leaves the drawer open; an unprevented one closes it', async ({ page }) => {
  const { openFixture } = await import('./style-fixture');
  const { fileURLToPath } = await import('node:url');
  const vanilla = '/@fs/' + fileURLToPath(new URL('../../packages/vanilla/dist/index.js', import.meta.url)).replaceAll('\\', '/');
  await openFixture(page, `<button type="button" id="open">Menu</button>
<dialog id="drawer" aria-labelledby="drawer-title"><div class="hw-dialog-header"><h2 id="drawer-title">Menu</h2><button type="button" data-hw-dialog-close aria-label="Close"></button></div>
<nav class="hw-navigation-drawer-nav" aria-label="Main"><ul><li><a class="hw-navigation-drawer-row" href="#target"><span class="hw-navigation-drawer-label">Target</span></a></li></ul></nav></dialog>
<p id="target" tabindex="-1">Target</p>`, { name: 'navigation-drawer-click' });
  await page.evaluate(async url => {
    const { createNavigationDrawer } = await import(/* @vite-ignore */ url);
    const controller = createNavigationDrawer(document.querySelector('#drawer'), { navigationLabel: 'Main' });
    document.querySelector('#open')!.addEventListener('click', event => controller.show(event.currentTarget as HTMLElement));
    const prevent = (event: Event) => { if ((event.target as Element).closest('#drawer a')) event.preventDefault(); };
    document.addEventListener('click', prevent);
    (window as unknown as { allow: () => void }).allow = () => document.removeEventListener('click', prevent);
  }, vanilla);
  const dialog = page.locator('#drawer'), link = dialog.locator('a');
  const open = () => dialog.evaluate(node => (node as HTMLDialogElement).open);
  await page.locator('#open').click(); expect(await open()).toBe(true);
  await link.click(); await page.waitForTimeout(150);
  expect(await open(), 'prevented by a document listener').toBe(true);
  expect(page.url()).not.toContain('#target');
  await page.evaluate(() => (window as unknown as { allow: () => void }).allow());
  await link.click();
  await expect.poll(open).toBe(false);
  await expect(page.locator('#open')).toBeFocused();
});
