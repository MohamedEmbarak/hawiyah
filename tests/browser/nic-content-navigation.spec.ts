import {expect,test,type Locator} from '@playwright/test';
import {readFileSync} from 'node:fs';
import AxeBuilder from '@axe-core/playwright';

async function exercise(scope:Locator) {
 const examples=scope.locator('.content-navigation-demo');await expect(examples).toHaveCount(2);
 const example=examples.first(),nav=example.locator('.hw-content-nav'),scroll=example.locator('.content-navigation-demo-scroll');
 const links=nav.locator('a[data-hw-section]:not([aria-disabled="true"])');await expect(links).toHaveCount(4);
 await expect(nav.locator('[aria-current="location"]')).toHaveCount(1);await expect(links.first()).toHaveAttribute('aria-current','location');
 await expect(nav.locator('.hw-content-nav-heading')).toBeVisible();await expect(examples.last().locator('.hw-content-nav-heading')).toHaveCount(0);await expect(examples.last().locator('.hw-content-nav')).toHaveAttribute('aria-label',/./);
 await expect(nav).toHaveCSS('gap','8px');await expect(links.first()).toHaveCSS('min-height','40px');await expect(links.first()).toHaveCSS('border-radius','2px');await expect(links.first().locator('.hw-content-nav-label')).toHaveCSS('font-size','14px');await expect(links.first().locator('.hw-content-nav-label')).toHaveCSS('line-height','28px');await expect(links.first().locator('.hw-content-nav-marker')).toHaveCSS('width','3px');
 const nested=nav.locator('.hw-content-nav-sublist a');expect(await nested.evaluate(el=>getComputedStyle(el,'::before').width)).toBe('2px');
 await links.last().scrollIntoViewIfNeeded();const before=await nav.evaluate(()=>window.scrollY);await links.last().click();await expect(links.last()).toHaveAttribute('aria-current','location');expect(await scroll.evaluate(el=>el.scrollTop)).toBeGreaterThan(300);expect(await nav.evaluate(()=>window.scrollY)).toBeCloseTo(before,0);
 const nestedId=(await nested.getAttribute('data-hw-section'))!;await nested.focus();await nested.press('Enter');await expect(nested).toHaveAttribute('aria-current','location');const target=scroll.locator(`[id="${nestedId}"]`);await expect(target).toBeFocused();await expect(target).toHaveAttribute('tabindex','-1');await links.first().focus();await expect(target).not.toHaveAttribute('tabindex','-1');
 const position=await scroll.evaluate(el=>el.scrollTop);await nav.locator('[aria-disabled="true"]').click({force:true});expect(await scroll.evaluate(el=>el.scrollTop)).toBe(position);await expect(nested).toHaveAttribute('aria-current','location');
 // Passive tracking must not steal focus or scroll the page.
 await links.first().focus();const pageTop=await nav.evaluate(()=>window.scrollY);await scroll.evaluate(el=>{el.scrollTop=0;});await expect(links.first()).toHaveAttribute('aria-current','location');await expect(links.first()).toBeFocused();expect(await nav.evaluate(()=>window.scrollY)).toBeCloseTo(pageTop,0);
 await nav.evaluate(el=>{(el as HTMLElement).style.blockSize='80px';(el as HTMLElement).style.overflow='auto';});await scroll.evaluate(el=>{el.scrollTop=el.scrollHeight;});await expect(links.last()).toHaveAttribute('aria-current','location');expect(await nav.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);expect(await nav.evaluate(()=>window.scrollY)).toBeCloseTo(pageTop,0);
 await nav.evaluate(el=>{(el as HTMLElement).style.removeProperty('block-size');(el as HTMLElement).style.removeProperty('overflow');});
 await expect(examples.last().locator('a[data-hw-section]').first()).toHaveAttribute('aria-current','location');
 return {example,nav,scroll,links};
}

for(const locale of ['ar','en'])test(`content navigation source states and contained scrolling in ${locale}`,async({page},info)=>{
 test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(locale=>{if(window===window.top){localStorage.setItem('hawiyah-locale',locale);localStorage.setItem('hawiyah-mode','light');}},locale);await page.setViewportSize({width:1543,height:1000});await page.goto('/#component/content-navigation');
 const scope=page.locator('#component-examples'),{example,nav,scroll,links}=await exercise(scope);await expect(scope.locator('.source-details pre')).toHaveCount(8);
 const marker=links.first().locator('.hw-content-nav-marker');await scroll.focus();await links.first().hover();await expect(links.first()).toHaveCSS('background-color','rgb(243, 244, 246)');await expect(marker).toHaveCSS('background-color','rgb(152, 162, 179)');
 await links.first().focus();await expect(links.first()).toHaveCSS('background-color','rgb(210, 214, 219)');expect(await links.first().evaluate(el=>parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
 for(const mode of ['light','dark']){await scope.evaluate((el,mode)=>{el.setAttribute('data-hw-mode',mode);(el as HTMLElement).style.background='var(--hw-color-surface)';(el as HTMLElement).style.color='var(--hw-color-text)';},mode);await scope.evaluate(el=>Promise.all(el.getAnimations({subtree:true}).filter(a=>a instanceof CSSTransition).map(a=>a.finished)));expect((await new AxeBuilder({page}).include('#component-examples .component-preview').analyze()).violations).toEqual([]);}
 await scope.evaluate(el=>el.setAttribute('data-hw-mode','light'));for(const dir of ['rtl','ltr']){await nav.evaluate((el,dir)=>el.setAttribute('dir',dir),dir);expect(await marker.evaluate((el,dir)=>{const m=el.getBoundingClientRect(),p=el.parentElement!.getBoundingClientRect();return Math.abs(dir==='rtl'?m.right-p.right:m.left-p.left)<1;},dir)).toBe(true);}
 await nav.evaluate((el,dir)=>el.setAttribute('dir',dir),locale==='ar'?'rtl':'ltr');await scope.evaluate(el=>el.setAttribute('data-hw-theme','hawiyah'));await links.last().click();await expect(links.last()).toHaveAttribute('aria-current','location');await scope.evaluate(el=>{el.setAttribute('data-hw-theme','custom');(el as HTMLElement).style.setProperty('--hw-color-primary-text','#005a9c');});await scroll.focus();await page.mouse.move(0,0);await expect(links.last().locator('.hw-content-nav-marker')).toHaveCSS('background-color','rgb(0, 90, 156)');
 await nav.evaluate(el=>el.setAttribute('data-sticky','true'));await expect(nav).toHaveCSS('position','sticky');await expect(nav).toHaveCSS('top','145px');await expect(nav).toHaveCSS('max-height','835px');
 await page.setViewportSize({width:320,height:844});await expect(nav).not.toHaveCSS('position','sticky');await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await example.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath(`content-nav-${locale}-mobile.png`)});
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.keyboard.press('Tab');await links.first().focus();await expect(links.first()).toHaveCSS('outline-style','solid');await expect(page).toHaveURL(/#component\/content-navigation$/);
});

for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']}))for(const language of languages)test(`${framework} ${language} native content navigation`,async({page})=>{
 test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1864,height:1100});await page.goto('/#component/content-navigation');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});const scope=page.frameLocator('.hw-ide-frame').locator('.demo');const{example,links}=await exercise(scope);await expect(example.locator('output')).toContainText('support');await page.setViewportSize({width:390,height:844});await expect.poll(()=>scope.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(0);await links.first().press('Enter');await expect(links.first()).toHaveAttribute('aria-current','location');await expect(example.locator('output')).toContainText('overview');await expect(page).toHaveURL(/#component\/content-navigation$/);
});

test('window navigation respects its offset, reduced motion and destruction',async({page})=>{
 const generated=readFileSync('apps/playground/src/generated/preview-runtime.ts','utf8');
 const runtime=JSON.parse(generated.match(/^export const previewRuntime = (.+);$/m)![1]!);
 const styles=JSON.parse(generated.match(/^export const previewStyles = (.+);$/m)![1]!);
 await page.goto('about:blank');await page.setViewportSize({width:900,height:700});await page.emulateMedia({reducedMotion:'reduce'});await page.setContent(`<html lang="en"><head><style>${styles}html{scroll-behavior:smooth}body{margin:0;padding-top:80px}.fixture-section{height:650px;padding-inline:220px 20px}.hw-content-nav{position:fixed;top:0;left:0;width:200px;background:var(--hw-color-surface)}</style></head><body><nav class="hw-content-nav" data-hw="content-navigation" aria-label="On this page">${['one','two','three'].map(id=>`<a class="hw-content-nav-link" href="#${id}" data-hw-section="${id}">${id}</a>`).join('')}</nav>${['one','two','three'].map(id=>`<section class="fixture-section" id="${id}"><h2>${id}</h2></section>`).join('')}</body></html>`);await page.addScriptTag({content:runtime});await page.evaluate(()=>{(window as any).fixtureController=(window as any).HawiyahVanilla.createContentNavigation(document.querySelector('nav'));});
 const second=page.locator('nav a').nth(1);await expect(page.locator('nav a').first()).toHaveAttribute('aria-current','location');await second.press('Enter');await expect(second).toHaveAttribute('aria-current','location');await expect(page.locator('#two')).toBeFocused();expect(await page.locator('#two').evaluate(el=>el.getBoundingClientRect().top)).toBeCloseTo(80,0);await expect(page).toHaveURL('about:blank');
 await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await expect(page.locator('nav a').last()).toHaveAttribute('aria-current','location');await page.evaluate(()=>(window as any).fixtureController.destroy());await expect(page.locator('nav [aria-current]')).toHaveCount(0);await expect(page.locator('#two')).not.toHaveAttribute('tabindex','-1');
});


test('unenhanced guide section links cannot navigate the host or editor frame',async({page})=>{
 await page.goto('/#component/content-navigation');
 const preview=page.locator('#component-examples .component-preview').first();
 const markup='<nav class="hw-content-nav"><a class="hw-content-nav-link" data-hw-section="missing" href="#missing">Unenhanced destination</a></nav>';
 await preview.evaluate((el,markup)=>el.insertAdjacentHTML('beforeend',markup),markup);
 await preview.getByText('Unenhanced destination').click();await expect(page).toHaveURL(/#component\/content-navigation$/);
 await page.locator('[data-guide-tab="playground"]').click();await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
 const body=page.frameLocator('.hw-ide-frame').locator('body');const before=await body.evaluate(()=>location.href);
 await body.evaluate((el,markup)=>el.insertAdjacentHTML('beforeend',markup),markup);await body.getByText('Unenhanced destination').click();expect(await body.evaluate(()=>location.href)).toBe(before);await expect(page).toHaveURL(/#component\/content-navigation$/);
});
