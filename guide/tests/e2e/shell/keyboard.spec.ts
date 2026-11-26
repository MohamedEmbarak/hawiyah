import type { Locator, Page } from '@playwright/test';
import { test, expect, hydrated } from '../support/fixtures';

async function focusVisible(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
    return outline || style.boxShadow !== 'none';
  });
}

async function tabTo(page: Page): Promise<Locator> {
  await page.keyboard.press('Tab');
  return page.locator(':focus');
}

for (const lang of ['ar', 'en'] as const) {
  test(`shell tab order with visible focus (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${lang}/components/`);
    await hydrated(page);
    const expected: { name: string | RegExp; role: string }[] = [
      { role: 'link', name: lang === 'ar' ? 'الانتقال إلى المحتوى الرئيسي' : 'Skip to main content' },
      { role: 'link', name: lang === 'ar' ? 'هوية، الصفحة الرئيسية' : 'Hawiyah, home page' },
      { role: 'link', name: lang === 'ar' ? 'المكوّنات' : 'Components' },
      { role: 'link', name: lang === 'ar' ? 'الأدلة' : 'Guides' },
      { role: 'link', name: lang === 'ar' ? 'القوالب' : 'Templates' },
      { role: 'link', name: lang === 'ar' ? 'المحرر' : 'Editor' },
      { role: 'link', name: lang === 'ar' ? 'English' : 'العربية' },
      { role: 'button', name: lang === 'ar' ? 'الوضع الداكن' : 'Dark mode' },
    ];
    for (const step of expected) {
      const focused = await tabTo(page);
      const role = await focused.evaluate((el) => (el.tagName === 'A' ? 'link' : el.tagName === 'BUTTON' ? 'button' : el.tagName));
      expect(role).toBe(step.role);
      await expect(focused).toHaveAccessibleName(step.name);
      expect(await focusVisible(focused), `focus indicator of ${String(step.name)}`).toBe(true);
    }
  });

  test(`route change moves focus into main (${lang})`, async ({ page }) => {
    await page.goto(`${lang}/components/`);
    await hydrated(page);
    const other = page.getByRole('link', { name: lang === 'ar' ? 'English' : 'العربية', exact: true });
    await other.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('lang', lang === 'ar' ? 'en' : 'ar');
    await expect
      .poll(() => page.evaluate(() => Boolean(document.activeElement && document.getElementById('main')?.contains(document.activeElement))))
      .toBe(true);
  });
}
