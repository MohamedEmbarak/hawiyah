import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['ar', 'en']) test(`NIC cards preserve source geometry and native link behavior in ${locale}`, async ({ page }, testInfo) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?preview=nic');
  expect(errors).toEqual([]);
  await expect(page.getByTestId('nic-showcase')).toBeVisible();
  if (locale === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
  const scope = page.getByTestId('nic-showcase');
  const card = (id: string) => page.locator(`[data-testid="${id}"].nq-card, [data-testid="${id}"] > .nq-card`);
  const base = card('base-card'), outlined = card('border-card'), action = card('action-card'), disabled = card('disabled-card');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(base).toHaveCSS('padding', '16px');
    await expect(base).toHaveCSS('gap', width < 768 ? '16px' : '24px');
    await expect(base).toHaveCSS('border-radius', '16px');
    await expect(base).toHaveCSS('border-top-width', '2px');
    await expect(base.locator('.nq-card-header')).toHaveCSS('padding', '0px');
    await expect(base.locator('.nq-card-body')).toHaveCSS('padding', '0px');
    await expect(base.locator('.nq-card-footer')).toHaveCSS('padding', '0px');
    await expect(base.locator('h2')).toHaveCSS('font-size', '18px');
    await expect(base.locator('h2')).toHaveCSS('line-height', '28px');
    await expect(base.locator('h2')).toHaveCSS('font-weight', '700');
    await expect(base.locator('p')).toHaveCSS('font-size', '16px');
    await expect(base.locator('p')).toHaveCSS('line-height', '24px');
    await expect(outlined).toHaveCSS('box-shadow', 'none');
    await expect(outlined).toHaveCSS('border-top-color', 'rgb(210, 214, 219)');
    expect(await scope.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
  for (const mode of ['light', 'dark']) {
    await scope.evaluate((node, mode) => node.setAttribute('data-nq-mode', mode), mode);
    await action.hover();
    await expect(action).toHaveCSS('background-color', mode === 'light' ? 'rgb(249, 250, 251)' : 'rgb(56, 66, 80)');
    await action.focus();
    await expect(action).toHaveCSS('background-color', mode === 'light' ? 'rgb(255, 255, 255)' : 'rgb(31, 42, 55)');
    await expect(action).toHaveCSS('outline-color', mode === 'light' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)');
    await expect(action).toHaveCSS('outline-width', '2px');
    await page.keyboard.press('Tab');
    expect((await new AxeBuilder({ page }).include('[data-testid="nic-showcase"]').analyze()).violations).toEqual([]);
  }
  await action.focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#card-destination$/);
  await expect(page.locator('#card-destination')).toBeFocused();
  await expect(disabled).toHaveAttribute('role', 'link');
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await expect(disabled).not.toHaveAttribute('href');
  expect(await disabled.evaluate(node => node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })))).toBe(false);
  await expect(page.getByTestId('card-activations')).toHaveText('0');
  await page.getByTestId('toggle-card').click();
  await expect(disabled).toHaveAttribute('href', '#disabled-destination');
  await disabled.click(); await expect(page.getByTestId('card-activations')).toHaveText('1');
  await expect(page).toHaveURL(/#disabled-destination$/);
  await scope.evaluate(node => { node.setAttribute('data-nq-theme', 'nasaq'); node.setAttribute('data-nq-mode', 'light'); });
  await expect(base).toHaveCSS('padding', '0px');
  await expect(base).toHaveCSS('gap', '0px');
  await expect(base).toHaveCSS('border-radius', '14px');
  await scope.evaluate(node => node.setAttribute('data-nq-theme', 'custom'));
  await expect(base).toHaveCSS('padding', '16px');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await action.focus(); await expect(action).toHaveCSS('outline-style', 'solid');
  await page.emulateMedia({ forcedColors: 'none' });
  await scope.evaluate(node => { node.setAttribute('data-nq-theme', 'dga'); node.setAttribute('data-nq-mode', 'light'); });
  await page.screenshot({ path: testInfo.outputPath(`nic-cards-${locale}.png`), fullPage: true });
});
