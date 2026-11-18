import { test, expect, hydrated, markDocument, sameDocument } from '../support/fixtures';

const ATTRIBUTION = {
  en: 'Developed by the Development Team in the National Platforms Sector — National Information Center',
  ar: 'تم التطوير بواسطة فريق التطوير في قطاع المنصات الوطنية - مركز المعلومات الوطني',
} as const;

for (const lang of ['ar', 'en'] as const) {
  const other = lang === 'ar' ? 'en' : 'ar';

  test.describe(`shell (${lang})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${lang}/components/`);
      await hydrated(page);
    });

    test('shows the attribution line with the NIC image in the header notice', async ({ page }) => {
      const notice = page.locator('header .hw-portal-notice');
      await expect(notice.locator('p.attribution')).toHaveText(ATTRIBUTION[lang]);
      const logo = notice.locator('img.nic-logo');
      await expect(logo).toHaveAttribute('alt', '');
      await expect(logo).toHaveAttribute('src', 'assets/nic-logo.webp');
      expect(await logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await logo.evaluate((img) => getComputedStyle(img).filter)).toBe('none');
    });

    test('shows the wordmark alone as the brand, named by the brand link', async ({ page }) => {
      const brand = page.locator('a.hw-portal-brand');
      await expect(brand).toHaveAttribute('href', `${lang}/`);
      await expect(brand).toHaveAccessibleName(lang === 'ar' ? 'هوية، الصفحة الرئيسية' : 'Hawiyah, home page');
      expect((await brand.innerText()).trim()).toBe('');
      const images = brand.locator('img');
      await expect(images).toHaveCount(2);
      for (const img of await images.all()) await expect(img).toHaveAttribute('alt', '');
      await expect(brand.locator('img.wordmark-light')).toBeVisible();
      await expect(brand.locator('img.wordmark-dark')).toBeHidden();
    });

    test('shows one reverse wordmark in the footer in both colour modes', async ({ page }) => {
      const images = page.locator('footer guide-wordmark img');
      await expect(images).toHaveCount(1);
      await expect(images).toHaveAttribute('src', 'brand/hawiyah-wordmark-reverse.svg');
      await expect(images).toBeVisible();
      await page.getByRole('button', { name: lang === 'ar' ? 'الوضع الداكن' : 'Dark mode' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-hw-mode', 'dark');
      await expect(images).toHaveCount(1);
      await expect(images).toBeVisible();
    });

    test('links to the same page in the other language without reloading', async ({ page }) => {
      const link = page.getByRole('link', { name: other === 'ar' ? 'العربية' : 'English', exact: true });
      await expect(link).toHaveAttribute('href', `${other}/components/`);
      await expect(link).toHaveAttribute('hreflang', other);
      await expect(link).toHaveAttribute('lang', other);
      await expect(link).toHaveAttribute('dir', other === 'ar' ? 'rtl' : 'ltr');
      await markDocument(page);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`/hawiyah/${other}/components/?$`));
      await expect(page.locator('html')).toHaveAttribute('lang', other);
      await expect(page.locator('html')).toHaveAttribute('dir', other === 'ar' ? 'rtl' : 'ltr');
      await expect(page.locator('header .hw-portal-notice p.attribution')).toHaveText(ATTRIBUTION[other]);
      expect(await sameDocument(page)).toBe(true);
      expect(await page.evaluate(() => localStorage.getItem('hawiyah-guide-lang'))).toBe(other);
    });

    test('toggles dark mode with one named button and keeps the choice', async ({ page }) => {
      const button = page.getByRole('button', { name: lang === 'ar' ? 'الوضع الداكن' : 'Dark mode' });
      await expect(button).toHaveAttribute('aria-pressed', 'false');
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('html')).toHaveAttribute('data-hw-mode', 'dark');
      expect(await page.evaluate(() => localStorage.getItem('hawiyah-guide-mode'))).toBe('dark');
      await expect(page.locator('a.hw-portal-brand img.wordmark-dark')).toBeVisible();
      await expect(page.locator('a.hw-portal-brand img.wordmark-light')).toBeHidden();
      expect(await page.locator('header img.nic-logo').evaluate((img) => getComputedStyle(img).filter)).toBe('brightness(0) invert(1)');
      await page.reload();
      await hydrated(page);
      await expect(page.locator('html')).toHaveAttribute('data-hw-mode', 'dark');
      await expect(page.getByRole('button', { name: lang === 'ar' ? 'الوضع الداكن' : 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
    });

    test('starts with a skip link to main', async ({ page }) => {
      await page.keyboard.press('Tab');
      const skip = page.locator(':focus');
      await expect(skip).toHaveText(lang === 'ar' ? 'الانتقال إلى المحتوى الرئيسي' : 'Skip to main content');
      await page.keyboard.press('Enter');
      await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('main');
    });

    test('names the header navigation and marks the current section', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: lang === 'ar' ? 'الأقسام الرئيسية' : 'Main sections' });
      const current = nav.getByRole('link', { name: lang === 'ar' ? 'المكوّنات' : 'Components' });
      await expect(current).toHaveAttribute('aria-current', 'page');
      await expect(current).toHaveAttribute('href', `${lang}/components/`);
    });

    test('has one main landmark and a footer with the guide, project and legal links', async ({ page }) => {
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.locator('main#main')).toHaveAttribute('tabindex', '-1');
      const footer = page.getByRole('contentinfo');
      await expect(footer.getByRole('group', { name: lang === 'ar' ? 'هوية' : 'Hawiyah' })).toHaveCount(1);
      await expect(footer.getByRole('navigation', { name: lang === 'ar' ? 'الدليل' : 'Guide' })).toHaveCount(1);
      await expect(footer.getByRole('navigation', { name: lang === 'ar' ? 'المشروع' : 'Project' })).toHaveCount(1);
      const legal = footer.getByRole('navigation', { name: lang === 'ar' ? 'الترخيص والإشعارات' : 'Licence and notices' });
      await expect(legal.getByRole('link')).toHaveCount(2);
      await expect(footer).toContainText(lang === 'ar' ? 'الإصدار 0.3.0.' : 'Version 0.3.0.');
      const notices = legal.getByRole('link', { name: lang === 'ar' ? 'الإشعارات وتراخيص الأطراف الثالثة' : 'Notices and third-party licences' });
      await expect(notices).toHaveAttribute('href', 'NOTICE.txt');
    });

    test('loads the notices file as a document, not a route', async ({ page }) => {
      const legal = page.getByRole('contentinfo').getByRole('link', { name: lang === 'ar' ? 'الإشعارات وتراخيص الأطراف الثالثة' : 'Notices and third-party licences' });
      await legal.click();
      await expect(page).toHaveURL(/\/hawiyah\/NOTICE\.txt$/);
      await expect(page.locator('body')).toContainText('Licence files distributed with this guide');
    });
  });
}

test.describe('header menu at 390 px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const lang of ['ar', 'en'] as const) {
    test(`opens, closes with Escape and returns focus (${lang})`, async ({ page }) => {
      await page.goto(`${lang}/components/`);
      await hydrated(page);
      const toggle = page.getByRole('button', { name: lang === 'ar' ? 'القائمة' : 'Menu' });
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).toHaveAttribute('aria-controls', 'site-navigation');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const link = page.locator('#site-navigation').getByRole('link', { name: lang === 'ar' ? 'المكوّنات' : 'Components' });
      await expect(link).toBeVisible();
      await link.focus();
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).toBeFocused();
      await expect(page.getByRole('link', { name: lang === 'ar' ? 'English' : 'العربية', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: lang === 'ar' ? 'الوضع الداكن' : 'Dark mode' })).toBeVisible();
    });

    test(`closes after a client navigation (${lang})`, async ({ page }) => {
      await page.goto(`${lang}/components/`);
      await hydrated(page);
      const toggle = page.getByRole('button', { name: lang === 'ar' ? 'القائمة' : 'Menu' });
      await toggle.click();
      await page.locator('#site-navigation').getByRole('link', { name: lang === 'ar' ? 'المكوّنات' : 'Components' }).click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  }
});
