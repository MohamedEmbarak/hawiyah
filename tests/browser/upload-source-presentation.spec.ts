import {expect, test, type Locator} from '@playwright/test';

test.use({hasTouch: true, viewport: {width: 1920, height: 1080}});

// Reconstructed only from the local source row's geometry and literal colors.
// This fixture is independent of Hawiyah classes and does not assert icon parity.
const sourceRow = '<div id="source-upload" style="box-sizing:border-box;display:flex;align-items:center;gap:8px;width:328px;min-height:36px;padding:7px;border:1px solid #D2D6DB;border-radius:4px;background:#F3F4F6;color:#161616;font-size:14px;font-weight:500;line-height:20px"><span style="width:20px;height:20px;flex:none;border:1.5px solid currentColor;border-radius:50%;box-sizing:border-box"></span><span style="flex:1;min-width:0">document.pdf</span><span style="width:20px;height:20px;flex:none">×</span></div>';

async function metrics(row: Locator) {
  return row.evaluate(element => {
    const style = getComputedStyle(element);
    return {height: element.getBoundingClientRect().height, background: style.backgroundColor,
      border: style.borderTopColor, radius: style.borderTopLeftRadius, gap: style.columnGap};
  });
}

for (const framework of ['vanilla', 'react', 'vue', 'angular']) test(`${framework} upload row follows local source dimensions and preserves messages`, async ({page}, info) => {
  test.setTimeout(120000);
  await page.goto('/#component/upload');
  await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption(framework);
  if (framework !== 'angular') await page.locator('[data-project-language]').selectOption('typescript');
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', {timeout: 60000});
  const frame = page.frameLocator('.hw-ide-frame');
  const transfers = frame.locator('section.demo .hw-upload-list');
  await transfers.evaluate(element => { (element as HTMLElement).style.width = '328px'; });
  const complete = transfers.locator('[data-status="complete"]');
  await expect(complete).toBeVisible();
  await page.evaluate(html => {
    const reference = document.createElement('section');
    reference.style.cssText = 'position:fixed;inset:16px auto auto 16px;z-index:2147483647';
    reference.innerHTML = html;
    document.body.append(reference);
  }, sourceRow);
  expect(await metrics(complete)).toEqual(await metrics(page.locator('#source-upload')));
  await expect(complete.locator('.hw-upload-name')).toHaveCSS('font-size', '14px');
  await expect(complete.locator('.hw-upload-name')).toHaveCSS('line-height', '20px');
  await expect(complete.locator('button')).toHaveAccessibleName(/.+/);
  await expect(complete.locator('button')).toHaveCSS('color', 'rgb(22, 22, 22)');
  expect(await complete.locator('button').evaluate(element => {
    const box = element.getBoundingClientRect();
    return [box.width, box.height];
  })).toEqual([20, 20]);
  await expect(transfers.locator('[data-status="error"] .hw-upload-status')).toBeVisible();
  await expect(transfers.locator('progress')).toHaveAttribute('value', '45');
  await transfers.screenshot({path: info.outputPath('rendered-upload-states.png'), timeout: 10000});
  await page.locator('#source-upload').screenshot({path: info.outputPath('reconstructed-source-row.png'), timeout: 10000});
  await complete.scrollIntoViewIfNeeded();
  const target = await complete.locator('button').boundingBox();
  expect(target).not.toBeNull();
  // Coarse-pointer target reaches beyond the unchanged 20px source icon.
  await page.mouse.click(target!.x + target!.width / 2, target!.y - 8);
  await expect(transfers.locator('[data-status="complete"]')).toHaveCount(0);
  await page.setViewportSize({width: 390, height: 844});
  await transfers.evaluate(element => {
    (element as HTMLElement).style.width = '100%';
    const name = element.querySelector('.hw-upload-name');
    if (name) name.textContent = 'long-filename-without-spaces-'.repeat(8) + '.pdf';
  });
  expect(await transfers.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});
