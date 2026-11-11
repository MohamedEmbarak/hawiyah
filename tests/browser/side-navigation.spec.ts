import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { contrast, effectiveBackground, openFixture } from './style-fixture';
// Authored markup of SideNavigation and of the list inside a NavigationDrawer: package classes only.
const list=(prefix:string,ar:boolean)=>`<ul>
  <li data-hw-value="start"><a class="hw-navigation-drawer-row" href="#${prefix}-start"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span><span class="hw-navigation-drawer-label">${ar?'البداية':'Start'}</span></a></li>
  <li data-hw-value="components"><details class="hw-navigation-drawer-group" open><summary class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">${ar?'المكونات':'Components'}</span></summary><ul>
    <li data-hw-value="copy-button"><a class="hw-navigation-drawer-row" href="#${prefix}-copy" aria-current="page"><span class="hw-navigation-drawer-label">${ar?'زر النسخ':'Copy button'}</span></a></li>
    <li data-hw-value="side-navigation"><a class="hw-navigation-drawer-row" href="#${prefix}-side"><span class="hw-navigation-drawer-label">${ar?'التنقل الجانبي':'Side navigation'}</span></a></li>
  </ul></details></li>
  <li data-hw-value="soon"><span class="hw-navigation-drawer-row" aria-disabled="true"><span class="hw-navigation-drawer-label">${ar?'قريبًا':'Soon'}</span></span></li>
</ul>`;
const body=(ar:boolean)=>`<main><h1>${ar?'التنقل':'Navigation'}</h1>
<nav id="side" class="hw-side-navigation hw-navigation-drawer-nav" aria-label="${ar?'أقسام الدليل':'Guide sections'}">${list('side',ar)}</nav>
<nav id="drawer" class="hw-navigation-drawer-nav" aria-label="${ar?'القائمة':'Menu'}">${list('drawer',ar)}</nav></main>`;
const themes=[[undefined,'light'],[undefined,'dark'],['hawiyah','light'],['hawiyah','dark']] as const;
for(const [theme,mode] of themes) for(const lang of ['ar','en'] as const)
  test(`the current row of SideNavigation and NavigationDrawer meets contrast (${theme??'dga'} ${mode}, ${lang})`,async({page})=>{
    await openFixture(page,body(lang==='ar'),{lang,theme,mode,name:'side-navigation'});
    for(const id of ['side','drawer']) {
      const label=`#${id} a[aria-current="page"] .hw-navigation-drawer-label`;
      const colour=await page.locator(label).evaluate(node=>getComputedStyle(node).color);
      const background=await effectiveBackground(page,label);
      expect(contrast(colour,background),`${id}: ${colour} on ${background}`).toBeGreaterThanOrEqual(4.5);
      // The marker is a non-text indicator of the current page.
      const marker=await page.locator(`#${id} a[aria-current="page"]`).evaluate(node=>getComputedStyle(node,'::before').backgroundColor);
      expect(contrast(marker,background),`${id} marker: ${marker} on ${background}`).toBeGreaterThanOrEqual(3);
      await expect(page.locator(`#${id} a[aria-current="page"]`)).toHaveCSS('font-weight','600');
    }
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.map(violation=>`${violation.id}: ${violation.nodes.map(node=>node.target.join(' ')).join(', ')}`)).toEqual([]);
  });
test('the current row keeps system colours in forced colours',async({page})=>{
  await page.emulateMedia({forcedColors:'active'});
  await openFixture(page,body(false),{name:'side-navigation'});
  const [row,marker,link]=await page.evaluate(()=>{const probe=document.createElement('a');probe.href='#probe';probe.style.color='LinkText';document.body.append(probe);const link=getComputedStyle(probe).color;probe.remove();const current=document.querySelector('#side a[aria-current="page"]')!;return [getComputedStyle(current).color,getComputedStyle(current,'::before').backgroundColor,link];});
  expect(row).toBe(link);expect(marker).toBe(link);
});
