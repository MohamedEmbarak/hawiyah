import { test } from '@playwright/test';
import { checkMobileSwitches } from '../helpers/mobile-switch';

for (const direction of ['rtl', 'ltr'] as const) {
  test(`vanilla mobile switch preserves density geometry, theme boundaries and interaction in ${direction}`, async ({ page }) => {
    await page.goto('/#foundations');
    await page.evaluate(() => {
      for (const style of document.querySelectorAll('style[data-vite-dev-id]')) {
        if (style.getAttribute('data-vite-dev-id')?.replaceAll('\\', '/').includes('/apps/playground/')) style.remove();
      }
    });
    await page.locator('#main').evaluate((main, dir) => {
      main.innerHTML = `<section id="switch-sizing" dir="${dir}" data-hw-density="mobile" data-hw-theme="dga">
        <label><input type="checkbox" role="switch" class="hw-switch" name="mobile-switch">Mobile</label>
        <label><input type="checkbox" role="switch" class="hw-switch" name="mobile-switch-disabled" disabled>Disabled</label>
        <div data-hw-density="comfortable"><label><input type="checkbox" role="switch" class="hw-switch" name="desktop-switch">Comfortable</label></div>
        <div data-hw-density="compact"><label><input type="checkbox" role="switch" class="hw-switch" name="compact-switch">Compact</label></div>
      </section>`;
    }, direction);
    await checkMobileSwitches(page, page.locator('#switch-sizing'), direction, ['dga', 'hawiyah', 'custom']);
  });
}
