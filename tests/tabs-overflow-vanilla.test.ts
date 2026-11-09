import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {createTabs} from '../packages/vanilla/src/tabs';
const cleanups:Array<()=>void>=[];
let width=272;
const disconnect=vi.fn();
beforeEach(()=>{vi.useFakeTimers();width=272;disconnect.mockClear();vi.stubGlobal('ResizeObserver',class {observe(){} unobserve(){} disconnect(){disconnect();}});vi.spyOn(HTMLElement.prototype,'clientWidth','get').mockImplementation(function(this:HTMLElement){return this.classList.contains('hw-tab-bar')?width:0;});vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function(this:HTMLElement){return {width:this.getAttribute('role')==='tab'?100:0,height:40,x:0,y:0,top:0,left:0,right:100,bottom:40,toJSON(){}};});});
afterEach(()=>{for(const cleanup of cleanups.splice(0))cleanup();document.body.replaceChildren();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
function mount(extra='',disabled=''){
 document.body.innerHTML=`<div class="hw-tabs" data-hw="tabs" ${extra}><div class="hw-tab-list" role="tablist" aria-label="Account sections"><button type="button" class="hw-tab" role="tab" data-hw-value="one" aria-controls="p-one" aria-selected="true">One</button><button type="button" class="hw-tab" role="tab" data-hw-value="two" aria-controls="p-two">Two</button><button type="button" class="hw-tab" role="tab" data-hw-value="three" aria-controls="p-three" ${disabled}>Three</button><button type="button" class="hw-tab" role="tab" data-hw-value="four" aria-controls="p-four">Four</button></div><section id="p-one">First panel</section><section id="p-two" hidden>Second panel</section><section id="p-three" hidden>Third panel</section><section id="p-four" hidden>Fourth panel</section></div><button id="outside">Outside</button>`;
 return document.querySelector<HTMLElement>('.hw-tabs')!;
}
function enhance(root:HTMLElement,options:Parameters<typeof createTabs>[1]={}){const controller=createTabs(root,options);cleanups.push(controller.destroy);return controller;}
const tabs=(root:HTMLElement)=>[...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
const summary=(root:HTMLElement)=>root.querySelector<HTMLElement>('summary')!;
const details=(root:HTMLElement)=>root.querySelector<HTMLDetailsElement>('.hw-tabs-overflow')!;
const items=(root:HTMLElement)=>[...root.querySelectorAll<HTMLButtonElement>('.hw-tab-overflow-item')];
const hide=async(indices:number[])=>{width=indices.length===4?72:indices.length===1?372:indices.length?272:1000;window.dispatchEvent(new Event('resize'));await vi.runOnlyPendingTimersAsync();};
const key=(target:HTMLElement,name:string)=>target.dispatchEvent(new KeyboardEvent('keydown',{key:name,bubbles:true,cancelable:true}));

it('preserves active panels and selects an omitted tab with one event and summary focus',async()=>{
 const root=mount(),callback=vi.fn(),change=vi.fn();root.addEventListener('hw:change',change);const controller=enhance(root,{onValueChange:callback});
 await hide([2,3]);expect(details(root).hidden).toBe(false);expect(summary(root).getAttribute('aria-label')).toBe('المزيد من التبويبات');
 expect(tabs(root)[2]!.dataset.hwOverflowHidden).toBe('true');expect(tabs(root)[2]!.hidden).toBe(false);expect(tabs(root)[2]!.getAttribute('aria-hidden')).toBe('true');
 details(root).open=true;items(root)[1]!.focus();items(root)[1]!.click();
 expect(controller.value).toBe('four');expect(callback).toHaveBeenCalledExactlyOnceWith('four');expect(change).toHaveBeenCalledTimes(1);expect(details(root).open).toBe(false);expect(document.activeElement).toBe(summary(root));
 expect(root.querySelector('#p-four')!.hasAttribute('hidden')).toBe(false);expect(root.querySelector('#p-four')!.getAttribute('aria-labelledby')).toBe(tabs(root)[3]!.id);expect(summary(root).dataset.active).toBe('true');expect(items(root)[1]!.getAttribute('aria-pressed')).toBe('true');
 expect(tabs(root)[0]!.tabIndex).toBe(0);controller.select('four');expect(callback).toHaveBeenCalledTimes(1);
});
it('excludes overflowed and disabled tabs from roving arrows in automatic and manual activation',async()=>{
 const root=mount('dir="rtl"','disabled'),callback=vi.fn();const controller=enhance(root,{activationMode:'manual',onValueChange:callback});await hide([2,3]);
 tabs(root)[0]!.focus();key(tabs(root)[0]!,'ArrowLeft');expect(document.activeElement).toBe(tabs(root)[1]);expect(controller.value).toBe('one');
 key(tabs(root)[1]!,'Enter');expect(controller.value).toBe('two');expect(callback).toHaveBeenCalledExactlyOnceWith('two');
 key(tabs(root)[1]!,'End');expect(document.activeElement).toBe(tabs(root)[1]);key(tabs(root)[1]!,'Home');expect(document.activeElement).toBe(tabs(root)[0]);
 const modified=new KeyboardEvent('keydown',{key:'End',ctrlKey:true,bubbles:true,cancelable:true});tabs(root)[0]!.dispatchEvent(modified);expect(modified.defaultPrevented).toBe(false);expect(document.activeElement).toBe(tabs(root)[0]);
 expect(items(root)[0]!.disabled).toBe(true);items(root)[0]!.click();expect(controller.value).toBe('two');
});
it('closes on Escape and outside press, and returns focus when a resize moves controls',async()=>{
 const root=mount();enhance(root);tabs(root)[3]!.focus();await hide([2,3]);expect(document.activeElement).toBe(summary(root));
 details(root).open=true;items(root)[0]!.focus();key(items(root)[0]!,'Escape');expect(details(root).open).toBe(false);expect(document.activeElement).toBe(summary(root));
 details(root).open=true;document.querySelector<HTMLButtonElement>('#outside')!.click();expect(details(root).open).toBe(false);
 details(root).open=true;items(root)[0]!.focus();await hide([3]);expect(document.activeElement).toBe(tabs(root)[2]);expect(tabs(root)[2]!.tabIndex).toBe(0);
 await hide([2,3]);items(root)[1]!.focus();await hide([3]);expect(document.activeElement).toBe(items(root)[0]);
 details(root).open=true;items(root)[0]!.focus();await hide([]);expect(details(root).hidden).toBe(true);expect(details(root).open).toBe(false);expect(document.activeElement).toBe(tabs(root)[3]);
 await hide([0,1,2,3]);expect(root.querySelector('[role="tablist"]')!.getAttribute('aria-hidden')).toBe('true');expect(tabs(root).every(tab=>tab.tabIndex===-1)).toBe(true);expect(details(root).hidden).toBe(false);
 await hide([]);expect(root.querySelector('[role="tablist"]')!.hasAttribute('aria-hidden')).toBe(false);
});
it('retains scrolling and vertical opt-outs, labels safely, and refreshes on orientation or label changes',async()=>{
 const root=mount('data-hw-overflow="scroll" lang="en"');enhance(root);await hide([2,3]);
 expect(details(root).hidden).toBe(true);expect(summary(root).getAttribute('aria-label')).toBe('More tabs');expect(root.querySelector('[role="tablist"]')!.getAttribute('data-hw-overflow')).toBe('scroll');
 root.dataset.hwOverflow='menu';await Promise.resolve();await hide([2,3]);expect(details(root).hidden).toBe(false);
 const list=root.querySelector('[role="tablist"]')!;list.setAttribute('aria-orientation','vertical');await Promise.resolve();await hide([2,3]);expect(details(root).hidden).toBe(true);
 list.setAttribute('aria-orientation','horizontal');await Promise.resolve();await hide([2,3]);tabs(root)[3]!.setAttribute('aria-label','<img src=x onerror=bad()>');await Promise.resolve();expect(items(root)[1]!.textContent).toBe('<img src=x onerror=bad()>');expect(items(root)[1]!.querySelector('img')).toBeNull();
});
it('honors fieldset disabled changes and the first-legend exception without emitting',async()=>{
 const root=mount(),fieldset=document.createElement('fieldset');root.before(fieldset);fieldset.append(root);const callback=vi.fn(),controller=enhance(root,{onValueChange:callback});await hide([2,3]);details(root).open=true;
 fieldset.disabled=true;await Promise.resolve();expect(details(root).open).toBe(false);expect(summary(root).getAttribute('aria-disabled')).toBe('true');expect(items(root).every(item=>item.disabled)).toBe(true);controller.select('four');expect(callback).not.toHaveBeenCalled();
 fieldset.disabled=false;await Promise.resolve();expect(summary(root).hasAttribute('aria-disabled')).toBe(false);controller.select('two');expect(controller.value).toBe('two');
 const legend=document.createElement('legend');fieldset.prepend(legend);legend.append(root);fieldset.disabled=true;await Promise.resolve();expect(tabs(root)[0]!.matches(':disabled')).toBe(false);expect(summary(root).hasAttribute('aria-disabled')).toBe(false);controller.select('four');expect(controller.value).toBe('four');
});
it('restores the authored DOM and removes observers and handlers on destroy',async()=>{
 const root=mount(),html=root.outerHTML,first=tabs(root)[0]!,list=root.querySelector('[role="tablist"]')!;const callback=vi.fn(),controller=enhance(root,{onValueChange:callback,overflowLabel:'Other sections'});
 await hide([2,3]);items(root)[1]!.click();expect(summary(root).getAttribute('aria-label')).toBe('Other sections');controller.destroy();controller.destroy();
 expect(root.outerHTML).toBe(html);expect(tabs(root)[0]).toBe(first);expect(root.querySelector('[role="tablist"]')).toBe(list);expect(disconnect).toHaveBeenCalledTimes(1);
 tabs(root)[1]!.click();controller.select('two');expect(callback).toHaveBeenCalledTimes(1);
});
it('ignores nested tab actions and leaves all-disabled groups without an active panel',async()=>{
 const root=mount();for(const tab of tabs(root))tab.disabled=true;const controller=enhance(root);await hide([2,3]);expect(controller.value).toBe('');expect(tabs(root).every(tab=>tab.getAttribute('aria-selected')==='false')).toBe(true);expect(summary(root).tabIndex).toBe(-1);
 root.querySelector('#p-one')!.insertAdjacentHTML('beforeend','<div role="tablist"><button type="button" role="tab" data-hw-value="nested">Nested</button></div>');root.querySelector<HTMLButtonElement>('[data-hw-value="nested"]')!.click();expect(controller.value).toBe('');
});
it('reads the root disclosure label, observes changes, and prioritizes explicit options',async()=>{
 const root=mount('data-hw-overflow-label="Additional sections"');const controller=enhance(root);await hide([2,3]);expect(summary(root).getAttribute('aria-label')).toBe('Additional sections');
 root.dataset.hwOverflowLabel='More account sections';await Promise.resolve();expect(summary(root).getAttribute('aria-label')).toBe('More account sections');
 controller.destroy();enhance(root,{overflowLabel:'Explicit sections'});await hide([2,3]);expect(summary(root).getAttribute('aria-label')).toBe('Explicit sections');
 root.dataset.hwOverflowLabel='Another data label';await Promise.resolve();expect(summary(root).getAttribute('aria-label')).toBe('Explicit sections');
});
