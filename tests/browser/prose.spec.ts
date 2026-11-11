import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { components, portalHeader, proseBody } from './code-prose-fixture';
import { contrast, effectiveBackground, openFixture } from './style-fixture';
const resolved=(page:Page,value:string)=>page.evaluate(value=>{const probe=document.createElement('i');probe.style.color=value;document.body.append(probe);const colour=getComputedStyle(probe).color;probe.remove();return colour;},value);
const computed=(page:Page,selector:string,properties:string[])=>page.locator(selector).first().evaluate((node,properties)=>Object.fromEntries(properties.map(property=>[property,getComputedStyle(node).getPropertyValue(property)])),properties);
const px=(page:Page,token:string)=>page.evaluate(token=>{const probe=document.createElement('i');probe.style.cssText=`position:absolute;inline-size:var(${token})`;document.body.append(probe);const value=getComputedStyle(probe).inlineSize;probe.remove();return value;},token);
test('class-less elements take the documented scales',async({page})=>{
  await page.setViewportSize({width:1280,height:900});
  await openFixture(page,proseBody);
  const scale=async(selector:string)=>computed(page,selector,['font-size','line-height','font-weight']);
  const text=(token:string)=>px(page,`--hw-text-${token}`);
  const line=(size:string,ratio:number)=>`${Math.round(parseFloat(size)*ratio*1000)/1000}px`;
  for(const [selector,token,ratio,weight] of [['#title','3xl',38/30,'700'],['#api','2xl',32/24,'700'],['#h3','xl',30/20,'600'],['#h4','lg',28/18,'600'],['#h5','md',24/16,'600'],['#h6','md',24/16,'600'],['#lead','md',24/16,'400'],['#li-1','md',24/16,'400'],['#dd','md',24/16,'400'],['#dt','md',24/16,'600'],['#small','sm',20/14,'400']] as const) {
    const size=await text(token);const style=await scale(selector);
    expect(style['font-size'],selector).toBe(size);
    expect(parseFloat(style['line-height']),selector).toBeCloseTo(parseFloat(line(size,ratio)),1);
    expect(style['font-weight'],selector).toBe(weight);
  }
  // Heading levels are the author's: the container changes metrics only.
  await expect(page.getByRole('heading',{level:2,name:'API'})).toBeVisible();
  expect((await computed(page,'#api',['scroll-margin-top']))['scroll-margin-top']).toBe(await px(page,'--hw-space-6'));
  // Text blocks keep the paragraph measure; listings, tables, figures and components do not.
  const measure=parseFloat(await px(page,'--hw-width-paragraph'));const container=(await page.locator('#prose').boundingBox())!.width;
  expect(container).toBeGreaterThan(measure);
  for(const selector of ['#after-heading','#ul','#quote','#title']) expect((await page.locator(selector).boundingBox())!.width,selector).toBeCloseTo(measure,0);
  for(const selector of ['#pre','#table','#alert','#prose-listing','#figure']) expect((await page.locator(selector).boundingBox())!.width,selector).toBeCloseTo(container,0);
  // Inline code, kbd and pre take the code styles; a class on the code element does not matter inside pre.
  expect(await computed(page,'#p-code',['direction','unicode-bidi','background-color'])).toEqual({direction:'ltr','unicode-bidi':'isolate','background-color':await resolved(page,'var(--hw-color-code-surface)')});
  expect((await computed(page,'#p-kbd',['border-bottom-width','white-space']))).toEqual({'border-bottom-width':'2px','white-space':'nowrap'});
  expect(await computed(page,'#pre',['direction','white-space','overflow-x','background-color'])).toEqual({direction:'ltr','white-space':'pre','overflow-x':'auto','background-color':await resolved(page,'var(--hw-color-code-surface)')});
  expect(await computed(page,'#pre code',['font-family','font-size','border-top-width','padding-left'])).toEqual({...(await computed(page,'#pre',['font-family','font-size'])),'border-top-width':'0px','padding-left':'0px'});
  // Links follow .hw-link, including the external indicator.
  expect((await computed(page,'#link',['color','text-decoration-line']))).toEqual({color:await resolved(page,'var(--hw-color-link)'),'text-decoration-line':'underline'});
  expect(await page.locator('#external').evaluate(node=>getComputedStyle(node,'::after').maskImage)).toMatch(/^url\(/);
  expect(await page.locator('#link').evaluate(node=>getComputedStyle(node,'::after').content)).toBe('none');
  await page.locator('#link').focus();
  expect((await computed(page,'#link',['outline-style','outline-width']))).toEqual({'outline-style':'solid','outline-width':'2px'});
});
test('flow spacing comes from space tokens and also spaces components',async({page})=>{
  await openFixture(page,proseBody);
  const top=async(selector:string)=>(await computed(page,selector,['margin-top','margin-bottom']));
  const space=(step:string)=>px(page,`--hw-space-${step}`);
  expect(await top('#title')).toEqual({'margin-top':'0px','margin-bottom':'0px'});
  expect((await top('#lead'))['margin-top']).toBe(await space('3'));
  expect((await top('#api'))['margin-top']).toBe(await space('10'));
  expect((await top('#h3'))['margin-top']).toBe(await space('8'));
  expect((await top('#ul'))['margin-top']).toBe(await space('4'));
  expect((await top('#hr'))['margin-top']).toBe(await space('8'));
  expect((await top('#table'))['margin-top']).toBe(await space('8'));
  for(const selector of ['#alert','#prose-listing','#classed','#last']) expect(await top(selector),selector).toEqual({'margin-top':await space('4'),'margin-bottom':'0px'});
  expect((await top('#li-2'))['margin-top']).toBe(await space('1'));
  expect((await top('#li-p'))['margin-top']).toBe(await space('3'));
  expect((await top('#quote-p'))['margin-top']).toBe(await space('3'));
  expect((await top('#dt-2'))['margin-top']).toBe(await space('3'));
  expect((await top('#ul-nested'))['margin-top']).toBe('0px');
});
for(const lang of ['ar','en'] as const)
  test(`lists, quotes and tables follow the nearest direction and code stays left to right (${lang})`,async({page})=>{
    await openFixture(page,proseBody,{lang});
    const start=lang==='ar'?'right':'left',end=lang==='ar'?'left':'right';
    const list=await computed(page,'#ul',[`padding-${start}`,`padding-${end}`]);
    expect(list).toEqual({[`padding-${start}`]:await px(page,'--hw-space-6'),[`padding-${end}`]:'0px'});
    const quote=await computed(page,'#quote',[`border-${start}-width`,`border-${end}-width`,`padding-${start}`,'color']);
    expect(quote).toEqual({[`border-${start}-width`]:await px(page,'--hw-space-1'),[`border-${end}-width`]:'0px',[`padding-${start}`]:await px(page,'--hw-space-4'),color:await resolved(page,'var(--hw-color-text-muted)')});
    expect((await computed(page,'#th',['text-align']))['text-align']).toBe('start');
    const head=(await page.locator('#th').boundingBox())!;const table=(await page.locator('#table').boundingBox())!;
    if(lang==='ar') expect(Math.abs(head.x+head.width-table.x-table.width)).toBeLessThanOrEqual(1); else expect(Math.abs(head.x-table.x)).toBeLessThanOrEqual(1);
    for(const selector of ['#pre','#p-code','#p-kbd','#prose-listing pre']) expect((await computed(page,selector,['direction'])).direction,selector).toBe('ltr');
    // A nested direction wins over the page: the container reads dir, never the locale.
    await page.locator('#prose').evaluate((node,dir)=>node.setAttribute('dir',dir),lang==='ar'?'ltr':'rtl');
    expect((await computed(page,'#ul',[`padding-${end}`]))[`padding-${end}`]).toBe(await px(page,'--hw-space-6'));
  });
for(const lang of ['ar','en'] as const)
  test(`prose reflows at 320px: tables stay in the container and listings scroll inside (${lang})`,async({page})=>{
    await page.setViewportSize({width:320,height:800});
    await openFixture(page,proseBody,{lang});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const container=(await page.locator('#prose').boundingBox())!;
    for(const selector of ['#table','#img','#pre','#prose-listing','#alert','#title']) {
      const box=(await page.locator(selector).boundingBox())!;
      expect(box.x,selector).toBeGreaterThanOrEqual(container.x-0.5);expect(box.x+box.width,selector).toBeLessThanOrEqual(container.x+container.width+0.5);
    }
    expect(await page.locator('#pre').evaluate(node=>node.scrollWidth>node.clientWidth)).toBe(true);
    const image=(await page.locator('#img').boundingBox())!;
    expect(image.width/image.height).toBeCloseTo(4,1);
  });
// Every element inside a component keeps the style it has outside prose; only the component's own block margin may change.
const properties=['color','background-color','font-family','font-size','font-weight','line-height','text-decoration-line','text-align','direction','max-width','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left','border-top-width','border-right-width','border-bottom-width','border-left-width','border-left-color','border-right-color','border-bottom-color','border-radius','display','white-space','overflow-x','list-style-type','width','outline-style'];
for(const lang of ['ar','en'] as const) for(const mode of ['light','dark'] as const)
  test(`components placed in prose keep their own look (${lang} ${mode})`,async({page})=>{
    await page.setViewportSize({width:900,height:900});
    const body=components.map(([name,html])=>`<section data-case="${name}"><div class="hw-prose" data-side="in"><p>Before</p>${html.replaceAll(' id="',' data-id="')}<p>After</p></div><div data-side="out"><p>Before</p>${html.replaceAll(' id="',' data-id="')}<p>After</p></div></section>`).join('');
    await openFixture(page,body,{lang,mode});
    const differences=await page.evaluate(properties=>{
      const found:string[]=[];
      for(const section of document.querySelectorAll('section[data-case]')) {
        const [inside,outside]=['in','out'].map(side=>section.querySelector(`[data-side="${side}"]`)!.children[1]);
        const a=[inside,...inside.querySelectorAll('*')],b=[outside,...outside.querySelectorAll('*')];
        if(a.length!==b.length||a.length<2) found.push(`${section.getAttribute('data-case')}: ${a.length} and ${b.length} elements`);
        a.forEach((node,index)=>{
          const x=getComputedStyle(node),y=getComputedStyle(b[index]);
          for(const property of properties) {
            if(index===0&&/^margin-(top|bottom)$/.test(property)) continue;
            if(x.getPropertyValue(property)!==y.getPropertyValue(property)) found.push(`${section.getAttribute('data-case')} ${node.tagName.toLowerCase()}${node.className?'.'+String(node.className).split(' ')[0]:''} ${property}: ${x.getPropertyValue(property)} in prose, ${y.getPropertyValue(property)} outside`);
          }
        });
      }
      return found;
    },properties);
    expect(differences).toEqual([]);
    // The check has teeth: a class-less paragraph beside the component does differ.
    const paragraphs=await page.evaluate(()=>[...document.querySelectorAll('section[data-case="alert"] [data-side] > p:first-child')].map(node=>getComputedStyle(node).marginBottom));
    expect(paragraphs[0]).not.toBe(paragraphs[1]);
  });
test('a class opts an element out and text tone is a .hw-type option',async({page})=>{
  await openFixture(page,`${proseBody}<p id="outside">Outside</p><p class="hw-type" data-scale="body-sm" data-tone="muted" id="muted">Muted</p><p class="hw-type" data-scale="body-sm" data-tone="subtle" id="subtle">Subtle</p><p class="hw-type" id="plain">Plain</p>`);
  expect(await computed(page,'#classed',['font-size','max-width','font-family'])).toEqual(await computed(page,'#outside',['font-size','max-width','font-family']));
  for(const tone of ['muted','subtle']) {
    const colour=(await computed(page,`#${tone}`,['color'])).color;
    expect(colour).toBe(await resolved(page,`var(--hw-color-text-${tone})`));
    expect(contrast(colour,await effectiveBackground(page,`#${tone}`))).toBeGreaterThanOrEqual(4.5);
  }
  expect((await computed(page,'#plain',['color'])).color).toBe((await computed(page,'#outside',['color'])).color);
});
test('forced colours keep LinkText for links and CanvasText for prose borders',async({page})=>{
  await page.emulateMedia({forcedColors:'active'});
  await openFixture(page,proseBody);
  const canvasText=await resolved(page,'CanvasText');
  expect((await computed(page,'#link',['color'])).color).toBe(await resolved(page,'LinkText'));
  expect((await computed(page,'#quote',['border-left-color']))['border-left-color']).toBe(canvasText);
  expect((await computed(page,'#hr',['border-top-color']))['border-top-color']).toBe(canvasText);
  expect((await computed(page,'#td',['border-bottom-color']))['border-bottom-color']).toBe(canvasText);
  expect((await computed(page,'#pre',['border-top-color']))['border-top-color']).toBe(canvasText);
  await page.locator('#link').focus();
  expect((await computed(page,'#link',['outline-color']))['outline-color']).toBe(await resolved(page,'Highlight'));
});
// The CSS half of the PortalHeader item: the actions container shrinks and wraps.
const headerText={ar:{brand:'هوية',menu:'القائمة',search:'بحث في الدليل',language:'English',mode:'الوضع الداكن',links:['المكونات','الأسس','القوالب']},en:{brand:'Hawiyah',menu:'Menu',search:'Search the guide',language:'العربية',mode:'Dark mode',links:['Components','Foundations','Templates']}};
for(const lang of ['ar','en'] as const) for(const name of ['hw-portal-header-actions','hw-portal-actions'])
  test(`three header actions wrap instead of overflowing 320px (${lang}, ${name})`,async({page})=>{
    await page.setViewportSize({width:320,height:600});
    await openFixture(page,portalHeader(name,headerText[lang]),{lang});
    await page.locator('body').evaluate(node=>{node.style.padding='0';});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const header=(await page.locator('#header').boundingBox())!;
    for(const id of ['brand','menu','search','language','mode']) {
      const box=(await page.locator(`#${id}`).boundingBox())!;
      expect(box.x,id).toBeGreaterThanOrEqual(header.x-0.5);expect(box.x+box.width,id).toBeLessThanOrEqual(header.x+header.width+0.5);
    }
    // The controls sit below the brand row and keep their source order for reading and Tab.
    expect((await page.locator('#actions').boundingBox())!.y).toBeGreaterThan((await page.locator('#brand').boundingBox())!.y+10);
    await page.locator('#brand').focus();
    for(const id of ['menu','search','language','mode']) {await page.keyboard.press('Tab');await expect(page.locator(`#${id}`)).toBeFocused();}
    expect(await computed(page,'#actions',['display','flex-wrap','flex-shrink','min-width','justify-content'])).toEqual({display:'flex','flex-wrap':'wrap','flex-shrink':'1','min-width':'0px','justify-content':'flex-end'});
  });
test('an empty header actions container takes no space at any width',async({page})=>{
  await page.setViewportSize({width:1100,height:600});
  await openFixture(page,`<header class="hw-portal-header"><a class="hw-portal-brand" href="#">Hawiyah</a><div class="hw-portal-header-actions" id="empty"><!----></div></header>`);
  expect((await computed(page,'#empty',['display'])).display).toBe('none');
});
for(const lang of ['ar','en'] as const) for(const mode of ['light','dark'] as const)
  test(`class-less prose has no automated accessibility violation apart from the documented class-less listing (${lang} ${mode})`,async({page})=>{
    await openFixture(page,`<main>${proseBody}</main>`,{lang,mode});
    const scan=await new AxeBuilder({page}).include('main').analyze();
    // A class-less pre has no tabindex: the documented limit of Markdown output (docs/code-and-prose.md).
    expect(scan.violations.map(violation=>`${violation.id}: ${violation.nodes.map(node=>node.target.join(' ')).join(', ')}`).filter(line=>line!=='scrollable-region-focusable: #pre')).toEqual([]);
    expect(scan.passes.map(rule=>rule.id)).toEqual(expect.arrayContaining(['color-contrast','link-in-text-block']));
  });
