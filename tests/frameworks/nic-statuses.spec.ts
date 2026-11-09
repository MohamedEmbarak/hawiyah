import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const locale of ['ar','en']) test(`five status types and ready header/footer work in ${locale}`, async ({page}) => {
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/?preview=nic');
  if(locale==='en')await page.getByRole('button',{name:'English',exact:true}).click();
  const scope=page.getByTestId('nic-showcase');
  const alert=(tone:string)=>page.locator(`[data-testid="alert-${tone}"].hw-alert, [data-testid="alert-${tone}"] > .hw-alert`);
  for(const tone of ['neutral','info','success','warning','danger']) {
    await expect(alert(tone)).toBeVisible();
    await expect(alert(tone)).toHaveAttribute('data-tone',tone);
    const title=await alert(tone).locator('strong').boundingBox(),body=await alert(tone).locator('p').boundingBox();
    expect(body!.y).toBeGreaterThanOrEqual(title!.y+title!.height-1);
    await expect(page.locator(`[data-testid="status-showcase"] .hw-badge[data-tone="${tone}"]`)).toHaveAttribute('data-variant','dot');
    await expect(page.locator(`[data-testid="status-toasts"] .hw-toast[data-tone="${tone}"]`)).toBeVisible();
  }
  await expect(alert('outline')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await expect(alert('minimal')).toHaveCSS('border-top-width','0px');
  for(const mode of ['light','dark']) {
    await scope.evaluate((node,mode)=>node.setAttribute('data-hw-mode',mode),mode);
    expect((await new AxeBuilder({page}).include('[data-testid="status-showcase"]').include('[data-testid="chrome-showcase"]').analyze()).violations).toEqual([]);
  }
  const chrome=page.getByTestId('chrome-showcase'),url=page.url();
  await chrome.locator('a[href="/services"]').click();await expect(page).toHaveURL(url);
  await chrome.locator('a[href="/privacy"]').click();await expect(page).toHaveURL(url);
  for(const width of [390,320]) {
    await page.setViewportSize({width,height:900});
    const toggle=chrome.locator('.hw-portal-menu-toggle');
    await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');
    await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await expect(toggle).toHaveAttribute('aria-expanded','false');
    expect(await chrome.evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});
