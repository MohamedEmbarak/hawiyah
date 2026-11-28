import type { Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
// Static fixture pages that load only the package stylesheet, so style checks do
// not depend on guide markup or guide CSS. The dev server serves the source.
export const stylesheet='/@fs/'+fileURLToPath(new URL('../../packages/styles/src/styles.css',import.meta.url)).replaceAll('\\','/');
export interface FixtureOptions { lang?: 'ar'|'en'; theme?: string; mode?: 'light'|'dark'; name?: string }
export async function openFixture(page:Page,body:string,{lang='en',theme,mode='light',name='style-fixture'}:FixtureOptions={}) {
  const dir=lang==='ar'?'rtl':'ltr';
  const html=`<!doctype html><html lang="${lang}" dir="${dir}"${theme?` data-hw-theme="${theme}"`:''} data-hw-mode="${mode}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Fixture</title><link rel="stylesheet" href="${stylesheet}"></head><body style="margin:0;padding:16px;background:var(--hw-color-surface);color:var(--hw-color-text);font-family:var(--hw-font-sans)">${body}</body></html>`;
  await page.route(`**/__${name}.html`,route=>route.fulfill({contentType:'text/html',body:html}));
  await page.goto(`/__${name}.html`);
  await page.evaluate(()=>document.fonts.ready);
}
// Reads pixels of a screenshot in the page, as "r,g,b" strings.
export async function pixels(page:Page,png:Buffer,points:[number,number][]) {
  return page.evaluate(async({data,points})=>{
    const bitmap=await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
    const canvas=new OffscreenCanvas(bitmap.width,bitmap.height);const context=canvas.getContext('2d')!;context.drawImage(bitmap,0,0);
    return points.map(([x,y])=>Array.from(context.getImageData(Math.round(x),Math.round(y),1,1).data.slice(0,3)).join(','));
  },{data:png.toString('base64'),points});
}
// Counts pixels that differ from the top-left corner colour of a screenshot.
export async function ink(page:Page,png:Buffer) {
  return page.evaluate(async data=>{
    const bitmap=await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
    const canvas=new OffscreenCanvas(bitmap.width,bitmap.height);const context=canvas.getContext('2d')!;context.drawImage(bitmap,0,0);
    const all=context.getImageData(0,0,bitmap.width,bitmap.height).data;let count=0;
    for(let index=0;index<all.length;index+=4) if(Math.abs(all[index]-all[0])+Math.abs(all[index+1]-all[1])+Math.abs(all[index+2]-all[2])>48) count++;
    return count;
  },png.toString('base64'));
}
const channel=(value:number)=>{const v=value/255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;};
const luminance=(rgb:string)=>{const [r,g,b]=rgb.match(/[\d.]+/g)!.map(Number);return 0.2126*channel(r)+0.7152*channel(g)+0.0722*channel(b);};
export function contrast(a:string,b:string) {const [x,y]=[luminance(a),luminance(b)].sort((m,n)=>n-m);return (x+0.05)/(y+0.05);}
// The first opaque background on the element or its ancestors.
export function effectiveBackground(page:Page,selector:string) {
  return page.locator(selector).evaluate(node=>{
    for(let current:Element|null=node;current;current=current.parentElement){const value=getComputedStyle(current).backgroundColor;if(!/rgba\(.*,\s*0\)$|transparent/.test(value))return value;}
    return 'rgb(255, 255, 255)';
  });
}
