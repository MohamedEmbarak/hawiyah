import {expect, test, type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function featuredGeometry(root: Locator) {
  const examples = root.locator('[data-featured-examples]');
  const icons = examples.locator('.hw-icon-background');
  await expect(icons).toHaveCount(22);
  for (let i = 0; i < 4; i++) {
    const icon = icons.nth(i), glyph = icon.locator('.hw-icon, svg, .hw-featured-symbol').first();
    const box = (await icon.boundingBox())!, art = (await glyph.boundingBox())!;
    expect(box.width).toBe([32,40,48,56][i]); expect(box.height).toBe(box.width);
    expect(art.width).toBe([16,20,24,28][i]); expect(art.height).toBe(art.width);
    expect(Math.abs(box.x + box.width/2 - art.x - art.width/2)).toBeLessThan(1);
    expect(Math.abs(box.y + box.height/2 - art.y - art.height/2)).toBeLessThan(1);
  }
  await expect(examples.locator('[data-style="light"]').first()).toHaveCSS('border-radius','4px');
  await expect(examples.locator('[data-style="outline"]').first()).toHaveCSS('border-radius','8px');
  await expect(examples.locator('[data-style="outline"]').first()).toHaveCSS('border-width','1px');
  for (const tone of ['brand','neutral','success','error','warning','info']) await expect(examples.locator(`[data-tone="${tone}"]`)).toHaveCount(3);
}
async function iconGeometry(root: Locator, density = 'comfortable') {
  await root.evaluate((el, density) => el.setAttribute('data-hw-density', density), density);
  const buttons = root.locator('.hw-icon-button'); await expect(buttons).toHaveCount(7);
  const heights = density === 'compact' ? [24,32,32,40,32,32,32] : density === 'mobile' ? [32,40,40,44,40,40,40] : [32,40,40,40,40,40,40];
  for (let i = 0; i < 7; i++) {
    const button = buttons.nth(i), glyph = button.locator('.hw-icon,svg').first();
    const b = (await button.boundingBox())!, g = (await glyph.boundingBox())!;
    expect(b.width).toBe(heights[i]); expect(b.height).toBe(heights[i]);
    expect(g.width).toBe(i === 0 ? 16 : 20); expect(g.height).toBe(i === 0 ? 16 : 20);
    expect(Math.abs(b.x+b.width/2-g.x-g.width/2)).toBeLessThan(1);
    expect(Math.abs(b.y+b.height/2-g.y-g.height/2)).toBeLessThan(1);
  }
  await expect(buttons.nth(2)).toHaveCSS('border-radius','9999px');
  await expect(buttons.nth(5)).toBeDisabled(); await expect(buttons.nth(5)).toHaveCSS('color','rgb(157, 164, 174)');
  await expect(buttons.nth(6)).toBeDisabled(); await expect(buttons.nth(6)).toHaveAttribute('aria-busy','true');
  await expect(buttons.nth(1)).toHaveAttribute('data-variant','ghost');
}
async function stateChecks(root: Locator) {
  const buttons = root.locator('.hw-icon-button');
  const selected = buttons.nth(4); await selected.evaluate(async el => {await Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{})));}); const colors = await selected.evaluate(el => ({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
  await selected.hover(); await expect(selected).toHaveCSS('background-color',colors.background); await expect(selected).toHaveCSS('color',colors.color);
  await buttons.first().press('Tab'); await buttons.first().focus(); await expect(buttons.first()).toHaveCSS('outline-style','solid');
  await root.evaluate(el => el.style.setProperty('--hw-icon-size','18px')); await expect(buttons.first().locator('.hw-icon,svg').first()).toHaveCSS('width','18px');
  await root.evaluate(el => el.style.removeProperty('--hw-icon-size'));
}
for (const language of ['javascript','typescript']) test(`vanilla ${language} project includes Featured icon compositions`,async({page})=>{
  test.setTimeout(120000);
  await page.goto('/#component/icon-button');
  await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption('vanilla');
  await page.locator('[data-project-language]').selectOption(language);
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  await featuredGeometry(page.frameLocator('.hw-ide-frame').locator('#app'));
});
for (const dir of ['rtl','ltr']) test(`NIC icon geometry, states and background compositions in ${dir}`, async ({page},info) => {
  test.setTimeout(120000); await page.goto('/#component/icon-button');
  const root = page.locator('.component-preview').first();
  await root.evaluate((el,dir) => {el.setAttribute('dir',dir);el.setAttribute('data-hw-mode','light');el.style.background='var(--hw-color-surface)';},dir);
  await iconGeometry(root); await stateChecks(root);
  for (const density of ['compact','mobile']) await iconGeometry(root,density);
  await iconGeometry(root);
  const backgrounds = page.locator('.component-preview .hw-icon-background:not([data-variant="featured"])'); await expect(backgrounds).toHaveCount(3);
  for (let i=0;i<3;i++) {const box=(await backgrounds.nth(i).boundingBox())!;expect(box.width).toBe(i===0?30:48);expect(box.height).toBe(box.width);}
  await featuredGeometry(page.locator('.component-preview').filter({has:page.locator('[data-featured-examples]')}));
  await page.locator('[data-featured-examples]').screenshot({path:info.outputPath(`featured-${dir}.png`)});
  const sizes = page.locator('.component-preview').last().locator('.hw-icon'); await expect(sizes).toHaveCount(3);
  for (let i=0;i<3;i++) await expect(sizes.nth(i)).toHaveCSS('width',`${[14,20,24][i]}px`);
  expect((await new AxeBuilder({page}).include('.component-preview').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.setViewportSize({width:390,height:844}); await root.screenshot({path:info.outputPath(`icons-${dir}-mobile.png`)});
  expect(await root.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await root.locator('.hw-icon-button').first().click(); await expect(page).toHaveURL(/#component\/icon-button$/);
  await root.evaluate(el=>{const host=document.createElement('div');host.setAttribute('data-hw-density','compact');host.innerHTML='<button class="hw-button" data-icon-only data-legacy-icon data-size="sm" data-variant="ghost" data-shape="circle" type="button" aria-label="Legacy search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6" /></svg></button>';el.append(host);});
  const legacy=root.locator('[data-legacy-icon]');await expect(legacy).toHaveCSS('width','24px');await expect(legacy).toHaveCSS('height','24px');await expect(legacy.locator('svg')).toHaveCSS('width','16px');await expect(legacy).toHaveCSS('border-radius','9999px');
  await root.evaluate(el=>el.setAttribute('data-hw-mode','dark')); await stateChecks(root);
  await root.evaluate(el=>{el.setAttribute('data-hw-theme','hawiyah');el.setAttribute('data-hw-mode','light');});
  await expect(root.locator('.hw-icon-button').nth(1).locator('.hw-icon')).toHaveCSS('width','24px');
  await root.evaluate(el=>{el.setAttribute('data-hw-theme','custom');el.style.setProperty('--hw-color-primary-subtle','#123456');});
  await expect(root.locator('.hw-icon-button').nth(4)).toHaveCSS('background-color','rgb(18, 52, 86)');
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await root.locator('.hw-icon-button').first().focus(); await expect(root.locator('.hw-icon-button').first()).toHaveCSS('outline-style','solid');
  await expect(root.locator('.hw-icon-button').first()).toHaveCSS('transition-property','none');
});
for (const framework of ['react','vue','angular']) test(`${framework} native icon shape, SVG sizing, loading and toggle actions`,async({page},info)=>{
  test.setTimeout(120000);await page.goto('/#component/icon-button');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption('typescript');
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const frame=page.frameLocator('.hw-ide-frame'),root=frame.locator('.demo');await root.evaluate(el=>el.setAttribute('data-hw-mode','light'));
  await iconGeometry(root);await stateChecks(root);await iconGeometry(root,'compact');await iconGeometry(root,'mobile');
  await featuredGeometry(root);
  const buttons=root.locator('.hw-icon-button');await buttons.first().press('Enter');await expect(root.locator('output')).toHaveText('search');
  await buttons.nth(4).click();await expect(buttons.nth(4)).toHaveAttribute('aria-pressed','true');await expect(root.locator('output')).toHaveText('saved');
  for(const i of [5,6])await buttons.nth(i).evaluate(el=>(el as HTMLButtonElement).click());await expect(root.locator('output')).toHaveText('saved');
  await page.setViewportSize({width:390,height:844});await page.locator('.hw-ide-frame').scrollIntoViewIfNeeded();await root.screenshot({path:info.outputPath(`${framework}-icons.png`)});
  expect(await root.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await expect(page).toHaveURL(/#component\/icon-button$/);
});
