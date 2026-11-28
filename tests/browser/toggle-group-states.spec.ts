import { expect, test } from '@playwright/test';
import { contrast, effectiveBackground, openFixture } from './style-fixture';
// Markup as the React, Vue and Angular adapters render multiple mode.
const multiple=(variant:'segmented'|'outline')=>`<fieldset class="hw-toggle-group" data-variant="${variant}" id="group"><legend class="hw-label">Notify me by</legend>
  <button type="button" class="hw-button" data-variant="secondary" aria-pressed="true" id="first">Email</button>
  <button type="button" class="hw-button" data-variant="secondary" aria-pressed="false" id="second">Text</button>
  <button type="button" class="hw-button" data-variant="secondary" aria-pressed="false" id="third">Post</button></fieldset>`;
const four=(lang:'ar'|'en',hint=false)=>{
  const names=lang==='en'?['Daily','Weekly','Monthly','Yearly']:['يومي','أسبوعي','شهري','سنوي'];
  return `<fieldset class="hw-toggle-group" data-variant="segmented" id="group"><legend class="hw-label">${lang==='en'?'Report period':'فترة التقرير'}</legend>
    ${names.map((name,index)=>`<label class="hw-choice"><input class="hw-radio" type="radio" name="period" value="${index}" ${index===0?'checked':''}>${name}</label>`).join('')}
    ${hint?`<p class="hw-hint">${lang==='en'?'Applies to every report.':'ينطبق على كل التقارير.'}</p>`:''}</fieldset>`;
};
for(const mode of ['light','dark'] as const)
  test(`segmented multiple mode: focus does not make an unpressed button look pressed (${mode})`,async({page})=>{
    await openFixture(page,multiple('segmented'),{mode});
    const pressed=await page.locator('#first').evaluate(node=>getComputedStyle(node).backgroundColor);
    await page.keyboard.press('Tab');await expect(page.locator('#first')).toBeFocused();
    // A pressed segment keeps the selected colours while focused.
    await expect(page.locator('#first')).toHaveCSS('background-color',pressed);
    await page.keyboard.press('Tab');await expect(page.locator('#second')).toBeFocused();
    await expect(page.locator('#second')).toHaveCSS('outline-style','solid');
    await expect(page.locator('#second')).not.toHaveCSS('background-color',pressed);
    await page.locator('#second').evaluate(node=>node.setAttribute('aria-pressed','true'));
    await expect(page.locator('#second')).toHaveCSS('background-color',pressed);
  });
for(const mode of ['light','dark'] as const)
  test(`outline multiple mode keeps 4.5:1 label contrast on hover and focus (${mode})`,async({page})=>{
    await openFixture(page,multiple('outline'),{mode});
    for(const action of ['hover','focus'] as const) {
      if(action==='hover') await page.locator('#third').hover();
      else {await page.mouse.move(0,0);await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('Tab');await expect(page.locator('#third')).toBeFocused();}
      const color=await page.locator('#third').evaluate(node=>getComputedStyle(node).color);
      expect(contrast(color,await effectiveBackground(page,'#third')),`${action} ${mode}`).toBeGreaterThanOrEqual(4.5);
    }
  });
for(const width of [320,390]) for(const lang of ['en','ar'] as const) for(const hint of [false,true])
  test(`a four-option segmented group stays on one row at ${width}px (${lang}${hint?', with hint':''})`,async({page})=>{
    await page.setViewportSize({width,height:700});
    await openFixture(page,four(lang,hint),{lang});
    const labels=page.locator('#group > label');
    const boxes=await labels.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
    for(const box of boxes) {
      expect(Math.abs(box.top-boxes[0].top)).toBeLessThan(1);
      expect(box.left).toBeGreaterThanOrEqual(0);expect(box.right).toBeLessThanOrEqual(width);
      // 48px DGA mobile targets with each label kept on one line.
      expect(box.height).toBe(48);
    }
    // Labels fit inside their own segment.
    expect(await labels.evaluateAll(nodes=>nodes.every(node=>node.scrollWidth<=node.clientWidth+1))).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if(hint) {
      const hintBox=(await page.locator('#group > .hw-hint').boundingBox())!;
      expect(hintBox.y).toBeGreaterThanOrEqual(boxes[0].bottom-1);
    }
    for(const label of await labels.all()) {await label.click();await expect(label.locator('input')).toBeChecked();}
  });
// Labels wrap only as a last resort: segments start from their content width,
// so a long label takes the room that its shorter neighbours do not need.
const uneven=(lang:'ar'|'en')=>{
  const names=lang==='en'?['All','Open','In progress']:['الكل','مفتوح','قيد التنفيذ'];
  return `<fieldset class="hw-toggle-group" data-variant="segmented" id="group"><legend class="hw-label">${lang==='en'?'Requests':'الطلبات'}</legend>
    ${names.map((name,index)=>`<label class="hw-choice"><input class="hw-radio" type="radio" name="state" value="${index}" ${index===0?'checked':''}>${name}</label>`).join('')}</fieldset>`;
};
for(const width of [320,390]) for(const lang of ['en','ar'] as const)
  test(`uneven labels that fit stay on one line at ${width}px (${lang})`,async({page})=>{
    await page.setViewportSize({width,height:700});
    await openFixture(page,uneven(lang),{lang});
    const labels=page.locator('#group > label');
    const boxes=await labels.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
    for(const box of boxes) {
      expect(Math.abs(box.top-boxes[0].top)).toBeLessThan(1);
      expect(box.height).toBe(48);
    }
    // The segments fill the row, and the longest label is the widest segment.
    expect(Math.max(...boxes.map(box=>box.right))-Math.min(...boxes.map(box=>box.left))).toBeGreaterThan(width-32-16-2);
    expect(boxes[2].width).toBeGreaterThan(boxes[0].width);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
