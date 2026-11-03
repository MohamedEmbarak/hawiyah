import {expect,test} from '@playwright/test';

for(const direction of ['rtl','ltr'])test(`catalog footer hover preserves rounded borders in ${direction}`,async({page},testInfo)=>{
  await page.goto('/#components');
  const card=page.locator('article.component-card:has(a[href="#component/input-group"])');
  const footer=card.locator('.component-card-docs');
  await card.evaluate((node,dir)=>{node.setAttribute('dir',dir);node.setAttribute('data-nq-theme','dga');},direction);
  for(const width of [1864,390])for(const mode of ['light','dark']) {
    await page.setViewportSize({width,height:884});await card.evaluate((node,mode)=>node.setAttribute('data-nq-mode',mode),mode);
    await footer.hover();
    const geometry=await card.evaluate(node=>{
      const footer=node.querySelector('.component-card-docs')!, outer=getComputedStyle(node),inner=getComputedStyle(footer);
      return {radius:parseFloat(outer.borderEndStartRadius),border:parseFloat(outer.borderBottomWidth),start:parseFloat(inner.borderEndStartRadius),end:parseFloat(inner.borderEndEndRadius),overflow:outer.overflow,background:inner.backgroundColor,color:outer.borderBottomColor,primary:outer.getPropertyValue('--nq-color-primary').trim()};
    });
    expect(geometry.start).toBeCloseTo(geometry.radius-geometry.border,1);expect(geometry.end).toBe(geometry.start);
    expect(geometry.overflow).toBe('visible');expect(geometry.background).not.toBe('rgba(0, 0, 0, 0)');
    const expected=await card.evaluate(node=>{const probe=document.createElement('span');probe.style.color='var(--nq-color-primary)';node.append(probe);const color=getComputedStyle(probe).color;probe.remove();return color;});
    await expect(card).toHaveCSS('border-bottom-color',expected);
    await card.screenshot({path:testInfo.outputPath(`card-footer-${direction}-${width}-${mode}.png`)});
  }
  await footer.focus();await expect(footer).toBeFocused();await expect(footer).not.toHaveCSS('outline-style','none');
});
