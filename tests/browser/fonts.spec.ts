import { expect, test, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// The opt-in fonts stylesheet, served from the built package as a plain static
// origin: what a page that links dist/styles.css and dist/fonts.css receives.
const dist=fileURLToPath(new URL('../../packages/styles/dist/',import.meta.url));
const origin='http://published-fonts.test';
const body=`<p id="sans">Hawiyah <span lang="ar" dir="rtl">هوية</span> <b>bold</b></p>
  <pre class="hw-code-block-content" dir="ltr" id="latin">const total = 0;</pre>
  <pre class="hw-code-block-content" dir="ltr" id="arabic">const label = 'إرسال الطلب';</pre>
  <pre class="hw-code-block-content" dir="ltr"><span id="narrow">iiiiiiiiii</span>\n<span id="wide">MMMMMMMMMM</span></pre>
  <pre dir="ltr" style="font-family:'Hawiyah Code Arabic',monospace;font-size:14px"><span id="alias-narrow">iiiiiiiiii</span>\n<span id="alias-wide">MMMMMMMMMM</span>\n<span id="alias-arabic">إرسال</span></pre>
  <pre dir="ltr" style="font-family:monospace;font-size:14px"><span id="generic-arabic">إرسال</span></pre>`;
async function open(page:Page,withFonts:boolean) {
  expect(existsSync(`${dist}fonts.css`),'packages/styles/dist/fonts.css is missing. Build the styles package first: node scripts/build.mjs --only styles').toBe(true);
  const requests:string[]=[];const missing:string[]=[];
  await page.route(`${origin}/**`,route=>{
    const path=decodeURIComponent(new URL(route.request().url()).pathname.replace(/^\/+/,''));
    requests.push(path);
    if(path==='index.html') return route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><title>Fonts</title><link rel="stylesheet" href="./styles.css">${withFonts?'<link rel="stylesheet" href="./fonts.css">':''}</head><body style="font-family:var(--hw-font-sans)">${body}</body></html>`});
    if(!existsSync(dist+path)){missing.push(path);return route.fulfill({status:404,body:''});}
    return route.fulfill({path:dist+path});
  });
  await page.goto(`${origin}/index.html`);
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForLoadState('networkidle');
  return {requests,missing,fonts:()=>requests.filter(path=>path.endsWith('.woff2')).map(path=>path.replace('assets/fonts/','')).sort()};
}
const width=(page:Page,id:string)=>page.locator(`#${id}`).evaluate(node=>node.getBoundingClientRect().width);
test('the component stylesheet alone fetches no text font',async({page})=>{
  const loaded=await open(page,false);
  expect(loaded.missing).toEqual([]);
  expect(loaded.fonts()).toEqual([]);
  expect(await page.evaluate(()=>[...document.fonts].map(face=>face.family.replaceAll('"',''))) ).toEqual(['HawiyahRiyal']);
  // Without fonts.css the Arabic code family is an unknown name and is skipped: code stays monospace.
  expect(await width(page,'narrow')).toBeCloseTo(await width(page,'wide'),1);
});
test('fonts.css loads the IBM files it needs, with swap, from inside the package',async({page})=>{
  const loaded=await open(page,true);
  expect(loaded.missing).toEqual([]);
  // Latin code needs the first IBM Plex Mono file only; the Arabic file serves both the sans family and Arabic in code.
  expect(loaded.fonts()).toEqual(['IBMPlexMono-Regular-Latin1.woff2','IBMPlexSansArabic-Bold.woff2','IBMPlexSansArabic-Regular.woff2']);
  const faces=await page.evaluate(()=>[...document.fonts].map(face=>({family:face.family.replaceAll('"',''),weight:face.weight,display:face.display,status:face.status})));
  expect(faces.filter(face=>face.family!=='HawiyahRiyal').every(face=>face.display==='swap')).toBe(true);
  expect(faces.filter(face=>face.status==='loaded').map(face=>`${face.family} ${face.weight}`).sort()).toEqual(['Hawiyah Code Arabic 400','IBM Plex Mono 400','IBM Plex Sans Arabic 400','IBM Plex Sans Arabic 700']);
  expect(await page.evaluate(()=>['400 16px "IBM Plex Sans Arabic"','500 16px "IBM Plex Sans Arabic"','600 16px "IBM Plex Sans Arabic"','700 16px "IBM Plex Sans Arabic"','400 14px "IBM Plex Mono"'].map(font=>document.fonts.check(font,'a')))).toEqual([true,false,false,true,true]);
});
test('Arabic inside code uses the joined Arabic face and Latin code stays monospace',async({page})=>{
  await open(page,true);
  // The listing is monospace in IBM Plex Mono.
  expect(await width(page,'narrow')).toBeCloseTo(await width(page,'wide'),1);
  // The Arabic code family never serves Latin: with no mono face before it, Latin falls through to the generic family.
  expect(await width(page,'alias-narrow')).toBeCloseTo(await width(page,'alias-wide'),1);
  expect(await page.evaluate(()=>document.fonts.check('14px "Hawiyah Code Arabic"','M'))).toBe(true);
  expect(await page.evaluate(async()=>(await document.fonts.load('14px "Hawiyah Code Arabic"','M')).length)).toBe(0);
  expect(await page.evaluate(async()=>(await document.fonts.load('14px "Hawiyah Code Arabic"','س')).length)).toBe(1);
  // Arabic letters come from the IBM file, not from the platform monospace fallback.
  expect(await width(page,'alias-arabic')).not.toBeCloseTo(await width(page,'generic-arabic'),1);
  const arabic=await page.locator('#arabic').evaluate(node=>getComputedStyle(node).fontFamily);
  expect(arabic.indexOf('IBM Plex Mono')).toBeLessThan(arabic.indexOf('Hawiyah Code Arabic'));
  expect(arabic.indexOf('Hawiyah Code Arabic')).toBeLessThan(arabic.indexOf('monospace'));
});
