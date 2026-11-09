import {expect,test,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function externalIndicator(link: Locator) {
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link.locator('.hw-sr-only')).toContainText(/new window|نافذة جديدة/);
  await link.evaluate(async element => {
    const url = getComputedStyle(element, '::after').maskImage.match(/url\("([^"]+)"\)/)?.[1];
    if (!url) throw new Error('External destination indicator is missing');
    const image = new Image(); image.src = url; await image.decode();
    const supplied = document.createElement('span');
    supplied.dataset.hwExternalIcon = ''; element.append(supplied);
    if (getComputedStyle(element, '::after').content !== 'none') throw new Error('External indicator is duplicated');
    supplied.remove();
  });
}
async function states(link:Locator,neutral=false){
  await expect(link).toHaveCSS('color',neutral?'rgb(56, 66, 80)':'rgb(22, 106, 69)');
  await link.hover();await expect(link).toHaveCSS('color',neutral?'rgb(77, 87, 97)':'rgb(20, 87, 58)');
  await link.press('Tab');await link.focus();await expect(link).toHaveCSS('outline-style','solid');await expect(link).toHaveCSS('outline-width','2px');
}
for(const dir of ['rtl','ltr'])test(`NIC links and breadcrumbs retain readable states, direction and keyboard focus in ${dir}`,async({page},info)=>{
  test.setTimeout(120000);await page.goto('/#component/link');const preview=page.locator('.component-preview').first();await preview.evaluate((el,dir)=>{el.setAttribute('dir',dir);el.setAttribute('data-hw-mode','light');},dir);
  const links=preview.locator('.hw-link');await expect(links).toHaveCount(5); await externalIndicator(links.nth(4));
  await states(links.nth(0));await page.locator('h1').click();await states(links.nth(1),true);
  await links.nth(2).hover();await expect(links.nth(2)).toHaveCSS('text-decoration-line','none');
  const icon=links.nth(2).locator('svg'),a=(await links.nth(2).boundingBox())!,b=(await icon.boundingBox())!;expect(Math.abs(a.y+a.height/2-b.y-b.height/2)).toBeLessThan(2);
  await expect(links.nth(3)).not.toHaveAttribute('href');await expect(links.nth(3)).toHaveAttribute('aria-disabled','true');
  await links.nth(0).hover();await page.mouse.down();await expect(links.nth(0)).toHaveCSS('color','rgb(16, 70, 49)');await page.mouse.up();await expect(page).toHaveURL(/#component\/link$/);
  await page.mouse.move(0,0);await preview.screenshot({path:info.outputPath(`links-${dir}.png`)});
  expect((await new AxeBuilder({page}).include('.component-preview').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await preview.evaluate(el=>el.setAttribute('data-hw-mode','dark'));await expect(links.nth(0)).toHaveCSS('color','rgb(84, 192, 138)');
  await links.nth(0).hover();await expect(links.nth(0)).toHaveCSS('color','rgb(136, 216, 173)');
  await page.goto('/#component/breadcrumb');const crumb=page.locator('.component-preview').first().locator('.hw-breadcrumb');
  await crumb.evaluate((el,dir)=>{el.setAttribute('dir',dir);el.setAttribute('data-hw-mode','light');},dir);
  await expect(crumb.locator('a').first()).toHaveCSS('transition-duration','0.2s');await states(crumb.locator('a').first(),true);
  const separator=await crumb.locator('li').nth(1).evaluate(el=>({content:getComputedStyle(el,'::before').content,border:getComputedStyle(el,'::before').borderBlockStartWidth,transform:getComputedStyle(el,'::before').transform}));expect(separator.content).toBe('""');expect(parseFloat(separator.border)).toBeGreaterThanOrEqual(1);expect(parseFloat(separator.border)).toBeLessThanOrEqual(1.5); // Chromium snaps fractional borders to device pixels.
  expect(separator.transform).toContain(dir==='rtl'?'-0.707107':'0.707107');
  await page.setViewportSize({width:390,height:844});expect(await crumb.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  await crumb.screenshot({path:info.outputPath(`breadcrumb-${dir}.png`)});
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await expect(crumb.locator('a').first()).toHaveCSS('transition-property','none');await crumb.locator('a').first().focus();await expect(crumb.locator('a').first()).toHaveCSS('outline-style','solid');
  await page.emulateMedia({forcedColors:'none'});await crumb.evaluate(el=>{el.setAttribute('data-hw-theme','hawiyah');});expect(await crumb.locator('li').nth(1).evaluate(el=>getComputedStyle(el,'::before').content)).toBe('"/"');
  await crumb.evaluate(el=>{el.setAttribute('data-hw-theme','custom');el.style.setProperty('--hw-color-link-neutral','#123456');});await page.mouse.move(0,0);await page.locator('h1').click();await expect(crumb.locator('a').first()).toHaveCSS('color','rgb(18, 52, 86)');
});
for(const framework of ['react','vue','angular'])test(`${framework} native link variants and disabled destinations`,async({page},info)=>{
  test.setTimeout(120000);await page.goto('/#component/link');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption('typescript');
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});const frame=page.frameLocator('.hw-ide-frame'),links=frame.locator('.hw-link');await expect(links).toHaveCount(5); await externalIndicator(links.nth(4));
  await states(links.nth(0));await expect(links.nth(1)).toHaveAttribute('data-variant','neutral');await expect(links.nth(3)).not.toHaveAttribute('href');await expect(links.nth(3)).toHaveAttribute('tabindex','-1');
  await links.nth(3).dispatchEvent('click');await expect(page).toHaveURL(/#component\/link$/);await links.nth(0).press('Enter');await expect(page).toHaveURL(/#component\/link$/);
  await page.setViewportSize({width:390,height:844});await page.locator('.hw-ide-frame').scrollIntoViewIfNeeded();await frame.locator('.hw-stack').screenshot({path:info.outputPath(`${framework}-links.png`)});
  await page.goto('/#component/breadcrumb');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});const crumb=frame.locator('.hw-breadcrumb');
  await states(crumb.locator('a').first(),true);await expect(crumb.locator('[aria-current="page"]')).toHaveText('الطلب');
  await crumb.locator('a').first().press('Enter');await expect(page).toHaveURL(/#component\/breadcrumb$/);
  expect(await crumb.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
});
