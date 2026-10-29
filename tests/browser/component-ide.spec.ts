import { expect, test, type Page } from '@playwright/test';

type EditorFile = 'html' | 'css' | 'js';

async function openIDE(page: Page, component = 'button') {
  await page.goto(`/#component/${component}`);
  await expect(page.locator('.nq-ide')).toHaveCount(0);
  await page.locator('[data-guide-tab="playground"]').click();
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state', 'ready', { timeout: 15_000 });
}

async function editFile(page: Page, file: EditorFile, value: string) {
  await page.locator(`[data-ide-file="${file}"]`).click();
  await page.locator(`[data-ide-editor="${file}"] .cm-content`).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(value);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window !== window.top) return;
    localStorage.setItem('nasaq-locale', 'ar');
    localStorage.setItem('nasaq-mode', 'light');
  });
});

test('HTML, CSS and JavaScript edits run together, recover from errors, and reset to the example', async ({ page }) => {
  await openIDE(page);
  const preview = page.frameLocator('.nq-ide-frame');
  const status = page.locator('.nq-ide-status');
  await page.locator('[data-ide-auto]').uncheck();
  await editFile(page, 'html', '<button id="demo" class="nq-button" type="button">انقر</button> <output id="counter">0</output>');
  // Wait longer than the automatic debounce: manual mode must leave the running document intact.
  await page.waitForTimeout(800);
  await expect(preview.locator('#demo')).toHaveCount(0);
  await expect(status).toHaveAttribute('data-state', 'edited');
  await editFile(page, 'css', '#demo { background: rgb(176, 0, 32); color: white; }');
  await editFile(page, 'js', `
    let count = 0;
    document.querySelector('#demo').addEventListener('click', () => {
      document.querySelector('#counter').textContent = String(++count);
    });
    console.info('interactive ready');
  `);
  await page.locator('[data-ide-run]').click();
  await expect(preview.locator('#demo')).toBeVisible();
  await preview.locator('#demo').click();
  await expect(preview.locator('#counter')).toHaveText('1');
  await expect(preview.locator('#demo')).toHaveCSS('background-color', 'rgb(176, 0, 32)');
  await expect(page.locator('.nq-ide-console')).toContainText('interactive ready');

  await page.locator('[data-ide-editor="js"] .cm-content').click();
  await page.keyboard.press('ControlOrMeta+Enter');
  await expect(preview.locator('#counter')).toHaveText('0');
  await editFile(page, 'js', 'throw new Error("intentional preview error")');
  await page.locator('[data-ide-run]').click();
  await expect(status).toHaveAttribute('data-state', 'error');
  await expect(page.locator('.nq-ide-console')).toBeVisible();
  await expect(page.locator('.nq-ide-console')).toContainText('intentional preview error');

  await page.locator('[data-ide-reset]').click();
  await expect(status).toHaveAttribute('data-state', 'ready');
  await expect(preview.locator('#demo')).toHaveCount(0);
  await expect(preview.locator('.nq-button')).toHaveCount(2);
  await expect(page.locator('[data-ide-file="html"]')).toHaveAttribute('aria-selected', 'true');
  await page.locator('[data-ide-auto]').check();
  await editFile(page, 'html', '<p id="auto-result">تحديث تلقائي</p>');
  await expect(preview.locator('#auto-result')).toHaveText('تحديث تلقائي');
  await expect(status).toHaveAttribute('data-state', 'ready');
});

test('the opaque preview blocks parent access and external resources, and ignores forged status messages', async ({ page }) => {
  const failures: string[] = [];
  const responses: string[] = [];
  page.on('requestfailed', request => {
    if (request.url().startsWith('https://example.test/')) failures.push(request.failure()?.errorText ?? '');
  });
  page.on('response', response => {
    if (response.url().startsWith('https://example.test/')) responses.push(response.url());
  });
  await openIDE(page);
  await expect(page.locator('.nq-ide-frame')).toHaveAttribute('sandbox', 'allow-scripts');
  await page.locator('[data-ide-auto]').uncheck();
  await editFile(page, 'js', `
    try { parent.document.body.dataset.compromised = 'yes'; }
    catch { console.log('parent access blocked'); }
  `);
  await page.locator('[data-ide-run]').click();
  await expect(page.locator('.nq-ide-console')).toContainText('parent access blocked');
  await expect(page.locator('body')).not.toHaveAttribute('data-compromised');

  await editFile(page, 'js', `
    fetch('https://example.test/blocked').catch(() => console.info('fetch blocked'));
    const external = document.createElement('script');
    external.nonce = document.querySelector('script[nonce]').nonce;
    external.src = 'https://example.test/probe.js';
    document.head.append(external);
  `);
  await page.locator('[data-ide-run]').click();
  await expect(page.locator('.nq-ide-console')).toContainText('connect-src');
  await expect(page.locator('.nq-ide-console')).toContainText('script-src');
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state', 'error');
  expect(responses).toEqual([]);
  // Chromium can report an attempted request before CSP rejects it; it must never receive a response.
  expect(failures).not.toEqual([]);
  expect(failures.every(error => /csp/i.test(error))).toBe(true);

  await page.evaluate(() => {
    const frame = document.querySelector<HTMLIFrameElement>('.nq-ide-frame')!;
    const token = frame.srcdoc.match(/"token":"([^"]+)"/)![1];
    const run = Number(frame.srcdoc.match(/"run":(\d+)/)![1]);
    const data = { channel: 'nasaq-component-preview', token, run, type: 'ready' };
    // Correct source with the wrong token, then correct token with the wrong source.
    window.dispatchEvent(new MessageEvent('message', { source: frame.contentWindow, data: { ...data, token: 'wrong' } }));
    window.dispatchEvent(new MessageEvent('message', { source: window, data }));
  });
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state', 'error');
});

test('the real enhancer works inside the preview, tab switches preserve edits, and navigation removes the editor', async ({ page }) => {
  await openIDE(page, 'password-field');
  const preview = page.frameLocator('.nq-ide-frame');
  await preview.locator('input').fill('example-password');
  await preview.locator('[data-nq-password-toggle]').click();
  await expect(preview.locator('input')).toHaveAttribute('type', 'text');
  await page.locator('[data-ide-auto]').uncheck();
  await editFile(page, 'html', '<p id="preserved">يبقى التعديل عند تغيير التبويب</p>');
  await page.locator('[data-guide-tab="preview"]').click();
  await page.locator('[data-guide-tab="playground"]').click();
  await expect(page.locator('[data-ide-editor="html"] .cm-content')).toContainText('id="preserved"');
  await page.locator('[data-ide-run]').click();
  await expect(preview.locator('#preserved')).toBeVisible();

  await page.evaluate(() => { location.hash = '#component/card'; });
  await expect(page.locator('.nq-ide')).toHaveCount(0);
  await expect(page.locator('.nq-ide-frame')).toHaveCount(0);
  await page.locator('[data-guide-tab="playground"]').click();
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state', 'ready');
  await expect(preview.locator('#preserved')).toHaveCount(0);
  await expect(preview.locator('.nq-card')).toBeVisible();
});

test('Arabic editor search, keyboard file tabs and phone preview remain usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openIDE(page);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.locator('[data-ide-file="html"]').focus();
  await page.keyboard.press('End');
  await expect(page.locator('[data-ide-file="js"]')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(page.locator('[data-ide-file="html"]')).toHaveAttribute('aria-selected', 'true');
  await page.locator('[data-ide-editor="html"] .cm-content').click();
  await page.keyboard.press('ControlOrMeta+f');
  await expect(page.locator('.cm-search input[name="search"]')).toHaveAttribute('aria-label', 'بحث');
  await page.keyboard.press('Escape');
  await page.locator('[data-ide-size]').selectOption('mobile');
  await expect(page.locator('.nq-ide-preview-stage')).toHaveAttribute('data-size', 'mobile');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('theme and navigation rerenders preserve all three edited files and inherit custom theme tokens', async ({ page }) => {
  await page.addInitScript(() => {
    if (window === window.top) localStorage.setItem('nasaq-theme', 'custom');
  });
  await openIDE(page);
  await page.locator('[data-ide-auto]').uncheck();
  await editFile(page, 'html', '<button id="draft" class="nq-button">مثال محفوظ</button>');
  await editFile(page, 'css', '#draft { border: 3px solid rgb(176, 0, 32); }');
  await editFile(page, 'js', 'document.querySelector("#draft").dataset.ready = "yes";');

  await page.locator('[data-action="mode"]').click();
  const preview = page.frameLocator('.nq-ide-frame');
  await expect(page.locator('[data-guide-tab="playground"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state', 'ready');
  await expect(preview.locator('html')).toHaveAttribute('data-nq-mode', 'dark');
  await expect(preview.locator('#draft')).toHaveAttribute('data-ready', 'yes');
  await expect(preview.locator('#draft')).toHaveCSS('border-top-color', 'rgb(176, 0, 32)');
  await expect(preview.locator('#draft')).toHaveCSS('background-color', 'rgb(164, 188, 253)');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.mobile-menu[data-action="menu"]').click();
  await page.locator('.sidebar-close[data-action="menu"]').click();
  await expect(preview.locator('#draft')).toHaveAttribute('data-ready', 'yes');
  await expect(page.locator('[data-ide-editor="html"] .cm-content')).toContainText('id="draft"');
  await page.locator('[data-ide-reset]').click();
  await expect(preview.locator('#draft')).toHaveCount(0);
  await expect(preview.locator('.nq-button')).toHaveCount(2);
});
