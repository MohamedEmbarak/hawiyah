import {expect, test} from '@playwright/test';
import {previewStyles} from '../../apps/playground/src/generated/preview-runtime';

for (const direction of ['rtl', 'ltr']) {
  test(`component motion and live reduced-motion changes preserve switch state in ${direction}`, async ({page}) => {
    await page.emulateMedia({reducedMotion:'no-preference'});
    // Exercise the built package CSS independently of the guide's global motion fallback.
    await page.setContent('<!doctype html><html><head></head><body><main id="main"></main></body></html>');
    await page.addStyleTag({content: previewStyles});
    await page.locator('#main').evaluate((main, direction) => {
      main.innerHTML=`<section data-nq-theme="nasaq"><div id="motion-scope" data-nq-theme="dga" dir="${direction}">
        <button class="nq-button" id="motion-button">Save</button>
        <input type="checkbox" role="switch" class="nq-switch" id="motion-switch" aria-label="Notifications">
        <span class="nq-spinner" role="status" aria-label="Loading"></span>
        <span class="nq-skeleton" aria-hidden="true" style="display:block;width:100px;height:20px"></span>
        <input class="nq-input" aria-label="Name">
      </div></section>`;
    }, direction);
    const scope=page.locator('#motion-scope'), control=page.locator('#motion-switch');
    for (const theme of ['dga','nasaq','custom']) {
      await scope.evaluate((node, theme)=>node.setAttribute('data-nq-theme',theme),theme);
      const expectedDuration=theme==='nasaq'?0.18:0.2;
      await expect(control).toHaveCSS('transition-duration',`${expectedDuration}s, ${expectedDuration}s`);
      expect(await scope.locator('.nq-button').evaluate(node=>parseFloat(getComputedStyle(node).transitionDuration))).toBeGreaterThan(0);
      const thumb=await control.evaluate(node=>{const s=getComputedStyle(node,'::before');return {duration:s.transitionDuration,ease:s.transitionTimingFunction};});
      expect(thumb).toEqual({duration:`${expectedDuration}s`,ease:theme==='nasaq'?'cubic-bezier(0.2, 0, 0, 1)':'cubic-bezier(0.42, 0, 0.58, 1)'});
      await expect(scope.locator('.nq-spinner')).toHaveCSS('animation-duration',theme==='nasaq'?'0.7s':'1s');
      await expect(scope.locator('.nq-spinner')).toHaveCSS('animation-timing-function','linear');
      await page.emulateMedia({reducedMotion:'reduce'});
      for (const selector of ['.nq-button','.nq-switch','.nq-input']) await expect(scope.locator(selector)).toHaveCSS('transition-duration','0s');
      expect(await control.evaluate(node=>getComputedStyle(node,'::before').transitionDuration)).toBe('0s');
      for (const selector of ['.nq-spinner','.nq-skeleton']) await expect(scope.locator(selector)).toHaveCSS('animation-name','none');
      await control.focus(); await page.keyboard.press('Space'); await expect(control).toBeChecked();
      await page.keyboard.press('Space'); await expect(control).not.toBeChecked();
      await page.emulateMedia({reducedMotion:'no-preference'});
    }
    await scope.evaluate(node=>node.setAttribute('data-nq-theme','dga'));
    // Freeze a real CSS transition halfway through to check interpolation and containment.
    const movement=await control.evaluate(node=>{
      const input=node as HTMLInputElement;
      const before=parseFloat(getComputedStyle(input,'::before').insetInlineStart);
      input.checked=true; void getComputedStyle(input,'::before').insetInlineStart;
      const transition=input.getAnimations({subtree:true}).find(animation=>['left','right','inset-inline-start'].includes((animation as CSSTransition).transitionProperty));
      if(!transition)throw new Error('Switch thumb transition did not start');
      transition.pause(); transition.currentTime=100;
      const style=getComputedStyle(input,'::before');
      return {before,mid:parseFloat(style.insetInlineStart),thumb:parseFloat(style.width),track:input.clientWidth,duration:transition.effect!.getTiming().duration};
    });
    expect(movement.duration).toBe(200);
    expect(movement.mid).toBeGreaterThan(movement.before);
    expect(movement.mid+movement.thumb).toBeLessThan(movement.track);
    // The preference can change while the thumb is moving; the checked state must survive.
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(control).toBeChecked();
    const end=await control.evaluate(node=>{const s=getComputedStyle(node,'::before');return {offset:parseFloat(s.insetInlineStart),duration:s.transitionDuration,animations:node.getAnimations({subtree:true}).length};});
    expect(end.offset).toBeGreaterThan(movement.mid);
    expect(end.duration).toBe('0s'); expect(end.animations).toBe(0);
    await control.focus(); await page.keyboard.press('Space'); await expect(control).not.toBeChecked();
    expect(await control.evaluate(node=>parseFloat(getComputedStyle(node,'::before').insetInlineStart))).toBe(movement.before);
    await page.keyboard.press('Tab'); await expect(scope.locator('.nq-input')).toBeFocused();
  });
}
