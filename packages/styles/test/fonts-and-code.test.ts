// @vitest-environment node
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=(path:string)=>readFileSync(root+path,'utf8');
const sha256=(path:string)=>createHash('sha256').update(readFileSync(root+path)).digest('hex');
const faces=(css:string)=>[...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([,body])=>({
  family:/font-family:\s*'([^']+)'/.exec(body)?.[1],weight:Number(/font-weight:\s*(\d+)/.exec(body)?.[1]),display:/font-display:\s*([a-z]+)/.exec(body)?.[1],
  url:/url\('([^']+)'\)/.exec(body)?.[1],range:/unicode-range:\s*([^;]+);/.exec(body)?.[1]?.trim()??null}));
const provenance=JSON.parse(read('src/assets/fonts/ibm-plex-provenance.json'));
const fonts=faces(read('src/fonts.css'));
describe('opt-in fonts stylesheet',()=>{
  it('declares IBM Plex Sans Arabic 400 to 700 and IBM Plex Mono 400 with font-display swap',()=>{
    expect(fonts.filter(face=>face.family==='IBM Plex Sans Arabic').map(face=>face.weight)).toEqual([400,500,600,700]);
    expect([...new Set(fonts.filter(face=>face.family==='IBM Plex Mono').map(face=>face.weight))]).toEqual([400]);
    expect(fonts.every(face=>face.display==='swap')).toBe(true);
    expect([...new Set(fonts.map(face=>face.family))].sort()).toEqual(['Hawiyah Code Arabic','IBM Plex Mono','IBM Plex Sans Arabic']);
  });
  it('references only files that are present, recorded and unchanged from the published packages',()=>{
    const recorded=new Map<string,{bytes:number;sha256:string;unicodeRange:string|null;weight:number}>(provenance.packages.flatMap((pack:{files:{file:string}[]})=>pack.files.map(file=>[file.file,file])));
    for(const face of fonts) {
      expect(face.url,face.family).toMatch(/^\.\/assets\/fonts\/IBMPlex[A-Za-z0-9-]+\.woff2$/);
      const file=face.url!.replace('./assets/fonts/','');
      expect(existsSync(`${root}src/assets/fonts/${file}`),file).toBe(true);
      expect(recorded.has(file),file).toBe(true);
    }
    const shipped=readdirSync(`${root}src/assets/fonts`).filter(file=>file.startsWith('IBMPlex')).sort();
    expect(shipped).toEqual([...recorded.keys()].sort());
    for(const [file,record] of recorded) {
      const bytes=readFileSync(`${root}src/assets/fonts/${file}`);
      expect(bytes.subarray(0,4).toString(),file).toBe('wOF2');
      expect(bytes.length,file).toBe(record.bytes);
      expect(sha256(`src/assets/fonts/${file}`),file).toBe(record.sha256);
    }
    expect(provenance.modifications).toEqual([]);
    for(const pack of provenance.packages) {expect(pack.license).toBe('OFL-1.1');expect(pack.version).toMatch(/^\d+\.\d+\.\d+$/);expect(pack.integrity).toMatch(/^sha512-/);}
    expect(sha256(`src/assets/fonts/${provenance.licenseFile}`)).toBe(provenance.licenseSha256);
    expect(read(`src/assets/fonts/${provenance.licenseFile}`)).toContain('SIL OPEN FONT LICENSE Version 1.1');
    expect(read('NOTICE')).toContain('ibm-plex-LICENSE.txt');
  });
  it('keeps the unicode-range values IBM ships and limits the Arabic code face to Arabic',()=>{
    const recorded=new Map<string,string|null>(provenance.packages.flatMap((pack:{files:{file:string;unicodeRange:string|null}[]})=>pack.files.map(file=>[file.file,file.unicodeRange])));
    for(const face of fonts.filter(face=>face.family!=='Hawiyah Code Arabic')) expect(face.range,face.url).toBe(recorded.get(face.url!.replace('./assets/fonts/','')));
    expect(fonts.filter(face=>face.family==='IBM Plex Sans Arabic').every(face=>face.range===null)).toBe(true);
    expect(fonts.filter(face=>face.family==='IBM Plex Mono').every(face=>face.range!==null)).toBe(true);
    const arabic=fonts.filter(face=>face.family==='Hawiyah Code Arabic');
    expect(arabic).toHaveLength(1);
    expect(arabic[0].url).toBe('./assets/fonts/IBMPlexSansArabic-Regular.woff2');
    expect(arabic[0].range).toBe(provenance.aliases[0].unicodeRange);
    // No part of the range reaches below U+0600, so Latin code can never use the proportional face.
    const starts=arabic[0].range!.split(',').map(part=>Number.parseInt(part.trim().slice(2).split('-')[0],16));
    expect(Math.min(...starts)).toBe(0x600);
  });
  it('lists the Arabic code face after IBM Plex Mono and never the sans family in the mono token',()=>{
    const tokens=JSON.parse(readFileSync(`${root}../tokens/tokens.json`,'utf8'));
    for(const mono of [tokens.foundation.font.mono.$value,tokens.themeFoundations.hawiyah.font.mono.$value]) {
      const families=mono.split(',').map((family:string)=>family.trim().replaceAll('"',''));
      expect(families.slice(0,2)).toEqual(['IBM Plex Mono','Hawiyah Code Arabic']);
      expect(families.at(-1)).toBe('monospace');
      expect(families).not.toContain('IBM Plex Sans Arabic');
    }
  });
  it('is never part of the component stylesheet',()=>{
    const sources=readdirSync(`${root}src`).filter(file=>file.endsWith('.css'));
    expect(read('src/styles.css')).not.toContain('fonts.css');
    for(const file of sources) if(file!=='fonts.css') {
      expect(read(`src/${file}`),file).not.toMatch(/@import\s+['"][^'"]*fonts\.css/);
      expect(faces(read(`src/${file}`)).map(face=>face.family),file).toEqual(file==='riyal.css'?['HawiyahRiyal']:[]);
    }
    // The published files, when the package has been built.
    if(existsSync(`${root}dist/styles.css`)&&existsSync(`${root}dist/fonts.css`)) {
      const flat=read('dist/styles.css');
      expect(faces(flat).map(face=>face.family)).toEqual(['HawiyahRiyal']);
      expect(flat).not.toContain('IBMPlex');
      for(const face of faces(read('dist/fonts.css'))) expect(existsSync(`${root}dist/${face.url!.slice(2)}`),face.url).toBe(true);
      expect(existsSync(`${root}dist/assets/fonts/ibm-plex-LICENSE.txt`)).toBe(true);
      expect(existsSync(`${root}dist/assets/fonts/ibm-plex-provenance.json`)).toBe(true);
    }
    expect(JSON.parse(read('package.json')).exports['./fonts.css']).toBe('./dist/fonts.css');
  });
});
describe('code and prose stylesheets',()=>{
  const roles=['comment','punctuation','keyword','property','string','constant','attribute','tag','type','function'];
  const tokenCss=readFileSync(`${root}../tokens/src/tokens.css`,'utf8');
  it('gives each syntax role one token and one zero-specificity class',()=>{
    const code=read('src/code.css');
    for(const role of roles) {
      expect(tokenCss,role).toContain(`--hw-color-code-${role}: var(--hw-color-`);
      expect(code,role).toContain(`:where(.hw-code-token-${role}) { color: var(--hw-color-code-${role}); }`);
    }
    expect([...code.matchAll(/hw-code-token-([a-z]+)\)/g)].map(match=>match[1])).toEqual(roles);
    // Class hooks only: a data attribute would not survive a framework HTML sanitizer.
    expect(code).not.toMatch(/\[data-token/);
  });
  it('uses declared tokens only and no physical side',()=>{
    for(const file of ['code.css','prose.css']) {
      const css=read(`src/${file}`).replace(/\/\*[\s\S]*?\*\//g,'');
      for(const [,name,fallback] of css.matchAll(/var\((--hw-[a-z0-9-]+)(,)?/g)) if(!fallback) expect(tokenCss,`${file} ${name}`).toContain(`${name}:`);
      expect(css,file).not.toMatch(/(?:margin|padding|border)-(?:left|right)\b|[^-](?:left|right):|text-align:\s*(?:left|right)/);
      expect(css,file).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    }
  });
  it('styles prose elements only through class-less, zero-specificity selectors',()=>{
    const css=read('src/prose.css').replace(/\/\*[\s\S]*?\*\//g,'').replace(/@media[^{]+\{/g,'');
    const selectors=[...css.matchAll(/([^{}]+)\{[^}]*\}/g)].flatMap(match=>match[1].split(/,\s*(?=[.:])/).map(selector=>selector.trim())).filter(Boolean);
    const element=selectors.filter(selector=>selector.startsWith(':where(.hw-prose)'));
    const flow=selectors.filter(selector=>!selector.startsWith(':where(.hw-prose)'));
    expect(element.length).toBeGreaterThan(30);
    for(const selector of element) {expect(selector,selector).toContain(':not([class])');expect(selector,selector).toContain(':not(:where(.hw-prose [class] *))');}
    // Everything else is the container and the flow spacing of its direct children.
    for(const selector of flow) expect(selector,selector).toMatch(/^\.hw-prose(?: > [^{]+)?$/);
    expect(read('src/styles.css').trimEnd().endsWith(`@import './prose.css';`)).toBe(true);
  });
});
