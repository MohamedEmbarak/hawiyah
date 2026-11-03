import {expect, test, type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function iconGeometry(root: Locator, density = 'comfortable') {
  await root.evaluate((el, density) => el.setAttribute('data-nq-density', density), density);
  const buttons = root.locator('.nq-icon-button'); await expect(buttons).toHaveCount(7);
  const heights = density === 'compact' ? [24,32,32,40,32,32,32] : density === 'mobile' ? [32,40,40,44,40,40,40] : [32,40,40,40,40,40,40];
  for (let i = 0; i < 7; i++) {
    const button = buttons.nth(i), glyph = button.locator('.nq-icon,svg').first();
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
  const buttons = root.locator('.nq-icon-button');
  const selected = buttons.nth(4); await selected.evaluate(async el => {await Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{})));}); const colors = await selected.evaluate(el => ({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
  await selected.hover(); await expect(selected).toHaveCSS('background-color',colors.background); await expect(selected).toHaveCSS('color',colors.color);
  await buttons.first().press('Tab'); await buttons.first().focus(); await expect(buttons.first()).toHaveCSS('outline-style','solid');
  await root.evaluate(el => el.style.setProperty('--nq-icon-size','18px')); await expect(buttons.first().locator('.nq-icon,svg').first()).toHaveCSS('width','18px');
  await root.evaluate(el => el.style.removeProperty('--nq-icon-size'));
}
for (const dir of ['rtl','ltr']) test(`NIC icon geometry, states and background compositions in ${dir}`, async ({page},info) => {
  test.setTimeout(120000); await page.goto('/#component/icon-button');
  const root = page.locator('.component-preview').first();
  await root.evaluate((el,dir) => {el.setAttribute('dir',dir);el.setAttribute('data-nq-mode','light');el.style.background='var(--nq-color-surface)';},dir);
  await iconGeometry(root); await stateChecks(root);
  for (const density of ['compact','mobile']) await iconGeometry(root,density);
  await iconGeometry(root);
  const backgrounds = page.locator('.component-preview .nq-icon-background'); await expect(backgrounds).toHaveCount(3);
  for (let i=0;i<3;i++) {const box=(await backgrounds.nth(i).boundingBox())!;expect(box.width).toBe(i===0?30:48);expect(box.height).toBe(box.width);}
  const sizes = page.locator('.component-preview').last().locator('.nq-icon'); await expect(sizes).toHaveCount(5);
  for (let i=0;i<5;i++) await expect(sizes.nth(i)).toHaveCSS('width',`${[14,20,24,30,48][i]}px`);
  expect((await new AxeBuilder({page}).include('.component-preview').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.setViewportSize({width:390,height:844}); await root.screenshot({path:info.outputPath(`icons-${dir}-mobile.png`)});
  expect(await root.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await root.locator('.nq-icon-button').first().click(); await expect(page).toHaveURL(/#component\/icon-button$/);
  await root.evaluate(el=>{const host=document.createElement('div');host.setAttribute('data-nq-density','compact');host.innerHTML='<button class="nq-button" data-icon-only data-legacy-icon data-size="sm" data-variant="ghost" data-shape="circle" type="button" aria-label="Legacy search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6" /></svg></button>';el.append(host);});
  const legacy=root.locator('[data-legacy-icon]');await expect(legacy).toHaveCSS('width','24px');await expect(legacy).toHaveCSS('height','24px');await expect(legacy.locator('svg')).toHaveCSS('width','16px');await expect(legacy).toHaveCSS('border-radius','9999px');
  await root.evaluate(el=>el.setAttribute('data-nq-mode','dark')); await stateChecks(root);
  await root.evaluate(el=>{el.setAttribute('data-nq-theme','nasaq');el.setAttribute('data-nq-mode','light');});
  await expect(root.locator('.nq-icon-button').nth(1).locator('.nq-icon')).toHaveCSS('width','24px');
  await root.evaluate(el=>{el.setAttribute('data-nq-theme','custom');el.style.setProperty('--nq-color-primary-subtle','#123456');});
  await expect(root.locator('.nq-icon-button').nth(4)).toHaveCSS('background-color','rgb(18, 52, 86)');
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await root.locator('.nq-icon-button').first().focus(); await expect(root.locator('.nq-icon-button').first()).toHaveCSS('outline-style','solid');
  await expect(root.locator('.nq-icon-button').first()).toHaveCSS('transition-property','none');
});
for (const framework of ['react','vue','angular']) test(`${framework} native icon shape, SVG sizing, loading and toggle actions`,async({page},info)=>{
  test.setTimeout(120000);await page.goto('/#component/icon-button');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption('typescript');
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const frame=page.frameLocator('.nq-ide-frame'),root=frame.locator('.demo');await root.evaluate(el=>el.setAttribute('data-nq-mode','light'));
  await iconGeometry(root);await stateChecks(root);await iconGeometry(root,'compact');await iconGeometry(root,'mobile');
  const buttons=root.locator('.nq-icon-button');await buttons.first().press('Enter');await expect(root.locator('output')).toHaveText('search');
  await buttons.nth(4).click();await expect(buttons.nth(4)).toHaveAttribute('aria-pressed','true');await expect(root.locator('output')).toHaveText('saved');
  for(const i of [5,6])await buttons.nth(i).evaluate(el=>(el as HTMLButtonElement).click());await expect(root.locator('output')).toHaveText('saved');
  await page.setViewportSize({width:390,height:844});await page.locator('.nq-ide-frame').scrollIntoViewIfNeeded();await root.screenshot({path:info.outputPath(`${framework}-icons.png`)});
  expect(await root.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await expect(page).toHaveURL(/#component\/icon-button$/);
});
