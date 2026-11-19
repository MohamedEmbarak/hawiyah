import { expect, presetMode, test } from '../support/fixtures';
import { TEXT, appendTo, axeWithFrame, codeOf, editorPath, logTexts, openEditor, originalRan, readyResult, resultFrame, statusLine, type Lang } from './support';

// Layout, toolbar names, keyboard, drafts, reset and axe of the editor route
// (layout guide/tests/e2e/editor/editor.spec.ts).

test.describe.configure({ timeout: 90_000 });

const NAMES = {
  en: {
    heading: 'Editor',
    controls: 'Editor controls',
    framework: 'Framework',
    language: 'Language',
    reset: 'Reset to the original example',
    copy: 'Copy the current file',
    download: 'Download the current file',
    run: 'Run',
    files: 'Files',
    code: 'Code of example.component.ts',
    result: 'Result',
    log: 'Log',
    clearLog: 'Clear the log',
    description: 'Button: primary',
    back: 'Button page',
    hint: 'Press Escape, then Tab, to leave the code.',
  },
  ar: {
    heading: 'المحرر',
    controls: 'أدوات المحرر',
    framework: 'إطار العمل',
    language: 'اللغة',
    reset: 'الإعادة إلى المثال الأصلي',
    copy: 'نسخ الملف الحالي',
    download: 'تنزيل الملف الحالي',
    run: 'تشغيل',
    files: 'الملفات',
    code: 'شيفرة example.component.ts',
    result: 'النتيجة',
    log: 'السجل',
    clearLog: 'مسح السجل',
    description: 'زر: primary',
    back: 'صفحة المكوّن: زر',
    hint: 'اضغط Escape ثم Tab لمغادرة الشيفرة.',
  },
} as const;

for (const lang of ['en', 'ar'] as const) {
  test(`${lang}: the prerendered document shows the default example as a code listing`, async ({ request }) => {
    const response = await request.get(editorPath(lang));
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toMatch(new RegExp(`<html[^>]*lang="${lang}"[^>]*dir="${lang === 'ar' ? 'rtl' : 'ltr'}"`));
    expect(html).toContain(`>${NAMES[lang].heading}</h1>`);
    expect(html).toContain('class="hw-code-block"');
    expect(html).toContain('example.component.ts');
    expect(html).toContain('HwButtonDirective');
    expect(html).not.toContain('cm-editor');
    expect(html).not.toContain('<iframe');
  });

  test(`${lang}: every control has a name in the page language`, async ({ page }) => {
    await openEditor(page, lang);
    await originalRan(page, lang);
    const n = NAMES[lang];
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(n.heading);
    await expect(page.locator('hw-page-header p')).toHaveText(n.description);
    await expect(page.getByRole('link', { name: n.back })).toHaveAttribute('href', `${lang}/components/button/reference/#example`);
    const toolbar = page.getByRole('group', { name: n.controls });
    await expect(toolbar).toBeVisible();
    await expect(toolbar.getByRole('group', { name: n.framework })).toBeVisible();
    await expect(toolbar.getByRole('group', { name: n.language })).toBeVisible();
    await expect(toolbar.getByRole('button', { name: n.reset })).toBeVisible();
    await expect(toolbar.getByRole('button', { name: n.copy })).toBeVisible();
    await expect(toolbar.getByRole('button', { name: n.download })).toBeVisible();
    const run = toolbar.getByRole('button', { name: new RegExp(`^${n.run}`) });
    await expect(run).toHaveAttribute('aria-keyshortcuts', 'Control+Enter Meta+Enter');
    await expect(page.getByRole('tablist', { name: n.files })).toBeVisible();
    await expect(page.getByRole('tab')).toHaveText(['example.component.ts', 'main.ts']);
    const code = page.getByRole('textbox', { name: n.code });
    await expect(code).toHaveAttribute('aria-describedby', 'editor-leave-hint');
    await expect(page.locator('#editor-leave-hint')).toHaveText(n.hint);
    await expect(code).toHaveAttribute('dir', 'ltr');
    await expect(page.getByRole('group', { name: n.result })).toBeVisible();
    await expect(page.getByRole('heading', { name: n.log })).toBeVisible();
    await expect(page.getByRole('button', { name: n.clearLog })).toBeVisible();
    // Angular is TypeScript only.
    await expect(toolbar.getByRole('group', { name: n.language }).getByRole('radio', { name: 'JavaScript' })).toBeDisabled();
    const frame = await readyResult(page);
    expect(await frame.title()).toBe(lang === 'en' ? 'Result in Angular' : 'النتيجة في Angular');
    await expect(page.locator('guide-editor-status')).toContainText('@hawiyah/angular 0.3.0 · npm · sha512-');
    // The sentence for a browser without script is not shown when script runs.
    await expect(page.locator('main .no-script')).toBeHidden();
  });
}

test('the status bar names the package of the framework shown and copies its integrity', async ({ page }) => {
  await openEditor(page, 'en', 'framework=vue');
  await originalRan(page, 'en');
  await expect(page.locator('guide-editor-status bdi')).toHaveText(/^@hawiyah\/vue 0\.3\.0 · npm · sha512-.{9}…$/);
  await expect(page.getByRole('button', { name: 'Copy the package integrity' })).toBeVisible();
});

test('Ctrl+Enter runs from the code without inserting anything, and from a toolbar control', async ({ page }) => {
  await openEditor(page, 'en', 'framework=react');
  await originalRan(page, 'en');
  const code = await appendTo(page, 'main.tsx', "\nconsole.info('shortcut');");
  const before = await code.innerText();
  await page.keyboard.press('Control+Enter');
  await expect(statusLine(page)).toHaveText(TEXT.en.yourCodeRan, { timeout: 30_000 });
  expect(await code.innerText()).toBe(before);
  await expect.poll(async () => (await logTexts(page)).filter((text) => text.includes('shortcut')).length).toBe(1);
  await page.getByRole('button', { name: 'Clear the log' }).click();
  await expect(page.getByRole('log').locator('li')).toHaveCount(0);
  await page.getByRole('button', { name: 'Download the current file' }).focus();
  await page.keyboard.press('Control+Enter');
  await expect.poll(async () => (await logTexts(page)).filter((text) => text.includes('shortcut')).length, { timeout: 30_000 }).toBe(1);
});

test('Escape then Tab leaves the code; Tab alone indents', async ({ page }) => {
  await openEditor(page, 'en');
  await originalRan(page, 'en');
  const code = await codeOf(page, 'main.ts');
  await code.click();
  await page.keyboard.press('Control+End');
  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('.cm-editor')))).toBe(true);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('.cm-editor')))).toBe(false);
  await expect.poll(() => page.evaluate(() => document.activeElement !== document.body)).toBe(true);
});

test('a restored draft is shown and not run until Run is pressed; discarding it restores the example', async ({ page }) => {
  await openEditor(page, 'en', 'framework=react');
  await originalRan(page, 'en');
  await appendTo(page, 'main.tsx', "\nconsole.info('from the draft');\n");
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('hawiyah-guide-editor:button/primary:react:ts:en')))
    .toContain('from the draft');
  await page.reload();
  await expect(page.getByText(TEXT.en.draftRestored)).toBeVisible({ timeout: 20_000 });
  await expect(statusLine(page)).toHaveText(TEXT.en.notRun);
  await expect(resultFrame(page)).toHaveCount(0);
  await page.waitForTimeout(1500);
  expect(await logTexts(page)).toEqual([]);
  await expect(resultFrame(page)).toHaveCount(0);
  await expect(await codeOf(page, 'main.tsx')).toContainText("console.info('from the draft');");
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(TEXT.en.yourCodeRan, { timeout: 30_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining('from the draft'));

  await page.reload();
  await page.getByRole('button', { name: 'Discard the edits' }).click();
  await originalRan(page, 'en');
  await expect(await codeOf(page, 'main.tsx')).not.toContainText('from the draft');
  expect(await page.evaluate(() => window.localStorage.getItem('hawiyah-guide-editor:button/primary:react:ts:en'))).toBeNull();
});

test('reset restores the original files and removes the drafts of the framework only', async ({ page }) => {
  await page.addInitScript(() => {
    // The init script also runs in the sandboxed result frame, which has no storage.
    if (window.top !== window) return;
    window.localStorage.setItem('hawiyah-guide-editor:button/primary:vue:ts:en', JSON.stringify({ files: { 'Example.vue': 'x', 'main.ts': 'y' }, savedAt: 1 }));
  });
  await openEditor(page, 'en', 'framework=react');
  await originalRan(page, 'en');
  await appendTo(page, 'Example.tsx', '\n// edited\n');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('hawiyah-guide-editor:button/primary:react:ts:en'))).not.toBeNull();
  await page.getByRole('button', { name: 'Reset to the original example' }).click();
  await originalRan(page, 'en');
  await expect(await codeOf(page, 'Example.tsx')).not.toContainText('// edited');
  expect(await page.evaluate(() => window.localStorage.getItem('hawiyah-guide-editor:button/primary:react:ts:en'))).toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem('hawiyah-guide-editor:button/primary:vue:ts:en'))).not.toBeNull();
});

test('choosing a framework and a language opens that project and updates the address', async ({ page }) => {
  await openEditor(page, 'en');
  await originalRan(page, 'en');
  await page.getByRole('group', { name: 'Framework' }).getByText('Vue', { exact: true }).click();
  await expect(page.getByRole('tab')).toHaveText(['Example.vue', 'main.ts']);
  await originalRan(page, 'en');
  expect(new URL(page.url()).search).toBe('?example=button/primary&framework=vue&language=ts');
  await page.getByRole('group', { name: 'Language' }).getByText('JavaScript', { exact: true }).click();
  await expect(page.getByRole('tab')).toHaveText(['Example.vue', 'main.js']);
  await originalRan(page, 'en');
  const code = await codeOf(page, 'Example.vue');
  await expect(code).toContainText("import { Button } from '@hawiyah/vue';");
  await expect(code).not.toContainText('lang="ts"');
});

test('unknown query values show the default example with an information alert', async ({ page }) => {
  await openEditor(page, 'en', 'example=button/none&framework=svelte');
  await expect(page.getByText('Part of the address named an example, framework, language or runtime that the editor does not have')).toBeVisible();
  await originalRan(page, 'en');
  await expect(page.getByRole('tab')).toHaveText(['example.component.ts', 'main.ts']);
});

test('another example of the pilot pages opens from the query', async ({ page }) => {
  await openEditor(page, 'ar', 'example=tabs/basic&framework=vanilla');
  await originalRan(page, 'ar');
  // A group directly under the Example section is named by its own name.
  await expect(page.locator('hw-page-header p')).toHaveText('تبويبات: basic');
  await expect(page.getByRole('tab', { name: 'index.html' })).toBeVisible();
});

test('download saves the file shown', async ({ page }) => {
  await openEditor(page, 'en', 'framework=react');
  await originalRan(page, 'en');
  await codeOf(page, 'main.tsx');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download the current file' }).click();
  expect((await download).suggestedFilename()).toBe('main.tsx');
});

test('on a phone the visual order is the order of the document and nothing scrolls sideways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openEditor(page, 'ar');
  await originalRan(page, 'ar');
  const box = async (locator: ReturnType<typeof page.locator>) => (await locator.boundingBox())!.y;
  const toolbar = await box(page.getByRole('group', { name: 'أدوات المحرر' }));
  const status = await box(page.locator('guide-editor-status'));
  const tabs = await box(page.getByRole('tablist', { name: 'الملفات' }));
  const result = await box(page.getByRole('group', { name: 'النتيجة' }));
  const log = await box(page.getByRole('log'));
  // Toolbar with Run, then the status line that tells the outcome, the code, the result and the log.
  expect([toolbar, status, tabs, result, log]).toEqual([toolbar, status, tabs, result, log].sort((a, b) => a - b));
  expect(status).toBeLessThan(tabs);
  expect(tabs).toBeLessThan(result);
  // The order of the document is the same.
  const order = await page.evaluate(() => {
    const items = ['guide-editor-toolbar', 'guide-editor-status', '#editor-files', 'guide-editor-page [role="group"][aria-label="النتيجة"]', 'guide-editor-log'].map((s) => document.querySelector(s)!);
    return items.every((item, i) => i === 0 || items[i - 1]!.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

for (const lang of ['en', 'ar'] as const satisfies readonly Lang[]) {
  for (const mode of ['light', 'dark'] as const) {
    test(`axe: ${lang} ${mode} with a result and a log entry`, async ({ page }) => {
      await presetMode(page, mode);
      await openEditor(page, lang, 'framework=react');
      await originalRan(page, lang);
      await appendTo(page, 'main.tsx', "\nconsole.info('axe');\n");
      await page.keyboard.press('Control+Enter');
      await expect(statusLine(page)).toHaveText(TEXT[lang].yourCodeRan, { timeout: 30_000 });
      await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining('axe'));
      expect(await axeWithFrame(page)).toEqual([]);
    });
  }
}

// Visible focus (WCAG 2.4.7) on the two guide-owned surfaces of the editor: the code
// (the CodeMirror editor draws the ring) and the result frame (its container draws
// the ring while focus is in the frame's document), in both colour modes.
for (const mode of ['light', 'dark'] as const) {
  test(`the focused code and the focused result show a visible focus indicator (${mode})`, async ({ page }) => {
    await presetMode(page, mode);
    await openEditor(page, 'en', 'framework=vanilla');
    await originalRan(page, 'en');
    await expect(page.locator('html')).toHaveAttribute('data-hw-mode', mode);
    const focusColour = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--hw-color-focus)';
      document.body.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });
    const ring = (selector: string) =>
      page.locator(selector).first().evaluate((element) => {
        const style = getComputedStyle(element);
        return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), colour: style.outlineColor };
      });
    // From Run, Tab reaches the code (after the status line's copy button and the file tab).
    const code = page.getByRole('textbox', { name: /^Code of/ });
    await code.focus();
    await expect(page.locator('.cm-editor').first()).toHaveClass(/cm-focused/);
    expect(await ring('.cm-editor')).toEqual({ style: 'solid', width: 2, colour: focusColour });
    // Escape then Tab leaves the code; the next stop is the result frame.
    await page.keyboard.press('Escape');
    await page.keyboard.press('Tab');
    await expect.poll(() => page.evaluate(() => document.activeElement?.localName)).toBe('iframe');
    // The page learns that focus went into the frame from its window's events.
    await expect.poll(() => ring('guide-preview-frame .frame')).toEqual({ style: 'solid', width: 2, colour: focusColour });
    // Tab on out of the frame (past the example's own controls): the ring goes.
    for (let presses = 0; presses < 5 && (await page.evaluate(() => document.activeElement?.localName)) === 'iframe'; presses += 1) {
      await page.keyboard.press('Tab');
    }
    await expect(page.getByRole('button', { name: 'Clear the log' })).toBeFocused();
    await expect.poll(async () => (await ring('guide-preview-frame .frame')).style).toBe('none');
  });
}

