import type { Page } from '@playwright/test';
import { test, expect, hydrated, markDocument, sameDocument } from '../support/fixtures';
import { available } from '../support/routes';

// Fragment links after hydration (shell: GuideViewportScroller, anchorScrolling
// 'enabled'). The router writes addresses without the trailing slash, so an in-page
// link '<page>/#id' reaches the router; it must scroll to the target and move focus
// to it without a document reload, in both languages, smoothly only without a
// reduced-motion preference.

/** Records the behavior argument of every scrollIntoView call in the document. */
async function recordScrolls(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { __scrolls: string[] }).__scrolls = calls;
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (this: Element, options?: boolean | ScrollIntoViewOptions) {
      calls.push(typeof options === 'object' ? String(options.behavior) : String(options));
      return original.call(this, options);
    };
  });
}

const scrolls = (page: Page): Promise<string[]> => page.evaluate(() => (window as unknown as { __scrolls: string[] }).__scrolls);

for (const lang of ['en', 'ar'] as const) {
  test(`${lang}: an in-page fragment link of the landing scrolls to and focuses its target without a reload`, async ({ page }) => {
    test.skip(!available.landing, 'the landing feature is not built');
    await recordScrolls(page);
    await page.goto(`${lang}/`);
    await hydrated(page);
    await markDocument(page);
    const link = page.locator('guide-landing-lead a[href$="#install"]');
    await expect(link).toHaveAttribute('href', `${lang}/#install`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/hawiyah/${lang}/?#install$`));
    await expect(page.locator('#install')).toBeInViewport();
    await expect(page.locator('#install-title')).toBeFocused();
    expect(await sameDocument(page)).toBe(true);
    expect(await scrolls(page)).toContain('instant');
    expect(await scrolls(page)).not.toContain('smooth');
  });

  test(`${lang}: a fragment link on a component page scrolls to and focuses its heading`, async ({ page }) => {
    const id = available.components[0];
    test.skip(!id, 'no component page is built');
    const path = `${lang}/components/${id}/reference/`;
    await page.goto(path);
    await hydrated(page);
    await markDocument(page);
    const target = page.locator('main article.hw-prose > h2[id]').last();
    const fragment = await target.getAttribute('id');
    // A link as the content renderer writes it: the page path plus '#id'.
    await page.evaluate(
      ({ href }) => {
        const link = document.createElement('a');
        link.href = href;
        link.id = 'fragment-probe';
        link.textContent = 'probe';
        document.querySelector('main h1')?.after(link);
      },
      { href: `${path}#${fragment}` },
    );
    await page.locator('#fragment-probe').click();
    await expect(page).toHaveURL(new RegExp(`#${fragment}$`));
    await expect(target).toBeInViewport();
    await expect(target).toBeFocused();
    expect(await sameDocument(page)).toBe(true);
  });
}

test('without a reduced-motion preference the scroll is smooth', async ({ page }) => {
  test.skip(!available.landing, 'the landing feature is not built');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordScrolls(page);
  await page.goto('en/');
  await hydrated(page);
  await page.locator('guide-landing-lead a[href$="#install"]').click();
  await expect(page.locator('#install-title')).toBeFocused();
  await expect(page.locator('#install')).toBeInViewport();
  expect(await scrolls(page)).toContain('smooth');
});

// "On this page" of a reference page writes the section into the address
// (hw-content-navigation updateHash: history.replaceState with the path under the
// base and the fragment). The router does not see a replaceState, so focus stays on
// the section and does not move to the page heading; Back leaves the page as before
// (no extra history entry), Forward restores the address, and a reload on the fragment
// address shows the section.
for (const lang of ['en', 'ar'] as const) {
  test(`${lang}: On this page writes the section into the address under the base path`, async ({ page }) => {
    const id = available.components[0];
    test.skip(!id, 'no component page is built');
    await page.goto(`${lang}/components/${id}/`);
    await hydrated(page);
    await markDocument(page);
    await page.locator('main').getByRole('link', { name: lang === 'ar' ? 'المرجع الكامل' : 'Full reference' }).click();
    await expect(page).toHaveURL(new RegExp(`/hawiyah/${lang}/components/${id}/reference/?$`));
    await expect(page.locator('main h1')).toBeFocused();
    const entry = page.locator('hw-content-navigation a.hw-content-nav-link[href$="#api"]');
    await expect(entry).toHaveCount(1);
    await entry.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`^http://[^/]+/hawiyah/${lang}/components/${id}/reference/?#api$`));
    const section = page.locator('main h2#api');
    await expect(section).toBeFocused();
    await expect(section).toBeInViewport();
    // No router navigation: the same document, the heading of the page not focused.
    expect(await sameDocument(page)).toBe(true);
    await page.waitForTimeout(300);
    await expect(section).toBeFocused();
    expect(await page.evaluate(() => history.length)).toBeGreaterThan(1);

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`/hawiyah/${lang}/components/${id}/?$`));
    await expect(page.locator('main h1')).toBeVisible();
    // Forward restores the address with the section (the router's popstate scroll
    // restoration, 'top', decides the position there).
    await page.goForward();
    await expect(page).toHaveURL(new RegExp(`/hawiyah/${lang}/components/${id}/reference/?#api$`));
    await expect(page.locator('main h1')).toBeVisible();

    await page.reload();
    await hydrated(page);
    await expect(page).toHaveURL(new RegExp(`/hawiyah/${lang}/components/${id}/reference/?#api$`));
    await expect(page.locator('main h2#api')).toBeInViewport();
  });
}
