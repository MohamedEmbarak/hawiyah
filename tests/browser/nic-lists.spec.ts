import { expect, test, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const variants = ['icon', 'custom', 'ordered'] as const;
type Variant = typeof variants[number];

test('a nested original-theme Card keeps authored list markers decorative', async ({ page }) => {
  await page.goto('/#component/card');
  const scope = page.locator('#component-examples');
  await scope.evaluate(el => {
    el.setAttribute('data-nq-theme', 'dga');
    el.setAttribute('data-nq-mode', 'dark');
  });
  const card = scope.locator('.component-preview .nq-card').first();
  await card.evaluate(el => {
    el.setAttribute('data-nq-theme', 'nasaq');
    el.setAttribute('data-nq-mode', 'light');
    (el as HTMLElement).style.setProperty('--nq-list-marker-size', '20px');
  });
  const marker = card.locator('.nq-list-marker').first();
  await expect(marker).toHaveCSS('color', await card.evaluate(el => getComputedStyle(el).color));
  await expect(marker).toHaveCSS('width', '20px');
  expect(await marker.evaluate(el => getComputedStyle(el, '::before').content)).toBe('""');
  await marker.evaluate(el => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', '10'); circle.setAttribute('cy', '10'); circle.setAttribute('r', '4');
    circle.setAttribute('fill', 'currentColor');
    svg.append(circle); el.append(svg);
  });
  await expect(marker).toHaveAttribute('aria-hidden', 'true');
  await expect(marker.locator('svg')).toHaveCSS('width', '20px');
  expect(await marker.evaluate(el => getComputedStyle(el, '::before').content)).toBe('none');
  // The neighboring card retains its own marker size and inherits the outer theme.
  await expect(scope.locator('ul.nq-list-custom .nq-list-marker').first()).toHaveCSS('width', '16px');
});

async function checkList(card: Locator, variant: Variant) {
  const list = card.locator(`.nq-card-body > .nq-list-${variant}`);
  await expect(list).toBeVisible();
  await expect(list).toHaveAccessibleName(await card.locator('.nq-card-title').innerText());
  await expect(list.locator(':scope > li')).toHaveCount(3);
  const first = list.locator(':scope > li').first();

  if (variant === 'ordered') {
    await expect(list).toHaveJSProperty('tagName', 'OL');
    await expect(list).toHaveAttribute('start', '2');
    await expect(list).toHaveCSS('margin-inline-start', '5px');
    await expect(first).toHaveCSS('list-style-type', 'decimal');
    await expect(list.locator('.nq-list-marker')).toHaveCount(0);
    return list;
  }

  await expect(list).toHaveJSProperty('tagName', 'UL');
  await expect(list).toHaveAttribute('role', 'list');
  await expect(list.locator(':scope > li > .nq-list-marker[aria-hidden="true"]')).toHaveCount(3);
  const marker = first.locator(':scope > .nq-list-marker');
  await expect(marker).toBeEmpty();
  await expect(marker).toHaveCSS('width', '16px');
  await expect(marker).toHaveCSS('font-size', '16px');
  expect(await marker.evaluate(el => getComputedStyle(el, '::before').content)).toBe('""');
  await expect(first).toHaveCSS('list-style-type', 'none');
  if (variant === 'icon') {
    await expect(list).toHaveCSS('margin-inline-start', '5px');
    await expect(first).toHaveCSS('padding-inline-start', '30px');
    await expect(marker).toHaveCSS('height', '28px');
    await expect(marker).toHaveCSS('line-height', '28px');
    const nested = list.locator('ol.nq-list-ordered');
    await expect(nested.getByRole('listitem')).toHaveCount(2);
    await expect(nested.locator('li').first()).toHaveCSS('list-style-type', 'decimal');
  } else {
    await expect(list).toHaveCSS('margin-inline-start', '0px');
    await expect(list).toHaveCSS('padding-inline-start', '20px');
    await expect(marker).toHaveCSS('position', 'relative');
    await expect(marker).toHaveCSS('inset-block-start', '1px');
  }
  return list;
}

for (const locale of ['ar', 'en'] as const) {
  test(`NIC list geometry and semantics in ${locale}`, async ({ page }, info) => {
    test.setTimeout(90000);
    await page.addInitScript(language => {
      if (window !== window.top) return;
      localStorage.setItem('nasaq-locale', language);
      localStorage.setItem('nasaq-mode', 'light');
    }, locale);
    await page.goto('/#component/card');
    const scope = page.locator('#component-examples');
    const examples = scope.locator('.ready-example');
    await expect(examples).toHaveCount(3);
    await expect(scope.locator('.source-details pre')).toHaveCount(12);
    for (const [index, variant] of variants.entries()) {
      await checkList(examples.nth(index).locator('.component-preview .nq-card'), variant);
    }
    const iconList = scope.locator('ul.nq-list-icon');
    const first = iconList.locator(':scope > li').first();
    const marker = first.locator(':scope > .nq-list-marker');
    for (const direction of ['rtl', 'ltr']) {
      await iconList.evaluate((el, value) => el.setAttribute('dir', value), direction);
      const itemBox = (await first.boundingBox())!;
      const markerBox = (await marker.boundingBox())!;
      const start = (box: typeof itemBox) => direction === 'rtl' ? box.x + box.width : box.x;
      expect(start(markerBox)).toBeCloseTo(start(itemBox), 1);
      expect(markerBox.y).toBeCloseTo(itemBox.y, 1);
    }
    await iconList.evaluate(el => el.removeAttribute('dir'));
    for (const mode of ['light', 'dark']) {
      await scope.evaluate((el, mode) => {
        el.setAttribute('data-nq-mode', mode);
        el.style.background = 'var(--nq-color-surface)';
      }, mode);
      await expect(marker).toHaveCSS('color', await first.evaluate(el => getComputedStyle(el).color));
      expect((await new AxeBuilder({ page }).include('#component-examples .component-preview').analyze()).violations).toEqual([]);
    }
    await scope.evaluate(el => {
      el.removeAttribute('data-nq-mode');
      el.setAttribute('data-nq-theme', 'custom');
      el.style.setProperty('--nq-list-icon-indent', '36px');
    });
    await expect(first).toHaveCSS('padding-inline-start', '36px');
    await scope.evaluate(el => {
      el.removeAttribute('data-nq-theme');
      el.style.removeProperty('--nq-list-icon-indent');
    });
    await page.setViewportSize({ width: 320, height: 844 });
    for (const list of await scope.locator('.nq-card-body > :is(ol,ul)').all()) {
      expect(await list.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
    await examples.first().screenshot({ path: info.outputPath(`card-list-${locale}-mobile.png`) });
    await page.emulateMedia({ forcedColors: 'active' });
    expect(await marker.evaluate(el => getComputedStyle(el, '::before').borderStyle)).toBe('solid');
    await expect(page).toHaveURL(/#component\/card$/);
  });
}

for (const [framework, language, sourceIndex] of [
  ['react', 'javascript', 1], ['react', 'typescript', 1],
  ['vue', 'javascript', 2], ['vue', 'typescript', 2], ['angular', 'typescript', 3],
] as const) {
  test(`${framework} ${language} renders the three copied Card list recipes`, async ({ page }) => {
    test.setTimeout(180000);
    await page.goto('/#component/card');
    const examples = page.locator('#component-examples .ready-example');
    await expect(examples).toHaveCount(3);
    const sources: string[] = [];
    for (const example of await examples.all()) {
      sources.push((await example.locator('.source-details pre code').nth(sourceIndex).textContent())!);
    }
    await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
    const status = page.locator('.nq-ide-status');
    await expect(status).toHaveAttribute('data-state', 'ready', { timeout: 45000 });
    await page.locator('[data-ide-auto]').uncheck();
    await page.locator('[data-ide-file="html"]').click();
    const editor = page.locator('[data-ide-editor="html"] .cm-content');
    for (const [index, variant] of variants.entries()) {
      await editor.click();
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.insertText(sources[index]!);
      await page.locator('[data-ide-run]').click();
      await expect(status).toHaveAttribute('data-state', 'ready', { timeout: 45000 });
      const card = page.frameLocator('.nq-ide-frame').locator('.nq-card');
      await checkList(card, variant);
    }
    await expect(page).toHaveURL(/#component\/card$/);
  });
}
