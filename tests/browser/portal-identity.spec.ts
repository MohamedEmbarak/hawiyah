import {expect,test,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function footerChecks(footer:Locator,width:number) {
  await expect(footer.locator('.hw-portal-footer-group')).toHaveCount(2);
  await expect(footer.locator('.hw-portal-footer-legal')).toBeVisible();
  await expect(footer.locator('.hw-portal-footer-wordmark')).toHaveAccessibleName('هوية');
  const heading=footer.locator('.hw-portal-footer-group h2').first();
  await expect(heading).toHaveCSS('font-size','16px');await expect(heading).toHaveCSS('line-height','24px');
  await expect(heading).toHaveCSS('border-bottom-width','1px');
  await expect(footer.locator('.hw-portal-footer-group ul').first()).toHaveCSS('row-gap','8px');
  const a=footer.locator('.hw-portal-footer-group a').first();await a.hover();await expect(a).toHaveCSS('text-decoration-line','underline');
  await a.focus();await expect(a).toBeFocused();expect(await a.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
  expect(await footer.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  if(width===390) {
    const groups=await footer.locator('.hw-portal-footer-group').all();
    const first=(await groups[0]!.boundingBox())!,second=(await groups[1]!.boundingBox())!;
    expect(second.y).toBeGreaterThan(first.y);
  }
}

for(const direction of ['rtl','ltr'])test(`verification masthead and grouped footer in ${direction}`,async({page},info)=>{
  test.setTimeout(120000);
  await page.goto('/#component/portal-layout');
  const preview=page.locator('.component-preview').first();
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:900});await preview.evaluate((el,dir)=>el.setAttribute('dir',dir),direction);
    const banner=preview.locator('.hw-site-verification'),details=banner.locator('details'),summary=banner.locator('summary');
    await preview.locator('.hw-portal-masthead').evaluate(el=>el.style.setProperty('--hw-content-max','20rem'));
    const summaryBox=(await summary.boundingBox())!,brandBox=(await preview.locator('.hw-portal-brand').boundingBox())!;
    expect(Math.abs(direction==='rtl' ? summaryBox.x+summaryBox.width-brandBox.x-brandBox.width : summaryBox.x-brandBox.x)).toBeLessThan(2);
    await preview.locator('.hw-portal-masthead').evaluate(el=>el.style.removeProperty('--hw-content-max'));
    await summary.focus();await summary.press('Enter');await expect(details).toHaveAttribute('open','');
    await expect(banner.getByRole('link')).toHaveAttribute('target','_blank');
    await expect(banner.locator('bdi').first()).toHaveText('example.test');
    await banner.getByRole('link').click();await expect(page).toHaveURL(/#component\/portal-layout$/);
    await summary.press('Space');await expect(details).not.toHaveAttribute('open');
    await expect(banner.getByRole('link')).toBeHidden();
    for(const mode of ['light','dark']) {
      await preview.evaluate((el,mode)=>el.setAttribute('data-hw-mode',mode),mode);
      await footerChecks(preview.locator('.hw-portal-footer'),width);
    }
    await preview.screenshot({path:info.outputPath(`portal-${direction}-${width}.png`)});
  }
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});
  const summary=preview.locator('.hw-site-verification summary');await summary.focus();await expect(summary).toHaveCSS('outline-style','solid');
  await expect(summary.locator('.hw-icon')).toHaveCSS('transition-property','none');
  const footer=preview.locator('.hw-portal-footer');await footer.locator('.hw-portal-footer-group a').first().hover();
  await expect(footer.locator('.hw-portal-footer-group a').first()).toHaveCSS('opacity','1');
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'none'});
  expect((await new AxeBuilder({page}).include('.component-preview').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await footer.evaluate(el=>{el.setAttribute('data-hw-theme','custom');el.style.setProperty('--hw-color-footer','#123456');el.style.setProperty('--hw-color-on-footer','#ffffff');});
  await expect(footer).toHaveCSS('background-color','rgb(18, 52, 86)');
  await expect(footer.locator('.hw-portal-footer-group a').first()).toHaveCSS('color','rgb(255, 255, 255)');
  await footer.evaluate(el=>{el.setAttribute('data-hw-theme','hawiyah');el.style.removeProperty('--hw-color-footer');el.style.removeProperty('--hw-color-on-footer');});
  await expect(footer).not.toHaveCSS('background-color','rgb(18, 52, 86)');
  await expect(footer.locator('.hw-portal-footer-group h2').first()).toHaveCSS('border-bottom-width','0px');
});

for(const framework of ['react','vue','angular'])test(`${framework} native masthead state and footer composition`,async({page},info)=>{
  test.setTimeout(120000);
  await page.goto('/#component/site-verification');await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption(framework);
  if(framework!=='angular')await page.locator('[data-project-language]').selectOption('typescript');
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const frame=page.frameLocator('.hw-ide-frame'),summary=frame.locator('.hw-site-verification summary'),details=frame.locator('.hw-site-verification details');
  await summary.press('Enter');await expect(details).toHaveAttribute('open','');await expect(frame.locator('output')).toHaveText('true');
  await frame.locator('.hw-verification-registration a').click();await expect(page).toHaveURL(/#component\/site-verification$/);
  await summary.press('Space');await expect(details).not.toHaveAttribute('open');await expect(frame.locator('output')).toHaveText('false');
  await page.setViewportSize({width:390,height:900});
  await expect(frame.locator('.hw-portal-menu-toggle')).toBeVisible();
  await frame.locator('.hw-portal-menu-toggle').click();await expect(frame.locator('.hw-portal-header nav')).toBeVisible();
  await frame.locator('.hw-portal-menu-toggle').press('Escape');await expect(frame.locator('.hw-portal-header nav')).toBeHidden();
  await frame.locator('.hw-portal-masthead').screenshot({path:info.outputPath(`${framework}-masthead.png`)});
  await page.goto('/#component/portal-footer');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  await footerChecks(frame.locator('.hw-portal-footer'),390);
  await frame.locator('.hw-portal-footer-group a').first().click();await expect(page).toHaveURL(/#component\/portal-footer$/);
  await frame.locator('.hw-portal-footer').screenshot({path:info.outputPath(`${framework}-footer.png`)});
});
