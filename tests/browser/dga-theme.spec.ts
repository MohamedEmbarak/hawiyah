import {expect,test} from '@playwright/test';

test('fresh guide defaults to DGA and nested custom resets legacy palette and geometry',async({page})=>{
  await page.goto('/#foundations');
  await expect(page.locator('html')).toHaveAttribute('data-nq-theme','dga');
  await page.locator('#main').evaluate(main=>main.insertAdjacentHTML('beforeend',`<div id="theme-scope" data-nq-theme="nasaq"><button class="nq-button" id="legacy-theme-button">Legacy</button><div data-nq-theme="custom"><button class="nq-button" id="custom-theme-button">Custom</button><input class="nq-input" id="nested-input" aria-label="Nested input"></div></div>`));
  await expect(page.locator('#legacy-theme-button')).toHaveCSS('background-color','rgb(0, 106, 100)');
  await expect(page.locator('#custom-theme-button')).toHaveCSS('background-color','rgb(27, 131, 84)');
  await expect(page.locator('#nested-input')).toHaveCSS('border-radius','4px');
  await page.locator('#theme-scope').evaluate(node=>node.setAttribute('data-nq-mode','dark'));
  await expect(page.locator('#custom-theme-button')).toHaveCSS('background-color','rgb(27, 131, 84)');
  await expect(page.locator('#nested-input')).toHaveCSS('background-color','rgb(31, 42, 55)');
});

test('explicit Nasaq preference survives visits and DGA input focus does not shift layout',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('nasaq-theme','nasaq'));
  await page.goto('/#foundations');
  await expect(page.locator('html')).toHaveAttribute('data-nq-theme','nasaq');
  await page.locator('#theme-select').selectOption('dga');
  const input=page.locator('#main input.nq-input').first();
  const before=await input.boundingBox();
  await input.focus();
  await expect(input).toBeFocused();
  const after=await input.boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  await page.emulateMedia({reducedMotion:'reduce'});
  const duration=await input.evaluate(node=>getComputedStyle(node).transitionDuration);
  expect(duration.split(',').every(value=>parseFloat(value)<=0.00001)).toBe(true);
});
