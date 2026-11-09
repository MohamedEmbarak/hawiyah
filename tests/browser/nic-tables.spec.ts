import {expect, test, type Locator} from '@playwright/test';
import { sortIcon } from '../helpers/icon-direction';
import AxeBuilder from '@axe-core/playwright';

for(const locale of ['ar','en'])test(`table galleries expose all ready variants and localized empty results in ${locale}`,async({page},info)=>{
  test.setTimeout(90000);await page.addInitScript(locale=>{if(window===window.top)localStorage.setItem('hawiyah-locale',locale);},locale);
  for(const component of ['table','data-table']){
    await page.goto(`/#component/${component}`);
    const examples=page.locator('#component-examples .ready-example');await expect(examples).toHaveCount(6);
    for(let i=0;i<6;i++){
      const example=examples.nth(i);await expect(example.locator('.source-details pre')).toHaveCount(4);
      await expect(example.locator('.hw-table-wrap')).toHaveAttribute('tabindex','0');
      await expect(example.locator('caption')).not.toBeEmpty();
      await expect(example.locator('thead th[scope="col"]')).toHaveCount(2);
    }
    await expect(examples.nth(1).locator('table')).toHaveAttribute('data-variant','striped');
    await expect(examples.nth(2).locator('table')).toHaveAttribute('data-variant','bordered');
    await expect(examples.nth(3).locator('table')).toHaveAttribute('data-size','sm');
    await expect(examples.nth(4).locator('table')).toHaveAttribute('data-size','lg');
    await expect(examples.last().locator('tbody td')).toHaveText(locale==='ar'?'لا توجد طلبات':'No requests found');
    expect((await new AxeBuilder({page}).include('#component-examples .component-preview').analyze()).violations).toEqual([]);
    if(component==='data-table'){
      await expect(examples.first().locator('.hw-table-sort-icon')).toHaveCount(2);
      await examples.first().locator('thead button').last().click();
      await expect(examples.first().locator('tbody tr').first().locator('td')).toHaveText('1');
      expect(await examples.first().locator('.hw-table-sort-icon').last().evaluate(sortIcon)).toBe('ascending');
      await expect(page).toHaveURL(/#component\/data-table$/);
      await page.setViewportSize({width:1543,height:1100});
      await examples.first().scrollIntoViewIfNeeded();
      await page.screenshot({path:info.outputPath(`table-gallery-${locale}.png`)});
    }
  }
});

async function geometry(table: Locator) {
  await expect(table).toHaveCSS('font-size','16px');
  const header=table.locator('thead th').first();
  await expect(header).toHaveCSS('padding','8px 16px');
  await expect(header).toHaveCSS('font-weight','400');
  for(const row of await table.locator('thead tr,tbody tr').all())expect((await row.boundingBox())!.height).toBeCloseTo(48,0);
  await expect(table.locator('thead th').nth(1)).toHaveCSS('border-inline-start-width','1px');
  await expect(table.locator('..')).toHaveCSS('border-radius','8px');
}
async function states(table: Locator) {
  await table.evaluate(el=>el.setAttribute('data-variant','striped'));
  const rows=table.locator('tbody tr');
  await rows.nth(1).hover();await expect(rows.nth(1)).toHaveCSS('background-color','rgb(243, 244, 246)');
  await rows.first().hover();await expect(rows.first()).toHaveCSS('background-color','rgb(245, 245, 246)');
  await rows.first().evaluate(el=>el.setAttribute('aria-selected','true'));
  const selected=await rows.first().evaluate(el=>getComputedStyle(el).backgroundColor);
  expect(selected).not.toBe('rgb(245, 245, 246)');
  await rows.nth(1).hover();await expect(rows.first()).toHaveCSS('background-color',selected);
  await rows.first().evaluate(el=>el.removeAttribute('aria-selected'));
  for(const [size,height] of [['sm',40],['lg',56]] as const){
    await table.evaluate((el,size)=>el.setAttribute('data-size',size),size);
    expect((await rows.first().boundingBox())!.height).toBeCloseTo(height,0);
  }
  await table.evaluate(el=>{el.removeAttribute('data-size');el.setAttribute('data-variant','bordered');});
  await expect(rows.first().locator('td').last()).toHaveCSS('border-inline-start-width','1px');
}
for(const locale of ['ar','en'])test(`NIC table source geometry, variants and scrolling in ${locale}`,async({page},info)=>{
  test.setTimeout(120000);
  await page.addInitScript(locale=>{if(window===window.top){localStorage.setItem('hawiyah-locale',locale);localStorage.setItem('hawiyah-mode','light');}},locale);
  await page.goto('/#component/data-table');
  const table=page.locator('.guide-demo .hw-table').first(),wrap=table.locator('..');
  await geometry(table);await states(table);
  await table.locator('thead button').nth(1).press('Enter');
  await expect(table.locator('tbody tr').first().locator('td').last()).toHaveText('1');
  await expect(table.locator('thead th').nth(1)).toHaveAttribute('aria-sort','ascending');
  const indicator=table.locator('.hw-table-sort-icon').last();await expect(indicator).toHaveAttribute('aria-hidden','true');
  expect(await indicator.evaluate(sortIcon)).toBe('ascending');
  await table.locator('thead button').nth(1).press('Enter');
  expect(await indicator.evaluate(sortIcon)).toBe('descending');
  await expect(table.locator('tbody th[scope="row"]')).toHaveCount(3);
  expect((await new AxeBuilder({page}).include('.guide-demo .hw-table-wrap').analyze()).violations).toEqual([]);
  await page.setViewportSize({width:390,height:844});
  await table.evaluate(el=>{(el as HTMLElement).style.minWidth='600px';});
  await wrap.focus();await expect(wrap).toBeFocused();
  const before=await wrap.evaluate(el=>el.scrollLeft);await wrap.press(locale==='ar'?'ArrowLeft':'ArrowRight');
  await expect.poll(()=>wrap.evaluate((el,before)=>Math.abs(el.scrollLeft-before),before)).toBeGreaterThan(0);
  expect(await wrap.evaluate(el=>el.getBoundingClientRect().right)).toBeLessThanOrEqual(390);
  await wrap.screenshot({path:info.outputPath(`table-${locale}-mobile.png`)});
  await wrap.evaluate(el=>el.setAttribute('data-hw-mode','dark'));
  await table.locator('tbody tr').first().hover();await expect(table.locator('tbody tr').first()).toHaveCSS('background-color','rgb(56, 66, 80)');
  expect((await new AxeBuilder({page}).include('.guide-demo .hw-table-wrap').analyze()).violations).toEqual([]);
  await wrap.evaluate(el=>{el.setAttribute('data-hw-theme','hawiyah');el.setAttribute('data-hw-mode','light');});
  await expect(table).toHaveCSS('font-size','14px');await expect(table.locator('thead th')).not.toHaveCount(0);
  await table.evaluate(el=>el.setAttribute('data-size','sm'));await expect(table.locator('tbody th').first()).toHaveCSS('padding-inline-start','12px');
  await table.evaluate(el=>el.removeAttribute('data-size'));
  await wrap.evaluate(el=>{el.setAttribute('data-hw-theme','custom');el.style.setProperty('--hw-color-table-row-hover-odd','#123456');});
  await table.locator('tbody tr').first().hover();await expect(table.locator('tbody tr').first()).toHaveCSS('background-color','rgb(18, 52, 86)');
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await wrap.focus();await expect(wrap).toHaveCSS('outline-style','solid');
  await expect(page).toHaveURL(/#component\/data-table$/);
});
for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']}))for(const language of languages)test(`${framework} ${language} native tables retain source geometry, sorting, empty results and scroll access`,async({page},info)=>{
  test.setTimeout(120000);await page.goto('/#component/data-table');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const frame=page.frameLocator('.hw-ide-frame'),table=frame.locator('table').first(),root=frame.locator('.demo');
  await geometry(table);await states(table);
  await table.locator('thead button').nth(1).press('Enter');await expect(table.locator('thead th').nth(1)).toHaveAttribute('aria-sort','ascending');
  await expect(table.locator('tbody tr').first().locator('td')).toHaveText('1');
  await table.locator('thead button').nth(1).press('Enter');await expect(table.locator('tbody tr').first().locator('td')).toHaveText('5');
  await expect(root.locator('output')).toHaveText('descending');
  await expect(table.locator('tbody th[scope="row"]')).toHaveCount(3);
  await expect(frame.locator('table').nth(1).locator('tbody td')).toHaveText('لا توجد سجلات');
  await expect(frame.locator('table').nth(1).locator('tbody td')).toHaveAttribute('colspan','2');
  await page.setViewportSize({width:390,height:844});await table.evaluate(el=>{(el as HTMLElement).style.minWidth='600px';});
  const wrap=table.locator('..');await wrap.focus();await expect(wrap).toBeFocused();await expect(wrap).toHaveAttribute('role','region');
  await expect.poll(()=>wrap.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  await wrap.press('ArrowLeft');await expect.poll(()=>wrap.evaluate(el=>Math.abs(el.scrollLeft))).toBeGreaterThan(0);
  await page.locator('.hw-ide-frame').scrollIntoViewIfNeeded();await root.screenshot({path:info.outputPath(`tables-${framework}.png`)});
  expect(await root.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.goto('/#component/table');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const plain=page.frameLocator('.hw-ide-frame').locator('table');await geometry(plain);
  await expect(plain.locator('tbody th[scope="row"]')).toHaveCount(2);
  await plain.evaluate(el=>{(el as HTMLElement).style.minWidth='600px';});
  const plainWrap=plain.locator('..');await plainWrap.focus();await plainWrap.press('ArrowLeft');
  await expect.poll(()=>plainWrap.evaluate(el=>Math.abs(el.scrollLeft))).toBeGreaterThan(0);
});
