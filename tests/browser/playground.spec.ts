import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

type Locale = 'en' | 'ar';
type Mode = 'light' | 'dark';
const routes = ['overview', 'foundations', 'components', 'discover', 'apply', 'workspace', 'docs', 'brand'] as const;

async function settings(page: Page, locale: Locale = 'en', mode: Mode = 'light') {
  await page.addInitScript(({ locale, mode }) => {
    localStorage.setItem('hawiyah-locale', locale);
    localStorage.setItem('hawiyah-mode', mode);
    localStorage.setItem('hawiyah-theme', 'hawiyah');
  }, { locale, mode });
}

async function visit(page: Page, route: string) {
  await page.goto(`/#${route}`);
  await expect(page.locator('main h1').first()).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
}

test('service discovery filters, recovers from an empty result, and restores modal focus', async ({ page }) => {
  await settings(page);
  await visit(page, 'discover');
  const search = page.getByRole('searchbox', { name: 'Search services' });
  await expect(page.locator('.result-count')).toContainText('8 services');
  await page.getByRole('button', { name: 'Individuals', exact: true }).click();
  await expect(page.locator('.service-card')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Individuals', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await search.fill('No matching service 987');
  await expect(page.locator('.service-card')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Let’s try another way' })).toBeVisible();
  await expect(search).toBeFocused();
  await page.getByRole('button', { name: 'Show all services' }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('.result-count')).toContainText('8 services');
  await expect(page.locator('.service-card')).toHaveCount(6);
  await search.fill('Start a business');
  await expect(page.locator('.service-card')).toHaveCount(1);
  const trigger = page.getByRole('button', { name: 'View service' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Start a business' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Before you begin' })).toBeVisible();
  await expect.poll(() => dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('guided application validates conditional details, rejects documents, reviews and completes locally', async ({ page }) => {
  await settings(page);
  await visit(page, 'apply');
  const form = page.locator('#application-form');
  const continueButton = form.getByRole('button', { name: 'Continue', exact: true });
  await continueButton.click();
  await expect(page.locator('#business-name')).toBeFocused();
  await expect(form.getByRole('heading', { name: 'Tell us about your business' })).toBeVisible();

  await page.getByLabel('Business name').fill('Hawiyah Test Studio');
  await page.getByLabel('Activity', { exact: false }).selectOption('other');
  const description = page.getByLabel('Describe your activity');
  await expect(description).toBeVisible();
  await expect(page.getByLabel('Business name')).toHaveValue('Hawiyah Test Studio');
  await page.getByLabel('City', { exact: false }).selectOption('riyadh');
  await page.getByLabel('Contact email').fill('invalid-email');
  await continueButton.click();
  await expect(description).toBeFocused();
  await description.fill('Fictional design and accessibility consulting.');
  await continueButton.click();
  await expect(page.getByLabel('Contact email')).toBeFocused();
  expect(await page.getByLabel('Contact email').evaluate(node => (node as HTMLInputElement).validity.typeMismatch)).toBe(true);
  await page.getByLabel('Contact email').fill('demo@example.test');
  await continueButton.click();
  await expect(form.getByRole('heading', { name: 'Bring the details together' })).toBeFocused();
  await expect(page.locator('.app-stepper [aria-current="step"]')).toContainText('Documents');

  const upload = page.getByLabel('Supporting document', { exact: true });
  await upload.setInputFiles({ name: 'invalid.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('example') });
  await expect(page.getByRole('alert')).toHaveText('Choose a PDF, PNG, or JPG smaller than 5 MB.');
  await expect(upload).toHaveValue('');
  await upload.setInputFiles({ name: 'oversize.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
  await expect(page.getByRole('alert')).toHaveText('Choose a PDF, PNG, or JPG smaller than 5 MB.');
  await expect(upload).toHaveValue('');
  await upload.setInputFiles({ name: 'sample-document.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') });
  await expect(page.locator('.application-upload strong')).toHaveText('sample-document.pdf');
  await expect(page.getByRole('alert')).toBeEmpty();
  await continueButton.click();
  await expect(form.getByRole('heading', { name: 'A final look before you go' })).toBeFocused();
  await expect(form).toContainText('Hawiyah Test Studio');
  await expect(form).toContainText('Fictional design and accessibility consulting.');
  await expect(form).toContainText('Riyadh');
  await expect(form).toContainText('demo@example.test');
  await expect(form).toContainText('sample-document.pdf');
  const declaration = form.getByRole('checkbox');
  await form.getByRole('button', { name: 'Complete example' }).click();
  await expect(declaration).toBeFocused();
  await expect(page.locator('.success-page')).toHaveCount(0);
  await declaration.check();
  await form.getByRole('button', { name: 'Complete example' }).click();
  await expect(page.getByRole('heading', { name: 'A good beginning.' })).toBeFocused();
  await expect(page.locator('.reference-box')).toContainText('HW-DEMO-1043');
});

test('workspace filters records, exports only the selection, and opens actionable details', async ({ page }) => {
  await settings(page);
  await visit(page, 'workspace');
  const rows = page.locator('.requests-table tbody tr');
  await expect(rows).toHaveCount(5);
  const search = page.getByRole('searchbox', { name: 'Search requests' });
  await search.fill('missing request');
  await expect(rows).toHaveCount(0);
  await expect(page.locator('.hw-empty')).toContainText('No matching requests');
  await search.fill('');
  await page.getByLabel('Filter by status').selectOption('completed');
  await expect(rows).toHaveCount(2);
  await page.getByRole('checkbox', { name: 'Select visible requests' }).check();
  await expect(page.locator('.bulk-bar')).toContainText('2 selected');
  await expect(page.locator('tbody input[type="checkbox"]:checked')).toHaveCount(2);

  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export selected' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('hawiyah-demo-requests.json');
  const exported = JSON.parse(await readFile((await download.path())!, 'utf8')) as { id: string }[];
  expect(exported.map(record => record.id).sort()).toEqual(['HW-1024', 'HW-1031']);
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await expect(page.locator('.bulk-bar')).toHaveCount(0);
  await expect(page.locator('tbody input[type="checkbox"]:checked')).toHaveCount(0);

  await page.getByLabel('Filter by status').selectOption('action');
  await expect(rows).toHaveCount(1);
  const details = page.getByRole('button', { name: 'View Event permit' });
  await details.click();
  const dialog = page.getByRole('dialog', { name: 'Event permit' });
  await expect(dialog).toContainText('Next step: attach an updated supporting document.');
  await dialog.getByRole('button', { name: 'Close details' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(details).toBeFocused();
});

test('Arabic component tabs follow visual RTL and combobox selection remains explicit', async ({ page }) => {
  await settings(page, 'ar');
  await visit(page, 'components');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const tabs = page.locator('[data-hw="tabs"]');
  const overview = tabs.getByRole('tab', { name: 'نظرة عامة' });
  const details = tabs.getByRole('tab', { name: 'التفاصيل' });
  await overview.focus();
  await overview.press('ArrowLeft');
  await expect(details).toBeFocused();
  await expect(details).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.getByRole('tabpanel')).toHaveText('معلومات واضحة لخطوتك القادمة.');
  await details.press('ArrowRight');
  await expect(overview).toBeFocused();
  await overview.press('End');
  await expect(tabs.getByRole('tab', { name: 'السجل' })).toBeFocused();

  const input = page.getByRole('combobox', { name: 'ابحث عن مدينة' });
  const combo = page.locator('[data-hw="combobox"]');
  const value = combo.locator('[data-hw-combobox-value]');
  await input.fill('ابه');
  await expect(combo.getByRole('option')).toHaveCount(1);
  await expect(combo.getByRole('option')).toHaveText('أبها');
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', await combo.getByRole('option').getAttribute('id') as string);
  await expect(value).toHaveValue('');
  await input.press('Escape');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).toHaveValue('ابه');
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(value).toHaveValue('abha');
  await expect(input).toHaveValue('أبها');
  await input.click();
  await expect(combo.getByRole('option')).toHaveCount(4);
  await page.locator('main h1').click();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('component modal contains focus and Escape restores it; tooltip persists across hover and dismisses', async ({ page }) => {
  await settings(page);
  await visit(page, 'components');
  const trigger = page.getByRole('button', { name: 'Open dialog', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'A moment of clarity' });
  await expect(dialog.getByRole('button', { name: 'Got it' })).toBeFocused();
  await page.locator('#component-search').evaluate(node => (node as HTMLElement).focus());
  await expect(dialog.getByRole('button', { name: 'Got it' })).toBeFocused();
  for (let index = 0; index < 4; index++) {
    await page.keyboard.press('Tab');
    // Native dialogs allow Tab into browser chrome. A focused document must
    // still keep its active element inside the modal, never in background UI.
    expect(await dialog.evaluate(node => !document.hasFocus() || node.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Got it' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();

  const tooltipTrigger = page.getByRole('button', { name: 'Hover or focus me' });
  await tooltipTrigger.focus();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  expect((await tooltipTrigger.getAttribute('aria-describedby'))?.split(' ')).toContain(await tooltip.getAttribute('id'));
  await tooltipTrigger.press('Escape');
  await expect(tooltip).not.toBeVisible();
  await expect(tooltipTrigger).toBeFocused();
  await page.locator('main h1').click();
  await tooltipTrigger.hover();
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  await page.locator('main h1').hover();
  await expect(tooltip).not.toBeVisible();
});

for (const locale of ['en', 'ar'] as const) {
  for (const width of [1440, 390]) {
    test(`${locale} routes fit a ${width}px viewport without horizontal page overflow`, async ({ page }) => {
      test.setTimeout(60_000);
      await settings(page, locale, locale === 'ar' ? 'dark' : 'light');
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await test.step(route, async () => {
          await visit(page, route);
          await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
          const size = await page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            content: document.documentElement.scrollWidth,
          }));
          expect(size.content, `${locale}/${route}: document width ${size.content}, viewport ${size.viewport}`).toBeLessThanOrEqual(size.viewport + 1);
        });
      }
      if (width === 390) {
        await page.locator('.mobile-menu').click();
        const sidebar = page.locator('.sidebar');
        await expect(sidebar).toHaveClass(/mobile-open/u);
        await sidebar.getByText(locale === 'ar' ? 'تجارب متكاملة' : 'Complete journeys', { exact: true }).click();
        await sidebar.locator('a[href="#discover"]').click();
        await expect(page).toHaveURL(/#discover$/u);
        await expect(sidebar).not.toHaveClass(/mobile-open/u);
        await expect(page.getByRole('searchbox')).toBeVisible();
      }
    });
  }
}

for (const locale of ['en', 'ar'] as const) {
  for (const route of ['overview', 'components', 'apply', 'workspace']) {
    test(`WCAG 2.2 AA automated checks: ${route}, ${locale}, ${locale === 'ar' ? 'dark' : 'light'}`, async ({ page }) => {
      test.setTimeout(60_000);
      await settings(page, locale, locale === 'ar' ? 'dark' : 'light');
      await visit(page, route);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const violations = result.violations.map(violation => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary })),
      }));
      expect(violations).toEqual([]);
    });
  }
}
