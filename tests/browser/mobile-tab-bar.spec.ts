import {expect, test} from '@playwright/test';

for (const direction of ['rtl','ltr']) {
  test(`mobile navigation color motion preserves route and focus semantics in ${direction}`, async ({page}) => {
    await page.setViewportSize({width:320,height:800});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto('/#foundations');
    await page.evaluate(dir=>{
      // Keep package CSS; guide-specific reduced-motion rules must not mask it.
      for (const style of document.querySelectorAll('style[data-vite-dev-id]')) if (style.getAttribute('data-vite-dev-id')?.replaceAll('\\','/').includes('/apps/playground/')) style.remove();
      document.body.innerHTML=`<main dir="${dir}" id="bar-scope" data-hw-theme="dga"><nav class="hw-secondary-nav" data-variant="mobile" aria-label="Mobile navigation"><ul>
        <li><a href="#home" aria-current="page"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span><span>الرئيسية</span></a></li>
        <li><a href="#services"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span><span>Services</span></a></li>
        <li><a href="#more"><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span><span>المزيد</span></a></li>
      </ul></nav><h1 id="home">Home</h1><h2 id="services">Services</h2><h2 id="more">More</h2></main>`;
    },direction);
    const scope=page.locator('#bar-scope'), links=scope.locator('nav a');
    for (const mode of ['light','dark']) {
      await scope.evaluate((node,mode)=>node.setAttribute('data-hw-mode',mode),mode);
      const boxes=await links.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
      expect(boxes.every(box=>box.height===70)).toBe(true);
      expect(Math.max(...boxes.map(box=>box.width))-Math.min(...boxes.map(box=>box.width))).toBeLessThan(1);
      await expect(links.first().locator('.hw-icon')).toHaveCSS('width','24px');
      await expect(links.first()).toHaveCSS('border-top-width','1px');
      await expect(links.first()).toHaveCSS('border-bottom-width','0px');
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    await links.first().focus(); await page.keyboard.press('Tab'); await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowRight'); await expect(links.nth(1)).toBeFocused();
    await expect(links.nth(1)).toHaveAttribute('href','#services');
    expect(await scope.getByRole('tab').count()).toBe(0);
    const color=await links.nth(1).evaluate(node=>{
      const before=getComputedStyle(node).color; node.setAttribute('aria-current','page');
      void getComputedStyle(node).color;
      const animation=node.getAnimations().find(a=>(a as CSSTransition).transitionProperty==='color');
      if (!animation) throw new Error('Expected source-backed color transition');
      animation.pause(); animation.currentTime=150;
      const mid=getComputedStyle(node).color; const duration=animation.effect!.getTiming().duration;
      animation.currentTime=300; const after=getComputedStyle(node).color; animation.finish();
      return {before,mid,after,duration};
    });
    expect(color.duration).toBe(300); expect(color.mid).not.toBe(color.before); expect(color.mid).not.toBe(color.after);
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(links.nth(1)).toHaveCSS('transition-duration','0s');
    await page.emulateMedia({forcedColors:'active'}); await links.nth(1).focus();
    await expect(links.nth(1)).toHaveCSS('outline-style','solid');
    await expect(links.nth(1)).toHaveCSS('border-top-style','solid');
    await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'none'});
    await scope.evaluate(node=>node.setAttribute('data-hw-theme','hawiyah'));
    await expect(links.first()).toHaveCSS('transition-duration','0s, 0s');
    await scope.evaluate(node=>node.setAttribute('data-hw-theme','custom'));
    await expect(links.first()).toHaveCSS('transition-duration','0.3s, 0.3s');
    await scope.evaluate(node=>node.style.fontSize='24px');
    await links.nth(1).locator('span').last().evaluate(node=>{node.textContent='خدمات ومعلومات طويلة Long service information'; (node as HTMLElement).style.fontSize='24px';});
    expect((await links.nth(1).boundingBox())!.height).toBeGreaterThan(70);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
