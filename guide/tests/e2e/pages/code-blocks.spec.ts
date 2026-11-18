import { test, expect, axe, hydrated } from '../support/fixtures';
import { languagePages } from '../support/routes';

// Every pre of every prerendered page is a named, focusable group with a class
// (contentPipeline.rendering.classlessPre), and the copy button copies the listing.

for (const target of languagePages) {
  test(`code listings are named groups: ${target.route}`, async ({ page }) => {
    await page.goto(target.href);
    await hydrated(page);
    const pres = page.locator('pre');
    const count = await pres.count();
    for (let index = 0; index < count; index += 1) {
      const pre = pres.nth(index);
      await expect(pre).toHaveAttribute('class', /\S/);
      await expect(pre).toHaveAttribute('tabindex', '0');
      await expect(pre).toHaveAttribute('role', 'group');
      await expect(pre).toHaveAttribute('dir', 'ltr');
      const name = await pre.evaluate((element) => {
        const ids = (element.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean);
        return ids.map((id) => document.getElementById(id)?.textContent?.trim() ?? '').join(' ').trim();
      });
      expect(name, `name of pre ${index}`).not.toBe('');
      // A listing in an inactive tab panel is hidden, so only shown listings have a computed name.
      if (await pre.isVisible()) await expect(pre).toHaveAccessibleName(name);
    }
    if (count > 0) {
      const violations = await axe(page);
      expect(violations.filter((line) => line.startsWith('scrollable-region-focusable'))).toEqual([]);
    }
  });
}

for (const lang of ['ar', 'en'] as const) {
  test(`copy button copies the whole listing (${lang})`, async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(`${lang}/components/button/`);
    await hydrated(page);
    const figure = page.locator('guide-example-block').first().getByRole('tabpanel').locator('figure.hw-code-block');
    const button = figure.getByRole('button', { name: lang === 'ar' ? 'نسخ الشيفرة' : 'Copy code' });
    await button.click();
    await expect(figure).toContainText(lang === 'ar' ? 'تم النسخ' : 'Copied');
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    const shown = await figure.locator('pre code').innerText();
    expect(copied.trimEnd()).toBe(shown.trimEnd());
    expect(copied).toContain("import { HwButtonDirective } from '@hawiyah/angular';");
    await expect(button).toBeFocused();
  });

  test(`code listings are reachable with the keyboard (${lang})`, async ({ page }) => {
    await page.goto(`${lang}/components/button/reference/`);
    await hydrated(page);
    const pre = page.locator('guide-example-block').first().getByRole('tabpanel').locator('pre');
    await pre.focus();
    await expect(pre).toBeFocused();
    const outline = await pre.evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(outline).not.toBe('none');
  });
}
