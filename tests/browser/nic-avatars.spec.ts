import {expect, test, type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function geometry(root: Locator) {
  await expect(root.locator('.nq-avatar')).toHaveCount(7);
  await expect(root.locator('img').first()).toHaveJSProperty('complete',true);
  const images=await root.locator('.nq-avatar:has(img)').evaluateAll(nodes=>nodes.map(el=>{
    const image=el.querySelector('img')!,s=getComputedStyle(el),p=getComputedStyle(image),r=el.getBoundingClientRect(),i=image.getBoundingClientRect();
    return {size:el.getAttribute('data-size'),variant:el.getAttribute('data-variant'),width:r.width,height:r.height,border:s.borderWidth,borderColor:s.borderColor,radius:s.borderRadius,imageWidth:i.width,imageHeight:i.height,fit:p.objectFit,position:p.objectPosition,loaded:image.naturalWidth>0,name:image.alt};
  }));
  expect(images).toHaveLength(5);
  for(const image of images){
    const size=Number(image.size);expect(image).toMatchObject({width:size,height:size,border:'3px',borderColor:'rgb(255, 255, 255)',imageWidth:size-6,imageHeight:size-6,fit:'cover',position:'50% 50%',loaded:true});expect(image.name).not.toBe('');
    expect(image.radius).toBe(image.variant==='square'?'8px':'9999px');
  }
  const fallback=root.locator('.nq-avatar[role="img"]');await expect(fallback).toHaveCount(2);
  for(const item of await fallback.all()){await expect(item).toHaveAttribute('aria-label',/.+/);await expect(item.locator('span')).toHaveAttribute('aria-hidden','true');}
}
for(const locale of ['ar','en'])test(`avatar sizes, image crops, themes and static semantics in ${locale}`,async({page},info)=>{
  await page.addInitScript(locale=>{if(window===window.top){localStorage.setItem('nasaq-locale',locale);localStorage.setItem('nasaq-mode','light');}},locale);
  await page.goto('/#component/avatar');const root=page.locator('#component-examples');await geometry(root);
  await expect(root.locator('.source-details pre')).toHaveCount(28);
  for(const mode of ['light','dark']){
    await root.evaluate((el,mode)=>{el.setAttribute('data-nq-mode',mode);(el as HTMLElement).style.backgroundColor='var(--nq-color-surface)';},mode);
    expect((await new AxeBuilder({page}).include('#component-examples .component-preview').analyze()).violations).toEqual([]);
  }
  await root.evaluate(el=>{el.setAttribute('data-nq-mode','light');el.setAttribute('data-nq-theme','nasaq');});
  const avatar=root.locator('.nq-avatar').first();await avatar.evaluate(el=>el.removeAttribute('data-size'));
  expect((await avatar.boundingBox())!.width).toBe(44);await expect(avatar).toHaveCSS('border-width','1px');
  await root.evaluate(el=>{el.setAttribute('data-nq-theme','custom');(el as HTMLElement).style.setProperty('--nq-color-avatar-border','#123456');});
  expect((await avatar.boundingBox())!.width).toBe(40);await expect(avatar).toHaveCSS('border-color','rgb(18, 52, 86)');
  for(const [size,width] of [['sm',32],['lg',56],['xl',80]] as const){await avatar.evaluate((el,size)=>el.setAttribute('data-size',size),size);expect((await avatar.boundingBox())!.width).toBe(width);}
  await avatar.evaluate(el=>{el.setAttribute('data-size','40');});await root.evaluate(el=>{el.removeAttribute('data-nq-theme');(el as HTMLElement).style.removeProperty('--nq-color-avatar-border');});
  // Direct img markup must use the same dimensions as a wrapped image, without reset.css.
  await avatar.evaluate(el=>{const image=el.querySelector('img')!;image.className='nq-avatar';image.dataset.size='64';el.after(image);});
  const direct=root.locator('img.nq-avatar');expect((await direct.boundingBox())!.width).toBe(64);await direct.evaluate(el=>{const wrapper=el.previousElementSibling!;el.removeAttribute('class');el.removeAttribute('data-size');wrapper.append(el);});
  await page.setViewportSize({width:320,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.setViewportSize({width:1200,height:1000});await root.screenshot({path:info.outputPath(`avatars-${locale}.png`)});
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await expect(avatar).toHaveCSS('border-style','solid');
  await expect(page).toHaveURL(/#component\/avatar$/);
});
for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']}))for(const language of languages)test(`${framework} ${language} native avatar sizing and image failure preserve identity`,async({page})=>{
  test.setTimeout(120000);await page.goto('/#component/avatar');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const root=page.frameLocator('.nq-ide-frame').locator('.demo');await geometry(root);
  const avatar=root.locator('.nq-avatar').first();await avatar.locator('img').evaluate(image=>image.setAttribute('src','data:image/png;base64,broken'));
  await expect(avatar.locator('img')).toHaveCount(0);await expect(avatar).toHaveAttribute('role','img');await expect(avatar).toHaveAttribute('aria-label','مستخدم تجريبي');await expect(avatar).toHaveText('مت');
  expect((await avatar.boundingBox())!.width).toBe(40);
  await page.setViewportSize({width:390,height:844});expect(await root.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await expect(root.locator('.nq-avatar').last()).toHaveText('نس');
});
