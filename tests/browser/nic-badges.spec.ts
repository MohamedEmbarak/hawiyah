import {expect, test, type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const palette = {
  neutral: ['rgb(31, 42, 55)', 'rgb(249, 250, 251)', 'rgb(229, 231, 235)'],
  info: ['rgb(24, 73, 169)', 'rgb(239, 248, 255)', 'rgb(178, 221, 255)'],
  success: ['rgb(8, 93, 58)', 'rgb(236, 253, 243)', 'rgb(171, 239, 198)'],
  warning: ['rgb(147, 55, 12)', 'rgb(255, 250, 235)', 'rgb(254, 223, 137)'],
  danger: ['rgb(145, 32, 24)', 'rgb(254, 205, 202)', 'rgb(254, 205, 202)'],
};
async function geometry(root: Locator) {
  await expect(root.locator('.hw-badge')).toHaveCount(15);
  await expect(root.locator('.hw-badge').first()).toHaveCSS('line-height','18px');
  const rendered=await root.locator('.hw-badge').evaluateAll(nodes=>nodes.map(el=>{
    const s=getComputedStyle(el),d=getComputedStyle(el,'::before');
    return {tone:el.getAttribute('data-tone'),variant:el.getAttribute('data-variant'),text:s.color,background:s.backgroundColor,font:s.fontSize,lineHeight:s.lineHeight,padding:s.padding,height:el.getBoundingClientRect().height,role:el.getAttribute('role'),tabindex:el.getAttribute('tabindex'),gap:s.gap,borderWidth:s.borderWidth,radius:s.borderRadius,border:s.borderColor,dot:{width:d.width,height:d.height,color:d.backgroundColor}};
  }));
  for(const variant of ['soft','outline','dot'])for(const [tone,[text,background,border]] of Object.entries(palette)) {
    const badge=rendered.find(item=>item.tone===tone&&item.variant===variant)!;
    expect(badge).toBeDefined();
    expect(badge).toMatchObject({text,background:variant==='outline'?'rgba(0, 0, 0, 0)':background,font:'12px',lineHeight:'18px',padding:'0px 8px',height:variant==='dot'?24:20,role:null,tabindex:null});
    if(variant==='dot')expect(badge).toMatchObject({gap:'8px',borderWidth:'0px',dot:{width:'10px',height:'10px',color:tone==='neutral'?'rgb(77, 87, 97)':text}});
    else expect(badge).toMatchObject({radius:'4px',border:variant==='outline'?text:border});
  }
  for(const variant of ['soft','outline','dot']){
    const badge=root.locator(`.hw-badge[data-tone="info"][data-variant="${variant}"]`);
    await badge.hover();await expect(badge).toHaveCSS('color',palette.info[0]);
  }
}
for(const locale of ['ar','en'])test(`badge source geometry, all statuses, wrapping and theme isolation in ${locale}`,async({page},info)=>{
  test.setTimeout(120000);await page.addInitScript(locale=>{if(window===window.top){localStorage.setItem('hawiyah-locale',locale);localStorage.setItem('hawiyah-mode','light');}},locale);
  await page.goto('/#component/badge');const examples=page.locator('#component-examples');
  await geometry(examples);
  await expect(examples.locator('.ready-example .source-details pre')).toHaveCount(12);
  for(const mode of ['light','dark']){
    await examples.evaluate((el,mode)=>{el.setAttribute('data-hw-mode',mode);(el as HTMLElement).style.backgroundColor='var(--hw-color-surface)';},mode);
    expect((await new AxeBuilder({page}).include('#component-examples .component-preview').analyze()).violations).toEqual([]);
  }
  await examples.evaluate(el=>{el.setAttribute('data-hw-mode','light');el.setAttribute('data-hw-theme','hawiyah');});
  const soft=examples.locator('.hw-badge[data-tone="success"][data-variant="soft"]');
  await expect(soft).toHaveCSS('border-radius','999px');await expect(soft).toHaveCSS('border-color','rgba(0, 0, 0, 0)');await expect(soft).toHaveCSS('color','rgb(23, 100, 71)');
  const dot=examples.locator('.hw-badge[data-tone="neutral"][data-variant="dot"]');
  expect(await dot.evaluate(el=>getComputedStyle(el,'::before').width)).toBe('6px');
  await examples.evaluate(el=>{el.setAttribute('data-hw-theme','custom');(el as HTMLElement).style.setProperty('--hw-color-badge-success-text','#123456');});
  await expect(soft).toHaveCSS('color','rgb(18, 52, 86)');await expect(soft).toHaveCSS('border-radius','4px');
  await examples.evaluate(el=>{el.removeAttribute('data-hw-theme');(el as HTMLElement).style.removeProperty('--hw-color-badge-success-text');});
  await page.setViewportSize({width:320,height:900});
  await dot.evaluate(el=>{el.textContent='حالة الطلب التفصيلية مع وصف طويل قابل للالتفاف';(el as HTMLElement).style.maxWidth='120px';});
  expect((await dot.boundingBox())!.height).toBeGreaterThan(24);
  expect(await dot.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  expect(await dot.evaluate(el=>getComputedStyle(el,'::before').width)).toBe('10px');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.setViewportSize({width:1200,height:1000});await examples.screenshot({path:info.outputPath(`badge-gallery-${locale}.png`)});
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await expect(soft).toHaveCSS('border-width','1px');
  expect(await dot.evaluate(el=>getComputedStyle(el,'::before').backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  await expect(page).toHaveURL(/#component\/badge$/);
});
for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']}))for(const language of languages)test(`${framework} ${language} renders all native badge variants with source styling`,async({page})=>{
  test.setTimeout(120000);await page.goto('/#component/badge');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const root=page.frameLocator('.hw-ide-frame').locator('.demo');await geometry(root);
  await page.setViewportSize({width:390,height:844});expect(await root.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await expect(root.locator('.hw-badges')).toHaveCount(3);
  await expect(page).toHaveURL(/#component\/badge$/);
});
