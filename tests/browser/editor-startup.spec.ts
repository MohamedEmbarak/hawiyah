import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.addInitScript(() => {
    if (window === window.top) localStorage.setItem('nasaq-locale','en');
  });
});

test('a slow preview can acknowledge startup after the timeout', async ({page}) => {
  test.setTimeout(120000);
  await page.addInitScript(() => {
    if (window !== window.top) return;
    let acknowledgement: MessageEvent | undefined;
    window.addEventListener('message', event => {
      if (!event.isTrusted || event.data?.channel !== 'nasaq-component-preview' || event.data.type !== 'ready') return;
      event.stopImmediatePropagation();
      acknowledgement = event;
      document.documentElement.dataset.previewAcknowledged = '';
    }, true);
    window.addEventListener('release-preview-acknowledgement', () => {
      if (acknowledgement) window.dispatchEvent(new MessageEvent('message', {
        data: acknowledgement.data, source: acknowledgement.source, origin: acknowledgement.origin,
      }));
    });
  });
  await page.goto('/#component/button');
  await page.locator('[data-guide-tab="playground"]').click();
  const status = page.locator('.nq-ide-status');
  await expect(page.locator('html')).toHaveAttribute('data-preview-acknowledged','',{timeout:45000});
  await expect(status).toHaveText('The preview is still starting…',{timeout:15000});
  await expect(status).toHaveAttribute('data-state','running');
  await expect(status).toHaveText('The preview has not responded. You can run the example again.',{timeout:40000});
  await expect(status).toHaveAttribute('data-state','error');
  await page.evaluate(() => window.dispatchEvent(new Event('release-preview-acknowledgement')));
  await expect(status).toHaveAttribute('data-state','ready');
  await expect(page.locator('.nq-ide-console')).toBeEmpty();
});

test('a successfully started script that reports a real error keeps its error visible', async ({page}) => {
  test.setTimeout(90000);
  await page.goto('/#component/button');
  await page.locator('[data-guide-tab="playground"]').click();
  const status = page.locator('.nq-ide-status');
  await expect(status).toHaveAttribute('data-state','ready',{timeout:45000});
  await page.locator('[data-ide-auto]').uncheck();
  await page.locator('[data-ide-file="js"]').click();
  await page.locator('[data-ide-editor="js"] .cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText("console.error('Fixture initialization failed');");
  await page.locator('[data-ide-run]').click();
  await expect(status).toHaveAttribute('data-state','error');
  await expect(page.locator('.nq-ide-console')).toContainText('Fixture initialization failed');
  await expect(page.locator('.nq-ide-console')).toBeVisible();
});
