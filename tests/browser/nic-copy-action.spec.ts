import { expect, test, type Page } from '@playwright/test';

test.describe.configure({timeout: 120000});

type ClipboardMode = 'success' | 'denied' | 'unavailable' | 'failed' | 'pending';
declare global {
  interface Window {
    nqCopyTest: { mode: ClipboardMode; writes: string[]; release: Array<() => void> };
  }
}

async function openExamples(page: Page, locale: 'ar' | 'en') {
  await page.addInitScript(language => {
    if (window !== window.top) return;
    localStorage.setItem('nasaq-locale', language);
    const state: Window['nqCopyTest'] = {mode: 'success', writes: [], release: []};
    window.nqCopyTest = state;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      get: () => state.mode === 'unavailable' ? undefined : {
        async writeText(text: string) {
          state.writes.push(text);
          if (state.mode === 'denied') throw new DOMException('Permission denied', 'NotAllowedError');
          if (state.mode === 'failed') throw new Error('Write failure');
          if (state.mode === 'pending') await new Promise<void>(resolve => state.release.push(resolve));
        },
      },
    });
  }, locale);
  await page.goto('/#component/button');
  await expect(page.locator('#component-examples [data-copy-action]')).toHaveCount(2, {timeout: 45000});
  expect(await page.evaluate(() => window.nqCopyTest.writes)).toEqual([]);
}

for (const locale of ['ar', 'en'] as const) {
  test(`copy action stays local and offers a selectable fallback in ${locale}`, async ({page}) => {
    await openExamples(page, locale);
    const ar = locale === 'ar';
    const email = page.locator('#component-examples [data-copy-action="email"]');
    const reference = page.locator('#component-examples [data-copy-action="reference"]');
    const firstStatus = email.getByRole('status');
    const status = reference.getByRole('status');
    const manual = reference.locator('[data-copy-manual] input');
    const route = page.url();
    await email.locator('[data-copy-source]').evaluate(el => {
      el.setAttribute('value', '   MAILTO: support%2Bqa%40example.test ?subject=private  ');
      el.textContent = 'Service desk';
    });
    await email.getByRole('button').press('Enter');
    await expect(firstStatus).toHaveText(ar ? 'تم النسخ إلى الحافظة.' : 'Copied to clipboard.');
    await expect(status).toBeEmpty();
    await reference.locator('[data-copy-source]').evaluate(el => {
      el.setAttribute('value', 'https://example.test/request');
      el.textContent = '  NQ-1043  ';
    });
    await reference.getByRole('button').press('Space');
    await expect(status).toHaveText(ar ? 'تم النسخ إلى الحافظة.' : 'Copied to clipboard.');
    expect(await page.evaluate(() => window.nqCopyTest.writes)).toEqual(['support+qa@example.test', 'NQ-1043']);
    await expect(manual).toBeHidden();
    for (const mode of ['denied', 'unavailable', 'failed'] as const) {
      await page.evaluate(value => { window.nqCopyTest.mode = value; }, mode);
      const count = await page.evaluate(() => window.nqCopyTest.writes.length);
      await reference.getByRole('button').click();
      const expected = mode === 'denied' ? (ar ? 'لم يسمح المتصفح' : 'was denied')
        : mode === 'unavailable' ? (ar ? 'غير متاحة' : 'is unavailable') : (ar ? 'تعذّر النسخ' : 'Copy failed');
      await expect(status).toContainText(expected);
      await expect(manual).toBeVisible();
      await expect(manual).toHaveAccessibleName(ar ? 'النص للنسخ اليدوي' : 'Text for manual copying');
      await expect(manual).toHaveValue('NQ-1043');
      await manual.focus();
      expect(await manual.evaluate(el => [(el as HTMLInputElement).readOnly, (el as HTMLInputElement).selectionStart, (el as HTMLInputElement).selectionEnd])).toEqual([true, 0, 7]);
      expect(await page.evaluate(() => window.nqCopyTest.writes.length)).toBe(count + (mode === 'unavailable' ? 0 : 1));
    }
    const code = reference.locator('xpath=ancestor::article[1]').locator('.source-details');
    for (const name of ['@nasaq/vanilla', '@nasaq/react', '@nasaq/vue', '@nasaq/angular']) await expect(code).toContainText(name);
    await expect(page).toHaveURL(route);
  });
}

test('a pending clipboard response cannot replace a newer result or duplicate a handler after remount', async ({page}) => {
  await openExamples(page, 'en');
  const example = page.locator('#component-examples [data-copy-action="reference"]');
  await page.evaluate(() => { window.nqCopyTest.mode = 'pending'; });
  await example.getByRole('button').click();
  await page.evaluate(() => { window.nqCopyTest.mode = 'denied'; });
  await example.getByRole('button').click();
  await expect(example.getByRole('status')).toContainText('was denied');
  await page.evaluate(() => { window.nqCopyTest.release.splice(0).forEach(resolve => resolve()); });
  await expect(example.getByRole('status')).toContainText('was denied');
  await page.evaluate(() => { location.hash = '#component/alert'; });
  await expect(example).toHaveCount(0);
  await page.evaluate(() => { window.nqCopyTest.mode = 'success'; location.hash = '#component/button'; });
  await expect(example.getByRole('status')).toBeEmpty();
  await example.getByRole('button').click();
  await expect(example.getByRole('status')).toHaveText('Copied to clipboard.');
  expect(await page.evaluate(() => window.nqCopyTest.writes)).toEqual(['NQ-1043', 'NQ-1043', 'NQ-1043']);
});
