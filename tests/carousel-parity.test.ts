import '@angular/compiler';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {NqCarouselComponent} from '../packages/angular/dist/fesm2022/nasaq-angular.mjs';
import {act, createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {createApp, createSSRApp, h, nextTick, reactive} from 'vue';
import {renderToString} from 'vue/server-renderer';
import {afterEach, beforeAll, expect, it, vi} from 'vitest';
import {Carousel as ReactCarousel} from '../packages/react/src/expanded-interactive';
import {Carousel as VueCarousel} from '../packages/vue/src/expansion-interactive';
import {createCarousel} from '../packages/vanilla/src/content';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cleanup: Array<() => void | Promise<void>> = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {for(const fn of cleanup.splice(0))await fn();TestBed.resetTestingModule();document.body.replaceChildren();});

async function mount(adapter: string, options: {count?: number; current?: number; loop?: boolean; controlled?: boolean} = {}) {
  const host=document.createElement('div');document.body.append(host);
  const state={count:options.count??3,current:options.current??0,loop:options.loop??false,showIndicators:true};
  const changed=vi.fn(),ref={current:null as HTMLElement|null};let sync:()=>Promise<void>;
  const attrs={id:'carousel-example',class:'consumer-class',title:'Example',style:{color:'red','--nq-carousel-index':99}};
  if(adapter==='react') {
    const root=createRoot(host);sync=async()=>{await act(()=>root.render(r(ReactCarousel,{id:attrs.id,className:attrs.class,title:attrs.title,style:attrs.style,label:'المحتوى',ref,slides:Array.from({length:state.count},(_,index)=>r('a',{href:`#slide-${index}`},`Content ${index+1}`)),index:options.controlled?state.current:undefined,defaultIndex:state.current,loop:state.loop,showIndicators:state.showIndicators,onIndexChange:changed})));};cleanup.push(async()=>{await act(()=>root.unmount());});
  } else if(adapter==='vue') {
    const model=reactive({...state});const app=createApp({render:()=>h(VueCarousel,{...attrs,label:'المحتوى',slides:Array.from({length:model.count},(_,index)=>({id:`slide-${index}`,label:`Item ${index+1}`,content:h('a',{href:`#slide-${index}`},`Content ${index+1}`)})),modelValue:options.controlled?model.current:undefined,defaultValue:model.current,wrap:model.loop,showIndicators:model.showIndicators,'onUpdate:modelValue':changed})});app.mount(host);sync=async()=>{Object.assign(model,state);await nextTick();};cleanup.push(()=>app.unmount());
  } else {
    const fixture=TestBed.createComponent(NqCarouselComponent);host.append(fixture.nativeElement);fixture.componentInstance.currentChange.subscribe(changed);
    sync=async()=>{fixture.componentRef.setInput('label','المحتوى');fixture.componentRef.setInput('slides',Array.from({length:state.count},(_,index)=>({id:`slide-${index}`,title:`Item ${index+1}`,content:`Content ${index+1}`})));fixture.componentRef.setInput('current',state.current);fixture.componentRef.setInput('loop',state.loop);fixture.componentRef.setInput('showIndicators',state.showIndicators);fixture.detectChanges();};cleanup.push(()=>fixture.destroy());
  }
  await sync();const root=host.querySelector<HTMLElement>('.nq-carousel')!;
  return {host,root,state,changed,ref,sync,click:async(selector:string)=>{await act(async()=>{root.querySelector<HTMLButtonElement>(selector)!.click();await nextTick();});await sync();}};
}

function checkExposure(root: HTMLElement, current: number, count: number) {
  expect(root.style.getPropertyValue('--nq-carousel-index')).toBe(String(current));
  const slides=[...root.querySelectorAll<HTMLElement>('.nq-carousel-track > .nq-carousel-slide')];expect(slides).toHaveLength(count);
  slides.forEach((slide,index)=>{
    const inactive=index!==current;expect(slide.hidden).toBe(inactive);expect(!!(slide.hasAttribute('inert')||slide.inert)).toBe(inactive);expect(slide.getAttribute('aria-hidden')).toBe(inactive?'true':null);expect(slide.getAttribute('role')).toBe('group');expect(slide.getAttribute('aria-label')).toContain(`${index+1} من ${count}`);
  });
  const selected=root.querySelectorAll('.nq-carousel-dot[aria-current="true"]');expect(selected).toHaveLength(count?1:0);if(count)expect([...root.querySelectorAll('.nq-carousel-dot')].indexOf(selected[0])).toBe(current);
}
for(const adapter of ['react','vue','angular']) {
  it(`${adapter}: bounded indicator navigation preserves mounted content and updates exposure without duplicate emissions`,async()=>{
    const m=await mount(adapter);const slides=[...m.root.querySelectorAll('.nq-carousel-slide')];checkExposure(m.root,0,3);
    expect(m.root.getAttribute('aria-roledescription')).toBe('عرض شرائح');expect(m.root.querySelector('.nq-carousel-pagination')?.getAttribute('aria-label')).toBe('اختيار الشريحة');
    for(const button of m.root.querySelectorAll<HTMLButtonElement>('.nq-carousel-arrow')){expect(button.type).toBe('button');expect(button.getAttribute('aria-label')).toMatch(/الشريحة/);}
    await m.click('.nq-carousel-dot');expect(m.changed).not.toHaveBeenCalled();
    await m.click('.nq-carousel-dot:last-child');checkExposure(m.root,2,3);expect(m.changed).toHaveBeenLastCalledWith(2);expect(m.root.querySelector<HTMLButtonElement>('[data-nq-next]')!.disabled).toBe(true);
    await m.click('[data-nq-next]');expect(m.changed).toHaveBeenCalledTimes(1);
    await m.click('[data-nq-previous]');checkExposure(m.root,1,3);expect(m.changed).toHaveBeenLastCalledWith(1);expect([...m.root.querySelectorAll('.nq-carousel-slide')]).toEqual(slides);
    expect(m.root.querySelector('[role="status"]')?.textContent).toBe('2 من 3');
    m.state.showIndicators=false;await m.sync();expect(m.root.querySelector('.nq-carousel-pagination')).toBeNull();
  });
  it(`${adapter}: looping wraps boundaries and empty/single collections cannot emit NaN or advance`,async()=>{
    const m=await mount(adapter,{loop:true});await m.click('[data-nq-previous]');checkExposure(m.root,2,3);await m.click('[data-nq-next]');checkExposure(m.root,0,3);expect(m.changed.mock.calls.map(call=>call[0])).toEqual([2,0]);
    m.state.count=1;await m.sync();checkExposure(m.root,0,1);await m.click('.nq-carousel-dot');await m.click('[data-nq-next]');expect(m.changed).toHaveBeenCalledTimes(2);
    m.state.count=0;await m.sync();checkExposure(m.root,0,0);expect(m.root.querySelector('[role="status"]')?.textContent).toBe('لا توجد شرائح');expect([...m.root.querySelectorAll<HTMLButtonElement>('.nq-carousel-arrow')].every(button=>button.disabled)).toBe(true);await m.click('[data-nq-previous]');expect(m.changed).toHaveBeenCalledTimes(2);
  });
  it(`${adapter}: fractional and nonfinite controlled indexes always expose one bounded slide`,async()=>{
    const m=await mount(adapter,{current:1.9,controlled:true});checkExposure(m.root,1,3);
    for(const [requested,expected] of [[NaN,0],[Infinity,0],[-Infinity,0],[-4,0],[999,2]]){m.state.current=requested;await m.sync();checkExposure(m.root,expected,3);}
    expect(m.changed).not.toHaveBeenCalled();
  });
  if(adapter!=='angular')it(`${adapter}: caller styles and attributes survive while controlled state remains parent-owned`,async()=>{
    const m=await mount(adapter,{controlled:true});expect(m.root.id).toBe('carousel-example');expect(m.root.classList.contains('consumer-class')).toBe(true);expect(m.root.title).toBe('Example');expect(m.root.style.color).toBe('red');if(adapter==='react')expect(m.ref.current).toBe(m.root);
    await m.click('.nq-carousel-dot:last-child');expect(m.changed).toHaveBeenLastCalledWith(2);checkExposure(m.root,0,3);
    m.state.current=2;await m.sync();checkExposure(m.root,2,3);
  });
}

it('vue: SSR omits inert on the active slide and protects inactive content',async()=>{
  const html=await renderToString(createSSRApp({render:()=>h(VueCarousel,{label:'المحتوى',slides:[{id:'first',label:'First',content:h('a',{href:'#first'},'First')},{id:'second',label:'Second',content:h('a',{href:'#second'},'Second')}],defaultValue:1})}));
  const container=document.createElement('div');container.innerHTML=html;
  const slides=[...container.querySelectorAll<HTMLElement>('.nq-carousel-slide')];expect(slides).toHaveLength(2);
  expect(slides[0].hasAttribute('inert')).toBe(true);expect(slides[0].hasAttribute('hidden')).toBe(true);expect(slides[0].getAttribute('aria-hidden')).toBe('true');
  expect(slides[1].hasAttribute('inert')).toBe(false);expect(slides[1].hasAttribute('hidden')).toBe(false);expect(slides[1].hasAttribute('aria-hidden')).toBe(false);
  expect(container.querySelector('.nq-carousel-dot[aria-current="true"]')?.getAttribute('aria-label')).toContain('2 من 2');
});

it('angular: custom slide templates retain context, actions and inactive-slide protection',()=>{
  class TemplateHost {
    slides=[{id:'first',title:'First',content:'Default first body'},{id:'second',title:'Second',content:'Default second body'}];
    current=0;
    activated=vi.fn();
  }
  Component({standalone:true,imports:[NqCarouselComponent],template:`
    <ng-template #slide let-item let-index="index"><article class="custom-card"><strong>{{ item.title }} / {{ index }}</strong><button type="button" class="slide-action" (click)="activated(item.id, index)">Open {{ item.title }}</button></article></ng-template>
    <nq-carousel label="Featured cards" [slides]="slides" [slideTemplate]="slide" [(current)]="current" />
  `})(TemplateHost);
  const fixture=TestBed.createComponent(TemplateHost);document.body.append(fixture.nativeElement);cleanup.push(()=>fixture.destroy());fixture.detectChanges();
  const root=fixture.nativeElement.querySelector('.nq-carousel') as HTMLElement;
  expect([...root.querySelectorAll('.custom-card strong')].map(node=>node.textContent)).toEqual(['First / 0','Second / 1']);
  expect(root.querySelectorAll('.nq-carousel-slide > h3')).toHaveLength(0);
  const first=root.querySelector<HTMLButtonElement>('.slide-action')!;first.click();fixture.detectChanges();expect(fixture.componentInstance.activated).toHaveBeenLastCalledWith('first',0);
  root.querySelector<HTMLButtonElement>('[data-nq-next]')!.click();fixture.detectChanges();
  expect(fixture.componentInstance.current).toBe(1);expect(root.querySelector('.slide-action')).toBe(first);
  const inactive=first.closest<HTMLElement>('.nq-carousel-slide')!;expect(inactive.hidden).toBe(true);expect(!!(inactive.inert||inactive.hasAttribute('inert'))).toBe(true);expect(inactive.getAttribute('aria-hidden')).toBe('true');
  root.querySelector<HTMLButtonElement>('.nq-carousel-slide:not([hidden]) .slide-action')!.click();fixture.detectChanges();expect(fixture.componentInstance.activated).toHaveBeenLastCalledWith('second',1);
});

it('vanilla: authored controls and slides restore exactly after dot navigation and teardown',()=>{
  const root=document.createElement('section');root.lang='ar';root.setAttribute('aria-label','المحتوى');root.className='nq-carousel';root.innerHTML='<div class="nq-carousel-viewport"><div class="nq-carousel-track" data-nq-carousel-track><article class="nq-carousel-slide" data-nq-slide><a href="#first">First</a></article><article class="nq-carousel-slide" data-nq-slide hidden><a href="#second">Second</a></article></div></div><div class="nq-carousel-controls"><button type="button" data-nq-previous>Previous</button><button type="button" data-nq-carousel-dot="0" aria-label="First"></button><button type="button" data-nq-carousel-dot="1" aria-label="Second"></button><button type="button" data-nq-next>Next</button><span data-nq-carousel-status>Ready</span></div>';
  document.body.append(root);const before=root.outerHTML,slides=[...root.querySelectorAll('[data-nq-slide]')],changed=vi.fn();const controller=createCarousel(root,{onValueChange:changed});
  root.querySelector<HTMLButtonElement>('[data-nq-carousel-dot="1"]')!.click();expect(controller.index).toBe(1);expect(changed).toHaveBeenLastCalledWith(1);expect(slides[0].hasAttribute('inert')).toBe(true);expect(slides[0].getAttribute('aria-hidden')).toBe('true');expect(root.querySelector('[data-nq-carousel-dot="1"]')?.getAttribute('aria-current')).toBe('true');
  controller.select(1);expect(changed).toHaveBeenCalledTimes(1);controller.destroy();expect(root.outerHTML).toBe(before);expect([...root.querySelectorAll('[data-nq-slide]')]).toEqual(slides);controller.select(0);expect(changed).toHaveBeenCalledTimes(1);
});
