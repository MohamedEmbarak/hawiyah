import {expect,test} from '@playwright/test';
import {finishMotion,motionFrame,pauseAccordionAnimations} from '../accordion-browser';

for (const direction of ['rtl','ltr']) {
  test(`accordion expands, reverses and closes accessibly in ${direction}`,async({page})=>{
    await pauseAccordionAnimations(page);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto('/#component/accordion');
    const root=page.locator('.component-preview .hw-accordion').first();
    // Use the live recipe and its public vanilla enhancement, not a test controller.
    const accordion=await root.count()?root:page.locator('.hw-accordion[data-hw="accordion"]').first();
    await accordion.evaluate((node,dir)=>node.setAttribute('dir',dir),direction);
    const items=accordion.locator(':scope > details'), first=items.first(), summary=first.locator('summary');
    const collapsed=(await first.boundingBox())!.height;
    await summary.focus(); await page.keyboard.press('Enter');
    const opening=await motionFrame(first,150);
    expect(opening.duration).toBe(300); expect(opening.from).toBeCloseTo(collapsed,0);
    expect(opening.height).toBeGreaterThan(opening.from); expect(opening.height).toBeLessThan(opening.to);
    await summary.evaluate(node=>(node as HTMLElement).click());
    const closing=await motionFrame(first,150);
    expect(closing.from).toBeCloseTo(opening.height,0);
    expect(closing.height).toBeLessThan(closing.from);
    await expect(summary).toHaveAttribute('aria-expanded','false');
    await expect(first.locator('.hw-accordion-content')).toHaveAttribute('inert','');
    await summary.evaluate(node=>(node as HTMLElement).click());
    const reopened=await motionFrame(first,150);
    expect(reopened.from).toBeCloseTo(closing.height,0);
    await first.locator('.hw-accordion-content').evaluate(node=>node.insertAdjacentHTML('beforeend','<p style="height:80px">Additional content</p><button type="button">Inside action</button>'));
    const resized=await motionFrame(first,150);
    expect(resized.to).toBeGreaterThan(reopened.to);
    await finishMotion(first);
    await expect(summary).toHaveAttribute('aria-expanded','true');
    await expect.poll(()=>first.evaluate(node=>node.getAnimations().filter(a=>(a.effect as KeyframeEffect).getKeyframes().some(k=>k.height)).length)).toBe(0);
    await first.getByRole('button',{name:'Inside action'}).focus();
    await summary.evaluate(node=>(node as HTMLElement).click());
    await expect(summary).toBeFocused();
    await expect(first.locator('.hw-accordion-content')).toHaveAttribute('aria-hidden','true');
    await page.keyboard.press('Tab'); await expect(items.nth(1).locator('summary')).toBeFocused();
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(first).not.toHaveAttribute('open');
    await summary.focus(); await page.keyboard.press('Space'); await expect(first).toHaveAttribute('open','');
    expect(await first.evaluate(node=>node.getAnimations().length)).toBe(0);
    await accordion.evaluate(node=>node.setAttribute('data-hw-theme','hawiyah'));
    await page.emulateMedia({reducedMotion:'no-preference'});
    await summary.click(); await expect(first).not.toHaveAttribute('open');
    expect(await first.evaluate(node=>node.getAnimations().length)).toBe(0);
  });
}
