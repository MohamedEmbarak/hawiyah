import {expect,test} from '@playwright/test';
import {previewStyles} from '../../apps/playground/src/generated/preview-runtime';

for (const width of [320,1280]) {
  test(`built CSS respects nested and automatic HTML direction independently of language at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setContent(`<!doctype html><html lang="en" dir="rtl"><head><title>Direction</title></head>
      <body><div id="boundary" lang="ar" dir="ltr"><section id="region" data-nq-theme="dga">
        <span id="first-text">First strong character</span>
        <span class="nq-icon" data-icon="arrow-right-01" data-directional="true"></span>
        <select class="nq-select" aria-label="Office"><option>Office</option></select>
        <div class="nq-carousel" data-nq-carousel-ready style="--nq-carousel-index:1">
          <div class="nq-carousel-viewport"><div class="nq-carousel-track">
            <div class="nq-carousel-slide">1</div><div class="nq-carousel-slide">2</div>
          </div></div>
          <button class="nq-carousel-arrow" data-nq-next aria-label="Next"></button>
        </div>
        <div class="nq-tab-bar" style="position:relative;inline-size:220px;margin-inline:auto">
          <details class="nq-tabs-overflow" open><summary>More</summary>
            <div class="nq-tab-overflow-menu"><button class="nq-tab-overflow-item" aria-pressed="true">Details</button></div>
          </details>
        </div>
      </section></div></body></html>`);
    await page.addStyleTag({content:previewStyles});
    const region = page.locator('#region');
    const assertDirection = async (rtl:boolean) => {
      await expect(region).toHaveCSS('direction',rtl?'rtl':'ltr');
      await expect(region.locator('.nq-icon')).toHaveCSS('transform',rtl?'matrix(-1, 0, 0, 1, 0, 0)':'none');
      const geometry = await region.evaluate(node=>{
        const find=(selector:string)=>node.querySelector<HTMLElement>(selector)!;
        const track = find('.nq-carousel-viewport').getBoundingClientRect();
        const slide = find('.nq-carousel-slide:last-child').getBoundingClientRect();
        const menuNode=find('.nq-tab-overflow-menu'), popup=menuNode.getBoundingClientRect();
        const anchor=(menuNode.offsetParent as HTMLElement).getBoundingClientRect();
        return {slide:Math.abs(slide.left-track.left), left:Math.abs(popup.left-anchor.left),right:Math.abs(popup.right-anchor.right),
          next:getComputedStyle(find('.nq-carousel-arrow'),'::before').content,
          select:getComputedStyle(find('.nq-select')).backgroundPositionX};
      });
      expect(geometry.slide).toBeLessThan(1);
      expect(geometry.next).toBe(rtl?'"←"':'"→"');
      expect(geometry.select).toMatch(rtl?/12px/:/10px/);
      expect(rtl?geometry.left:geometry.right).toBeLessThan(2);
    };
    await assertDirection(false); // Arabic content in an LTR section of an RTL page.
    await region.evaluate(node=>{node.lang='en';node.dir='rtl';});
    await assertDirection(true);
    await region.evaluate(node=>{node.dir='auto';node.querySelector('#first-text')!.textContent='إشعار';});
    await assertDirection(true);
    await region.evaluate(node=>{node.querySelector('#first-text')!.textContent='Notice';});
    await assertDirection(false);
    await region.evaluate(node=>{node.removeAttribute('dir');node.parentElement!.removeAttribute('dir');});
    await assertDirection(true); // Inherits the English document's explicit RTL setting.
  });
}
