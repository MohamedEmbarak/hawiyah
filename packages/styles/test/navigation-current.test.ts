// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const css=readFileSync(fileURLToPath(new URL('../src/navigation-drawer.css',import.meta.url)),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
const tokens=JSON.parse(readFileSync(fileURLToPath(new URL('../../tokens/tokens.json',import.meta.url)),'utf8'));
const declarations=(selector:string)=>{const start=css.indexOf(selector+' {');if(start<0)throw new Error(`no rule for ${selector}`);return css.slice(start,css.indexOf('}',start));};
const token=(body:string,property:string)=>new RegExp(`(?:^|[;{\\s])${property}:\\s*var\\(--hw-color-([a-z0-9-]+)\\)`).exec(body)?.[1];
const channels=(hex:string)=>[1,3,5].map(index=>Number.parseInt(hex.slice(index,index+2),16)/255);
const luminance=(hex:string)=>channels(hex).map(value=>value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[0.2126,0.7152,0.0722][index],0);
const ratio=(a:string,b:string)=>{const [low,high]=[luminance(a),luminance(b)].sort((x,y)=>x-y);return (high+0.05)/(low+0.05);};
const modes=Object.entries(tokens.themes as Record<string,Record<string,{color:Record<string,{$value:string}>}>>).filter(([name])=>!name.startsWith('$')).flatMap(([name,theme])=>Object.entries(theme).map(([mode,values])=>({name:`${name} ${mode}`,color:(key:string):string=>{const value=values.color[key].$value;const alias=/^\{color\.([a-z0-9-]+)\}$/.exec(value)?.[1];return alias?values.color[alias].$value:value;}})));
// The current row is always visible in SideNavigation, so the pair the stylesheet uses is measured here.
describe('current navigation row',()=>{
  const row=declarations(`.hw-navigation-drawer-row[aria-current='page']`),marker=declarations(`.hw-navigation-drawer-row[aria-current='page']::before`);
  const foreground=token(row,'color'),background=token(row,'background'),indicator=token(marker,'background');
  it('names its colours with semantic tokens',()=>{expect(foreground).toBeTruthy();expect(background).toBeTruthy();expect(indicator).toBeTruthy();expect(modes.length).toBeGreaterThanOrEqual(4);});
  for(const mode of modes) it(`${mode.name}: the label reaches 4.5:1 and the marker 3:1 on the row background`,()=>{
    expect(ratio(mode.color(foreground!),mode.color(background!)),`${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
    expect(ratio(mode.color(indicator!),mode.color(background!)),`${indicator} on ${background}`).toBeGreaterThanOrEqual(3);
  });
  it('keeps system colours for the row and the marker in forced colours',()=>{
    const forced=css.slice(css.indexOf('@media (forced-colors: active)'));
    expect(forced).toContain(`.hw-navigation-drawer-row[aria-current='page'] { color: LinkText; }`);
    expect(forced).toContain(`.hw-navigation-drawer-row[aria-current='page']::before { background: LinkText; forced-color-adjust: none; }`);
  });
});
