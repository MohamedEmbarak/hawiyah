import {expect,test,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function examples(scope:Locator,rtl=true) {
 const roots=scope.locator('.nq-tabs');await expect(roots).toHaveCount(6);
 const basic=roots.nth(0),long=roots.nth(1),manual=roots.nth(2),vertical=roots.nth(3),scroll=roots.nth(4),selected=roots.nth(5);
 await expect(basic.getByRole('tab')).toHaveCount(3);
 const tab=basic.getByRole('tab').first();await expect(tab).toHaveCSS('min-height','44px');await expect(tab).toHaveCSS('line-height','20px');await expect(tab).toHaveCSS('padding','12px 16px');await expect(basic.locator('.nq-tab-list')).toHaveCSS('gap','3px');
 await tab.focus();await tab.press(rtl?'ArrowLeft':'ArrowRight');await expect(basic.getByRole('tab').nth(1)).toHaveAttribute('aria-selected','true');await expect(basic.getByRole('tab').nth(2)).toBeDisabled();await expect(basic.getByRole('tabpanel')).toHaveCount(1);
 await expect(basic.getByRole('tabpanel')).toHaveCSS('margin-top','24px');
 await long.evaluate(el=>{(el as HTMLElement).style.inlineSize='400px';(el as HTMLElement).style.maxInlineSize='100%';});
 const summary=long.locator('summary'),details=long.locator('details');await expect(summary).toBeVisible();await summary.press('Enter');await expect(details).toHaveAttribute('open','');
 const omitted=long.locator('[role="tab"][data-nq-overflow-hidden="true"]');expect(await omitted.count()).toBeGreaterThan(0);
 const items=long.locator('.nq-tab-overflow-item');await expect(items).toHaveCount(await omitted.count());await expect(items.filter({hasText:rtl?'غير متاحة':'Unavailable'})).toBeDisabled();
 const target=items.last(),name=(await target.textContent())!;await target.click();await expect(details).not.toHaveAttribute('open','');await expect(summary).toHaveAttribute('data-active','true');await expect(summary).toBeFocused();await expect(long.getByRole('tabpanel')).toContainText(name);
 await summary.press('Space');await expect(details).toHaveAttribute('open','');await items.first().focus();await items.first().press('Escape');await expect(summary).toBeFocused();await expect(details).not.toHaveAttribute('open','');
 await summary.click();await basic.getByRole('tab').first().click();await expect(details).not.toHaveAttribute('open','');
 await manual.getByRole('tab').first().focus();await manual.getByRole('tab').first().press(rtl?'ArrowLeft':'ArrowRight');await expect(manual.getByRole('tab').first()).toHaveAttribute('aria-selected','true');await expect(manual.getByRole('tab').nth(1)).toBeFocused();await manual.getByRole('tab').nth(1).press('Enter');await expect(manual.getByRole('tab').nth(1)).toHaveAttribute('aria-selected','true');
 await vertical.getByRole('tab').first().press('ArrowDown');await expect(vertical.getByRole('tab').nth(1)).toHaveAttribute('aria-selected','true');await expect(vertical.locator('summary')).not.toBeVisible();
 await expect(scroll.locator('summary')).not.toBeVisible();expect(await scroll.locator('.nq-tab-list').evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);await scroll.getByRole('tab').first().press('End');await expect(scroll.getByRole('tab').last()).toBeFocused();await expect(scroll.getByRole('tab').last()).toHaveAttribute('aria-selected','true');
 await expect(selected.locator('summary')).toHaveAttribute('data-active','true');await expect(selected.getByRole('tabpanel')).toContainText(rtl?'التواصل':'contact');
 // Width changes must preserve logical selection and rescue focused controls.
 await summary.focus();await long.evaluate(el=>{(el as HTMLElement).style.inlineSize='1100px';(el as HTMLElement).style.maxInlineSize='none';});await expect(summary).not.toBeVisible();await expect(long.getByRole('tab').last()).toBeFocused();
 await long.evaluate(el=>{(el as HTMLElement).style.inlineSize='240px';(el as HTMLElement).style.maxInlineSize='100%';});await expect(summary).toBeFocused();await expect(summary).toHaveAttribute('data-active','true');
 return {basic,long,summary};
}

for(const locale of ['ar','en'])test(`NIC tab states and responsive disclosure in ${locale}`,async({page},info)=>{
 test.setTimeout(120000);await page.addInitScript(locale=>{if(window===window.top){localStorage.setItem('nasaq-locale',locale);localStorage.setItem('nasaq-mode','light');}},locale);
 await page.setViewportSize({width:1543,height:1000});await page.goto('/#component/tabs');
 const scope=page.locator('#component-examples');const {basic,long,summary}=await examples(scope,locale==='ar');await expect(scope.locator('.source-details pre')).toHaveCount(24);
 const tab=basic.getByRole('tab').nth(1);await tab.hover();await expect(tab).toHaveCSS('background-color','rgb(243, 244, 246)');await tab.focus();await expect(tab).toHaveCSS('background-color','rgba(0, 0, 0, 0)');await expect(tab).toHaveCSS('outline-width','2px');
 for(const mode of ['light','dark']){await scope.evaluate((el,mode)=>{el.setAttribute('data-nq-mode',mode);(el as HTMLElement).style.background='var(--nq-color-surface)';},mode);await summary.click();expect((await new AxeBuilder({page}).include('#component-examples .component-preview').analyze()).violations).toEqual([]);await summary.press('Escape');}
 await scope.evaluate(el=>{el.setAttribute('data-nq-mode','light');el.setAttribute('data-nq-theme','nasaq');});await expect(basic.getByRole('tab').first()).toHaveCSS('font-weight','600');await scope.evaluate(el=>{el.setAttribute('data-nq-theme','custom');(el as HTMLElement).style.setProperty('--nq-color-primary','#005a9c');});expect(await basic.getByRole('tab').first().evaluate(el=>getComputedStyle(el,'::after').backgroundColor)).toBe('rgb(0, 90, 156)');
 await page.setViewportSize({width:320,height:844});await summary.click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const menu=long.locator('.nq-tab-overflow-menu');expect(await menu.evaluate(el=>el.getBoundingClientRect().left>=0 && el.getBoundingClientRect().right<=innerWidth)).toBe(true);await long.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath(`tabs-${locale}-mobile.png`)});await summary.press('Escape');
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await summary.focus();await expect(summary).toHaveCSS('outline-style','solid');await expect(page).toHaveURL(/#component\/tabs$/);
});

for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']}))for(const language of languages)test(`${framework} ${language} native tab overflow`,async({page})=>{
 test.setTimeout(120000);await page.setViewportSize({width:1864,height:1100});await page.goto('/#component/tabs');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
 const scope=page.frameLocator('.nq-ide-frame').locator('.demo');const {summary,long}=await examples(scope);await expect(scope.locator('output')).toHaveText('first');await page.setViewportSize({width:390,height:844});await summary.click();expect(await long.locator('.nq-tab-overflow-menu').evaluate(el=>el.getBoundingClientRect().left>=0&&el.getBoundingClientRect().right<=innerWidth)).toBe(true);expect(await scope.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
});
