import { test, expect } from '../support/fixtures';
import { pageModel } from '../support/routes';

// With JavaScript disabled, the prerendered component pages carry their content, the
// native Angular example and the listings: nothing on these pages is rendered in the
// browser only.

test.use({ javaScriptEnabled: false });

const TEXT = {
  en: { title: 'Button', label: 'Continue', result: 'Result', status: 'Rendered with @hawiyah/angular 0.3.0 from npm', variants: 'Save draft' },
  ar: { title: 'زر', label: 'متابعة', result: 'النتيجة', status: 'معروض باستخدام @hawiyah/angular 0.3.0 من npm', variants: 'حفظ المسودة' },
} as const;

for (const lang of ['ar', 'en'] as const) {
  const t = TEXT[lang];

  test(`brief view without JavaScript (${lang})`, async ({ page }) => {
    const response = await page.goto(`${lang}/components/button/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.title);
    const result = page.getByRole('group', { name: t.result });
    // The generated native Angular example (guide-example-button-primary) is in the HTML.
    const example = result.locator('guide-example-button-primary button.hw-button');
    await expect(example).toHaveText(t.label);
    await expect(example).toHaveAttribute('data-variant', 'primary');
    await expect(example).toHaveAttribute('type', 'button');
    await expect(page.locator('guide-example-block p.status')).toHaveText(t.status);
    await expect(page.locator('guide-example-block pre code', { hasText: 'hwButton' })).toHaveCount(1);
    await expect(page.locator('guide-example-block [role="tabpanel"]:visible pre code')).toContainText('hwButton');
    await expect(page.locator('guide-example-block [role="tab"]')).toHaveCount(4);
  });

  test(`reference view without JavaScript (${lang})`, async ({ page }) => {
    const model = pageModel('button', lang);
    await page.goto(`${lang}/components/button/reference/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.title);
    await expect(page.locator('main article > h2')).toHaveCount(model.headings.filter((heading) => heading.level === 2).length);
    await expect(page.getByRole('group', { name: t.result })).toHaveCount(model.liveGroups.length);
    await expect(page.getByRole('group', { name: t.result }).nth(model.liveGroups.indexOf('variants')).getByRole('button', { name: t.variants })).toBeVisible();
    await expect(page.locator('main table')).toHaveCount(model.tables.length);
    await expect(page.locator('main table caption').first()).not.toBeEmpty();
    await expect(page.locator('hw-content-navigation a').first()).toHaveAttribute('href', /#example$/);
    await expect(page.locator('main pre')).not.toHaveCount(0);
  });
}

// Without script the controls that need it are not shown, and the side navigation
// is in the flow at every width (the drawer cannot open).
for (const lang of ['ar', 'en'] as const) {
  test(`at 390 px without script: side navigation in the flow, no control that needs script (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${lang}/components/button/reference/`);
    const sideNav = lang === 'ar' ? 'صفحات المكوّنات' : 'Component pages';
    await expect(page.locator('hw-side-navigation')).toBeVisible();
    await expect(page.locator('hw-side-navigation').getByRole('link', { name: TEXT[lang].title, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: sideNav })).toBeHidden();
    await expect(page.getByRole('button', { name: lang === 'ar' ? 'الوضع الداكن' : 'Dark mode' })).toBeHidden();
    await expect(page.locator('guide-code-block hw-copy-button').first()).toBeHidden();
    expect(await page.locator('guide-code-block hw-copy-button button').evaluateAll((buttons) => buttons.filter((b) => (b as HTMLElement).offsetParent !== null).length)).toBe(0);
  });

  test(`the landing without script shows no chooser that needs script (${lang})`, async ({ page }) => {
    await page.goto(`${lang}/`);
    await expect(page.locator('guide-landing-duo .controls')).toBeHidden();
    await expect(page.locator('#install .choosers')).toBeHidden();
    await expect(page.locator('guide-landing-lead .all')).toBeVisible();
  });
}

// Without script the editor cannot edit or run code: one sentence in the page
// language says so, and no guide control of the editor is shown (decision E-E).
const NO_SCRIPT = {
  en: 'The editor needs JavaScript to edit and run code; the component pages show every example without it.',
  ar: 'يحتاج المحرر إلى JavaScript لتحرير الشيفرة وتشغيلها، وتعرض صفحات المكوّنات كل مثال من دونه.',
} as const;

for (const lang of ['ar', 'en'] as const) {
  for (const width of [1280, 390]) {
    test(`editor without script at ${width} px: one sentence and no editor control (${lang})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      // An address that names another example than the default one.
      await page.goto(`${lang}/editor/?example=tabs/basic&framework=react`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang === 'ar' ? 'المحرر' : 'Editor');
      await expect(page.locator('main .no-script')).toHaveText(NO_SCRIPT[lang]);
      await expect(page.locator('main .no-script')).toBeVisible();
      // One prerendered page answers every address: it names no example.
      const header = page.locator('main hw-page-header');
      await expect(header.locator('p')).toHaveText(lang === 'ar' ? 'حرّر مثالًا من أمثلة صفحات المكوّنات وشغّله.' : 'Edit an example of the component pages and run it.');
      await expect(header.getByRole('link')).toHaveText(lang === 'ar' ? 'صفحات المكوّنات' : 'Component pages');
      await expect(header.getByRole('link')).toHaveAttribute('href', `${lang}/components/`);
      for (const selector of ['guide-editor-toolbar', 'guide-editor-status', 'main .workspace']) await expect(page.locator(selector)).toBeHidden();
      const controls = await page.locator('main').evaluate((main) =>
        Array.from(main.querySelectorAll('button, input, select, textarea, [role="tab"], [role="radio"], [contenteditable="true"], iframe'))
          .filter((element) => (element as HTMLElement).offsetParent !== null || element.getClientRects().length > 0)
          .map((element) => element.outerHTML.slice(0, 80)),
      );
      expect(controls).toEqual([]);
    });
  }
}
