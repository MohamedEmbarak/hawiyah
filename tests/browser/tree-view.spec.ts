import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openFixture } from './style-fixture';

// What these cases check: the package stylesheet on authored markup written in this file, an
// expanded three-level flat tree of li[role=treeitem] as the documents describe it. No adapter
// is rendered here and no document is read; the markup each adapter renders, and the vanilla
// controller on the documented markup, are covered by the package tests. Some rows carry no
// hw-tree-item class, as in the vanilla samples of the guide, so the rules for class-less rows apply.
const item=(id:string,label:string,level:number,branch=false,classed=true)=>`<li ${classed?'class="hw-tree-item" ':''}role="treeitem" id="${id}" aria-level="${level}" aria-posinset="1" aria-setsize="1" aria-labelledby="${id}-label" ${branch?'aria-expanded="true"':''} aria-selected="false" tabindex="${id==='business'?0:-1}" style="--hw-tree-depth: ${level-1}">${branch?`<button type="button" class="hw-tree-toggle" tabindex="-1" aria-label="Collapse ${label}"><span class="hw-icon" data-icon="minus-sign" data-size="sm" aria-hidden="true"></span></button>`:''}<span id="${id}-label">${label}</span></li>`;
const tree=`<ul class="hw-tree-view" role="tree" aria-label="Documents" style="inline-size:320px">${item('business','Business',1,true)}${item('licences','Licences',2,true)}${item('commercial','Commercial licence',3,true)}${item('personal','Personal',1,false,false)}<li role="treeitem" id="hidden" aria-level="2" aria-selected="false" tabindex="-1" hidden style="--hw-tree-depth: 1"><span>Hidden row</span></li></ul>`;

for(const lang of ['en','ar'] as const)
  test(`[TREE-02] each level of the flat tree starts one indent step further from the inline start (${lang})`,async({page})=>{
    await openFixture(page,tree,{lang});
    // Distance from the inline-start edge of the tree to the inline-start edge of the first box in each item.
    const offsets=await page.evaluate(()=>{
      const root=document.querySelector('.hw-tree-view')!.getBoundingClientRect();const rtl=getComputedStyle(document.documentElement).direction==='rtl';
      return ['business','licences','commercial'].map(id=>{const box=document.querySelector(`#${id} > .hw-tree-toggle`)!.getBoundingClientRect();return rtl?root.right-box.right:box.left-root.left;});
    });
    const step=await page.evaluate(()=>{const probe=document.createElement('i');probe.style.cssText='display:block;inline-size:var(--hw-tree-indent)';document.querySelector('.hw-tree-view')!.append(probe);const size=probe.getBoundingClientRect().width;probe.remove();return size;});
    expect(step).toBeCloseTo(33,0);
    expect(offsets[1]!-offsets[0]!).toBeCloseTo(step,0);expect(offsets[2]!-offsets[1]!).toBeCloseTo(step,0);
    // No inline padding and no nested group: the stylesheet alone indents, and a hidden row takes no space.
    expect(await page.locator('.hw-tree-view [role=group]').count()).toBe(0);
    await expect(page.locator('#hidden')).toBeHidden();
    const rows=await page.locator('[role=treeitem]:not([hidden])').evaluateAll(nodes=>nodes.map(node=>Math.round(node.getBoundingClientRect().top)));
    expect([...rows].sort((a,b)=>a-b)).toEqual(rows);expect(new Set(rows).size).toBe(rows.length);
  });

test('[TREE-05] on the authored flat markup, an expanded tree item shows only its own label, so its name contains its visible text (WCAG 2.5.3)',async({page})=>{
  await openFixture(page,tree);
  const results=await new AxeBuilder({page}).include('.hw-tree-view').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  expect(results.violations.map(violation=>violation.id)).toEqual([]);
  await expect(page.locator('#business')).toHaveAccessibleName('Business');
  expect(await page.locator('#business').evaluate(node=>node.textContent)).toBe('Business');
});

for(const mode of ['light','dark','forced'] as const)
  test(`[TREE-06] the branch toggle is a 28px borderless, transparent button (${mode})`,async({page})=>{
    if(mode==='forced') await page.emulateMedia({forcedColors:'active'});
    await openFixture(page,tree,{mode:mode==='dark'?'dark':'light'});
    const toggle=page.locator('#business > .hw-tree-toggle');
    const box=(await toggle.boundingBox())!;expect(Math.round(box.width)).toBe(28);expect(Math.round(box.height)).toBe(28);
    const style=await toggle.evaluate(node=>{const computed=getComputedStyle(node);return {background:computed.backgroundColor,border:computed.borderTopWidth,appearance:computed.appearance};});
    expect(style.border).toBe('0px');
    if(mode!=='forced') expect(style.background).toBe('rgba(0, 0, 0, 0)');
    else {
      const colours=await page.evaluate(()=>{const probe=document.createElement('i');probe.style.color='ButtonText';document.body.append(probe);const value=getComputedStyle(probe).color;probe.remove();return {buttonText:value,toggle:getComputedStyle(document.querySelector('#business > .hw-tree-toggle')!).color};});
      expect(colours.toggle).toBe(colours.buttonText);
    }
    // The icon is the packaged minus sign, drawn by the icon class.
    await expect(toggle.locator('.hw-icon[data-icon="minus-sign"]')).toHaveCount(1);
    expect(await toggle.getAttribute('tabindex')).toBe('-1');
  });
