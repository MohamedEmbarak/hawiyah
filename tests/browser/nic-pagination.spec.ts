import {expect,test,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function cases(scope:Locator){
 const navs=scope.locator('.nq-pagination');await expect(navs).toHaveCount(6);
 const first=navs.nth(0),middle=navs.nth(1),last=navs.nth(2),single=navs.nth(3),disabled=navs.nth(4),large=navs.nth(5);
 const compact=await scope.evaluate(el=>el.ownerDocument.defaultView!.matchMedia('(max-width: 576px)').matches);
 const current=first.locator('[aria-current="page"]');await expect(current).toHaveText('1');
 await expect(current).toHaveCSS('min-width',compact?'30px':'40px');await expect(current).toHaveCSS('height',compact?'30px':'40px');await expect(current).toHaveCSS('border-radius','0px');await expect(current).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 expect(await current.evaluate(el=>getComputedStyle(el,'::after').height)).toBe('3px');await expect(first).toHaveCSS('gap',compact?'6px':'8px');await expect(first).toHaveCSS('margin-top','40px');
 await expect(first.locator('[data-nq-previous]')).toBeDisabled();await first.locator('[data-nq-next]').press('Enter');await expect(current).toHaveText('2');
 const trigger=first.locator('summary');await trigger.press('Enter');await expect(first.locator('details')).toHaveAttribute('open','');
 const menu=first.locator('.nq-pagination-menu');await expect(menu).toBeVisible();await expect(menu).toHaveCSS('min-width','80px');await expect(menu).toHaveCSS('max-height','300px');await expect(menu.locator('[data-nq-page="8"]')).toHaveCSS('height','40px');
 await menu.locator('[data-nq-page="8"]').click();await expect(current).toHaveText('8');await expect(current).toBeFocused();await expect(first.locator('details[open]')).toHaveCount(0);
 await expect(middle.locator('details')).toHaveCount(2);await middle.locator('summary').first().press('Space');await expect(middle.locator('details').first()).toHaveAttribute('open','');
 await middle.locator('summary').last().press('Enter');await expect(middle.locator('details[open]')).toHaveCount(1);await expect(middle.locator('details').last()).toHaveAttribute('open','');
 await middle.locator('summary').last().press('Escape');await expect(middle.locator('details[open]')).toHaveCount(0);await expect(middle.locator('summary').last()).toBeFocused();
 await middle.locator('summary').first().click();await single.locator('[aria-current="page"]').click();await expect(middle.locator('details[open]')).toHaveCount(0);
 await expect(last.locator('[data-nq-next]')).toBeDisabled();for(const marker of ['[data-nq-previous]','[data-nq-next]'])await expect(single.locator(marker)).toBeDisabled();
 for(const button of await disabled.locator('button').all())await expect(button).toBeDisabled();await expect(disabled.locator('summary')).toHaveCount(0);
 expect(await large.locator('button').count()).toBeLessThan(20);
 await large.locator('summary').first().click();const input=large.locator('details[open] [data-nq-jump-input]');await expect(input).toHaveAttribute('form','');await expect(input).toHaveAttribute('data-nq-filled','true');await input.fill('');await expect(input).toHaveAttribute('data-nq-filled','false');
 await input.fill('7000');await large.locator('details[open] [data-nq-jump-submit]').click();await expect(large.locator('[aria-current="page"]')).toHaveText('5000');await expect(input).toHaveAttribute('aria-invalid','true');
 await input.fill('2000');await expect(input).not.toHaveAttribute('aria-invalid','true');await expect(input).toHaveAttribute('data-nq-filled','true');await input.press('Enter');await expect(large.locator('[aria-current="page"]')).toHaveText('2000');await expect(large.locator('[aria-current="page"]')).toBeFocused();await expect(large.locator('details[open]')).toHaveCount(0);
 return first;
}
for(const locale of ['ar','en'])test(`pagination source geometry and accessible jumps in ${locale}`,async({page},info)=>{
 test.setTimeout(120000);await page.addInitScript(locale=>{if(window===window.top){localStorage.setItem('nasaq-locale',locale);localStorage.setItem('nasaq-mode','light');}},locale);
 await page.goto('/#component/pagination');const scope=page.locator('#component-examples'),first=await cases(scope);
 await expect(scope.locator('.source-details pre')).toHaveCount(24);
 for(const mode of ['light','dark']){await scope.evaluate((el,mode)=>{el.setAttribute('data-nq-mode',mode);(el as HTMLElement).style.background='var(--nq-color-surface)';},mode);expect((await new AxeBuilder({page}).include('#component-examples .component-preview').analyze()).violations).toEqual([]);}
 await scope.evaluate(el=>el.setAttribute('data-nq-mode','light'));await first.locator('summary').click();expect((await new AxeBuilder({page}).include('#component-examples .component-preview').analyze()).violations).toEqual([]);await first.locator('summary').press('Escape');
 const arrow=first.locator('[data-nq-next]');expect(await arrow.evaluate(el=>getComputedStyle(el,'::before').content)).toBe(locale==='ar'?'"‹"':'"›"');
 await first.evaluate((el,dir)=>el.setAttribute('dir',dir),locale==='ar'?'ltr':'rtl');expect(await arrow.evaluate(el=>getComputedStyle(el,'::before').content)).toBe(locale==='ar'?'"›"':'"‹"');await first.evaluate(el=>el.removeAttribute('dir'));
 await scope.evaluate(el=>el.setAttribute('data-nq-theme','nasaq'));await expect(first.locator('[aria-current="page"]')).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 await scope.evaluate(el=>{el.setAttribute('data-nq-theme','custom');(el as HTMLElement).style.setProperty('--nq-duration-pagination','500ms');});await expect(arrow).toHaveCSS('transition-duration','0.5s, 0.5s');
 await page.setViewportSize({width:320,height:900});await expect(first).toHaveCSS('gap','6px');await expect(first).toHaveCSS('margin-top','40px');await expect(first.locator('[aria-current="page"]')).toHaveCSS('min-width','30px');await expect(arrow).toHaveCSS('height','40px');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await first.locator('summary').click();const menu=(await first.locator('.nq-pagination-menu').boundingBox())!;expect(menu.x).toBeGreaterThanOrEqual(0);expect(menu.x+menu.width).toBeLessThanOrEqual(320);await first.screenshot({path:info.outputPath(`pagination-${locale}-mobile.png`)});await first.locator('summary').press('Escape');
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await expect(arrow).toHaveCSS('transition-property','none');await first.locator('summary').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(first.locator('summary')).toBeFocused();await expect(first.locator('summary')).toHaveCSS('outline-style','solid');await expect(page).toHaveURL(/#component\/pagination$/);
});
for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']}))for(const language of languages)test(`${framework} ${language} native page windows and jumps`,async({page})=>{
 test.setTimeout(120000);await page.setViewportSize({width:1864,height:1100});await page.goto('/#component/pagination');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
 const scope=page.frameLocator('.nq-ide-frame').locator('.demo'),first=await cases(scope);await expect(scope.locator('output')).toHaveText('8');await page.setViewportSize({width:390,height:844});expect(await scope.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await first.locator('summary').click();const menu=first.locator('.nq-pagination-menu');expect(await menu.evaluate(el=>el.getBoundingClientRect().left>=0 && el.getBoundingClientRect().right<=innerWidth)).toBe(true);await first.locator('summary').press('Escape');await page.emulateMedia({reducedMotion:'reduce'});await expect(first.locator('[data-nq-next]')).toHaveCSS('transition-property','none');
});
