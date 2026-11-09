import '@angular/compiler';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {HwTabsComponent, HwTabComponent} from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import {act, createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {createApp, createSSRApp, h, nextTick, reactive} from 'vue';
import {renderToString} from 'vue/server-renderer';
import {afterEach, beforeAll, beforeEach, expect, it, vi} from 'vitest';
import {Tabs as ReactTabs} from '../packages/react/src/interactive';
import {Tabs as VueTabs} from '../packages/vue/src/interactive';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cleanups: Array<() => void | Promise<void>> = [];
const items = () => ['a','b','c','d','e'].map(value => ({value,label: `Tab ${value}`,content: `Panel ${value}`,disabled: value === 'c'}));
type State = {value: string; items: ReturnType<typeof items>; overflow: 'menu'|'scroll'; orientation: 'horizontal'|'vertical'; activationMode: 'automatic'|'manual'};
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
beforeEach(() => {
  const original = HTMLElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function(this:HTMLElement){if(this.matches('[role="tab"]'))return {x:0,y:0,left:0,top:0,right:100,bottom:44,width:100,height:44,toJSON(){return {};}};return original.call(this);});
  vi.spyOn(HTMLElement.prototype,'clientWidth','get').mockImplementation(function(this:HTMLElement){return Number(this.closest<HTMLElement>('[data-test-width]')?.dataset.testWidth ?? 0);});
});
afterEach(async () => {for(const fn of cleanups.splice(0))await fn();TestBed.resetTestingModule();vi.restoreAllMocks();document.body.replaceChildren();});

async function mount(adapter:string,initial:Partial<State>={},controlled=false){
  const host=document.createElement('div');host.dataset.testWidth='350';document.body.append(host);
  const state:State={value:'a',items:items(),overflow:'menu',orientation:'horizontal',activationMode:'automatic',...initial};
  const changed=vi.fn();let sync:()=>Promise<void>,flush:()=>Promise<void>;
  if(adapter==='react'){
    const root=createRoot(host);cleanups.push(async()=>{await act(()=>root.unmount());});
    sync=async()=>{await act(()=>root.render(r(ReactTabs,{...state,value:controlled?state.value:undefined,defaultValue:state.value,label:'Service details',overflowLabel:'More tabs',onValueChange:changed})));};
    flush=async()=>{await act(async()=>{await new Promise(resolve=>setTimeout(resolve,35));});};
  }else if(adapter==='vue'){
    const model=reactive({...state});const app=createApp({render:()=>h(VueTabs,{...model,modelValue:controlled?model.value:undefined,defaultValue:model.value,label:'Service details',overflowLabel:'More tabs','onUpdate:modelValue':changed})});app.mount(host);cleanups.push(()=>app.unmount());
    sync=async()=>{Object.assign(model,state);await nextTick();};flush=async()=>{await new Promise(resolve=>setTimeout(resolve,35));await nextTick();};
  }else{
    class Host{state=state;change=changed;}
    Component({standalone:true,inputs:['state'],imports:[HwTabsComponent,HwTabComponent],template:`<hw-tabs label="Service details" overflowLabel="More tabs" [value]="state.value" [overflow]="state.overflow" [orientation]="state.orientation" [activationMode]="state.activationMode" (valueChange)="change($event)">@for(item of state.items; track item.value){<hw-tab [value]="item.value" [label]="item.label" [disabled]="item.disabled">{{item.content}}</hw-tab>}</hw-tabs>`})(Host);
    const fixture=TestBed.createComponent(Host);host.append(fixture.nativeElement);cleanups.push(()=>fixture.destroy());
    sync=async()=>{fixture.componentRef.setInput('state',{...state});fixture.detectChanges();};flush=async()=>{await new Promise(resolve=>setTimeout(resolve,35));fixture.detectChanges();};
  }
  await sync();await flush();
  const root=()=>host.querySelector<HTMLElement>('.hw-tabs')!;
  const run=async(fn:()=>void)=>{await act(async()=>{fn();await Promise.resolve();});await flush();};
  const resize=async(width:number)=>run(()=>{host.dataset.testWidth=String(width);window.dispatchEvent(new Event('resize'));});
  return {host,state,changed,root,run,resize,sync:async()=>{await sync();await flush();}};
}
const hiddenTabs=(root:HTMLElement)=>[...root.querySelectorAll('[role="tab"][data-hw-overflow-hidden="true"]')].map(node=>node.textContent);
const selected=(root:HTMLElement)=>root.querySelector('[role="tab"][aria-selected="true"]')?.textContent;

for(const adapter of ['react','vue','angular']){
  it(`${adapter}: overflow preserves tab-panel names and projects hidden choices with selected state`,async()=>{
    const m=await mount(adapter);expect(hiddenTabs(m.root())).toEqual(['Tab c','Tab d','Tab e']);
    const summary=m.root().querySelector<HTMLElement>('summary')!,details=m.root().querySelector<HTMLDetailsElement>('details')!;
    expect(summary.getAttribute('aria-label')).toBe('More tabs');expect(details.hidden).toBe(false);
    expect(m.root().querySelectorAll('[role="tab"][tabindex="0"]')).toHaveLength(1);
    const choices=m.root().querySelectorAll<HTMLButtonElement>('.hw-tab-overflow-item');expect(choices[0]!.disabled).toBe(true);
    await m.run(()=>{details.open=true;choices[1]!.click();});expect(selected(m.root())).toBe('Tab d');expect(m.changed).toHaveBeenLastCalledWith('d');expect(details.open).toBe(false);expect(document.activeElement).toBe(summary);expect(summary.dataset.active).toBe('true');
    const panel=m.root().querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])')!;expect(panel.textContent).toBe('Panel d');expect(document.getElementById(panel.getAttribute('aria-labelledby')!)?.textContent).toBe('Tab d');
    expect([...m.root().querySelectorAll<HTMLButtonElement>('button')].every(button=>button.type==='button')).toBe(true);
  });
  it(`${adapter}: Escape and outside click dismiss without selection, while manual RTL keys skip overflowed and disabled originals`,async()=>{
    const m=await mount(adapter,{activationMode:'manual'});m.host.dir='rtl';const tabs=m.root().querySelectorAll<HTMLButtonElement>('[role="tab"]');
    await m.run(()=>{tabs[0]!.focus();tabs[0]!.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true}));});expect(document.activeElement).toBe(tabs[1]);expect(selected(m.root())).toBe('Tab a');expect(m.changed).not.toHaveBeenCalled();
    await m.run(()=>tabs[1]!.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true})));expect(document.activeElement).toBe(tabs[1]);
    const details=m.root().querySelector<HTMLDetailsElement>('details')!,summary=details.querySelector<HTMLElement>('summary')!;
    await m.run(()=>{details.open=true;details.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));});expect(details.open).toBe(false);expect(document.activeElement).toBe(summary);
    await m.run(()=>{details.open=true;document.body.click();});expect(details.open).toBe(false);expect(m.changed).not.toHaveBeenCalled();
    await m.run(()=>{tabs[0]!.focus();tabs[0]!.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',ctrlKey:true,bubbles:true,cancelable:true}));});expect(document.activeElement).toBe(tabs[0]);
  });
  it(`${adapter}: resizing repairs focus and exposes the active overflowed tab when space returns`,async()=>{
    const m=await mount(adapter);await m.resize(900);expect(hiddenTabs(m.root())).toEqual([]);
    await m.run(()=>{m.root().querySelectorAll<HTMLButtonElement>('[role="tab"]')[4]!.focus();});await m.resize(350);expect(document.activeElement).toBe(m.root().querySelector('summary'));
    await m.run(()=>{const details=m.root().querySelector<HTMLDetailsElement>('details')!;details.open=true;m.root().querySelectorAll<HTMLButtonElement>('.hw-tab-overflow-item')[2]!.click();});
    await m.resize(900);expect(hiddenTabs(m.root())).toEqual([]);expect(m.root().querySelector<HTMLDetailsElement>('details')!.hidden).toBe(true);expect(document.activeElement).toBe(m.root().querySelector('[role="tab"][aria-selected="true"]'));expect(selected(m.root())).toBe('Tab e');
  });
  it(`${adapter}: scroll/vertical opt-outs, dynamic children and all-disabled sets preserve semantics`,async()=>{
    const m=await mount(adapter);m.state.overflow='scroll';await m.sync();expect(m.root().querySelector('.hw-tab-bar')!.getAttribute('data-hw-overflow')).toBe('scroll');expect(hiddenTabs(m.root())).toEqual([]);
    m.state.overflow='menu';m.state.orientation='vertical';await m.sync();expect(hiddenTabs(m.root())).toEqual([]);
    m.state.orientation='horizontal';m.state.items=[...m.state.items,{value:'f',label:'Tab f',content:'Panel f',disabled:false}];await m.sync();expect(hiddenTabs(m.root())).toEqual(['Tab c','Tab d','Tab e','Tab f']);
    m.state.items=m.state.items.map(item=>({...item,disabled:true}));await m.sync();expect(m.root().querySelector('[role="tab"][aria-selected="true"]')).toBeNull();expect(m.root().querySelectorAll('[role="tab"][tabindex="0"]')).toHaveLength(0);expect([...m.root().querySelectorAll<HTMLButtonElement>('button')].every(button=>button.disabled)).toBe(true);
    m.state.items=[];await m.sync();expect(m.root().querySelectorAll('[role="tab"]')).toHaveLength(0);expect(m.root().querySelector('details')!.hidden).toBe(true);
  });
  it(`${adapter}: partial resizing retains a focused disclosure destination or moves focus to its visible original`,async()=>{
    const m=await mount(adapter);const details=m.root().querySelector<HTMLDetailsElement>('details')!;
    await m.run(()=>{details.open=true;details.querySelector<HTMLElement>('[data-hw-overflow-value="e"]')!.focus();});
    await m.resize(450);expect(details.open).toBe(true);expect(document.activeElement).toBe(details.querySelector('[data-hw-overflow-value="e"]'));
    await m.resize(900);expect(details.hidden).toBe(true);expect(document.activeElement).toBe(m.root().querySelectorAll('[role="tab"]')[4]);expect(selected(m.root())).toBe('Tab a');
  });
  it(`${adapter}: an extremely narrow bar uses the disclosure without an empty exposed tablist`,async()=>{
    const m=await mount(adapter);await m.resize(120);expect(hiddenTabs(m.root())).toHaveLength(5);expect(m.root().querySelector('[role="tablist"]')!.getAttribute('aria-hidden')).toBe('true');expect(m.root().querySelector('details')!.hidden).toBe(false);
  });
}
for(const adapter of ['react','vue'])it(`${adapter}: rejected controlled overflow changes do not replace the active panel or later steal focus`,async()=>{
  const m=await mount(adapter,{},true);await m.run(()=>m.root().querySelectorAll<HTMLButtonElement>('.hw-tab-overflow-item')[1]!.click());expect(selected(m.root())).toBe('Tab a');expect(m.changed).toHaveBeenLastCalledWith('d');
  const outside=document.createElement('button');document.body.append(outside);outside.focus();m.state.value='b';await m.sync();expect(selected(m.root())).toBe('Tab b');expect(document.activeElement).toBe(outside);
});
it('React/Vue SSR keeps all original tabs available until layout measurement',async()=>{
  const renders=[renderToStaticMarkup(r(ReactTabs,{items:items(),label:'Details'})),await renderToString(createSSRApp({render:()=>h(VueTabs,{items:items(),label:'Details'})}))];
  for(const html of renders){const host=document.createElement('div');host.innerHTML=html;expect(host.querySelectorAll('[role="tab"]')).toHaveLength(5);expect(host.querySelectorAll('[data-hw-overflow-hidden]')).toHaveLength(0);expect(host.querySelector('details')!.hidden).toBe(true);expect(host.querySelector('summary')!.getAttribute('aria-label')).toBe('المزيد من التبويبات');}
});
