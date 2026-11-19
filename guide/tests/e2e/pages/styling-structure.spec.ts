import type { Page } from '@playwright/test';
import { test, expect, hydrated, keepRootDocument } from '../support/fixtures';
import { documents } from '../support/routes';
import { ANCESTOR_EFFECTS, INHERITED_ALLOWED, INHERITED_PROPERTIES, PLACEMENT, stylingRule } from '../support/styling-rule';

// The structural half of the styling rule (README.md, "The styling rule"): every rule
// of every guide stylesheet, style element and adopted sheet, under every media,
// supports, container and layer condition, with state pseudo-classes and
// pseudo-elements stripped from its selector, is matched against the page. A rule
// that matches a package element may declare only placement properties; a rule that
// matches an ancestor of a package element may declare an inherited property, a
// package custom property or a property that changes how descendants paint
// (ANCESTOR_EFFECTS) only when INHERITED_ALLOWED lists stylesheet, selector and
// property.
// A selector the stripper cannot handle fails.

const input = {
  mode: 'structure' as const,
  placement: PLACEMENT.map((entry) => entry.properties.source),
  inherited: INHERITED_PROPERTIES,
  effects: ANCESTOR_EFFECTS,
  inheritedAllowed: INHERITED_ALLOWED.map(({ sheet, selector, property }) => ({ sheet, selector, property })),
};

async function structure(page: Page, label: string): Promise<void> {
  const outcome = await page.evaluate(stylingRule, input);
  expect(outcome.sheets, `${label}: guide stylesheets read`).toBeGreaterThan(0);
  expect(outcome.packageElements, `${label}: package elements`).toBeGreaterThan(0);
  expect(outcome.violations, label).toEqual([]);
  test.info().annotations.push({ type: 'structure', description: `${label}: ${outcome.rules} rules in ${outcome.sheets} sheets, ${outcome.matches} reach package elements, ${outcome.packageElements} package elements` });
}

test('the stripper removes states and pseudo-elements, keeps structure, and refuses what it cannot handle', async ({ page }) => {
  await page.goto('en/components/');
  await hydrated(page);
  const cases: [string, string][] = [
    ['a:hover', 'a:is(*)'],
    ['.x:focus-visible > span::before', '.x:is(*) > span:is(*)'],
    ['button:focus:not(:focus-visible)', 'button:is(*):is(*)'],
    ['li:not(.y):checked', 'li:not(.y):is(*)'],
    [':is(.a:hover, .b) .c::after:hover', ':is(.a:is(*), .b) .c:is(*):is(*)'],
    [':where(.a) :has(> input:checked)', ':where(.a) :has(> input:is(*))'],
    ['.a:before, .b:first-line', '.a:is(*), .b:is(*)'],
    ['td code::marker', 'td code:is(*)'],
    ['details:open > summary', 'details:is(*) > summary'],
    ['div[_ngcontent-hwg-c1] p:nth-child(2n+1)', 'div[_ngcontent-hwg-c1] p:nth-child(2n+1)'],
    [':root[data-hw-mode="dark"] .z', ':root:is(*) .z'],
    ['a[title="a, b:hover"]:target', 'a[title="a, b:hover"]:is(*)'],
    ['p:lang(ar):dir(rtl)', 'p:lang(ar):dir(rtl)'],
    [':host .a', 'ERROR :host cannot be stripped'],
    ['::slotted(p)', 'ERROR ::slotted() cannot be stripped'],
    ['li:nth-child(2 of .a:hover)', 'ERROR :nth-child(... of S) cannot be stripped'],
  ];
  const outcome = await page.evaluate(stylingRule, { mode: 'strip' as const, selectors: cases.map(([selector]) => selector) });
  expect(outcome.stripped).toEqual(cases.map(([, expected]) => expected));
});

test('the placement list and the inherited list are written out with reasons', () => {
  for (const entry of PLACEMENT) expect(entry.reason.length, entry.properties.source).toBeGreaterThan(20);
  for (const entry of INHERITED_ALLOWED) {
    expect(entry.reason.length, `${entry.selector} ${entry.property}`).toBeGreaterThan(20);
    expect(INHERITED_PROPERTIES.includes(entry.property) || ANCESTOR_EFFECTS.includes(entry.property) || entry.property.startsWith('--hw-'), entry.property).toBe(true);
  }
});

const pages = documents.filter((doc) => doc.kind === 'page');

for (const doc of pages) {
  const label = doc.route === '' ? 'root document' : doc.route === '404' ? '404 document' : doc.route;
  test(`guide rules reach package elements only to place them: ${label}`, async ({ page, guard }) => {
    if (doc.route === '') {
      await keepRootDocument(page);
      await page.goto('');
    } else if (doc.route === '404') {
      guard.allowDocument404(/\/hawiyah\/en\/no-such-page\/$/);
      await page.goto('en/no-such-page/');
    } else {
      await page.goto(`${doc.route}/`);
    }
    await hydrated(page);
    if (doc.route.endsWith('/editor')) {
      // The editor after its first run: status line, log and result frame filled.
      await expect(page.locator('guide-editor-status p.state')).toHaveText(/^(The original example ran in \d+ ms\.|شُغِّل المثال الأصلي في \d+ ملّي ثانية\.)$/, { timeout: 20_000 });
    }
    await structure(page, `${label} at 1280 px`);
    await page.setViewportSize({ width: 390, height: 844 });
    await structure(page, `${label} at 390 px`);
  });
}

for (const lang of ['ar', 'en'] as const) {
  test(`guide rules reach package elements only to place them: opened header menu and side drawer (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${lang}/components/button/reference/`);
    await hydrated(page);
    const menu = page.getByRole('button', { name: lang === 'ar' ? 'القائمة' : 'Menu' });
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await structure(page, `${lang} header menu open`);
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    const opener = page.getByRole('button', { name: lang === 'ar' ? 'صفحات المكوّنات' : 'Component pages' });
    await opener.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await structure(page, `${lang} side drawer open`);
  });
}
