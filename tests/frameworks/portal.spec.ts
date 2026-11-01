import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('native portal shell supports Arabic/English, disclosure and skip focus',async({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?preview=portal');
  const shell=page.locator('.nq-portal-layout');
  await expect(shell).toHaveAttribute('lang','ar');await expect(shell).toHaveAttribute('dir','rtl');
  await expect(page.locator('header img')).toBeVisible();
  expect(await page.locator('header img').evaluate(image=>image.getBoundingClientRect().width)).toBeGreaterThan(80);
  const menu=page.locator('.nq-portal-menu-toggle');
  const nav=page.locator('header nav');
  await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true');
  await nav.locator('a').first().focus();await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();await expect(nav).toBeHidden();
  await menu.click();await nav.locator('a').first().click();await expect(nav).toBeHidden();
  const skip=page.locator('.nq-skip-link');await skip.focus();await page.keyboard.press('Enter');
  await expect(page.locator('#portal-content')).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('portal-ar-mobile.png'),fullPage:true});
  await page.getByRole('button',{name:'English',exact:true}).click();
  await expect(shell).toHaveAttribute('lang','en');await expect(shell).toHaveAttribute('dir','ltr');
  await page.setViewportSize({width:1440,height:1000});
  await expect(menu).toBeHidden();await expect(nav).toBeVisible();
  expect((await new AxeBuilder({page}).include('.nq-portal-layout').analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});
