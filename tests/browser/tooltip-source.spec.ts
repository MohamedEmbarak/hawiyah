import {expect, test} from '@playwright/test';

const projects = [
  ['vanilla', 'javascript'], ['vanilla', 'typescript'],
  ['react', 'javascript'], ['react', 'typescript'],
  ['vue', 'javascript'], ['vue', 'typescript'], ['angular', 'typescript'],
] as const;

for (const [framework, language] of projects) test(`tooltip source surface in ${framework} ${language}`, async ({page}, testInfo) => {
  test.setTimeout(120000);
  await page.setViewportSize({width: 1920, height: 1200});
  await page.addInitScript(() => {
    if (window === window.top) { localStorage.setItem('hawiyah-locale', 'en'); localStorage.setItem('hawiyah-mode', 'light'); }
  });
  await page.goto('/#component/tooltip');
  await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption(framework);
  if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', {timeout: 45000});
  const frame = page.frameLocator('.hw-ide-frame');
  const root = frame.locator('[data-disclosure-project="tooltip"]');
  const trigger = root.locator('[aria-describedby]').first();
  const tip = root.locator('[role="tooltip"]').first();
  await trigger.focus();
  await expect(tip).toBeVisible();
  const measurements = await tip.evaluate(element => {
    const reference = element.ownerDocument.createElement('span');
    reference.textContent = element.textContent;
    reference.style.cssText = 'display:block;box-sizing:border-box;width:max-content;min-width:160px;max-width:240px;padding:8px;border-radius:4px;background:#fff;color:#384250;font-family:inherit;font-size:12px;font-weight:500;line-height:18px;box-shadow:0 4px 6px -2px rgb(16 24 40 / .03),0 12px 16px -4px rgb(16 24 40 / .08)';
    reference.setAttribute('data-source-tooltip-reference', '');
    const sourceGroup = element.ownerDocument.createElement('span');
    const caption = element.ownerDocument.createElement('small');
    caption.textContent = 'Decoded source fixture';
    sourceGroup.style.cssText = 'display:block;margin-inline-start:24px';
    sourceGroup.append(caption, reference);
    element.parentElement!.append(sourceGroup);
    const properties = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderRadius', 'fontSize', 'lineHeight', 'fontWeight', 'backgroundColor', 'color', 'boxShadow'] as const;
    const actual = getComputedStyle(element);
    const source = getComputedStyle(reference);
    return {actual: Object.fromEntries(properties.map(key => [key, actual[key]])), source: Object.fromEntries(properties.map(key => [key, source[key]])), width: element.getBoundingClientRect().width, sourceWidth: reference.getBoundingClientRect().width};
  });
  expect(measurements.actual).toEqual(measurements.source);
  expect(measurements.width).toBeCloseTo(measurements.sourceWidth, 1);
  await root.screenshot({path: testInfo.outputPath('tooltip-source-comparison.png')});
  if (framework === 'vanilla' && language === 'javascript') {
    await root.evaluate(node => node.setAttribute('data-hw-mode', 'dark'));
    await expect(tip).toHaveCSS('background-color', 'rgb(31, 42, 55)');
    await root.evaluate(node => { node.setAttribute('data-hw-mode', 'light'); node.setAttribute('data-hw-theme', 'hawiyah'); });
    await expect(tip).toHaveCSS('padding-inline-start', '12px');
    await expect(tip).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await trigger.evaluate(node => node.parentElement!.setAttribute('data-hw-theme', 'dga'));
    await expect(tip).toHaveCSS('padding-inline-start', '8px');
    await expect(tip).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  }
  await trigger.press('Escape');
  await expect(tip).toBeHidden();
  await expect(trigger).toBeFocused();
});
