import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function checkNicButtons(page: Page) {
  const scope = page.getByTestId('nic-showcase');
  // A nested dark preview owns its backdrop; changing tokens alone does not paint it.
  await scope.evaluate(node => { node.style.background = 'var(--hw-color-canvas)'; node.style.color = 'var(--hw-color-text)'; });
  const button = (name: string) => page.locator(`[data-testid="button-${name}"].hw-button, [data-testid="button-${name}"] > .hw-button`);
  const cases = [
    ['primary', 'rgb(27, 131, 84)', 'rgb(22, 106, 69)', 'rgb(20, 87, 58)'],
    ['default', 'rgb(12, 17, 27)', 'rgb(31, 42, 55)', 'rgb(77, 87, 97)'],
    ['secondary', 'rgb(243, 244, 246)', 'rgb(229, 231, 235)', 'rgb(229, 231, 235)'],
    ['outline', 'rgba(0, 0, 0, 0)', 'rgb(210, 214, 219)', 'rgb(229, 231, 235)'],
    ['outline-white', 'rgba(0, 0, 0, 0)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.3)'],
    ['light', 'rgb(255, 255, 255)', 'rgb(243, 244, 246)', 'rgba(255, 255, 255, 0.7)'],
    ['danger', 'rgb(217, 44, 32)', 'rgb(180, 35, 24)', 'rgb(122, 38, 25)'],
  ];
  for (const [name, resting, hover, pressed] of cases) {
    const target = button(name!);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.mouse.move(0, 0);
    await expect(target).toHaveCSS('background-color', resting!);
    await target.hover(); await expect(target).toHaveCSS('background-color', hover!);
    await page.mouse.down(); await expect(target).toHaveCSS('background-color', pressed!);
    await expect(target).toHaveCSS('box-shadow', 'none');
    await page.mouse.up();
    // Establish keyboard modality, then verify focus remains while Space is held.
    await page.keyboard.press('Tab'); await target.focus();
    await expect(target).toHaveCSS('outline-width', '2px');
    await expect(target).toHaveCSS('outline-color', name === 'outline-white' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)');
    await page.keyboard.down('Space'); await expect(target).toHaveCSS('outline-width', '2px'); await page.keyboard.up('Space');
    await page.keyboard.press('Tab');
  }
  await expect(page.getByTestId('button-count')).toHaveText('14');
  for (const id of ['disabled', 'loading']) {
    await expect(button(id)).toBeDisabled();
    await button(id).evaluate(node => (node as HTMLButtonElement).click());
  }
  await expect(button('loading')).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByTestId('button-count')).toHaveText('14');
  await button('icon').focus(); await page.keyboard.press('Enter');
  await expect(page.getByTestId('button-count')).toHaveText('15');
  for (const mode of ['light', 'dark']) {
    await scope.evaluate((node, mode) => node.setAttribute('data-hw-mode', mode), mode);
    await page.keyboard.press('Tab'); await page.mouse.move(0, 0);
    // Colours are measured at rest: a mode change starts transitions, and a mid-transition frame is not a resting state.
    await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== 'running'));
    expect((await new AxeBuilder({ page }).include('[data-testid="button-showcase"]').analyze()).violations).toEqual([]);
    await button('secondary').hover();
    await expect(button('secondary')).toHaveCSS('background-color', mode === 'dark' ? 'rgb(77, 87, 97)' : 'rgb(229, 231, 235)');
  }
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await scope.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
  await scope.evaluate(node => { node.setAttribute('data-hw-theme', 'hawiyah'); node.setAttribute('data-hw-mode', 'light'); });
  await page.mouse.move(0, 0);
  await expect(button('secondary')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(button('secondary')).toHaveCSS('border-color', 'rgb(117, 142, 140)');
  await scope.evaluate(node => node.setAttribute('data-hw-theme', 'custom'));
  await expect(button('secondary')).toHaveCSS('background-color', 'rgb(243, 244, 246)');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await button('primary').focus(); await expect(button('primary')).toHaveCSS('outline-style', 'solid');
  await expect(button('disabled')).toHaveCSS('border-top-style', 'solid');
}
