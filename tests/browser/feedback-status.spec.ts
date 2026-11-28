import { expect, test, type Page } from '@playwright/test';
import { openFixture } from './style-fixture';

// Static fixtures with the package stylesheet only: the documented markup of the feedback,
// status and content components (packages/vanilla/README.md), and where a case names it the
// wrapper host the Angular adapter adds around the same markup.
const box=async(page:Page,selector:string)=>(await page.locator(selector).boundingBox())!;
const overlap=(a:{x:number;y:number;width:number;height:number},b:{x:number;y:number;width:number;height:number})=>a.x<b.x+b.width-0.5&&b.x<a.x+a.width-0.5&&a.y<b.y+b.height-0.5&&b.y<a.y+a.height-0.5;

const alert=`<div class="hw-alert" data-tone="success" role="status" id="alert"><div class="hw-alert-content"><p>Your draft was saved and can be completed later from the requests page.</p></div><button type="button" class="hw-button hw-alert-dismiss" data-variant="ghost" data-size="md" aria-label="Dismiss message"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></div>`;
for(const lang of ['en','ar'] as const)
  test(`[ALERT-04] the dismiss button keeps a 24px target at the inline end of a 320px alert (${lang})`,async({page})=>{
    await page.setViewportSize({width:320,height:640});
    await openFixture(page,alert,{lang});
    const button=await box(page,'.hw-alert-dismiss'),content=await box(page,'.hw-alert-content'),root=await box(page,'#alert');
    expect(button.width).toBeGreaterThanOrEqual(24);expect(button.height).toBeGreaterThanOrEqual(24);
    expect(root.x+root.width).toBeLessThanOrEqual(320);expect(overlap(button,content)).toBe(false);
    if(lang==='ar') expect(button.x+button.width).toBeLessThanOrEqual(content.x+0.5); else expect(button.x).toBeGreaterThanOrEqual(content.x+content.width-0.5);
  });
test('[ALERT-04] the dismiss button shows a focus ring in forced colours',async({page})=>{
  await page.emulateMedia({forcedColors:'active'});
  await openFixture(page,alert);
  await page.keyboard.press('Tab');
  const ring=await page.locator('.hw-alert-dismiss').evaluate(node=>{const style=getComputedStyle(node);return {focused:node===document.activeElement&&node.matches(':focus-visible'),style:style.outlineStyle,width:Number.parseFloat(style.outlineWidth)};});
  expect(ring.focused).toBe(true);expect(ring.style).not.toBe('none');expect(ring.width).toBeGreaterThanOrEqual(2);
});

test('[PROGRESS-03] progress is 4, 8 and 12px high for sm, default and lg, alone and inside the Angular host',async({page})=>{
  await openFixture(page,`<div style="inline-size:240px">${['sm','','lg'].map(size=>`<progress class="hw-progress" id="bare-${size||'md'}" ${size?`data-size="${size}"`:''} value="40" max="100" aria-label="Upload"></progress><hw-progress id="host-${size||'md'}"><progress class="hw-progress" ${size?`data-size="${size}"`:''} value="40" max="100" aria-label="Upload"></progress></hw-progress>`).join('')}</div>`);
  for(const [size,height] of [['sm',4],['md',8],['lg',12]] as const){
    const bare=await box(page,`#bare-${size}`),inner=await box(page,`#host-${size} > progress`),host=await box(page,`#host-${size}`);
    expect(bare.height).toBeCloseTo(height,1);expect(inner.height).toBeCloseTo(height,1);expect(inner.width).toBeCloseTo(bare.width,0);
    await expect(page.locator(`#host-${size}`)).toHaveCSS('display','block');expect(host.width).toBeCloseTo(240,0);
  }
});

test('[SKELETON-02] a skeleton is a block of the container width and 16px; a circle of 3rem is 48 by 48px',async({page})=>{
  await openFixture(page,`<div style="inline-size:240px"><span class="hw-skeleton" id="block" aria-hidden="true"></span><span class="hw-skeleton" id="circle" data-variant="circle" aria-hidden="true" style="inline-size:3rem"></span></div>`);
  const block=await box(page,'#block'),circle=await box(page,'#circle');
  expect(block.width).toBeCloseTo(240,0);expect(block.height).toBeCloseTo(16,0);
  expect(circle.width).toBeCloseTo(48,0);expect(circle.height).toBeCloseTo(48,0);
});

// SKELETON-04 checks the stylesheet and the accessibility tree of the documented pattern, written here as authored
// markup; it reads no document (SKELETON-03 checks the documents) and renders no adapter.
test('[SKELETON-04] the documented loading pattern is one status with the loading text and no other named node',async({page})=>{
  await openFixture(page,`<main><div role="status"><span class="hw-sr-only">Loading requests</span><span class="hw-skeleton" aria-hidden="true" data-variant="text" style="inline-size: 70%"></span><span class="hw-skeleton" aria-hidden="true" style="block-size: 4rem"></span></div></main>`);
  await expect(page.locator('main')).toMatchAriaSnapshot(`- main:\n  - status: Loading requests`);
  await expect(page.getByRole('status')).toHaveCount(1);
  expect(await page.locator('main [aria-busy], main [aria-label]').count()).toBe(0);
});

test('[SPINNER-04] the spinner box is 16, 20 and 32px for sm, default and lg and stops under reduced motion',async({page})=>{
  const body=['sm','','lg'].map(size=>`<span class="hw-spinner" id="spinner-${size||'md'}" role="status" ${size?`data-size="${size}"`:''}><span class="hw-sr-only">Loading</span></span>`).join(' ');
  await openFixture(page,body);
  // The layout box, not the bounding box of the rotating element.
  for(const [size,side] of [['sm',16],['md',20],['lg',32]] as const) expect(await page.locator(`#spinner-${size}`).evaluate(node=>[(node as HTMLElement).offsetWidth,(node as HTMLElement).offsetHeight])).toEqual([side,side]);
  await expect(page.locator('#spinner-md')).toHaveCSS('animation-name','hw-spin');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('#spinner-md')).toHaveCSS('animation-name','none');
});

const list=(variant?:string)=>`<dl class="hw-description-list" ${variant?`data-variant="${variant}"`:''} id="list-${variant??'default'}"><div><dt>Processing time</dt><dd>3 working days</dd></div><div><dt>Fee</dt><dd>100</dd></div></dl>`;
for(const lang of ['en','ar'] as const)
  test(`[DESCRIPTION-LIST-02] default rows are stacked; horizontal rows are two columns above 40rem and stacked below (${lang})`,async({page})=>{
    await page.setViewportSize({width:1024,height:700});
    await openFixture(page,list()+list('horizontal'),{lang});
    const pair=async(id:string)=>({term:await box(page,`#${id} > div:first-child > dt`),value:await box(page,`#${id} > div:first-child > dd`)});
    const stacked=await pair('list-default');expect(stacked.value.y).toBeGreaterThanOrEqual(stacked.term.y+stacked.term.height-0.5);
    const wide=await pair('list-horizontal');expect(overlap(wide.term,wide.value)).toBe(false);expect(wide.value.y).toBeLessThan(wide.term.y+wide.term.height);
    if(lang==='ar') expect(wide.value.x+wide.value.width).toBeLessThanOrEqual(wide.term.x+0.5); else expect(wide.value.x).toBeGreaterThanOrEqual(wide.term.x+wide.term.width-0.5);
    await page.setViewportSize({width:480,height:700});
    const narrow=await pair('list-horizontal');expect(narrow.value.y).toBeGreaterThanOrEqual(narrow.term.y+narrow.term.height-0.5);
  });

test('[TIMELINE-03] a timeline item heading is 16px medium, and the item is as high with the Angular host around the list',async({page})=>{
  const items=`<li class="hw-timeline-item" data-state="complete"><h3>Submitted</h3><time datetime="2026-10-27">27 October 2026</time><p>Received.</p></li><li class="hw-timeline-item" data-state="current" aria-current="step"><h3>Review</h3></li>`;
  await openFixture(page,`<div style="inline-size:320px"><ol class="hw-timeline" id="bare">${items}</ol><hw-timeline id="host"><ol class="hw-timeline">${items}</ol></hw-timeline></div>`);
  const heading=page.locator('#bare .hw-timeline-item h3').first();
  await expect(heading).toHaveCSS('font-size','16px');await expect(heading).toHaveCSS('font-weight','500');
  const bare=await box(page,'#bare > li:first-child'),hosted=await box(page,'#host > ol > li:first-child');
  expect(hosted.height).toBeCloseTo(bare.height,0);expect(hosted.width).toBeCloseTo(bare.width,0);
});

const notifications=`<section class="hw-notification-list" aria-labelledby="notifications-title" tabindex="-1"><h2 id="notifications-title">Notifications</h2><ul><li data-state="unread" id="unread"><h3><a class="hw-link" href="#request">Request approved and ready to collect</a></h3><span class="hw-badge" data-tone="info">New</span><p>Your commercial licence is ready.</p><time datetime="2026-10-28T09:00:00+03:00">28 October</time><button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-mark-read>Mark as read</button><button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="Dismiss: Request approved"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></li></ul></section>`;
for(const lang of ['en','ar'] as const)
  test(`[NOTIFICATION-04] at 320px the parts of an unread item do not overlap and both buttons keep a 24px target (${lang})`,async({page})=>{
    await page.setViewportSize({width:320,height:800});
    await openFixture(page,notifications,{lang});
    const parts=await Promise.all(['#unread > h3','#unread > .hw-badge','#unread > p','#unread > [data-hw-mark-read]','#unread > [data-hw-dismiss]'].map(selector=>box(page,selector)));
    for(let first=0;first<parts.length;first++) for(let second=first+1;second<parts.length;second++) expect(overlap(parts[first]!,parts[second]!),`parts ${first} and ${second}`).toBe(false);
    for(const button of parts.slice(3)){expect(button.width).toBeGreaterThanOrEqual(24);expect(button.height).toBeGreaterThanOrEqual(24);}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.locator('#unread > [data-hw-dismiss]').focus();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');
    const ring=await page.locator('#unread > [data-hw-dismiss]').evaluate(node=>{const style=getComputedStyle(node);return {visible:node.matches(':focus-visible'),style:style.outlineStyle,width:Number.parseFloat(style.outlineWidth)};});
    expect(ring.visible).toBe(true);expect(ring.style).not.toBe('none');expect(ring.width).toBeGreaterThanOrEqual(2);
  });

const consent=(tag:string,attributes='')=>`<${tag} class="hw-cookie-consent" ${attributes} aria-labelledby="cookies-title"><h2 id="cookies-title">Cookies</h2><p>Choose optional cookies.</p><div class="hw-button-group"><button type="button" class="hw-button" data-variant="primary">Accept</button><button type="button" class="hw-button" data-variant="secondary">Reject</button><button type="button" class="hw-button" data-variant="ghost">Preferences</button></div></${tag}>`;
for(const lang of ['en','ar'] as const)
  test(`[CONSENT-03] below 40rem the three consent buttons are a stacked full-width grid (${lang})`,async({page})=>{
    await page.setViewportSize({width:390,height:800});
    await openFixture(page,consent('section'),{lang});
    const group=await box(page,'.hw-button-group');const buttons=await Promise.all([1,2,3].map(index=>box(page,`.hw-button-group > button:nth-child(${index})`)));
    for(const button of buttons){expect(button.width).toBeCloseTo(group.width,0);expect(button.x).toBeCloseTo(group.x,0);}
    expect(buttons[1]!.y).toBeGreaterThanOrEqual(buttons[0]!.y+buttons[0]!.height);expect(buttons[2]!.y).toBeGreaterThanOrEqual(buttons[1]!.y+buttons[1]!.height);
  });
for(const lang of ['en','ar'] as const)
  test(`[CONSENT-05] the banner variant on the Angular host is fixed at the block end (${lang})`,async({page})=>{
    await page.setViewportSize({width:1024,height:700});
    await openFixture(page,`<main style="block-size:1600px"><p>Content</p></main>${consent('hw-cookie-consent','data-variant="banner" role="region"')}`,{lang});
    const banner=page.locator('hw-cookie-consent');
    await expect(banner).toHaveCSS('position','fixed');
    const before=(await banner.boundingBox())!;expect(before.y+before.height).toBeGreaterThan(700-40);expect(before.y+before.height).toBeLessThanOrEqual(700);
    await page.evaluate(()=>window.scrollTo(0,600));
    const after=(await banner.boundingBox())!;expect(after.y).toBeCloseTo(before.y,0);
    expect(before.x).toBeGreaterThanOrEqual(0);expect(before.x+before.width).toBeLessThanOrEqual(1024);
  });

test('[COLLAPSIBLE-03] a disabled collapsible trigger has the disabled colour, and GrayText in forced colours',async({page})=>{
  const body=`<details class="hw-collapsible" id="off"><summary class="hw-collapsible-trigger" aria-disabled="true">Requirements</summary><div class="hw-collapsible-content">Content</div></details><details class="hw-collapsible" id="on"><summary class="hw-collapsible-trigger">Requirements</summary><div class="hw-collapsible-content">Content</div></details>`;
  const probe=(page:Page,colour:string)=>page.evaluate(value=>{const node=document.createElement('i');node.style.color=value;document.body.append(node);const computed=getComputedStyle(node).color;node.remove();return computed;},colour);
  await openFixture(page,body);
  await expect(page.locator('#off > summary')).toHaveCSS('color',await probe(page,'var(--hw-color-on-disabled)'));
  await expect(page.locator('#off > summary')).toHaveCSS('cursor','not-allowed');
  expect(await page.locator('#on > summary').evaluate(node=>getComputedStyle(node).color)).not.toBe(await probe(page,'var(--hw-color-on-disabled)'));
  await page.emulateMedia({forcedColors:'active'});
  await openFixture(page,body);
  await expect(page.locator('#off > summary')).toHaveCSS('color',await probe(page,'GrayText'));
});

test('[PAGE-HEADER-02] an h3 page-header title has the font size and weight of the h1 title',async({page})=>{
  await page.setViewportSize({width:1024,height:700});
  await openFixture(page,`<header class="hw-page-header" id="first"><div class="hw-page-header-content"><h1>Requests</h1><p>All requests.</p></div></header><header class="hw-page-header" id="third"><div class="hw-page-header-content"><h3>Requests</h3><p>All requests.</p></div></header><header class="hw-page-header" id="main"><div class="hw-page-header-main"><div><h3>Requests</h3></div><div class="hw-page-header-actions"><button type="button" class="hw-button">New</button></div></div></header>`);
  const title=(selector:string)=>page.locator(selector).evaluate(node=>{const style=getComputedStyle(node);return [style.fontSize,style.fontWeight,style.lineHeight,style.marginBlockStart,style.marginBlockEnd];});
  const first=await title('#first h1');
  expect(await title('#third h3')).toEqual(first);expect(await title('#main h3')).toEqual(first);
});

test('[TEXTAREA-02] [ATTR-06] the default textarea is as high inside the Angular host; form-control hosts are blocks and hidden hosts are not rendered',async({page})=>{
  const field=`<div class="hw-field"><label class="hw-label" for="ID">Notes</label><textarea class="hw-textarea" id="ID"></textarea></div>`;
  const hosts=['hw-field','hw-text-field','hw-textarea','hw-select','hw-checkbox','hw-switch','hw-radio-group','hw-number-field','hw-slider','hw-range-slider','hw-combobox','hw-password-field','hw-search-field','hw-pin-input','hw-tag-input','hw-multi-select','hw-file-dropzone','hw-calendar','hw-date-picker','hw-progress','hw-meter','hw-description-list','hw-timeline','hw-notification-list','hw-feedback'];
  await openFixture(page,`<div style="inline-size:320px">${field.replaceAll('ID','bare')}<hw-textarea id="host">${field.replaceAll('ID','hosted')}</hw-textarea>${hosts.map(host=>`<${host} data-host>x</${host}><${host} data-host hidden>x</${host}>`).join('')}<hw-table id="wide" style="overflow:auto"><table><tr><td style="min-inline-size:900px">wide</td></tr></table></hw-table></div>`);
  const bare=await box(page,'#bare'),hosted=await box(page,'#hosted');
  expect(hosted.height).toBeCloseTo(bare.height,0);expect(hosted.width).toBeCloseTo(bare.width,0);expect(bare.height).toBeGreaterThanOrEqual(88);
  const display=await page.locator('[data-host]').evaluateAll(nodes=>nodes.map(node=>`${node.localName}${node.hasAttribute('hidden')?'[hidden]':''}=${getComputedStyle(node).display}`));
  expect(display).toEqual(hosts.flatMap(host=>[`${host}=block`,`${host}[hidden]=none`]));
  const wide=await box(page,'#wide');expect(wide.width).toBeLessThanOrEqual(320.5);
});
