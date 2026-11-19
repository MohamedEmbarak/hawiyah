import type { Locator } from '@playwright/test';
import { test, expect, hydrated, keepRootDocument, markDocument, presetMode, sameDocument } from '../support/fixtures';

/**
 * What an identity container paints: its visible images, the width of the box that
 * holds the artwork (the container itself, or the wordmark host inside it) against
 * the visible image, visible text outside .hw-sr-only, and generated content
 * (::before, ::after) on the container and everything in it.
 */
async function painted(container: Locator, box: 'container' | 'wordmark'): Promise<{ images: number; boxWidth: number; imageWidth: number; text: string; generated: string[] }> {
  return container.evaluate((element, which) => {
    const visible = Array.from(element.querySelectorAll('img')).filter((img) => {
      const rect = img.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && getComputedStyle(img).visibility !== 'hidden';
    });
    const holder = which === 'container' ? element : element.querySelector('guide-wordmark');
    const text: string[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.parentElement?.closest('.hw-sr-only')) text.push(node.textContent ?? '');
    }
    const generated = [element, ...Array.from(element.querySelectorAll('*'))].flatMap((node) =>
      ['::before', '::after']
        .map((pseudo) => [pseudo, getComputedStyle(node, pseudo).content] as const)
        .filter(([, content]) => content !== 'none' && content !== 'normal')
        .map(([pseudo, content]) => `${node.localName}${pseudo} ${content}`),
    );
    return {
      images: visible.length,
      boxWidth: Math.round(holder?.getBoundingClientRect().width ?? -1),
      imageWidth: Math.round(visible[0]?.getBoundingClientRect().width ?? 0),
      text: text.join('').trim(),
      generated,
    };
  }, box);
}

function expectArtworkAlone(facts: Awaited<ReturnType<typeof painted>>): void {
  expect(facts.images, 'one visible image').toBe(1);
  expect(facts.imageWidth).toBeGreaterThan(0);
  expect(facts.boxWidth, 'the box holding the artwork is as wide as its one visible image').toBe(facts.imageWidth);
  expect(facts.text, 'no visible text').toBe('');
  expect(facts.generated, 'no generated content').toEqual([]);
}

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
      expectArtworkAlone(await painted(brand, 'container'));
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
      const guide = footer.getByRole('navigation', { name: lang === 'ar' ? 'الدليل' : 'Guide' });
      await expect(guide).toHaveCount(1);
      // The Guide column links to every section of the header, the editor included.
      await expect(guide.getByRole('link', { name: lang === 'ar' ? 'المكوّنات' : 'Components' })).toHaveAttribute('href', `${lang}/components/`);
      await expect(guide.getByRole('link', { name: lang === 'ar' ? 'المحرر' : 'Editor' })).toHaveAttribute('href', `${lang}/editor/`);
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

// The identity constraint: the artwork alone, no Hawiyah text beside it.
for (const lang of ['ar', 'en'] as const) {
  for (const mode of ['light', 'dark'] as const) {
    test(`the footer brand is the artwork alone: one image and no text (${lang}, ${mode})`, async ({ page }) => {
      await presetMode(page, mode);
      await page.goto(`${lang}/components/`);
      await hydrated(page);
      await expect(page.locator('html')).toHaveAttribute('data-hw-mode', mode);
      const marks = page.locator('footer .hw-portal-footer-brand-marks');
      await expect(marks).toHaveCount(1);
      await expect(marks).toHaveAttribute('aria-label', lang === 'ar' ? 'هوية' : 'Hawiyah');
      expect((await marks.evaluate((element) => element.textContent ?? '')).trim()).toBe('');
      await expect(marks.locator('img')).toHaveCount(1);
      await expect(marks.locator('img')).toBeVisible();
      await expect(marks.locator('img')).toHaveAttribute('alt', '');
      // The group itself is a block of the package footer layout; the artwork is its
      // only child, so the wordmark host is measured.
      expect(await marks.evaluate((element) => Array.from(element.childNodes).filter((node) => node.nodeType === 1 || (node.textContent ?? '').trim() !== '').map((node) => node.nodeName.toLowerCase()))).toEqual(['guide-wordmark']);
      expectArtworkAlone(await painted(marks, 'wordmark'));
    });

    test(`the header brand is the artwork alone in the painted page (${lang}, ${mode})`, async ({ page }) => {
      await presetMode(page, mode);
      await page.goto(`${lang}/components/`);
      await hydrated(page);
      await expect(page.locator('html')).toHaveAttribute('data-hw-mode', mode);
      expectArtworkAlone(await painted(page.locator('a.hw-portal-brand'), 'container'));
    });
  }
}

for (const mode of ['light', 'dark'] as const) {
  test(`the root document heading is the artwork alone, with the English name visually hidden (${mode})`, async ({ page }) => {
    await presetMode(page, mode);
    await keepRootDocument(page);
    await page.goto('');
    await hydrated(page);
    const heading = page.locator('h1');
    await expect(heading).toHaveCount(1);
    const texts = await heading.evaluate((h1) => ({
      all: (h1.textContent ?? '').trim(),
      hidden: Array.from(h1.querySelectorAll('.hw-sr-only'), (node) => node.textContent ?? '').join('').trim(),
      visibleImages: Array.from(h1.querySelectorAll('img')).filter((img) => img.getBoundingClientRect().width > 0).length,
    }));
    expect(texts).toEqual({ all: 'Hawiyah', hidden: 'Hawiyah', visibleImages: 1 });
    await expect(heading).toHaveAccessibleName(/هوية/);
    expectArtworkAlone(await painted(heading, 'wordmark'));
  });

  test(`the not-found document shows the artwork alone above its heading (${mode})`, async ({ page, guard }) => {
    await presetMode(page, mode);
    guard.allowDocument404(/\/hawiyah\/en\/no-such-page\/$/);
    await page.goto('en/no-such-page/');
    await hydrated(page);
    const wordmark = page.locator('.not-found > guide-wordmark');
    await expect(wordmark).toHaveCount(1);
    expectArtworkAlone(await painted(wordmark, 'container'));
  });
}

// Forced colours: the surfaces take the system colours, so the artwork follows the
// system colour scheme, not the stored mode; the NIC logo filter follows it too.
for (const [scheme, stored] of [
  ['light', 'dark'],
  ['dark', 'light'],
] as const) {
  test(`forced colours with a ${scheme} system scheme and a stored ${stored} mode`, async ({ page }) => {
    await presetMode(page, stored);
    await page.emulateMedia({ forcedColors: 'active', colorScheme: scheme });
    await page.goto('en/components/');
    await hydrated(page);
    await expect(page.locator('html')).toHaveAttribute('data-hw-mode', stored);
    const brand = page.locator('a.hw-portal-brand');
    await expect(brand.locator(scheme === 'light' ? 'img.wordmark-light' : 'img.wordmark-dark')).toBeVisible();
    await expect(brand.locator(scheme === 'light' ? 'img.wordmark-dark' : 'img.wordmark-light')).toBeHidden();
    const footer = page.locator('footer .hw-portal-footer-brand-marks img');
    await expect(footer).toHaveCount(1);
    await expect.poll(() => footer.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(scheme === 'light' ? /\/brand\/hawiyah-wordmark\.svg$/ : /\/brand\/hawiyah-wordmark-reverse\.svg$/);
    expect(await page.locator('header img.nic-logo').evaluate((img) => getComputedStyle(img).filter)).toBe(scheme === 'light' ? 'none' : 'brightness(0) invert(1)');
  });
}

for (const lang of ['ar', 'en'] as const) {
  test(`the header marks its section current on the pages below it (${lang})`, async ({ page }) => {
    await page.goto(`${lang}/components/button/reference/`);
    await hydrated(page);
    const nav = page.getByRole('navigation', { name: lang === 'ar' ? 'الأقسام الرئيسية' : 'Main sections' });
    await expect(nav.getByRole('link', { name: lang === 'ar' ? 'المكوّنات' : 'Components' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: lang === 'ar' ? 'المحرر' : 'Editor' })).not.toHaveAttribute('aria-current', 'page');
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
