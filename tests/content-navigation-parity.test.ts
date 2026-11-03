import '@angular/compiler';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {NqContentNavigationComponent} from '../packages/angular/dist/fesm2022/nasaq-angular.mjs';
import {act, createElement as r, createRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {createApp, createSSRApp, h, nextTick, reactive} from 'vue';
import {renderToString} from 'vue/server-renderer';
import {afterEach, beforeAll, expect, it, vi} from 'vitest';
import {ContentNavigation as ReactNavigation} from '../packages/react/src/content-navigation';
import {ContentNavigation as VueNavigation} from '../packages/vue/src/content-navigation';
import type {ContentNavigationItem} from '../packages/core/src/content-navigation';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cleanup: Array<() => void | Promise<void>> = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {for(const fn of cleanup.splice(0))await fn();TestBed.resetTestingModule();vi.restoreAllMocks();document.body.replaceChildren();});
const items = (): readonly ContentNavigationItem[] => [{id:'intro',label:'المقدمة',children:[{id:'details',label:'التفاصيل'},{id:'blocked',label:'غير متاح',disabled:true}]},{id:'finish:نسق',label:'الخاتمة'}];
type State = {items: readonly ContentNavigationItem[]; scrollRoot: HTMLElement|null; offset:number; label:string; sticky:boolean; showHeading:boolean};
const rect=(top:number,height:number)=>({x:0,y:top,left:0,top,right:500,bottom:top+height,width:500,height,toJSON(){return {};}});
function scroller(){
  const element=document.createElement('div');document.body.append(element);
  Object.defineProperties(element,{clientHeight:{value:400,configurable:true},scrollHeight:{value:1200,configurable:true},clientTop:{value:0}});
  element.getBoundingClientRect=()=>rect(100,400);
  element.scrollTo=vi.fn((options:ScrollToOptions)=>{element.scrollTop=options.top??0;element.dispatchEvent(new Event('scroll'));});
  return element;
}
async function mount(adapter:string,initial:Partial<State>={}){
  const host=document.createElement('div');document.body.append(host);const scroll=scroller();
  const sections=['intro','details','blocked','finish:نسق'].map((id,index)=>{const section=document.createElement('section');section.id=id;section.textContent=`Section ${id}`;section.dataset.position=String(index*300);section.getBoundingClientRect=()=>rect(100+Number(section.dataset.position)-(section.parentElement?.scrollTop??0),300);scroll.append(section);return section;});
  const state:State={items:items(),scrollRoot:scroll,offset:80,label:'في هذه الصفحة',sticky:false,showHeading:true,...initial};
  const changed=vi.fn(),forwarded=createRef<HTMLElement>();let sync:()=>Promise<void>,flush:()=>Promise<void>,dispose:()=>Promise<void>;
  if(adapter==='react'){
    const root=createRoot(host);dispose=async()=>{await act(()=>root.unmount());};
    sync=async()=>{await act(()=>root.render(r(ReactNavigation,{...state,onCurrentChange:changed,ref:forwarded,id:'consumer-nav',className:'consumer-class'})));};
    flush=async()=>{await act(async()=>{await new Promise(resolve=>setTimeout(resolve,35));});};
  }else if(adapter==='vue'){
    const model=reactive({...state}),app=createApp({render:()=>h(VueNavigation,{...model,onCurrentChange:changed,id:'consumer-nav',class:'consumer-class'})});app.mount(host);dispose=async()=>app.unmount();
    sync=async()=>{Object.assign(model,state);await nextTick();};flush=async()=>{await new Promise(resolve=>setTimeout(resolve,35));await nextTick();};
  }else{
    const fixture=TestBed.createComponent(NqContentNavigationComponent);host.append(fixture.nativeElement);fixture.componentInstance.currentChange.subscribe(changed);dispose=async()=>fixture.destroy();
    sync=async()=>{for(const [key,value]of Object.entries(state))fixture.componentRef.setInput(key,value);fixture.detectChanges();};flush=async()=>{await new Promise(resolve=>setTimeout(resolve,35));fixture.detectChanges();};
  }
  let alive=true;const destroy=async()=>{if(alive){alive=false;await dispose();}};cleanup.push(destroy);
  await sync();await flush();
  const nav=()=>host.querySelector<HTMLElement>('.nq-content-nav')!;
  const run=async(fn:()=>void)=>{await act(async()=>{fn();await Promise.resolve();});await flush();};
  return {host,scroll,sections,state,changed,forwarded,nav,run,destroy,sync:async()=>{await sync();await flush();}};
}
const current=(nav:HTMLElement)=>nav.querySelector<HTMLElement>('[aria-current="location"]')?.dataset.nqSection;
for(const adapter of ['react','vue','angular']){
  it(`${adapter}: nested semantic links, Arabic heading and disabled entries follow only actual visible sections`,async()=>{
    const m=await mount(adapter);expect(m.nav().getAttribute('aria-label')).toBe('في هذه الصفحة');expect(m.nav().querySelector('h2')?.textContent).toBe('في هذه الصفحة');expect(m.nav().querySelectorAll('.nq-content-nav-sublist')).toHaveLength(1);
    expect(current(m.nav())).toBe('intro');expect(m.changed).toHaveBeenLastCalledWith('intro');
    const disabled=m.nav().querySelector<HTMLElement>('[data-nq-section="blocked"]')!;expect(disabled.tagName).toBe('SPAN');expect(disabled.getAttribute('aria-disabled')).toBe('true');expect(disabled.getAttribute('href')).toBeNull();expect(disabled.tabIndex).toBe(-1);
    expect(m.nav().querySelector('a[data-nq-section="finish:نسق"]')!.getAttribute('href')).toBe(`#${encodeURIComponent('finish:نسق')}`);
    await m.run(()=>{m.scroll.scrollTop=320;m.scroll.dispatchEvent(new Event('scroll'));});expect(current(m.nav())).toBe('details');
    await m.run(()=>{m.scroll.scrollTop=620;m.scroll.dispatchEvent(new Event('scroll'));});expect(current(m.nav())).toBe('details');expect(m.nav().querySelectorAll('[aria-current]')).toHaveLength(1);
    await m.run(()=>{m.scroll.scrollTop=800;m.scroll.dispatchEvent(new Event('scroll'));});expect(current(m.nav())).toBe('finish:نسق');
    if(adapter!=='angular'){expect(m.nav().id).toBe('consumer-nav');expect(m.nav().classList.contains('consumer-class')).toBe(true);}if(adapter==='react')expect(m.forwarded.current).toBe(m.nav());
  });
  it(`${adapter}: ordinary activation scrolls locally without hashes and keyboard activation focuses the target`,async()=>{
    const m=await mount(adapter),oldHash=location.hash,link=m.nav().querySelector<HTMLAnchorElement>('[data-nq-section="details"]')!;
    const outside=document.createElement('button');document.body.append(outside);outside.focus();
    await m.run(()=>link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,button:0,detail:1})));expect(m.scroll.scrollTo).toHaveBeenLastCalledWith({top:220,behavior:'smooth'});expect(document.activeElement).toBe(outside);expect(current(m.nav())).toBe('details');expect(location.hash).toBe(oldHash);
    await m.run(()=>link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,button:0,detail:0})));expect(document.activeElement).toBe(m.sections[1]);expect(m.sections[1]!.getAttribute('tabindex')).toBe('-1');
    outside.focus();expect(m.sections[1]!.hasAttribute('tabindex')).toBe(false);
    const count=m.changed.mock.calls.length;await m.run(()=>m.scroll.dispatchEvent(new Event('scroll')));expect(m.changed).toHaveBeenCalledTimes(count);
  });
  it(`${adapter}: modified/nonprimary links preserve browser intent and disabled entries never activate`,async()=>{
    const m=await mount(adapter),link=m.nav().querySelector<HTMLAnchorElement>('a')!,prevented:boolean[]=[];
    m.host.addEventListener('click',event=>{prevented.push(event.defaultPrevented);event.preventDefault();});
    await m.run(()=>{for(const modifiers of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}])link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,...modifiers}));m.nav().querySelector<HTMLElement>('[aria-disabled="true"]')!.click();});
    expect(prevented).toEqual([false,false,false,false,false,false]);expect(m.scroll.scrollTo).not.toHaveBeenCalled();expect(current(m.nav())).toBe('intro');
  });
  it(`${adapter}: changed labels/items/offset and scroll roots refresh without retaining old listeners`,async()=>{
    const m=await mount(adapter);m.state.label='Contents';m.state.showHeading=false;m.state.sticky=true;m.state.offset=120;await m.sync();expect(m.nav().querySelector('h2')).toBeNull();expect(m.nav().getAttribute('aria-label')).toBe('Contents');expect(m.nav().dataset.sticky).toBe('true');
    await m.run(()=>m.nav().querySelector<HTMLAnchorElement>('[data-nq-section="details"]')!.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail:1})));expect(m.scroll.scrollTo).toHaveBeenLastCalledWith({top:180,behavior:'smooth'});
    const remove=vi.spyOn(m.scroll,'removeEventListener'),next=scroller();next.append(...m.sections);m.state.scrollRoot=next;await m.sync();expect(remove.mock.calls.some(([name])=>name==='scroll')).toBe(true);expect(current(m.nav())).toBe('intro');
    await m.run(()=>{m.scroll.scrollTop=800;m.scroll.dispatchEvent(new Event('scroll'));});expect(current(m.nav())).toBe('intro');
    await m.run(()=>{next.scrollTop=350;next.dispatchEvent(new Event('scroll'));});expect(current(m.nav())).toBe('details');
    m.state.items=[{id:'missing',label:'Not yet mounted'}];await m.sync();expect(m.nav().querySelectorAll('[aria-current]')).toHaveLength(0);expect(m.changed).toHaveBeenLastCalledWith('');
    await m.run(()=>m.nav().querySelector<HTMLAnchorElement>('a')!.click());expect(next.scrollTo).not.toHaveBeenCalled();
  });
  it(`${adapter}: teardown removes scrolling observers and restores temporary target focus attributes`,async()=>{
    const m=await mount(adapter),remove=vi.spyOn(m.scroll,'removeEventListener');await m.run(()=>m.nav().querySelector<HTMLAnchorElement>('[data-nq-section="details"]')!.click());expect(m.sections[1]!.getAttribute('tabindex')).toBe('-1');
    const count=m.changed.mock.calls.length;await m.destroy();expect(m.sections[1]!.hasAttribute('tabindex')).toBe(false);expect(remove.mock.calls.some(([name])=>name==='scroll')).toBe(true);
    m.scroll.scrollTop=800;m.scroll.dispatchEvent(new Event('scroll'));await new Promise(resolve=>setTimeout(resolve,35));expect(m.changed).toHaveBeenCalledTimes(count);
  });
}
it('React/Vue SSR render real fragments and no assumed active location before observation',async()=>{
  const renders=[renderToStaticMarkup(r(ReactNavigation,{items:items()})),await renderToString(createSSRApp({render:()=>h(VueNavigation,{items:items()})}))];
  for(const html of renders){const host=document.createElement('div');host.innerHTML=html;expect(host.querySelector('nav')!.getAttribute('aria-label')).toBe('في هذه الصفحة');expect(host.querySelectorAll('a[href]')).toHaveLength(3);expect(host.querySelectorAll('[aria-current]')).toHaveLength(0);expect(host.querySelectorAll('.nq-content-nav-sublist')).toHaveLength(1);}
});
