import {expect,test} from '@playwright/test';
import {finishMotion,motionFrame,pauseAccordionAnimations} from '../accordion-browser';

test('native accordion animates exclusive items and settles reduced motion',async({page})=>{
  await pauseAccordionAnimations(page);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/?preview=portal');
  const scope=page.getByTestId('accordion-showcase');
  const items=scope.locator('details');
  await items.first().locator('summary').focus(); await page.keyboard.press('Enter');
  const frame=await motionFrame(items.first(),150);
  expect(frame.duration).toBe(300); expect(frame.height).toBeGreaterThan(frame.from); expect(frame.height).toBeLessThan(frame.to);
  await finishMotion(items.first());
  await items.nth(1).locator('summary').click();
  await expect(items.first().locator('summary')).toHaveAttribute('aria-expanded','false');
  await expect(items.first().locator('.nq-accordion-content')).toHaveAttribute('inert','');
  await expect(items.nth(1).locator('summary')).toHaveAttribute('aria-expanded','true');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(items.first()).not.toHaveAttribute('open'); await expect(items.nth(1)).toHaveAttribute('open','');
  await items.nth(1).locator('summary').press('Space'); await expect(items.nth(1)).not.toHaveAttribute('open');
  await page.getByRole('button',{name:'English',exact:true}).click();
  await items.first().locator('summary').focus(); await page.keyboard.press('Enter');
  await expect(items.first()).toHaveAttribute('open','');
  expect(await items.first().evaluate(node=>node.getAnimations().length)).toBe(0);
});
