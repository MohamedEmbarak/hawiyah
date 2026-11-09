import { expect, test, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type Direction = 'rtl' | 'ltr';

function arrowImage(control: Locator, verifyAsset = false) {
  return control.evaluate(async (element, verifyAsset) => {
    const url = getComputedStyle(element).backgroundImage.match(/url\("([^"]+)"\)/)?.[1];
    if (!url) return '';
    if (verifyAsset) {
      const image = element.ownerDocument.createElement('img');
      image.src = url;
      await image.decode();
    }
    return url;
  }, verifyAsset);
}

async function expectPlacement(control: Locator, direction: Direction) {
  await expect(control).toHaveCSS('direction', direction);
  await expect(control).toHaveCSS('padding-inline-end', direction === 'rtl' ? '36px' : '35px');
  const position = await control.evaluate(element => getComputedStyle(element).backgroundPositionX.split(',').at(-1)?.trim());
  expect(position).toMatch(direction === 'rtl' ? /^(?:left )?12px$/ : /^(?:right 10px|calc\(100% - 10px\))$/);
}

async function exerciseSelects(scope: Locator, direction: Direction) {
  const examples = scope.locator('[data-select-demo]');
  await expect(examples).toHaveCount(6);
  for (const example of await examples.all()) {
    const control = example.locator('select');
    await expect(control).toHaveAccessibleName(/\S/);
    const descriptions = await example.locator('.hw-hint, .hw-error').allTextContents();
    expect(descriptions.length).toBeGreaterThan(0);
    await expect(control).toHaveAccessibleDescription(descriptions.join(' '));
    await expect(control.locator('option[value="unavailable"]')).toBeDisabled();
  }

  const control = (kind: string) => scope.locator(`[data-select-demo="${kind}"] select`);
  const single = control('single');
  await expect(single).toHaveValue('first');
  await expect(single).toHaveCSS('height', '40px');
  await expect(single).toHaveCSS('font-size', '14px');
  await expect(single).toHaveCSS('appearance', 'none');
  await expect(single).toHaveCSS('background-size', /18px 18px$/);
  await expectPlacement(single, direction);
  const down = await arrowImage(single, true);
  expect(down).not.toBe('');
  await single.focus();
  const up = await arrowImage(single, true);
  expect(up).not.toBe('');
  expect(up).not.toBe(down);
  await single.selectOption('second');
  await expect(single).toHaveValue('second');
  await single.press('Tab');
  expect(await arrowImage(single)).toBe(down);

  const required = control('required');
  await expect(required).toHaveValue('');
  await expect(required.locator('option[value=""]')).toHaveCount(1);
  expect(await required.evaluate((element: HTMLSelectElement) => element.validity.valueMissing)).toBe(true);
  await required.selectOption('third');
  expect(await required.evaluate((element: HTMLSelectElement) => element.validity.valid)).toBe(true);

  const error = control('error');
  await expect(error).toHaveAttribute('aria-invalid', 'true');
  await expect(scope.locator('[data-select-demo="error"] .hw-error')).toHaveCSS('font-size', '12px');
  await expect(scope.locator('[data-select-demo="single"] .hw-hint')).toHaveCSS('font-size', '10px');
  await expect(control('disabled')).toBeDisabled();

  const multiple = control('multiple');
  await expect(multiple).toHaveValues(['first', 'third']);
  await multiple.selectOption(['second', 'third']);
  await expect(multiple).toHaveValues(['second', 'third']);
  const listbox = control('listbox');
  await expect(listbox).toHaveAttribute('size', '3');
  await expect(listbox).toHaveValue('second');
  await listbox.press('Home');
  await expect(listbox).toHaveValue('first');
  await listbox.press('End');
  await expect(listbox).toHaveValue('third');
  for (const list of [multiple, listbox]) {
    await list.focus();
    await expect(list).not.toHaveCSS('appearance', 'none');
    expect(await arrowImage(list)).toBe('');
    expect((await list.boundingBox())!.height).toBeGreaterThan(40);
  }
  return single;
}

async function expectMobileFit(scope: Locator) {
  const controls = scope.locator('[data-select-demo] select');
  for (const control of await controls.all()) {
    expect(await control.evaluate(element => {
      const bounds = element.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= element.ownerDocument.documentElement.clientWidth + 1;
    })).toBe(true);
  }
}

for (const locale of ['ar', 'en'] as const) {
  test(`Select ready examples, themes and keyboard behavior in ${locale}`, async ({ page }, info) => {
    test.setTimeout(90000);
    await page.addInitScript(language => {
      if (window !== window.top) return;
      localStorage.setItem('hawiyah-locale', language);
      localStorage.setItem('hawiyah-mode', 'light');
    }, locale);
    await page.setViewportSize({ width: 1543, height: 1000 });
    await page.goto('/#component/select');
    const scope = page.locator('#component-examples');
    await expect(scope.locator('.source-details pre')).toHaveCount(24);
    const single = await exerciseSelects(scope, locale === 'ar' ? 'rtl' : 'ltr');
    for (const mode of ['light', 'dark']) {
      await scope.evaluate((element, mode) => {
        element.setAttribute('data-hw-mode', mode);
        element.style.background = 'var(--hw-color-surface)';
      }, mode);
      expect((await new AxeBuilder({ page }).include('#component-examples .component-preview').analyze()).violations).toEqual([]);
    }
    await scope.evaluate(element => element.removeAttribute('data-hw-mode'));
    const opposite = locale === 'ar' ? 'ltr' : 'rtl';
    await single.evaluate((element, direction) => element.dir = direction, opposite);
    await expectPlacement(single, opposite);
    await single.evaluate(element => element.removeAttribute('dir'));

    await scope.evaluate(element => element.setAttribute('data-hw-theme', 'hawiyah'));
    await single.focus();
    await expect(single).not.toHaveCSS('appearance', 'none');
    expect(await arrowImage(single)).toBe('');
    await scope.evaluate(element => element.removeAttribute('data-hw-theme'));
    await page.setViewportSize({ width: 320, height: 844 });
    await expectMobileFit(scope);
    await scope.locator('.ready-example').first().screenshot({ path: info.outputPath(`select-${locale}-mobile.png`) });
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await single.press('Tab');
    await single.press('Shift+Tab');
    await single.focus();
    await expect(single).toBeFocused();
    await expect(single).not.toHaveCSS('appearance', 'none');
    await expect(single).not.toHaveCSS('outline-style', 'none');
    expect(await arrowImage(single)).toBe('');
    await expect(page).toHaveURL(/#component\/select$/);
  });
}

const projects = [
  ['react', 'javascript', 'ar'], ['react', 'typescript', 'en'],
  ['vue', 'javascript', 'en'], ['vue', 'typescript', 'ar'], ['angular', 'typescript', 'en'],
] as const;

for (const [framework, language, locale] of projects) {
  test(`${framework} ${language} Select project in ${locale}`, async ({ page }) => {
    test.setTimeout(120000);
    await page.addInitScript(language => {
      if (window === window.top) localStorage.setItem('hawiyah-locale', language);
    }, locale);
    await page.setViewportSize({ width: 1864, height: 1000 });
    await page.goto('/#component/select');
    await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
    await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', { timeout: 45000 });
    const scope = page.frameLocator('.hw-ide-frame').locator('.demo');
    await exerciseSelects(scope, locale === 'ar' ? 'rtl' : 'ltr');
    await expect(scope.locator('[data-select-demo="single"] output')).toHaveText('second');
    await page.setViewportSize({ width: 390, height: 844 });
    await expectMobileFit(scope);
    await expect(page).toHaveURL(/#component\/select$/);
  });
}
