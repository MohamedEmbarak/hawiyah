import {expect,test,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function geometry(group:Locator,mobile=false){
  const segments=group.locator(':scope > label, :scope > button');
  await expect(group).toHaveCSS('column-gap','0px');await expect(group).toHaveCSS('padding-inline-start','8px');
  await expect(segments.first()).toHaveCSS('font-size','16px');await expect(segments.first()).toHaveCSS('line-height','24px');
  const boxes=await segments.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
  for(const box of boxes){expect(box.height).toBe(mobile?48:36);expect(box.width).toBeGreaterThanOrEqual(76);}
  expect(await group.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
}
async function readonly(group:Locator){
  const inputs=group.locator('input[type=radio]');await inputs.first().focus();await inputs.first().press('ArrowLeft');await inputs.first().press('Space');
  await expect(inputs.first()).toBeChecked();await expect(group.locator('label').first()).toHaveCSS('outline-style','solid');
  await group.locator('label').nth(1).click({force:true});await expect(inputs.first()).toBeChecked();await expect(inputs.nth(1)).not.toBeChecked();
}
async function attached(group:Locator){
  const buttons=group.locator('.nq-button');await expect(buttons).toHaveCount(3);await expect(buttons.last()).toBeDisabled();
  const first=(await buttons.nth(0).boundingBox())!,second=(await buttons.nth(1).boundingBox())!;
  const vertical=await group.getAttribute('data-orientation')==='vertical';
  if(vertical){expect(Math.abs(second.y-(first.y+first.height-1))).toBeLessThan(1);await expect(buttons.first()).toHaveCSS('border-bottom-left-radius','0px');await expect(buttons.last()).toHaveCSS('border-top-left-radius','0px');}
  else {expect(Math.abs(first.y-second.y)).toBeLessThan(1);const gap=first.x<second.x?second.x-first.x-first.width:first.x-second.x-second.width;expect(Math.abs(gap+1)).toBeLessThan(1);}
  await buttons.first().press('Tab');await buttons.first().focus();await expect(buttons.first()).toHaveCSS('outline-style','solid');
}
for(const dir of ['rtl','ltr'])test(`NIC segmented states and grouped actions in ${dir}`,async({page},info)=>{
  test.setTimeout(120000);await page.goto('/#component/toggle-group');const previews=page.locator('.component-preview');await previews.evaluateAll((nodes,dir)=>nodes.forEach(node=>{node.setAttribute('dir',dir);node.setAttribute('data-nq-mode','light');}),dir);
  const group=previews.first().locator('.nq-toggle-group'),labels=group.locator('label');await geometry(group);
  await expect(labels.first()).toHaveCSS('background-color','rgb(12, 17, 27)');await expect(labels.first()).toHaveCSS('color','rgb(255, 255, 255)');
  await labels.nth(1).hover();await expect(labels.nth(1)).toHaveCSS('background-color','rgb(249, 250, 251)');
  await page.mouse.down();await expect(labels.nth(1)).toHaveCSS('background-color','rgb(12, 17, 27)');await page.mouse.up();await expect(group.locator('input').nth(1)).toBeChecked();
  await group.locator('input').nth(1).press(dir==='rtl'?'ArrowLeft':'ArrowRight');await expect(group.locator('input').first()).toBeChecked();
  await expect(labels.first()).toHaveCSS('outline-style','solid');
  const ro=previews.locator('.nq-toggle-group[data-nq-readonly="true"]:not([data-variant="outline"])');await readonly(ro);
  const multiple=previews.locator('.nq-toggle-group[data-nq-multiple="true"]:not([data-nq-readonly="true"])');await multiple.locator('button').nth(1).click();await expect(multiple.locator('button').nth(1)).toHaveAttribute('aria-pressed','true');await expect(multiple.locator('button').first()).toHaveAttribute('aria-pressed','true');
  const disabled=previews.locator('.nq-toggle-group[disabled]');await expect(disabled.locator('input').first()).toBeDisabled();await expect(disabled.locator('label').first()).toHaveCSS('color','rgb(157, 164, 174)');
  expect((await new AxeBuilder({page}).include('.component-preview').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  const outline=previews.locator('.nq-toggle-group[data-nq-readonly="true"][data-variant="outline"]');await outline.locator('button').first().press('Tab');await outline.locator('button').first().focus();await expect(outline.locator('button').first()).toHaveCSS('outline-style','solid');await outline.locator('button').nth(1).click({force:true});await expect(outline.locator('button').nth(1)).toHaveAttribute('aria-pressed','false');
  await page.setViewportSize({width:390,height:844});await geometry(group,true);await group.screenshot({path:info.outputPath(`segmented-${dir}-mobile.png`)});
  await group.evaluate(el=>el.setAttribute('data-nq-mode','dark'));await expect(labels.first()).toHaveCSS('background-color','rgb(229, 231, 235)');
  await group.evaluate(el=>{el.setAttribute('data-nq-theme','custom');el.style.setProperty('--nq-color-segment-selected','#123456');});await expect(labels.first()).toHaveCSS('background-color','rgb(18, 52, 86)');
  await group.evaluate(el=>{el.setAttribute('data-nq-theme','nasaq');el.style.removeProperty('--nq-color-segment-selected');});await expect(group).toHaveCSS('column-gap','4px');
  await group.evaluate(el=>el.setAttribute('data-nq-theme','dga'));await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await expect(labels.first()).toHaveCSS('transition-property','none');await group.locator('input').first().focus();await expect(labels.first()).toHaveCSS('outline-style','solid');
  await outline.locator('button').first().focus();await expect(outline.locator('button').first()).toHaveCSS('outline-style','solid');await page.emulateMedia({forcedColors:'none'});await page.goto('/#component/button-group');for(const g of await page.locator('.component-preview .nq-button-group[data-variant="attached"]').all())await attached(g);
});
for(const framework of ['react','vue','angular'])test(`${framework} native segmented selection, readonly and attached groups`,async({page},info)=>{
  test.setTimeout(120000);await page.goto('/#component/toggle-group');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption('typescript');
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});const frame=page.frameLocator('.nq-ide-frame'),groups=frame.locator('.nq-toggle-group');await expect(groups).toHaveCount(6);await geometry(groups.first(),await groups.first().evaluate(()=>innerWidth<=576));
  await groups.first().locator('input').first().press('ArrowLeft');await expect(frame.locator('output')).toHaveText('second');await groups.first().locator('input').nth(1).press('ArrowLeft');await expect(frame.locator('output')).toHaveText('first');
  await readonly(groups.nth(2));await groups.nth(5).locator('button').first().press('Tab');await groups.nth(5).locator('button').first().focus();await expect(groups.nth(5).locator('button').first()).toHaveCSS('outline-style','solid');await groups.nth(5).locator('button').nth(1).click({force:true});await expect(groups.nth(5).locator('button').nth(1)).toHaveAttribute('aria-pressed','false');await groups.nth(1).locator('button').nth(1).click();await expect(groups.nth(1).locator('button').nth(1)).toHaveAttribute('aria-pressed','true');await expect(groups.nth(3).locator('input').first()).toBeDisabled();
  await page.setViewportSize({width:390,height:844});await geometry(groups.first(),true);await page.locator('.nq-ide-frame').scrollIntoViewIfNeeded();await groups.first().screenshot({path:info.outputPath(`${framework}-segmented.png`)});
  await page.goto('/#component/button-group');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  for(const g of await frame.locator('.nq-button-group').all())await attached(g);await frame.locator('.nq-button-group').first().locator('button').first().click();await expect(frame.locator('output')).toHaveText('search');
});
