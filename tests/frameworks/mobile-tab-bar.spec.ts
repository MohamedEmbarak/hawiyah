import {expect,test} from '@playwright/test';

test('native mobile navigation variant renders icons, current state and page links',async({page})=>{
  await page.setViewportSize({width:320,height:800});
  await page.goto('/?preview=portal');
  const bar=page.locator('.nq-secondary-nav[data-variant="mobile"]');
  await expect(bar).toHaveAttribute('aria-label','تنقل الجوال');
  await expect(bar.locator('a')).toHaveCount(3);
  await expect(bar.locator('.nq-icon[aria-hidden="true"]')).toHaveCount(3);
  await expect(bar.locator('a').first()).toHaveAttribute('aria-current','page');
  await bar.locator('a').first().focus(); await page.keyboard.press('Tab'); await expect(bar.locator('a').nth(1)).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page).toHaveURL(/#services$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'English',exact:true}).click();
  await expect(bar).toHaveAttribute('aria-label','Mobile navigation');
  await expect(bar.locator('a').first()).toHaveAccessibleName('Home');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(bar.locator('a').first()).toHaveCSS('transition-duration','0s');
});
