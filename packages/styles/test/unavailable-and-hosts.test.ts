// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const read=(name:string)=>readFileSync(fileURLToPath(new URL(`../src/${name}`,import.meta.url)),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
const extended=read('extended.css'),components=read('components.css'),layout=read('layout.css'),carousel=read('nic-carousel.css'),pagination=read('nic-pagination.css'),buttons=read('nic-buttons.css'),feedback=read('feedback.css'),datePicker=read('date-picker.css');
const all=[extended,components,layout,carousel,pagination,buttons,feedback,datePicker].join('\n');
const tokens=JSON.parse(readFileSync(fileURLToPath(new URL('../../tokens/tokens.json',import.meta.url)),'utf8'));
/** The declarations of the first rule whose selector is exactly `selector`. */
const declarations=(css:string,selector:string)=>{const start=css.indexOf(selector+' {');if(start<0)throw new Error(`no rule for ${selector}`);return css.slice(start+selector.length+2,css.indexOf('}',start)).trim();};
const forced=(css:string)=>{const start=css.indexOf('@media (forced-colors: active) {');if(start<0)throw new Error('no forced-colours block');return css.slice(start);};
const token=(body:string,property:string)=>new RegExp(`(?:^|[;\\s])${property}:[^;]*var\\(--hw-color-([a-z0-9-]+)\\)`).exec(body)?.[1];
// Alpha colours are measured after compositing on the surface they are painted on.
const channels=(hex:string,backdrop=[1,1,1])=>{const alpha=hex.length===9?Number.parseInt(hex.slice(7),16)/255:1;return [1,3,5].map((index,channel)=>Number.parseInt(hex.slice(index,index+2),16)/255*alpha+backdrop[channel]!*(1-alpha));};
const luminance=(rgb:number[])=>rgb.map(value=>value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[0.2126,0.7152,0.0722][index]!,0);
const ratio=(foreground:string,background:string,surface:string)=>{const back=channels(background,channels(surface));const [low,high]=[luminance(channels(foreground,back)),luminance(back)].sort((x,y)=>x-y);return (high!+0.05)/(low!+0.05);};
const modes=Object.entries(tokens.themes as Record<string,Record<string,{color:Record<string,{$value:string}>}>>).filter(([name])=>!name.startsWith('$')).flatMap(([name,theme])=>Object.entries(theme).map(([mode,values])=>({name:`${name} ${mode}`,color:(key:string):string=>{const value=values.color[key]!.$value;const alias=/^\{color\.([a-z0-9-]+)\}$/.exec(value)?.[1];return alias?values.color[alias]!.$value:value;}})));
const physical=/(?:^|[;\s])(?:(?:margin|padding|border)-(?:left|right|top|bottom)|left|right|top|bottom|width|height|min-width|max-width|min-height|max-height|text-align:\s*(?:left|right))\b\s*:?/;

describe('Angular wrapper hosts',()=>{
  const rules=[...layout.matchAll(/:where\(([^)]*)\)((?::where\(:not\(\[hidden\]\)\))?) \{([^}]*)\}/g)].filter(match=>/(^|[\s,])hw-[a-z-]+/.test(match[1]!)&&!match[1]!.includes('.')).map(match=>({hosts:match[1]!.split(',').map(host=>host.trim()).filter(Boolean),guarded:match[2]!=='',body:match[3]!.trim()}));
  const display=(host:string)=>rules.filter(rule=>rule.hosts.includes(host)).map(rule=>rule.body);
  it('gives every wrapper host one zero-specificity box that leaves a hidden host alone',()=>{
    const block=['hw-field','hw-text-field','hw-textarea','hw-select','hw-checkbox','hw-switch','hw-radio-group','hw-number-field','hw-slider','hw-range-slider','hw-combobox','hw-password-field','hw-search-field','hw-pin-input','hw-tag-input','hw-multi-select','hw-file-dropzone','hw-file-upload','hw-calendar','hw-date-picker','hw-accordion','hw-collapsible','hw-tree-view','hw-tabs','hw-secondary-nav','hw-pagination','hw-breadcrumb','hw-stepper','hw-service-details','hw-progress','hw-meter','hw-description-list','hw-timeline','hw-notification-list','hw-feedback'];
    for(const host of block) expect(display(host),host).toEqual(['display: block;']);
    for(const host of ['hw-table','hw-data-table','hw-carousel']) expect(display(host),host).toEqual(['display: block; min-inline-size: 0; max-inline-size: 100%;']);
    for(const host of ['hw-popover','hw-menu']) expect(display(host),host).toEqual(['display: inline-block; max-inline-size: 100%;']);
    for(const host of ['hw-toggle-group','hw-content-navigation']) expect(display(host),host).toEqual(['display: contents;']);
    const added=rules.filter(rule=>!rule.hosts.includes('hw-container')&&!rule.hosts.includes('hw-card'));
    expect(added).toHaveLength(4);
    for(const rule of added) expect(rule.guarded,rule.hosts[0]).toBe(true);
    const every=rules.flatMap(rule=>rule.hosts);
    expect(new Set(every).size).toBe(every.length);
  });
  it('leaves hosts that are their own root, and dialogs in the top layer, without a rule',()=>{
    for(const host of ['hw-alert','hw-badge','hw-chip','hw-spinner','hw-skeleton','hw-avatar','hw-avatar-group','hw-button-group','hw-empty-state','hw-stat','hw-cookie-consent','hw-side-navigation','hw-tooltip','hw-dialog','hw-drawer','hw-radio','hw-link','hw-portal-header','hw-portal-layout']) expect(display(host),host).toEqual([]);
    expect(layout).not.toMatch(/(^|[\s,(])hw-alert\b/m);
  });
});

describe('controls that stay focusable while unavailable',()=>{
  it('styles an aria-disabled arrow like a disabled one and keeps hover and active for available arrows only',()=>{
    expect(declarations(carousel,`.hw-button.hw-carousel-arrow:is(:disabled, [aria-disabled='true'])`)).toBe('opacity: .3; cursor: not-allowed;');
    expect(carousel).toContain(`.hw-button.hw-carousel-arrow:hover:not(:disabled, [aria-disabled='true']) {`);
    expect(carousel).toContain(`.hw-button.hw-carousel-arrow:active:not(:disabled, [aria-disabled='true']) {`);
    expect(carousel).not.toMatch(/hw-carousel-arrow:disabled/);
    expect(pagination).not.toMatch(/hw-pagination-arrow:disabled/);
  });
  it('draws the focus ring of an aria-disabled button, carousel arrow and pagination arrow at full opacity',()=>{
    expect(declarations(buttons,`.hw-button[aria-disabled='true']:focus-visible`)).toBe('outline: 2px solid var(--hw-button-focus-color); outline-offset: 2px;');
    expect(declarations(buttons,'.hw-button')).toContain('--hw-button-focus-color: var(--hw-color-focus-contrast);');
    const arrow=declarations(carousel,`.hw-button.hw-carousel-arrow[aria-disabled='true']:focus-visible`);
    expect(arrow).toContain('opacity: 1;'); expect(token(arrow,'background')).toBe('disabled'); expect(token(arrow,'color')).toBe('on-disabled');
    const page=declarations(pagination,`.hw-pagination :is(.hw-pagination-arrow, .hw-pagination-gap-trigger)[aria-disabled='true']:focus-visible`);
    expect(page).toContain('opacity: 1;'); expect(token(page,'outline')).toBe('focus-contrast');
    // The general rule must outrank the rule that removes the outline of a disabled button.
    expect(buttons.indexOf(`.hw-button[aria-disabled='true']:focus-visible {`)).toBeGreaterThan(buttons.indexOf(`.hw-button:is(:disabled, [aria-disabled='true']) {`));
  });
  for(const mode of modes) it(`${mode.name}: the focus ring reaches 3:1 on every page surface`,()=>{
    for(const surface of ['surface','canvas','surface-muted','surface-raised']) expect(ratio(mode.color('focus-contrast'),mode.color(surface),mode.color('surface')),surface).toBeGreaterThanOrEqual(3);
  });
  it('keeps system colours for unavailable arrows and their focus ring in forced colours',()=>{
    expect(forced(carousel)).toContain(`.hw-carousel-arrow:is(:disabled, [aria-disabled='true'])::before { background: GrayText; }`);
    expect(forced(pagination)).toContain(`.hw-pagination-arrow:is(:disabled, [aria-disabled='true'])::before { background: GrayText; }`);
    expect(forced(pagination)).toContain(`.hw-pagination :is(.hw-pagination-arrow, .hw-pagination-gap-trigger)[aria-disabled='true']:focus-visible { outline-color: Highlight; }`);
    expect(forced(buttons)).toContain(`.hw-button[aria-disabled='true']:focus-visible { outline: 2px solid Highlight; outline-offset: 2px; }`);
  });
  it('shows a disabled collapsible trigger, chip button and tree toggle, also in forced colours',()=>{
    const trigger=`.hw-collapsible > :is(summary, .hw-collapsible-trigger, [data-hw-trigger])[aria-disabled='true']`;
    expect(token(declarations(extended,trigger),'color')).toBe('on-disabled');
    expect(forced(extended)).toContain(`${trigger} { color: GrayText; }`);
    expect(declarations(components,'.hw-chip button:hover:not(:disabled)')).toBe('background: var(--hw-color-border);');
    expect(token(declarations(components,'.hw-chip button:disabled'),'color')).toBe('on-disabled');
    expect(forced(components)).toContain('.hw-chip button:disabled { color: GrayText; }');
    expect(forced(extended)).toContain('.hw-tree-toggle { color: ButtonText; }'); expect(forced(extended)).toContain('.hw-tree-toggle:disabled { color: GrayText; }');
    expect(forced(extended)).toContain(`.hw-feedback [aria-pressed='true'] { outline-color: Highlight; }`);
  });
  it('marks a read-only dropzone without disabling its file input',()=>{
    expect(declarations(extended,`.hw-file-dropzone[data-hw-readonly='true']`)).toBe('border-style: solid;');
    expect(declarations(extended,`.hw-file-dropzone input[type='file'][aria-disabled='true']`)).toBe('cursor: default;');
    expect(extended).toContain(`.hw-file-dropzone:focus-within, .hw-file-dropzone[data-state='dragging'] {`);
  });
});

describe('tree toggle and tree indentation',()=>{
  const toggle=declarations(extended,'.hw-tree-toggle');
  it('is a borderless button with a 1.75rem target (WCAG 2.5.8) that reads the depth of a flat tree',()=>{
    for(const part of ['min-inline-size: 1.75rem;','min-block-size: 1.75rem;','padding: 0;','border: 0;','background: transparent;','font: inherit;','cursor: pointer;']) expect(toggle).toContain(part);
    expect(declarations(extended,'.hw-tree-view')).toContain('--hw-tree-indent: calc(var(--hw-space-2) + 2 * var(--hw-space-3) + 1px);');
    expect(declarations(extended,`:is(.hw-tree-item, .hw-tree-view [role='treeitem'])`)).toContain('padding-inline-start: calc(var(--hw-space-2) + var(--hw-tree-depth, 0) * var(--hw-tree-indent));');
  });
  const glyph=token(toggle,'color'),hover=token(declarations(extended,'.hw-tree-toggle:hover:not(:disabled)'),'background'),selected=token(declarations(extended,`:is(.hw-tree-item, .hw-tree-view [role='treeitem'])[aria-selected='true']`),'background');
  it('names its colours with semantic tokens',()=>{expect(glyph).toBe('text-muted');expect(hover).toBe('surface-muted');expect(selected).toBe('primary-subtle');});
  for(const mode of modes) it(`${mode.name}: the toggle glyph reaches 3:1 at rest, on hover and on a selected item`,()=>{
    for(const background of ['surface',hover!,selected!]) expect(ratio(mode.color(glyph!),mode.color(background),mode.color('surface')),background).toBeGreaterThanOrEqual(3);
  });
});

describe('value text of the sliders',()=>{
  const value=declarations(extended,'.hw-slider-value');
  it('gives the slider output the look of the range output',()=>{
    expect(value).toBe('display: block; color: var(--hw-color-text-muted); font-size: var(--hw-text-sm); font-variant-numeric: tabular-nums;');
    expect(token(declarations(extended,'.hw-range-slider output'),'color')).toBe(token(value,'color'));
  });
  for(const mode of modes) it(`${mode.name}: the value text reaches 4.5:1 on every page surface`,()=>{
    for(const surface of ['surface','canvas','surface-muted','surface-raised']) expect(ratio(mode.color(token(value,'color')!),mode.color(surface),mode.color('surface')),surface).toBeGreaterThanOrEqual(4.5);
  });
});

describe('regions that are always rendered and markup that no adapter renders any more',()=>{
  it('hides an empty footer, trend and icon region',()=>{
    expect(declarations(components,'.hw-dialog-footer:empty')).toBe('display: none;');
    expect(declarations(extended,'.hw-service-details > footer:empty')).toBe('display: none;');
    expect(declarations(extended,'.hw-stat-trend:empty')).toBe('display: none;');
    // The tile rule sets display with this selector; the empty rule repeats it so that it wins.
    const tile=`.hw-empty > :is(.hw-empty-icon, span[aria-hidden='true']:first-child)`;
    expect(declarations(components,tile)).toContain('display: grid;');
    expect(declarations(components,`${tile}:empty`)).toBe('display: none;');
    expect(components.indexOf(`${tile}:empty {`)).toBeGreaterThan(components.indexOf(`${tile} {`));
    expect(datePicker).not.toContain('.hw-dialog-footer');
  });
  it('lays out the alert dismiss button and the multi-select rows with logical properties',()=>{
    expect(declarations(components,'.hw-alert > .hw-alert-dismiss')).toBe('flex: none; margin-block: calc(-1 * var(--hw-space-2)); margin-inline-end: calc(-1 * var(--hw-space-2));');
    expect(declarations(extended,'.hw-multi-select-options > .hw-hint')).toBe('padding-inline: var(--hw-space-2);');
    expect(declarations(extended,`.hw-multi-select-options > label:has(input[aria-disabled='true'])`)).toBe('cursor: default;');
    expect(declarations(extended,'.hw-tag-input > :is(ul, ol, [data-hw-tags])')).toBe('display: contents; margin: 0; padding: 0; list-style: none;');
    for(const [css,selector] of [[components,'.hw-alert > .hw-alert-dismiss'],[extended,'.hw-tree-toggle'],[extended,'.hw-slider-value'],[extended,`:is(.hw-tree-item, .hw-tree-view [role='treeitem'])`],[carousel,`.hw-button.hw-carousel-arrow[aria-disabled='true']:focus-visible`]] as const) expect(declarations(css,selector),selector).not.toMatch(physical);
  });
  it('keeps the page title typography at a lower heading level without restyling projected headings',()=>{
    expect(layout).toContain('.hw-page-header :is(h1, h2), .hw-page-header :where(.hw-page-header-main > div, .hw-page-header-content) > :is(h3, h4, h5, h6) {');
  });
  it('has no rule left for removed markup',()=>{
    for(const gone of ['.hw-popover-content','.hw-service-card-meta','data-unread','data-read=','data-dragging','data-dragover','.hw-tag-input.hw-field','.hw-tag-input > .hw-inline','.hw-feedback > h2','.hw-feedback > fieldset',`li[data-state='active']`,'.hw-calendar-info > .hw-tooltip-anchor']) expect(all,gone).not.toContain(gone);
    expect(feedback).not.toContain('.hw-choice'); expect(feedback).not.toContain('.hw-radio'); expect(feedback).not.toContain('forced-colors');
    expect(extended).toContain(`:is(.hw-notification-list > ul > li, .hw-notification-list > li)[data-state='unread'] {`);
    expect(extended.match(/\.hw-tooltip-anchor/g)).toBeNull(); expect(components).toContain(`[data-hw='tooltip'], .hw-tooltip-anchor { position: relative; display: inline-flex; }`);
  });
});
