import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { codeBody, syntaxRoles } from './code-prose-fixture';
import { contrast, openFixture } from './style-fixture';
// Resolves a colour expression on the root, where the tokens are declared.
const resolved=(page:Page,value:string)=>page.evaluate(value=>{const probe=document.createElement('i');probe.style.color=value;document.body.append(probe);const colour=getComputedStyle(probe).color;probe.remove();return colour;},value);
const computed=(page:Page,selector:string,properties:string[])=>page.locator(selector).first().evaluate((node,properties)=>Object.fromEntries(properties.map(property=>[property,getComputedStyle(node).getPropertyValue(property)])),properties);
for(const lang of ['ar','en'] as const)
  test(`code stays left to right while its header follows the page direction (${lang})`,async({page})=>{
    await openFixture(page,codeBody,{lang});
    for(const selector of ['#scroll pre','#wrap pre','#inline-code','#inline-code-ar','#key']) {
      const style=await computed(page,selector,['direction','unicode-bidi']);
      expect(style,selector).toEqual({direction:'ltr','unicode-bidi':'isolate'});
    }
    expect((await computed(page,'#scroll pre',['text-align','tab-size','white-space']))).toEqual({'text-align':'start','tab-size':'2','white-space':'pre'});
    // The first line starts at the left edge of the listing in both page directions.
    const pre=(await page.locator('#scroll pre').boundingBox())!;const first=(await page.locator('#scroll pre span').first().boundingBox())!;
    expect(first.x-pre.x).toBeLessThan(20);
    // The header is ordinary content: title at the inline start, actions at the inline end.
    expect(await computed(page,'#scroll .hw-code-block-header',['direction'])).toEqual({direction:lang==='ar'?'rtl':'ltr'});
    const title=(await page.locator('#scroll .hw-code-block-title').boundingBox())!;const actions=(await page.locator('#scroll .hw-code-block-actions').boundingBox())!;
    if(lang==='ar') expect(title.x).toBeGreaterThan(actions.x); else expect(title.x).toBeLessThan(actions.x);
    // Inline code in a right-to-left sentence keeps its own order.
    const words=await page.locator('#inline-code-ar').evaluate(node=>{const range=document.createRange();const text=node.firstChild!;const x=(start:number)=>{range.setStart(text,start);range.setEnd(text,start+1);return range.getBoundingClientRect().x;};return [x(0),x(5)];});
    expect(words[0]).toBeLessThan(words[1]);
  });
for(const lang of ['ar','en'] as const)
  test(`Arabic tokens on one line keep their source order (${lang})`,async({page})=>{
    await openFixture(page,codeBody,{lang});
    // The rectangle of the Arabic letters themselves, without the quotes or the comment marker.
    const arabic=(id:string)=>page.locator(id).evaluate(node=>{const text=node.firstChild as Text;const range=document.createRange();const start=text.data.search(/[\u0600-\u06ff]/);range.setStart(text,start);range.setEnd(text,text.data.search(/[\u0600-\u06ff][^\u0600-\u06ff]*$/)+1);const box=range.getBoundingClientRect();return {left:box.left,right:box.right};});
    const [first,second,string,comment]=[await arabic('#bidi-first'),await arabic('#bidi-second'),await arabic('#bidi-string'),await arabic('#bidi-comment')];
    expect(first.right,'first string is left of the second').toBeLessThanOrEqual(second.left);
    expect(string.right,'string is left of the comment').toBeLessThanOrEqual(comment.left);
    expect(await computed(page,'#bidi-first',['unicode-bidi'])).toEqual({'unicode-bidi':'isolate'});
    // The rule stays at zero specificity: a highlighter's own theme still replaces the colour.
    expect((await computed(page,'#themed',['color'])).color).not.toBe('');
  });
test('a scrolling listing is one named tab stop with a visible ring and scrolls with the arrow keys',async({page})=>{
  await page.setViewportSize({width:480,height:800});
  await openFixture(page,codeBody);
  const listing=page.locator('#scroll pre');
  await expect(listing).toHaveAttribute('role','group');
  await expect(page.getByRole('group',{name:'app.ts'}).first()).toBeVisible();
  await page.locator('#code-link').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#scroll .hw-code-block-actions button')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(listing).toBeFocused();
  const ring=await computed(page,'#scroll pre',['outline-style','outline-width','outline-offset','outline-color']);
  const tokens=await page.evaluate(()=>{const root=getComputedStyle(document.documentElement);return {width:root.getPropertyValue('--hw-focus-width').trim(),offset:root.getPropertyValue('--hw-focus-offset').trim()};});
  expect(ring).toEqual({'outline-style':'solid','outline-width':tokens.width,'outline-offset':tokens.offset,'outline-color':await resolved(page,'var(--hw-color-focus)')});
  // The ring is drawn outside the listing, on the page surface.
  expect(contrast(ring['outline-color'],await resolved(page,'var(--hw-color-surface)'))).toBeGreaterThanOrEqual(3);
  expect(await listing.evaluate(node=>node.scrollWidth>node.clientWidth)).toBe(true);
  await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
  await expect.poll(()=>listing.evaluate(node=>node.scrollLeft)).toBeGreaterThan(0);
  // A pointer press does not draw the keyboard ring.
  await page.locator('#bare pre').click();
  expect((await computed(page,'#bare pre',['outline-style']))['outline-style']).toBe('none');
  // The next stop is outside the listing: no span inside it takes focus.
  await listing.focus();await page.keyboard.press('Tab');
  await expect(page.locator('#bare pre')).toBeFocused();
});
for(const lang of ['ar','en'] as const)
  test(`a listing scrolls inside its box by default and wraps with data-wrap at 320px (${lang})`,async({page})=>{
    await page.setViewportSize({width:320,height:700});
    await openFixture(page,codeBody,{lang});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const scroll=await page.locator('#scroll pre').evaluate(node=>({overflow:getComputedStyle(node).overflowX,scrolls:node.scrollWidth>node.clientWidth,tab:node.tabIndex}));
    expect(scroll).toEqual({overflow:'auto',scrolls:true,tab:0});
    const wrap=await page.locator('#wrap pre').evaluate(node=>({space:getComputedStyle(node).whiteSpace,wrap:getComputedStyle(node).overflowWrap,scrolls:node.scrollWidth>node.clientWidth,tab:node.hasAttribute('tabindex'),role:node.getAttribute('role'),height:node.getBoundingClientRect().height}));
    expect(wrap).toMatchObject({space:'pre-wrap',wrap:'anywhere',scrolls:false,tab:false,role:null});
    expect(wrap.height).toBeGreaterThan((await page.locator('#scroll pre').boundingBox())!.height);
    // Inline code breaks instead of widening a narrow paragraph.
    for(const selector of ['#inline','#inline-ar']) expect(await page.locator(selector).evaluate(node=>node.scrollWidth<=node.clientWidth),selector).toBe(true);
  });
for(const theme of ['dga','hawiyah'] as const) for(const mode of ['light','dark'] as const)
  test(`every syntax role uses its token and reaches 4.5:1 on the code surface (${theme} ${mode})`,async({page})=>{
    await openFixture(page,codeBody,{theme,mode});
    const surface=await resolved(page,'var(--hw-color-code-surface)');
    expect((await computed(page,'#scroll',['background-color']))['background-color']).toBe(surface);
    expect(contrast(await resolved(page,'var(--hw-color-code-text)'),surface)).toBeGreaterThanOrEqual(4.5);
    for(const role of syntaxRoles) {
      const colour=(await computed(page,`#scroll .hw-code-token-${role}, #bare .hw-code-token-${role}, #css .hw-code-token-${role}`,['color'])).color;
      expect(colour,role).toBe(await resolved(page,`var(--hw-color-code-${role})`));
      expect(contrast(colour,surface),`${role} ${colour} on ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
    // Inline code and the key carry the same text colour on their own surfaces.
    for(const selector of ['#inline-code','#key']) {
      const style=await computed(page,selector,['color','background-color']);
      expect(contrast(style.color,style['background-color']),selector).toBeGreaterThanOrEqual(4.5);
    }
    // Code in a link keeps the link colour.
    expect((await computed(page,'#linked-code',['color'])).color).toBe((await computed(page,'#code-link',['color'])).color);
  });
test('syntax rules have zero specificity and the listing fills its figure',async({page})=>{
  await openFixture(page,`<style>b { color: rgb(1, 2, 3); }</style>${codeBody}`);
  expect((await computed(page,'#themed',['color'])).color).toBe('rgb(1, 2, 3)');
  // Inside a figure the pre has no second border or background; the figure draws them.
  expect(await computed(page,'#scroll pre',['border-top-width','background-color'])).toEqual({'border-top-width':'0px','background-color':'rgba(0, 0, 0, 0)'});
  expect((await computed(page,'#scroll',['border-top-width','margin-left','margin-top']))).toEqual({'border-top-width':'1px','margin-left':'0px','margin-top':'0px'});
  // The code element inherits the listing face rather than the browser's monospace default.
  expect((await computed(page,'#scroll code',['font-family','font-size']))).toEqual(await computed(page,'#scroll pre',['font-family','font-size']));
  expect((await computed(page,'#scroll pre',['font-family']))['font-family']).toContain('IBM Plex Mono');
});
test('forced colours replace syntax colours and borders with CanvasText and the ring with Highlight',async({page})=>{
  await page.emulateMedia({forcedColors:'active'});
  await openFixture(page,codeBody);
  const canvasText=await resolved(page,'CanvasText');const highlight=await resolved(page,'Highlight');
  for(const role of syntaxRoles) expect((await computed(page,`#scroll .hw-code-token-${role}, #bare .hw-code-token-${role}, #css .hw-code-token-${role}`,['color'])).color,role).toBe(canvasText);
  for(const selector of ['#scroll','#scroll .hw-code-block-header','#inline-code','#key']) expect((await computed(page,selector,['border-bottom-color']))['border-bottom-color'],selector).toBe(canvasText);
  await page.locator('#code-link').focus();await page.keyboard.press('Tab');await page.keyboard.press('Tab');
  await expect(page.locator('#scroll pre')).toBeFocused();
  expect(await computed(page,'#scroll pre',['outline-style','outline-color'])).toEqual({'outline-style':'solid','outline-color':highlight});
});
test('print wraps every listing',async({page})=>{
  await page.emulateMedia({media:'print'});
  await openFixture(page,codeBody);
  for(const selector of ['#scroll pre','#bare pre']) expect(await computed(page,selector,['white-space','overflow-x']),selector).toEqual({'white-space':'pre-wrap','overflow-x':'visible'});
});
for(const lang of ['ar','en'] as const) for(const mode of ['light','dark'] as const)
  test(`the listing markup has no automated accessibility violation (${lang} ${mode})`,async({page})=>{
    // Narrow enough for the listing to scroll, so the scrolling-region rule applies.
    await page.setViewportSize({width:480,height:900});
    await openFixture(page,`<main><h1>Code</h1>${codeBody}</main>`,{lang,mode});
    const scan=await new AxeBuilder({page}).include('main').analyze();
    expect(scan.violations.map(violation=>`${violation.id}: ${violation.nodes.map(node=>node.target.join(' ')).join(', ')}`)).toEqual([]);
    // The rules that matter here did run: colour contrast and the focusable scrolling region.
    expect(scan.passes.map(rule=>rule.id)).toEqual(expect.arrayContaining(['color-contrast','scrollable-region-focusable','aria-allowed-role']));
  });
