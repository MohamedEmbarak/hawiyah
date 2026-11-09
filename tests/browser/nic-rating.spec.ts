import {expect,test,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function examples(scope:Locator) {
  const inputs=scope.locator('fieldset.hw-rating');await expect(inputs).toHaveCount(5);
  const selected=inputs.nth(0),empty=inputs.nth(1),readonly=inputs.nth(2),disabled=inputs.nth(3),invalid=inputs.nth(4);
  await expect(selected.locator('input:checked')).toHaveValue('4');
  await expect(empty.locator('input:checked')).toHaveCount(0);
  const colors=()=>selected.locator('label > span[aria-hidden="true"]').evaluateAll(nodes=>nodes.map(el=>getComputedStyle(el).color));
  await expect.poll(colors).toEqual(['rgb(27, 131, 84)','rgb(27, 131, 84)','rgb(27, 131, 84)','rgb(27, 131, 84)','rgb(208, 213, 221)']);
  await selected.locator('input:checked').press('ArrowUp');await expect(selected.locator('input:checked')).toHaveValue('3');
  await selected.locator('label').nth(4).click();await expect(selected.locator('input:checked')).toHaveValue('5');
  // Read-only radios advertise aria-disabled while remaining focusable. Exercise
  // the browser click guard instead of Playwright's disabled-control wait.
  await readonly.locator('label').last().click({force:true});await expect(readonly.locator('input:checked')).toHaveValue('3');
  await readonly.locator('input:checked').press('ArrowDown');await expect(readonly.locator('input:checked')).toHaveValue('3');
  await expect(readonly.locator('input:checked')).toBeFocused();
  for(const radio of await disabled.locator('input').all())await expect(radio).toBeDisabled();
  expect(await invalid.locator('input').first().evaluate((el:HTMLInputElement)=>el.checkValidity())).toBe(false);
  const displays=scope.locator('.hw-rating-display');await expect(displays).toHaveCount(3);
  for(const [index,value] of [0,3.5,5].entries()){
    const display=displays.nth(index);await expect(display).toHaveAttribute('role','img');await expect(display).toHaveAttribute('aria-label',new RegExp(String(value)));
    await expect(display.locator('input,button,[tabindex]')).toHaveCount(0);await expect(display.locator('.hw-rating-score')).toHaveText(`${value}/5`);
    await expect(display.locator('.hw-rating-stars')).toHaveCSS('gap','4px');
    for(const [i,star] of (await display.locator('.hw-rating-star').all()).entries()){
      expect((await star.boundingBox())!.width).toBe(30);expect((await star.boundingBox())!.height).toBe(30);
      const fill=star.locator('.hw-rating-fill');expect((await fill.boundingBox())!.width).toBe(Math.max(0,Math.min(1,value-i))*30);
      await expect(fill).toHaveCSS('transition-duration','0.2s');
    }
  }
  return displays.nth(1);
}
async function halfAlignment(display:Locator,dir:string){
  await display.evaluate((el,dir)=>el.setAttribute('dir',dir),dir);
  const star=display.locator('.hw-rating-star').nth(3),fill=star.locator('.hw-rating-fill');
  const s=(await star.boundingBox())!,f=(await fill.boundingBox())!;
  expect(f.x-s.x).toBeCloseTo(dir==='rtl'?15:0,1);
}
for(const locale of ['ar','en'])test(`rating source geometry and aggregate accessibility in ${locale}`,async({page},info)=>{
  test.setTimeout(90000);await page.addInitScript(locale=>{if(window===window.top){localStorage.setItem('hawiyah-locale',locale);localStorage.setItem('hawiyah-mode','light');}},locale);
  await page.goto('/#component/rating');const scope=page.locator('#component-examples');const half=await examples(scope);
  await expect(scope.locator('.source-details pre')).toHaveCount(24);
  await halfAlignment(half,'ltr');await halfAlignment(half,'rtl');
  await scope.evaluate(el=>{el.setAttribute('data-hw-mode','light');el.setAttribute('data-hw-theme','hawiyah');});await expect(half.locator('.hw-rating-star').first()).toHaveCSS('width','28px');await expect(half.locator('.hw-rating-fill').first()).toHaveCSS('transition-duration','0s');
  await scope.evaluate(el=>{el.setAttribute('data-hw-theme','custom');(el as HTMLElement).style.setProperty('--hw-duration-rating','500ms');});await expect(half.locator('.hw-rating-fill').first()).toHaveCSS('transition-duration','0.5s');
  await page.emulateMedia({reducedMotion:'reduce'});await expect(half.locator('.hw-rating-fill').first()).toHaveCSS('transition-property','none');
  await page.setViewportSize({width:320,height:900});
  // WebKit can report the previous scrollable area until the resized layout is painted.
  await expect.poll(() => page.evaluate(() => innerWidth === 320 && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const outside = await scope.locator('.component-preview fieldset.hw-rating label, .component-preview .hw-rating-display .hw-rating-star').evaluateAll(nodes => nodes.flatMap(node => {
    const {left,right} = node.getBoundingClientRect();
    return left < -1 || right > innerWidth + 1 ? [{left,right}] : [];
  }));
  expect(outside).toEqual([]);
  await half.screenshot({path:info.outputPath(`rating-${locale}-fraction.png`)});
  await page.emulateMedia({forcedColors:'active'});const readonly=scope.locator('fieldset.hw-rating').nth(2);await readonly.locator('input:checked').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(readonly.locator('input:checked')).toBeFocused();await expect(readonly.locator('label:has(input:checked)')).toHaveCSS('outline-style','solid');
  const forcedColors = await page.evaluate(() => ({
    active: matchMedia('(forced-colors: active)').matches,
    adjust: CSS.supports('forced-color-adjust','none'),
  }));
  await expect(half.locator('.hw-rating-score')).toBeVisible();
  await expect(half).toHaveAccessibleName(/3\.5/);
  if (forcedColors.active && forcedColors.adjust) {
    await expect(half.locator('.hw-rating-star').first()).toHaveCSS('forced-color-adjust','none');
  } else {
    info.annotations.push({type:'browser capability', description:`forced-colors active=${forcedColors.active}, forced-color-adjust supported=${forcedColors.adjust}`});
  }
  await expect(page).toHaveURL(/#component\/rating$/);
});
for (const locale of ['ar','en']) for (const mode of ['light','dark']) {
  test(`rating gallery accessibility in ${locale} ${mode}`, async ({page}) => {
    test.setTimeout(180000);
    await page.addInitScript(locale => { if (window === window.top) localStorage.setItem('hawiyah-locale', locale); },locale);
    await page.goto('/#component/rating');
    const scope = page.locator('#component-examples');
    await expect(scope.locator('fieldset.hw-rating')).toHaveCount(5);
    await scope.evaluate((node:HTMLElement,mode) => {
      node.setAttribute('data-hw-mode',mode);
      node.style.background = 'var(--hw-color-surface)';
    },mode);
    expect((await new AxeBuilder({page}).include('#component-examples .component-preview').analyze()).violations).toEqual([]);
  });
}
for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']}))for(const language of languages)test(`${framework} ${language} native rating input and fractional display`,async({page})=>{
  test.setTimeout(90000);await page.goto('/#component/rating');await page.locator('[data-guide-tab="playground"]').click();await page.locator('[data-project-framework]').selectOption(framework);if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});const scope=page.frameLocator('.hw-ide-frame').locator('.demo');const half=await examples(scope);
  await expect(scope.locator('output')).toHaveText('5');await halfAlignment(half,'ltr');await halfAlignment(half,'rtl');
  await page.setViewportSize({width:390,height:844});expect(await scope.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.emulateMedia({reducedMotion:'reduce'});await expect(half.locator('.hw-rating-fill').first()).toHaveCSS('transition-property','none');
});
