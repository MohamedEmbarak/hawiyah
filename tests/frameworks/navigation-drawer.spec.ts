import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('native navigation drawer composes user content, page links and modal focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?preview=portal');
  const showcase = page.getByTestId('navigation-drawer-showcase');
  const trigger = showcase.getByTestId('navigation-drawer-trigger');
  const dialog = showcase.locator('dialog');
  for (const english of [false, true]) {
    if (english) await page.getByRole('button', { name: 'English', exact: true }).click();
    await trigger.click(); await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(true);
    await expect(dialog.locator('.hw-navigation-drawer-user')).toHaveText(english ? 'Welcome to Hawiyah' : 'مرحبًا بك في هوية');
    const bounds = await dialog.boundingBox(); expect(bounds!.width).toBeCloseTo(327, 0);
    expect(bounds!.x).toBeCloseTo(english ? 0 : 390 - 327, 0);
    expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    await expect(dialog.locator('[aria-current="page"]')).toHaveText(english ? 'Home' : 'الرئيسية');
    await expect(dialog.locator('[aria-disabled="true"]')).not.toHaveAttribute('href');
    await dialog.locator('summary').focus(); await page.keyboard.press('Enter');
    // The disclosure keeps its native state when reopened, so toggle only if needed.
    if (!(await dialog.locator('details').evaluate(node => (node as HTMLDetailsElement).open))) await dialog.locator('summary').press('Enter');
    await dialog.locator('details a').first().click();
    await expect(dialog).toBeHidden(); await expect(page).toHaveURL(/#services$/);
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(false);
    await trigger.click();
    expect((await new AxeBuilder({ page }).include('[data-testid="navigation-drawer-showcase"] dialog').analyze()).violations).toEqual([]);
    await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  }
});
