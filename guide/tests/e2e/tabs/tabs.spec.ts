import type { Locator, Page } from '@playwright/test';
import { test, expect, hydrated } from '../support/fixtures';
import { pageModel } from '../support/routes';

// Tabs brief and reference views in Arabic and English (contentPipeline.pilots.tabs):
// content from docs/components/tabs(.ar).md, the native Angular result of each live
// group, its id references, and its keyboard behaviour in both directions.
//
// These specs test the native Angular result and the page structure only. The
// sandboxed frames of the JavaScript, React and Vue results and their
// equivalence with the Angular result are compared by the equivalence runner, scripts/equivalence/run.mjs:
//   - each group renders in the vanilla, React and Vue frames in ar and en;
//   - the normalised DOM, the aria snapshot and the screenshot of the four results
//     are equal at rest and after each step of the checks declared on the html
//     blocks (tabs-keyboard, tabs-keyboard-vertical, tabs-activate, tabs-click,
//     tabs-disabled), and each step asserts its documented outcome in every frame
//     (the keys of the keyboard table equal the keys the steps press);
//   - tests/e2e/equivalence/native-vs-frame.spec.ts: the native Angular result and
//     the Angular frame of each group have equal aria snapshots.
// What every component page shares (outline, content navigation, framework tabs and
// editor links of every group, tables) is checked from the page model by
// pages/component-page.spec.ts; positions and counts here are read from the model too.

const TEXT = {
  en: {
    title: 'Tabs',
    briefTitle: 'Tabs · Hawiyah',
    referenceTitle: 'Tabs reference · Hawiyah',
    result: 'Result',
    frameworks: 'Framework',
    status: 'Rendered with @hawiyah/angular 0.3.0 from npm',
    fullReference: 'Full reference',
    onThisPage: 'On this page',
    important: 'Important',
    sections: ['Example', 'Variants and states', 'API', 'Accessibility', 'RTL and localisation', 'Platforms Code reference'],
    basic: { name: 'Request details', tabs: ['Overview', 'Documents', 'History'], panels: ['The request is under review.', 'Two documents are attached to the request.', 'The request was submitted and assigned to a reviewer.'] },
    vertical: { name: 'Account settings', tabs: ['Profile', 'Security', 'Notifications'], panels: ['Name, email address and mobile number.', 'Password and verification methods.', 'Messages about requests and appointments.'] },
    manual: { name: 'Service steps', tabs: ['Apply', 'Pay', 'Receive'], panels: ['Fill in the application form.', 'Pay the service fee.', 'Receive the document by email.'] },
    disabled: { name: 'Request details', tabs: ['Overview', 'Decision', 'Documents', 'History'], panels: ['The decision is available after the review.', 'No decision has been issued.', 'Two documents are attached to the request.', 'The request was submitted and assigned to a reviewer.'] },
  },
  ar: {
    title: 'تبويبات',
    briefTitle: 'تبويبات · هوية',
    referenceTitle: 'مرجع المكوّن: تبويبات · هوية',
    result: 'النتيجة',
    frameworks: 'إطار العمل',
    status: 'معروض باستخدام @hawiyah/angular 0.3.0 من npm',
    fullReference: 'المرجع الكامل',
    onThisPage: 'في هذه الصفحة',
    important: 'مهم',
    sections: ['مثال', 'الأشكال والحالات', 'الواجهة البرمجية', 'إمكانية الوصول', 'الاتجاه والتوطين', 'مرجع كود المنصات'],
    basic: { name: 'تفاصيل الطلب', tabs: ['نظرة عامة', 'المستندات', 'السجل'], panels: ['الطلب قيد المراجعة.', 'أُرفق بالطلب مستندان.', 'قُدّم الطلب وأُسند إلى مراجع.'] },
    vertical: { name: 'إعدادات الحساب', tabs: ['الملف الشخصي', 'الأمان', 'الإشعارات'], panels: ['الاسم والبريد الإلكتروني ورقم الجوال.', 'كلمة المرور وطرق التحقق.', 'الرسائل المتعلقة بالطلبات والمواعيد.'] },
    manual: { name: 'خطوات الخدمة', tabs: ['التقديم', 'الدفع', 'الاستلام'], panels: ['عبّئ نموذج الطلب.', 'ادفع رسوم الخدمة.', 'استلم المستند عبر البريد الإلكتروني.'] },
    disabled: { name: 'تفاصيل الطلب', tabs: ['نظرة عامة', 'القرار', 'المستندات', 'السجل'], panels: ['يتاح القرار بعد انتهاء المراجعة.', 'لم يصدر قرار بعد.', 'أُرفق بالطلب مستندان.', 'قُدّم الطلب وأُسند إلى مراجع.'] },
  },
} as const;

type Lang = keyof typeof TEXT;

type Group = { readonly name: string; readonly tabs: readonly string[]; readonly panels: readonly string[] };

/** Position of a live group of the Tabs page in a language. */
function at(lang: Lang, example: string): number {
  const index = pageModel('tabs', lang).liveGroups.indexOf(example);
  if (index < 0) throw new Error(`tabs (${lang}) has no live group ${example}`);
  return index;
}

/** The tab list of the native result in example block `index`. */
function resultTabs(page: Page, lang: Lang, index: number, name: string): Locator {
  return page.locator('guide-example-block').nth(index).getByRole('group', { name: TEXT[lang].result }).getByRole('tablist', { name });
}

/** The visible panel of a native result, its text and its labelling tab. */
async function expectSelected(page: Page, lang: Lang, index: number, group: Group, selected: number): Promise<void> {
  const result = page.locator('guide-example-block').nth(index).getByRole('group', { name: TEXT[lang].result });
  const tabs = result.getByRole('tablist', { name: group.name }).getByRole('tab');
  for (const [i] of group.tabs.entries()) {
    await expect(tabs.nth(i)).toHaveAttribute('aria-selected', String(i === selected));
  }
  const panel = result.getByRole('tabpanel');
  await expect(panel).toHaveCount(1);
  await expect(panel).toHaveText(group.panels[selected] ?? '');
  await expect(panel).toHaveAccessibleName(group.tabs[selected] ?? '');
}

/** Each tab controls a panel inside the same result whose aria-labelledby names the tab. */
async function expectIdReferences(result: Locator, count: number): Promise<void> {
  const tabs = result.locator('[role="tab"]');
  await expect(tabs).toHaveCount(count);
  const ids = new Set<string>();
  for (const tab of await tabs.all()) {
    const id = await tab.getAttribute('id');
    const controls = await tab.getAttribute('aria-controls');
    expect(id, 'tab id').toMatch(/\S/);
    expect(controls, 'aria-controls').toMatch(/\S/);
    ids.add(id ?? '');
    const panel = result.locator(`[id="${controls}"]`);
    await expect(panel).toHaveCount(1);
    await expect(panel).toHaveAttribute('role', 'tabpanel');
    await expect(panel).toHaveAttribute('aria-labelledby', id ?? '');
    await expect(panel).toHaveClass(/\bhw-tab-panel\b/);
  }
  expect(ids.size).toBe(count);
}

for (const lang of ['ar', 'en'] as const) {
  const t = TEXT[lang];
  const next = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight';
  const previous = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft';

  test.describe(`tabs (${lang})`, () => {
    test('brief view: heading, summary, the basic example and the link to the reference', async ({ page }) => {
      await page.goto(`${lang}/components/tabs/`);
      await hydrated(page);
      await expect(page).toHaveTitle(t.briefTitle);
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      const article = page.locator('main article.hw-prose');
      await expect(article).toHaveAttribute('lang', lang);
      await expect(article.getByRole('heading', { level: 1 })).toHaveText(t.title);
      await expect(article.getByRole('heading', { level: 2 })).toHaveText([t.sections[0]]);

      const blocks = page.locator('guide-example-block');
      await expect(blocks).toHaveCount(1);
      await expect(blocks.locator('section.example')).toHaveAttribute('aria-labelledby', 'example');
      await expect(blocks.locator('p.status')).toHaveText(t.status);
      const tablist = resultTabs(page, lang, 0, t.basic.name);
      await expect(tablist.getByRole('tab')).toHaveText([...t.basic.tabs]);
      await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
      await expectSelected(page, lang, 0, t.basic, 0);
      await expectIdReferences(blocks.getByRole('group', { name: t.result }), 3);

      // The listing of the Angular tab is the Angular source of the group.
      const frameworks = blocks.locator('hw-tabs').filter({ has: page.getByRole('tablist', { name: t.frameworks }) });
      await expect(frameworks.getByRole('tab', { name: 'Angular' })).toHaveAttribute('aria-selected', 'true');
      const listing = frameworks.getByRole('tabpanel').locator('pre code');
      await expect(listing).toContainText(`<hw-tab value="overview" label="${t.basic.tabs[0]}">`);
      await expect(article.getByRole('link', { name: t.fullReference })).toHaveAttribute('href', `${lang}/components/tabs/reference/`);
    });

    test('basic example: keyboard follows the reading direction and selects automatically', async ({ page }) => {
      await page.goto(`${lang}/components/tabs/`);
      await hydrated(page);
      const tabs = resultTabs(page, lang, 0, t.basic.name).getByRole('tab');
      await expect(page.locator('guide-example-block').getByRole('group', { name: t.result }).locator('hw-tabs')).toHaveCSS('direction', lang === 'ar' ? 'rtl' : 'ltr');
      await tabs.first().focus();
      await expect(tabs.nth(0)).toHaveAttribute('tabindex', '0');
      await expect(tabs.nth(1)).toHaveAttribute('tabindex', '-1');
      await page.keyboard.press(next);
      await expect(tabs.nth(1)).toBeFocused();
      await expectSelected(page, lang, 0, t.basic, 1);
      await page.keyboard.press('End');
      await expect(tabs.nth(2)).toBeFocused();
      await expectSelected(page, lang, 0, t.basic, 2);
      await page.keyboard.press(next);
      await expect(tabs.nth(0)).toBeFocused();
      await expectSelected(page, lang, 0, t.basic, 0);
      await page.keyboard.press(previous);
      await expect(tabs.nth(2)).toBeFocused();
      await page.keyboard.press('Home');
      await expect(tabs.nth(0)).toBeFocused();
      await expectSelected(page, lang, 0, t.basic, 0);
      // Tab leaves the list for the visible panel.
      await page.keyboard.press('Tab');
      const panel = page.locator('guide-example-block').getByRole('group', { name: t.result }).getByRole('tabpanel');
      await expect(panel).toBeFocused();
    });

    test('reference view: sections, every live group, API tables and the alert', async ({ page }) => {
      await page.goto(`${lang}/components/tabs/reference/`);
      await hydrated(page);
      await expect(page).toHaveTitle(t.referenceTitle);
      const article = page.locator('main article.hw-prose');
      await expect(article.getByRole('heading', { level: 1 })).toHaveText(t.title);
      await expect(article.locator(':scope > h2')).toHaveText([...t.sections]);

      const model = pageModel('tabs', lang);
      const blocks = page.locator('guide-example-block');
      await expect(blocks).toHaveCount(model.liveGroups.length);
      const groups: [number, Group][] = [[at(lang, 'basic'), t.basic], [at(lang, 'vertical'), t.vertical], [at(lang, 'manual'), t.manual], [at(lang, 'disabled-tab'), t.disabled]];
      for (const [index, group] of groups) {
        await expect(resultTabs(page, lang, index, group.name).getByRole('tab')).toHaveText([...group.tabs]);
        await expectSelected(page, lang, index, group, 0);
        await expectIdReferences(blocks.nth(index).getByRole('group', { name: t.result }), group.tabs.length);
      }
      // Generated ids are unique across the results of the page.
      const ids = await page.locator('guide-example-block [role="group"] [role="tab"]').evaluateAll((nodes) => nodes.map((node) => node.id));
      // The disabled group has four tabs, the others three.
      expect(ids.length).toBe(groups.reduce((sum, [, group]) => sum + group.tabs.length, 0));
      expect(new Set(ids).size).toBe(ids.length);

      const tables = article.getByRole('table');
      await expect(tables).toHaveCount(model.tables.length);
      const angularTable = model.tables.findIndex((table) => table.columns.some((column) => column.label.some((node) => node.value === (lang === 'ar' ? 'الفئة' : 'Kind'))) && table.rows.some((row) => row['c0']?.some((node) => node.value === 'hw-tab value')));
      const angular = tables.nth(angularTable);
      await expect(angular.getByRole('row')).toHaveCount(1 + (model.tables[angularTable]?.rows.length ?? 0));
      await expect(angular.getByRole('cell', { name: 'hw-tab value' })).toBeVisible();
      const vueTable = model.tables.findIndex((table) => table.rows.some((row) => row['c0']?.some((node) => node.value === 'update:modelValue')));
      await expect(tables.nth(vueTable).getByRole('cell', { name: 'update:modelValue' })).toBeVisible();
      await expect(article.locator('hw-alert[role="note"]')).toHaveCount(1);
      await expect(article.locator('hw-alert[role="note"]')).toContainText(t.important);
    });

    test('vertical example: click selects, Up and Down Arrow move in both directions', async ({ page }) => {
      await page.goto(`${lang}/components/tabs/reference/`);
      await hydrated(page);
      const tablist = resultTabs(page, lang, at(lang, 'vertical'), t.vertical.name);
      await expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
      const tabs = tablist.getByRole('tab');
      const [first, second] = [await tabs.nth(0).boundingBox(), await tabs.nth(1).boundingBox()];
      expect(second!.y).toBeGreaterThan(first!.y);
      await tabs.nth(1).click();
      await expectSelected(page, lang, at(lang, 'vertical'), t.vertical, 1);
      await page.keyboard.press('ArrowDown');
      await expect(tabs.nth(2)).toBeFocused();
      await expectSelected(page, lang, at(lang, 'vertical'), t.vertical, 2);
      await page.keyboard.press('ArrowUp');
      await expect(tabs.nth(1)).toBeFocused();
      // Horizontal arrows do nothing in a vertical list.
      await page.keyboard.press(next);
      await expect(tabs.nth(1)).toBeFocused();
      await expectSelected(page, lang, at(lang, 'vertical'), t.vertical, 1);
    });

    test('manual example: arrows move focus only, Enter and Space select', async ({ page }) => {
      await page.goto(`${lang}/components/tabs/reference/`);
      await hydrated(page);
      const tabs = resultTabs(page, lang, at(lang, 'manual'), t.manual.name).getByRole('tab');
      await tabs.first().focus();
      await page.keyboard.press(next);
      await expect(tabs.nth(1)).toBeFocused();
      await expectSelected(page, lang, at(lang, 'manual'), t.manual, 0);
      await page.keyboard.press('Enter');
      await expectSelected(page, lang, at(lang, 'manual'), t.manual, 1);
      await page.keyboard.press('End');
      await expect(tabs.nth(2)).toBeFocused();
      await expectSelected(page, lang, at(lang, 'manual'), t.manual, 1);
      await page.keyboard.press(' ');
      await expectSelected(page, lang, at(lang, 'manual'), t.manual, 2);
    });

    test('disabled tab: skipped by the arrows and not selectable', async ({ page }) => {
      await page.goto(`${lang}/components/tabs/reference/`);
      await hydrated(page);
      const tabs = resultTabs(page, lang, at(lang, 'disabled-tab'), t.disabled.name).getByRole('tab');
      await expect(tabs.nth(1)).toBeDisabled();
      await tabs.first().focus();
      await page.keyboard.press(next);
      await expect(tabs.nth(2)).toBeFocused();
      await expectSelected(page, lang, at(lang, 'disabled-tab'), t.disabled, 2);
      await page.keyboard.press(previous);
      await expect(tabs.nth(0)).toBeFocused();
      await tabs.nth(1).click({ force: true });
      await expectSelected(page, lang, at(lang, 'disabled-tab'), t.disabled, 0);
    });

    for (const width of [1280, 390]) {
      test(`reference view at ${width} px: no horizontal overflow, tab lists inside their results`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${lang}/components/tabs/reference/`);
        await hydrated(page);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        for (const result of await page.locator('guide-example-block').getByRole('group', { name: t.result }).all()) {
          const outer = await result.boundingBox();
          const list = await result.getByRole('tablist').boundingBox();
          expect(list!.x).toBeGreaterThanOrEqual(outer!.x - 1);
          expect(list!.x + list!.width).toBeLessThanOrEqual(outer!.x + outer!.width + 1);
        }
      });
    }
  });
}
