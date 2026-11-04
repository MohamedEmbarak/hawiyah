import {expect, test} from '@playwright/test';

const projects = [
  ['vanilla','javascript','ar'], ['vanilla','typescript','en'], ['react','javascript','en'],
  ['react','typescript','ar'], ['vue','javascript','ar'], ['vue','typescript','en'], ['angular','typescript','ar'],
] as const;

for (const [framework,language,locale] of projects) {
  test(`${framework} ${language} portal projects keep local navigation, current page and keyboard focus in ${locale}`, async ({page}) => {
    test.setTimeout(300000);
    await page.addInitScript(locale => { if (window === window.top) localStorage.setItem('nasaq-locale', locale); }, locale);
    for (const id of ['secondary-nav','portal-layout','mobile-top-bar','navigation-drawer'] as const) await test.step(id, async () => {
      await page.goto(`/#component/${id}`);
      await page.locator('[data-guide-tab="playground"]').click();
      await page.locator('[data-project-framework]').selectOption(framework);
      if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
      await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
      await page.locator('[data-ide-size]').selectOption('mobile');
      const app = page.frameLocator('.nq-ide-frame').locator(`[data-portal-project="${id}"][data-project-format="${framework}-${language}"]`);
      const view = app.locator('[data-page-view]');
      await expect(view).toHaveAttribute('data-page-view','overview');
      const initialUrl = await app.evaluate(el => el.ownerDocument.URL);
      if (id === 'secondary-nav') {
        const navs = app.getByRole('navigation');
        await expect(navs).toHaveCount(2);
        const shortcuts = app.locator('nav[data-variant="mobile"]');
        await expect(shortcuts.locator('[aria-hidden="true"].nq-icon')).toHaveCount(3);
        await shortcuts.locator('a[href="#demo-page-requests"]').press('Enter');
        for (const nav of await navs.all()) {
          await expect(nav.locator('a[aria-current="page"]')).toHaveAttribute('href','#demo-page-requests');
        }
      } else if (id === 'portal-layout') {
        await expect(app.getByRole('banner')).toHaveCount(1);
        await expect(app.getByRole('main')).toHaveCount(1);
        await expect(app.getByRole('contentinfo')).toHaveCount(1);
        await expect(app.getByRole('banner').getByText(locale === 'ar' ? 'حساب زائر' : 'Guest account', {exact:true})).toBeVisible();
        const skip = app.locator('.nq-skip-link');
        await skip.focus(); await skip.press('Enter'); await expect(app.getByRole('main')).toBeFocused();
        const menu = app.locator('.nq-portal-menu-toggle');
        await menu.click(); await expect(menu).toHaveAttribute('aria-expanded','true');
        await menu.press('Escape'); await expect(menu).toHaveAttribute('aria-expanded','false'); await expect(menu).toBeFocused();
        await menu.click();
        await app.locator('header nav a[href="#demo-page-requests"]').press('Enter');
        await expect(menu).toHaveAttribute('aria-expanded','false');
        await expect(app.locator('.nq-secondary-nav a[aria-current="page"]')).toHaveAttribute('href','#demo-page-requests');
        await expect(app.locator('.nq-breadcrumb [aria-current="page"]')).toHaveText(locale === 'ar' ? 'طلباتي' : 'My requests');
      } else {
        const trigger = app.locator('[data-drawer-open]');
        if (id === 'mobile-top-bar') {
          await expect(trigger).toHaveAccessibleName(locale === 'ar' ? 'فتح قائمة التنقل' : 'Open navigation');
          await expect(app.locator('.nq-mobile-top-bar-actions a')).toBeVisible();
        }
        await trigger.press('Enter');
        const dialog = app.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('a[aria-current="page"]')).toHaveAttribute('href','#demo-page-overview');
        await expect(dialog.locator('[aria-disabled=true]')).toHaveCount(1);
        await dialog.press('Escape'); await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
        await trigger.press('Enter');
        await dialog.locator('summary').press('Enter');
        await dialog.getByRole('link', {name:locale === 'ar' ? 'طلباتي' : 'My requests'}).press('Enter');
        await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
      }
      await expect(view).toHaveAttribute('data-page-view','requests');
      if (id === 'mobile-top-bar') {
        const bar = app.locator('.nq-mobile-top-bar');
        await expect(bar).toHaveAttribute('data-variant','internal');
        await bar.locator('.nq-mobile-top-bar-actions a').press('Enter');
        await expect(view).toHaveAttribute('data-page-view','overview');
        await expect(bar).toHaveAttribute('data-variant','main');
      }
      expect(await app.evaluate(el => el.ownerDocument.URL)).toBe(initialUrl);
      await expect(page).toHaveURL(new RegExp(`#component/${id}$`));
    });
  });
}
