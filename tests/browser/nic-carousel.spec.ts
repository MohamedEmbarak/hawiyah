import {expect,test,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function position(root:Locator,index:number){
  await expect(root).toHaveCSS('--nq-carousel-index',String(index));
  const slide=root.locator('.nq-carousel-slide').nth(index);
  await expect(slide).not.toHaveAttribute('inert');
  await expect.poll(async()=>{const v=(await root.locator('.nq-carousel-viewport').boundingBox())!,s=(await slide.boundingBox())!;return Math.abs(s.x-v.x);}).toBeLessThan(1);
  await expect(root.locator('.nq-carousel-dot[aria-current="true"]')).toHaveCount(1);
  await expect(root.locator('.nq-carousel-dot').nth(index)).toHaveAttribute('aria-current','true');
}
async function cases(scope:Locator){
  const roots=scope.locator('.nq-carousel');await expect(roots).toHaveCount(5);
  const normal=roots.nth(0),loop=roots.nth(1),without=roots.nth(2),empty=roots.nth(3),single=roots.nth(4);
  await expect(normal.locator('.nq-carousel-track')).toHaveCSS('transition-duration','0.6s');
  await expect(normal.locator('.nq-carousel-track')).toHaveCSS('transition-timing-function','cubic-bezier(0.25, 1, 0.5, 1)');
  await expect(normal.locator('.nq-carousel-track')).toHaveCSS('gap','16px');
  for(const arrow of await normal.locator('.nq-carousel-arrow').all()){expect((await arrow.boundingBox())!.width).toBe(45);expect((await arrow.boundingBox())!.height).toBe(45);await expect(arrow).toHaveCSS('border-radius','50%');await expect(arrow).toHaveAttribute('aria-label',/.+/);}
  const dot=normal.locator('.nq-carousel-dot').first();expect((await dot.boundingBox())!.width).toBe(24);expect(await dot.evaluate(el=>getComputedStyle(el,'::before').width)).toBe('12px');
  await dot.hover();expect(await dot.evaluate(el=>getComputedStyle(el,'::before').backgroundColor)).toBe('rgb(27, 131, 84)');
  await normal.locator('[data-nq-next]').press('Enter');await position(normal,1);await expect(normal.locator('.nq-carousel-slide').first()).toHaveAttribute('inert','');
  await normal.locator('.nq-carousel-dot').last().press('Space');await position(normal,2);await expect(normal.locator('[data-nq-next]')).toBeDisabled();
  await normal.locator('[data-nq-previous]').press('Enter');await position(normal,1);
  await loop.locator('[data-nq-previous]').click();await position(loop,2);await expect(loop.locator('[data-nq-next]')).toBeEnabled();
  await expect(without.locator('.nq-carousel-dot')).toHaveCount(0);await without.locator('[data-nq-next]').click();await expect(without).toHaveCSS('--nq-carousel-index','1');
  await expect(empty.locator('.nq-carousel-empty')).toBeVisible();await expect(empty.locator('.nq-carousel-slide')).toHaveCount(0);
  for(const root of [empty,single])for(const arrow of await root.locator('.nq-carousel-arrow').all())await expect(arrow).toBeDisabled();
  return normal;
}
for(const locale of ['ar','en'])test(`carousel source motion, keyboard, direction and themes in ${locale}`,async({page},info)=>{
  test.setTimeout(120000);await page.addInitScript(locale=>{if(window===window.top){localStorage.setItem('nasaq-locale',locale);localStorage.setItem('nasaq-mode','light');}},locale);
  await page.goto('/#component/carousel');const examples=page.locator('#component-examples');const normal=await cases(examples);
  await expect(examples.locator('.source-details pre')).toHaveCount(20);
  expect(await normal.locator('[data-nq-next]').evaluate(el=>getComputedStyle(el,'::before').content)).toBe(locale==='ar'?'"←"':'"→"');
  await normal.evaluate((el,dir)=>el.setAttribute('dir',dir),locale==='ar'?'ltr':'rtl');await position(normal,1);
  expect(await normal.locator('[data-nq-next]').evaluate(el=>getComputedStyle(el,'::before').content)).toBe(locale==='ar'?'"→"':'"←"');
  await normal.evaluate(el=>el.removeAttribute('dir'));await position(normal,1);
  await normal.locator('.nq-carousel-slide').first().evaluate(el=>{const button=document.createElement('button');button.textContent='Inactive action';el.append(button);button.focus();});
  await expect(normal.locator('.nq-carousel-slide').first().locator('button')).not.toBeFocused();
  for(const mode of ['light','dark']){await examples.evaluate((el,mode)=>{el.setAttribute('data-nq-mode',mode);(el as HTMLElement).style.background='var(--nq-color-surface)';},mode);expect((await new AxeBuilder({page}).include('#component-examples .component-preview').analyze()).violations).toEqual([]);}
  await examples.evaluate(el=>{el.setAttribute('data-nq-mode','light');el.setAttribute('data-nq-theme','nasaq');});await expect(normal.locator('.nq-carousel-track')).toHaveCSS('transition-duration','0s');
  await examples.evaluate(el=>{el.setAttribute('data-nq-theme','custom');(el as HTMLElement).style.setProperty('--nq-duration-carousel','900ms');});await expect(normal.locator('.nq-carousel-track')).toHaveCSS('transition-duration','0.9s');
  await page.emulateMedia({reducedMotion:'reduce'});await expect(normal.locator('.nq-carousel-track')).toHaveCSS('transition-property','none');await normal.locator('.nq-carousel-dot').first().click();await position(normal,0);
  await page.setViewportSize({width:320,height:900});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await normal.screenshot({path:info.outputPath(`carousel-${locale}-mobile.png`)});
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await normal.locator('.nq-carousel-dot').first().focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(normal.locator('.nq-carousel-dot').first()).toBeFocused();await expect(normal.locator('.nq-carousel-dot').first()).toHaveCSS('outline-style','solid');
  await expect(page).toHaveURL(/#component\/carousel$/);
});
for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']}))for(const language of languages)test(`${framework} ${language} native carousel controls, indicators and track work together`,async({page})=>{
  test.setTimeout(120000);await page.goto('/#component/carousel');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});const root=page.frameLocator('.nq-ide-frame').locator('.demo');const normal=await cases(root);
  await expect(root.locator('output')).toHaveText('1');await page.setViewportSize({width:390,height:844});expect(await root.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.emulateMedia({reducedMotion:'reduce'});await expect(normal.locator('.nq-carousel-track')).toHaveCSS('transition-property','none');
});
