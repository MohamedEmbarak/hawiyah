import { expect, test } from '@playwright/test';
import { contrast, effectiveBackground, ink, openFixture } from './style-fixture';
test('carousel arrows keep a visible glyph in forced colours',async({page})=>{
  await page.emulateMedia({forcedColors:'active'});
  await openFixture(page,`<div class="hw-carousel-arrows"><button type="button" class="hw-button hw-carousel-arrow" data-hw-previous aria-label="Previous slide"></button><button type="button" class="hw-button hw-carousel-arrow" aria-label="Next slide"></button><button type="button" class="hw-button hw-carousel-arrow" aria-label="Disabled" disabled></button></div>`);
  for(const arrow of await page.locator('.hw-carousel-arrow').all()) {
    const box=(await arrow.boundingBox())!;
    // The centre 20px square holds only the glyph.
    expect(await ink(page,await page.screenshot({clip:{x:box.x+box.width/2-10,y:box.y+box.height/2-10,width:20,height:20}}))).toBeGreaterThan(10);
  }
});
test('a pressed icon button stays distinguishable in forced colours',async({page})=>{
  await page.emulateMedia({forcedColors:'active'});
  await openFixture(page,`<button type="button" class="hw-button hw-icon-button" data-variant="ghost" aria-pressed="true" aria-label="Pinned" id="on"><span class="hw-icon" data-icon="star" aria-hidden="true"></span></button>
    <button type="button" class="hw-button hw-icon-button" data-variant="ghost" aria-pressed="false" aria-label="Not pinned" id="off"><span class="hw-icon" data-icon="star" aria-hidden="true"></span></button>
    <button type="button" class="hw-button hw-icon-button" data-variant="secondary" aria-pressed="true" aria-label="Pinned secondary" id="on2"><span class="hw-icon" data-icon="star" aria-hidden="true"></span></button>
    <button type="button" class="hw-button hw-icon-button" data-variant="secondary" aria-pressed="false" aria-label="Not pinned secondary" id="off2"><span class="hw-icon" data-icon="star" aria-hidden="true"></span></button>`);
  const style=(id:string)=>page.locator(id).evaluate(node=>({background:getComputedStyle(node).backgroundColor,icon:getComputedStyle(node.firstElementChild!).backgroundColor}));
  for(const [on,off] of [['#on','#off'],['#on2','#off2']]) {
    const pressed=await style(on),rest=await style(off);
    expect(pressed.background).not.toBe(rest.background);
    expect(contrast(pressed.icon,pressed.background)).toBeGreaterThanOrEqual(3);
  }
});
for(const mode of ['light','dark'] as const)
  test(`the upload-list remove action keeps its glyph contrast on hover and focus (${mode})`,async({page})=>{
    await openFixture(page,`<ul class="hw-upload-list"><li class="hw-upload-item" data-status="complete"><span class="hw-upload-name">report.pdf</span><span class="hw-upload-status" role="status">Uploaded</span><button type="button" class="hw-button" data-variant="subtle" aria-label="Remove report.pdf" id="remove">Remove</button></li></ul>`,{mode});
    const primaryHover=await page.evaluate(()=>{const probe=document.createElement('i');probe.style.color='var(--hw-button-hover)';document.querySelector('#remove')!.append(probe);const value=getComputedStyle(probe).color;probe.remove();return value;});
    for(const action of ['hover','focus'] as const) {
      if(action==='hover') await page.locator('#remove').hover();
      else {await page.mouse.move(0,0);await page.keyboard.press('Tab');await expect(page.locator('#remove')).toBeFocused();}
      const glyph=await page.locator('#remove').evaluate(node=>getComputedStyle(node).color);
      const background=await effectiveBackground(page,'#remove');
      expect(background,`${action} ${mode}`).not.toBe(primaryHover);
      expect(contrast(glyph,background),`${action} ${mode}`).toBeGreaterThanOrEqual(3);
    }
  });
for(const lang of ['en','ar'] as const)
  test(`file upload and dropzone reflow inside a narrow card at 320px (${lang})`,async({page})=>{
    await page.setViewportSize({width:320,height:800});
    // Documented vanilla markup: the label is the zone and holds a plain file input.
    await openFixture(page,`<div style="inline-size:234px;box-sizing:border-box">
      <label class="hw-upload" id="upload"><strong>${lang==='en'?'Choose a document':'اختر مستندًا'}</strong><span class="hw-hint">PDF · PNG · JPG</span><input type="file" id="doc" accept=".pdf,.png,.jpg"></label>
      <label class="hw-file-dropzone" id="zone"><strong>${lang==='en'?'Choose or drop documents':'اختر المستندات أو أفلتها'}</strong><span class="hw-hint">PDF, PNG · 5 MB</span><input type="file" id="drop" multiple><span role="status"></span></label></div>`,{lang});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    for(const [zone,input] of [['#upload','#doc'],['#zone','#drop']]) {
      const outer=(await page.locator(zone).boundingBox())!,inner=(await page.locator(input).boundingBox())!;
      expect(inner.x).toBeGreaterThanOrEqual(outer.x-0.5);
      expect(inner.x+inner.width).toBeLessThanOrEqual(outer.x+outer.width+0.5);
      expect(await page.locator(zone).evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
    }
  });
test('the vanilla data-dragover marker shows the drag-over state',async({page})=>{
  await openFixture(page,`<div class="hw-file-dropzone" id="zone"><p>Drop files</p><input type="file" aria-label="Files"></div><div class="hw-file-dropzone" id="ref" data-state="dragging"><p>Reference</p></div>`);
  const reference=await page.locator('#ref').evaluate(node=>[getComputedStyle(node).borderTopColor,getComputedStyle(node).backgroundColor]);
  const rest=await page.locator('#zone').evaluate(node=>getComputedStyle(node).borderTopColor);
  expect(rest).not.toBe(reference[0]);
  await page.locator('#zone').evaluate(node=>node.setAttribute('data-dragover',''));
  // The zone transitions its colours, so wait for the settled values.
  await expect(page.locator('#zone')).toHaveCSS('border-top-color',reference[0]);
  await expect(page.locator('#zone')).toHaveCSS('background-color',reference[1]);
});
test('calendar month buttons show one chevron with or without icon markup',async({page})=>{
  await openFixture(page,`<div class="hw-calendar"><button type="button" class="hw-button hw-calendar-prev" aria-label="Previous month" id="icon"><span class="hw-icon" data-icon="arrow-left-01" data-directional="true" data-size="md" aria-hidden="true"></span></button><button type="button" class="hw-button hw-calendar-next" id="text">Next month</button></div>`);
  expect(await page.locator('#icon').evaluate(node=>getComputedStyle(node,'::before').content)).toBe('none');
  expect(await page.locator('#text').evaluate(node=>getComputedStyle(node,'::before').content)).toBe('""');
});
test('an empty-state icon wrapped in a decorative span gets the icon tile',async({page})=>{
  await openFixture(page,`<section class="hw-empty"><span aria-hidden="true" id="tile"><svg viewBox="0 0 24 24" id="art"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"></circle></svg></span><h3>No requests</h3><p>New requests appear here.</p></section>
    <section class="hw-empty"><svg viewBox="0 0 24 24" id="direct"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"></circle></svg><h3>No requests</h3></section>`);
  const tile=(await page.locator('#tile').boundingBox())!,direct=(await page.locator('#direct').boundingBox())!;
  expect([tile.width,tile.height]).toEqual([direct.width,direct.height]);
  expect((await page.locator('#art').boundingBox())!.width).toBe(40);
  expect(await page.locator('#tile').evaluate(node=>getComputedStyle(node).backgroundColor)).toBe(await page.locator('#direct').evaluate(node=>getComputedStyle(node).backgroundColor));
});
for(const theme of [undefined,'hawiyah'])
  test(`field hints use the type scale, never 10px (${theme??'dga'} theme)`,async({page})=>{
    await openFixture(page,`<div class="hw-field"><label class="hw-label" for="name">Request name</label><input class="hw-input" id="name" aria-describedby="hint"><p class="hw-hint" id="hint">A clear name helps you follow the request.</p></div>`,{theme});
    await expect(page.locator('#hint')).toHaveCSS('font-size',theme?'14px':'12px');
  });
