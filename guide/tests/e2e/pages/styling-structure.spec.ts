import type { Page } from '@playwright/test';
import { test, expect, hydrated, keepRootDocument } from '../support/fixtures';
import { documents } from '../support/routes';
import {
  ANCESTOR_EFFECTS,
  INHERITED_ALLOWED,
  INHERITED_FLOOR,
  PLACEMENT,
  PLACEMENT_ALLOWED,
  PLACEMENT_PROPERTIES,
  entryKey,
  judgedInherited,
  stylingRule,
} from '../support/styling-rule';

// The structural half of the styling rule (README.md, "The styling rule"): every rule
// of every guide stylesheet, style element and adopted sheet, under every media,
// supports, container and layer condition, with states (pseudo-classes, aria-*, data-*
// and the boolean state attributes) and pseudo-elements stripped from its selector, is
// matched against the page. A rule that matches a package element (both clauses of
// styling-rule.ts) may declare only margins, and a placement property only through an
// entry of PLACEMENT_ALLOWED (value and condition included); a rule that matches an
// ancestor of a package element may declare an inherited property (derived from the
// browser), a package custom property or a property that changes how descendants paint
// (ANCESTOR_EFFECTS) only through an entry of INHERITED_ALLOWED. A selector the stripper
// cannot handle fails, and so does an entry that no rule on any page uses.

const lists = {
  placement: PLACEMENT.map((entry) => entry.properties.source),
  placementAllowed: PLACEMENT_ALLOWED.map(({ sheet, selector, property, value, condition }) => ({ sheet, selector, property, value, condition })),
  effects: ANCESTOR_EFFECTS,
  inheritedAllowed: INHERITED_ALLOWED.map(({ sheet, selector, property, value, condition }) => ({ sheet, selector, property, value, condition })),
};

async function structure(page: Page, label: string): Promise<string[]> {
  const { inherited } = await judgedInherited(page);
  const outcome = await page.evaluate(stylingRule, { mode: 'structure' as const, inherited, ...lists });
  expect(outcome.sheets, `${label}: guide stylesheets read`).toBeGreaterThan(0);
  expect(outcome.packageRules, `${label}: rules of the package stylesheet read`).toBeGreaterThan(1000);
  expect(outcome.packageElements, `${label}: package elements`).toBeGreaterThan(0);
  expect(outcome.violations, label).toEqual([]);
  test.info().annotations.push({
    type: 'structure',
    description: `${label}: ${outcome.rules} rules in ${outcome.sheets} sheets, ${outcome.matches} reach package elements, ${outcome.packageElements} package elements (${outcome.firstClause} by tag or class, ${outcome.secondClause} more matched by package rules)`,
  });
  return outcome.used ?? [];
}

async function open(page: Page, route: string, guard: { allowDocument404(url: RegExp): void }): Promise<void> {
  if (route === '') {
    await keepRootDocument(page);
    await page.goto('');
  } else if (route === '404') {
    guard.allowDocument404(/\/hawiyah\/en\/no-such-page\/$/);
    await page.goto('en/no-such-page/');
  } else {
    await page.goto(`${route}/`);
  }
  await hydrated(page);
  if (route.endsWith('/editor')) {
    // The editor after its first run: status line, log and result frame filled.
    await expect(page.locator('guide-editor-status p.state')).toHaveText(/^(The original example ran in \d+ ms\.|شُغِّل المثال الأصلي في \d+ ملّي ثانية\.)$/, { timeout: 20_000 });
  }
}

test('the stripper removes states and pseudo-elements, keeps structure, and refuses what it cannot handle', async ({ page }) => {
  await page.goto('en/components/');
  await hydrated(page);
  // [package]: the selector names an hw- class or tag outside :not(), so what it matches
  // in the package stylesheet is a package element (second clause).
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
    ["[role='tab'][aria-selected='true']:nth-child(2)", "[role='tab']:is(*):nth-child(2)"],
    ['details[open] > summary, dialog[open]', 'details:is(*) > summary, dialog:is(*)'],
    ['[data-state=on] input[disabled][checked][readonly][required][inert][hidden], option[selected]', ':is(*) input:is(*):is(*):is(*):is(*):is(*):is(*), option:is(*)'],
    ['a[href][lang="ar"][dir=rtl][type][id][class~=x], [openly]', 'a[href][lang="ar"][dir=rtl][type][id][class~=x], [openly]'],
    ['li:not([aria-current]) a', 'li:is(*) a'],
    [':where(.hw-prose) :where(h2):not(:where(.hw-prose [class] *))', ':where(.hw-prose) :where(h2):not(:where(.hw-prose [class] *)) [package]'],
    ['hw-tabs > [role=tab]', 'hw-tabs > [role=tab] [package]'],
    ['.hw-alert :where(h2, h3, h4, p)', '.hw-alert :where(h2, h3, h4, p) [package]'],
    ['a:not(.hw-button)', 'a:not(.hw-button)'],
    [':root:has(.hw-dialog[open])', ':root:has(.hw-dialog:is(*))'],
    ['[data-hw-mode=dark] p, :root, button, [class*=hw-code-token-]', ':is(*) p, :root, button, [class*=hw-code-token-]'],
    [':host .a', 'ERROR :host cannot be stripped'],
    ['::slotted(p)', 'ERROR ::slotted() cannot be stripped'],
    ['li:nth-child(2 of .a:hover)', 'ERROR :nth-child(... of S) cannot be stripped'],
  ];
  const outcome = await page.evaluate(stylingRule, { mode: 'strip' as const, selectors: cases.map(([selector]) => selector) });
  expect(outcome.stripped).toEqual(cases.map(([, expected]) => expected));
});

test('the lists are written out with values and reasons, and the inherited properties are derived from the browser', async ({ page }) => {
  for (const entry of PLACEMENT) expect(entry.reason.length, entry.properties.source).toBeGreaterThan(20);
  for (const entry of PLACEMENT_ALLOWED) {
    expect(entry.reason.length, entryKey(entry)).toBeGreaterThan(20);
    expect(PLACEMENT_PROPERTIES.test(entry.property), `${entryKey(entry)}: a placement property`).toBe(true);
    if (entry.property === 'display') expect(entry.value, `${entryKey(entry)}: display only as none`).toBe('none');
  }
  const { inherited, derived } = await judgedInherited(page);
  // The derivation sees the inherited properties of this Chromium, among them those the
  // written list once lacked.
  expect(derived, 'inherited properties derived').toBeGreaterThan(100);
  for (const name of ['color', 'font-family', 'visibility', 'scrollbar-color', 'interactivity', 'caret-shape', 'text-justify']) expect(inherited, name).toContain(name);
  for (const entry of INHERITED_ALLOWED) {
    expect(entry.reason.length, entryKey(entry)).toBeGreaterThan(20);
    const judged = inherited.includes(entry.property) || ANCESTOR_EFFECTS.includes(entry.property) || entry.property.startsWith('--hw-') || entry.property.startsWith('--_hw-');
    expect(judged, entryKey(entry)).toBe(true);
  }
  test.info().annotations.push({ type: 'inherited', description: `${derived} derived, ${inherited.length} judged with INHERITED_FLOOR (${INHERITED_FLOOR.length})` });
});

const pages = documents.filter((doc) => doc.kind === 'page');

for (const doc of pages) {
  const label = doc.route === '' ? 'root document' : doc.route === '404' ? '404 document' : doc.route;
  test(`guide rules reach package elements only to place them: ${label}`, async ({ page, guard }) => {
    await open(page, doc.route, guard);
    await structure(page, `${label} at 1280 px`);
    await page.setViewportSize({ width: 390, height: 844 });
    await structure(page, `${label} at 390 px`);
  });
}

async function openedStates(page: Page, lang: 'ar' | 'en', used: Set<string>): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${lang}/components/button/reference/`);
  await hydrated(page);
  const menu = page.getByRole('button', { name: lang === 'ar' ? 'القائمة' : 'Menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  for (const key of await structure(page, `${lang} header menu open`)) used.add(key);
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  const opener = page.getByRole('button', { name: lang === 'ar' ? 'صفحات المكوّنات' : 'Component pages' });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  for (const key of await structure(page, `${lang} side drawer open`)) used.add(key);
}

for (const lang of ['ar', 'en'] as const) {
  test(`guide rules reach package elements only to place them: opened header menu and side drawer (${lang})`, async ({ page }) => {
    await openedStates(page, lang, new Set());
  });
}

test('every listed declaration is used by a rule on some page', async ({ page, guard }) => {
  test.setTimeout(240_000);
  const used = new Set<string>();
  for (const doc of pages) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, doc.route, guard);
    for (const key of await structure(page, `${doc.route} at 1280 px`)) used.add(key);
    await page.setViewportSize({ width: 390, height: 844 });
    for (const key of await structure(page, `${doc.route} at 390 px`)) used.add(key);
  }
  for (const lang of ['ar', 'en'] as const) await openedStates(page, lang, used);
  const unused = [...PLACEMENT_ALLOWED, ...INHERITED_ALLOWED].map(entryKey).filter((key) => !used.has(key));
  expect(unused, 'listed declarations that no rule on any page uses').toEqual([]);
});
