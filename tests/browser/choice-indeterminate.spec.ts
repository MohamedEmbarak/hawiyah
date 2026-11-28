import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
// Loads only the package stylesheet, so the check does not depend on guide markup.
const stylesheet='/@fs/'+fileURLToPath(new URL('../../packages/styles/src/styles.css',import.meta.url)).replaceAll('\\','/');
const fixture=(theme:string|null,mode:string)=>`<!doctype html><html lang="en" dir="ltr"${theme?` data-hw-theme="${theme}"`:''} data-hw-mode="${mode}"><head><meta charset="utf-8"><title>Choices</title><link rel="stylesheet" href="${stylesheet}"></head><body>
  <form id="choices"><fieldset><legend>Delivery</legend>
    <label class="hw-choice"><input class="hw-radio" type="radio" name="delivery" value="post">Post</label>
    <label class="hw-choice"><input class="hw-radio" type="radio" name="delivery" value="office">Office</label>
    <label class="hw-choice"><input class="hw-radio" type="radio" name="delivery" value="email" disabled>Email</label></fieldset>
    <label class="hw-choice"><input class="hw-checkbox" type="checkbox" id="mixed">All documents</label>
    <label class="hw-choice"><input class="hw-checkbox" type="checkbox" id="plain">Terms</label></form></body></html>`;
// A mark shows only when the pseudo-element is generated and visible.
const marked=(page:Page,selector:string)=>page.locator(selector).evaluateAll(nodes=>nodes.map(node=>{
  const mark=getComputedStyle(node,'::before');
  return mark.content!=='none'&&mark.visibility==='visible';
}));
for(const theme of [null,'dga','custom','hawiyah']) for(const mode of ['light','dark'])
  test(`unselected radios stay empty and only a mixed checkbox shows its mark (${theme??'default'} theme, ${mode})`,async({page})=>{
    await page.route('**/__choice-fixture.html',route=>route.fulfill({contentType:'text/html',body:fixture(theme,mode)}));
    await page.goto('/__choice-fixture.html');
    await expect(page.locator('.hw-radio').first()).toHaveCSS('appearance',theme==='hawiyah'?'auto':'none');
    const radios=page.locator('.hw-radio');
    expect(await radios.evaluateAll(nodes=>nodes.every(node=>node.matches(':indeterminate')))).toBe(true);
    expect(await marked(page,'.hw-radio')).toEqual([false,false,false]);
    await page.locator('#mixed').evaluate(node=>{(node as HTMLInputElement).indeterminate=true;});
    const generated=theme!=='hawiyah';
    expect(await marked(page,'.hw-checkbox')).toEqual([generated,false]);
    await radios.nth(1).check();
    expect(await marked(page,'.hw-radio')).toEqual([false,generated,false]);
    await page.locator('#choices').evaluate(form=>(form as HTMLFormElement).reset());
    await expect(radios.nth(1)).not.toBeChecked();
    expect(await marked(page,'.hw-radio')).toEqual([false,false,false]);
  });
