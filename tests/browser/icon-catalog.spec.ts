import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// Loads only the package stylesheet, so the check does not depend on guide markup.
const icons=new URL('../../packages/styles/src/assets/icons/',import.meta.url);
const stylesheet='/@fs/'+fileURLToPath(new URL('../../packages/styles/src/styles.css',import.meta.url)).replaceAll('\\','/');
const provenance=JSON.parse(readFileSync(new URL('provenance.json',icons),'utf8')) as {upstream:{commit:string};icons:{name:string;file:string;sha256:string;upstreamUrl:string;directionalOptIn:boolean}[]};
const css=readFileSync(new URL('../../packages/styles/src/icons.css',import.meta.url),'utf8');
const fixture=()=>`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>Icons</title><link rel="stylesheet" href="${stylesheet}"></head><body style="color: rgb(10, 90, 40)">
  ${provenance.icons.map(icon=>`<span class="hw-icon" data-icon="${icon.name}" data-directional="true" aria-hidden="true"></span>`).join('')}</body></html>`;
test('every shipped icon file is a recorded upstream file with a data-icon rule',()=>{
  const files=readdirSync(icons).filter(file=>file.endsWith('.svg')).sort();
  expect(provenance.icons.map(icon=>icon.file).sort()).toEqual(files);
  for(const icon of provenance.icons) {
    expect(icon.file).toBe(`${icon.name}.svg`);
    expect(icon.upstreamUrl).toBe(`https://raw.githubusercontent.com/hugeicons/hugeicons/${provenance.upstream.commit}/icons/${icon.file}`);
    const rule=new RegExp(`\\.hw-icon\\[data-icon=["']${icon.name}["']\\]\\s*\\{\\s*--hw-icon-image:\\s*url\\(["']\\./assets/icons/${icon.file}["']\\)`);
    expect(css,icon.name).toMatch(rule);
    expect(createHash('sha256').update(readFileSync(new URL(icon.file,icons))).digest('hex'),icon.name).toBe(icon.sha256);
  }
});
test('every icon renders from its own file, inherits colour and mirrors only when it opts in',async({page})=>{
  await page.route('**/__icon-catalog.html',route=>route.fulfill({contentType:'text/html',body:fixture()}));
  await page.goto('/__icon-catalog.html');
  const rendered=await page.locator('.hw-icon').evaluateAll(async nodes=>Promise.all(nodes.map(async node=>{
    const style=getComputedStyle(node);const source=style.maskImage.slice(5,-2);
    const image=new Image();image.src=source;await image.decode();
    return {name:node.getAttribute('data-icon')!,source,width:image.naturalWidth,size:`${style.width} ${style.height}`,color:style.backgroundColor,mirrored:style.transform!=='none'};
  })));
  for(const icon of rendered) {
    expect(icon.width,icon.name).toBe(24);
    expect(icon.size,icon.name).toBe('24px 24px');
    expect(icon.color,icon.name).toBe('rgb(10, 90, 40)');
  }
  // Vite may inline the artwork, so distinct sources show that no rule points at another icon.
  expect(new Set(rendered.map(icon=>icon.source)).size).toBe(rendered.length);
  expect(rendered.filter(icon=>icon.mirrored).map(icon=>icon.name).sort()).toEqual(provenance.icons.filter(icon=>icon.directionalOptIn).map(icon=>icon.name).sort());
});
