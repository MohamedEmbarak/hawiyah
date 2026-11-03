import { expect, type Locator, type Page } from '@playwright/test';

/** Source values from NIC global.css 1677–1766; shared assertions against real adapters. */
export async function checkNicAccordion(page: Page, accordion: Locator) {
  const item=accordion.locator('.nq-accordion-item').first(), trigger=item.locator('summary'), content=item.locator('.nq-accordion-content');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(accordion).toHaveCSS('border-radius','6px');
  await expect(accordion).toHaveCSS('border-top-color','rgb(222, 226, 230)');
  await expect(item).toHaveCSS('padding','18px');
  await expect(trigger).toHaveCSS('padding','12px 16px');
  await expect(trigger).toHaveCSS('font-size','16px');
  await expect(trigger).toHaveCSS('font-weight','600');
  await expect(trigger).toHaveCSS('line-height','24px');
  await expect(trigger).toHaveCSS('transition-duration','0.15s, 0.15s');
  await expect(content).toHaveCSS('padding','16px');
  const indicator=()=>trigger.evaluate(node=>{const css=getComputedStyle(node,'::after');return {size:css.width,duration:css.transitionDuration,mask:css.maskImage,content:css.content};});
  expect(await indicator()).toMatchObject({size:'18px',duration:'0.2s',content:'""'});
  // Vite may inline this licensed SVG rather than retain its source filename.
  expect((await indicator()).mask).toMatch(/arrow-down-01.*\.svg|data:image\/svg\+xml/);
  await trigger.hover();await expect(trigger).toHaveCSS('background-color','rgb(243, 244, 246)');
  // Force keyboard modality, then test focus independently of the hover position.
  await page.keyboard.press('Tab');await trigger.focus();
  await expect(trigger).toHaveCSS('background-color','rgb(229, 231, 235)');
  await expect(trigger).toHaveCSS('outline-width','2px');
  await expect(trigger).toHaveCSS('outline-color','rgb(0, 0, 0)');
  await trigger.press('Enter');await expect(item).toHaveAttribute('open','');
  await expect(content).toBeVisible();
  // Wait for natural height; closing must settle to the same padded header.
  await expect.poll(()=>item.evaluate(node=>node.getAnimations().filter(a=>(a.effect as KeyframeEffect).getKeyframes().some(k=>k.height)).length)).toBe(0);
  const bodyBox=(await content.boundingBox())!, itemBox=(await item.boundingBox())!, summaryBox=(await trigger.boundingBox())!;
  expect(bodyBox.x).toBeCloseTo(itemBox.x,0);
  expect(bodyBox.width).toBeCloseTo(itemBox.width,0);
  expect(bodyBox.y-summaryBox.y-summaryBox.height).toBeCloseTo(18,0);
  await trigger.press('Space');await expect(item).not.toHaveAttribute('open');
  expect((await item.boundingBox())!.height).toBeCloseTo(84,0);
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:1000});
    expect(await accordion.evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
  }
  await accordion.evaluate(node=>node.setAttribute('data-nq-mode','dark'));
  await trigger.focus();await expect(trigger).toHaveCSS('background-color','rgb(56, 66, 80)');
  await expect(trigger).toHaveCSS('outline-color','rgb(255, 255, 255)');
  await accordion.evaluate(node=>{node.setAttribute('data-nq-theme','nasaq');node.setAttribute('data-nq-mode','light');});
  await expect(item).toHaveCSS('padding','0px');await expect(trigger).toHaveCSS('padding','16px 20px');
  await expect(accordion).toHaveCSS('border-radius','14px');
  expect((await indicator()).duration).toBe('0s');
  await accordion.evaluate(node=>{node.setAttribute('data-nq-theme','custom');(node as HTMLElement).style.setProperty('--nq-color-accordion-focus','rgb(50, 60, 70)');});
  await expect(item).toHaveCSS('padding','18px');await expect(trigger).toHaveCSS('background-color','rgb(50, 60, 70)');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(trigger).toHaveCSS('transition-property','none');
  // A host reset can impose a tiny !important duration; no property may animate.
  expect(await trigger.evaluate(node=>getComputedStyle(node,'::after').transitionProperty)).toBe('none');
  await trigger.press('Enter');await expect(item).toHaveAttribute('open','');
  expect(await item.evaluate(node=>node.getAnimations().length)).toBe(0);
  await page.emulateMedia({forcedColors:'active'});await trigger.focus();
  await expect(trigger).toHaveCSS('outline-style','solid');await expect(trigger).toHaveCSS('outline-width','2px');
}
