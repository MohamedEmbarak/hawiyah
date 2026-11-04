import {expect, type Locator, type Page} from '@playwright/test';

export async function frameWidth(page: Page, project: Locator, width: number) {
  // The IDE normally gives the preview half the card. Resize its actual browsing
  // context so the project's viewport media queries cross each documented breakpoint.
  await page.evaluate(pixels => {
    let style = document.querySelector<HTMLStyleElement>('style[data-test-frame-width]');
    if (!style) {
      style = document.createElement('style');
      style.dataset.testFrameWidth = '';
      document.head.append(style);
    }
    // The project editor can replace its iframe when a language finishes compiling.
    style.textContent = `.nq-ide-preview-stage iframe.nq-ide-frame { inline-size: ${pixels}px !important; min-inline-size: ${pixels}px !important; max-inline-size: ${pixels}px !important; flex-shrink: 0 !important; }`;
  }, width);
  const frame = page.locator('.nq-ide-frame');
  // Chromium can defer layout for an off-screen embedded document. Flush the
  // host's geometry, expose the frame, then compare the two browsing contexts.
  await frame.scrollIntoViewIfNeeded();
  const hostWidth = await frame.evaluate(node => node.clientWidth);
  expect(hostWidth).toBeGreaterThanOrEqual(width - 3);
  expect(hostWidth).toBeLessThanOrEqual(width + 1);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect.poll(() => project.evaluate(node => node.ownerDocument.defaultView!.innerWidth), {timeout: 15000}).toBe(hostWidth);
}
