import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// Serves the built package directory as a plain static origin, with no bundler
// or dev-server CSS processing, to prove that a page can link dist/styles.css.
const dist=fileURLToPath(new URL('../../packages/styles/dist/',import.meta.url));
const origin='http://published-styles.test';
const page=(links:string)=>`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>Published</title>${links}</head><body>
  <button class="hw-button" data-variant="primary" type="button">متابعة</button>
  <span class="hw-icon" data-icon="search-01" aria-hidden="true"></span>
  <span class="hw-riyal" id="riyal">&#x20C1;</span></body></html>`;
test.skip(!existsSync(`${dist}styles.css`),'Build the styles package first: node scripts/build.mjs --only styles');
test('the published styles.css loads directly in a browser as one request with tokens and assets',async({page:browser})=>{
  const requests:string[]=[];const missing:string[]=[];
  await browser.route(`${origin}/**`,async route=>{
    const path=new URL(route.request().url()).pathname.replace(/^\/+/,'');
    requests.push(path);
    if(path==='index.html'||path==='with-reset.html') return route.fulfill({contentType:'text/html',body:page(`<link rel="stylesheet" href="./styles.css">${path==='with-reset.html'?'<link rel="stylesheet" href="./reset.css">':''}`)});
    const file=dist+decodeURIComponent(path);
    if(!existsSync(file)){missing.push(path);return route.fulfill({status:404,body:''});}
    return route.fulfill({path:file});
  });
  await browser.goto(`${origin}/index.html`);
  await browser.waitForLoadState('networkidle');
  const css=requests.filter(path=>path.endsWith('.css'));
  expect(css).toEqual(['styles.css']);
  expect(missing).toEqual([]);
  const sheet=await browser.evaluate(()=>{
    const root=getComputedStyle(document.documentElement);const button=getComputedStyle(document.querySelector('.hw-button')!);
    return {primary:root.getPropertyValue('--hw-color-primary').trim(),background:button.backgroundColor,boxSizing:getComputedStyle(document.body).margin};
  });
  expect(sheet.primary).not.toBe('');
  expect(sheet.background).not.toBe('rgba(0, 0, 0, 0)');
  // reset.css stays opt-in: the default body margin survives.
  expect(sheet.boxSizing).toBe('8px');
  // Relative asset URLs resolve against the published file.
  const mask=await browser.locator('.hw-icon').evaluate(node=>getComputedStyle(node).maskImage);
  expect(mask).toBe(`url("${origin}/assets/icons/search-01.svg")`);
  expect(await browser.locator('.hw-icon').evaluate(async node=>{const image=new Image();image.src=getComputedStyle(node).maskImage.slice(5,-2);await image.decode();return image.naturalWidth;})).toBe(24);
  await browser.evaluate(()=>document.fonts.ready);
  expect(await browser.evaluate(()=>[...document.fonts].some(font=>font.status==='loaded'&&/riyal/i.test(font.family)))).toBe(true);
  expect(requests).toContain('assets/fonts/riyal.woff2');
  await browser.goto(`${origin}/with-reset.html`);
  await expect(browser.locator('body')).toHaveCSS('margin','0px');
});
