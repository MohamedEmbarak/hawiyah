import '@angular/compiler';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {HwLinkComponent,HwBreadcrumbComponent} from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import {act,createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {createApp,h,nextTick,ref} from 'vue';
import {afterEach,beforeAll,expect,it} from 'vitest';
import {Link as ReactLink} from '../packages/react/src/expanded-content';
import {Breadcrumb as ReactBreadcrumb} from '../packages/react/src/display';
import {Link as VueLink} from '../packages/vue/src/content';
import {Breadcrumb as VueBreadcrumb} from '../packages/vue/src/display';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
beforeAll(()=>TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting()));
const cleanups:Array<()=>void|Promise<void>>=[];
afterEach(async()=>{for(const cleanup of cleanups.splice(0))await cleanup();TestBed.resetTestingModule();document.body.replaceChildren();});
const items=[{label:'Home',href:'#home'},{label:'Unavailable',href:'#blocked',disabled:true},{label:'Current'}];
class Host { disabled=false; calls=0; items=items; activate(event:Event){event.preventDefault();this.calls++;} }
Component({standalone:true,imports:[HwLinkComponent,HwBreadcrumbComponent],template:`<hw-link href="#destination" variant="neutral" [disabled]="disabled" (click)="activate($event)" (auxclick)="activate($event)">Destination</hw-link><hw-breadcrumb label="Hierarchy" [items]="items" />`})(Host);
for(const adapter of ['react','vue','angular'])it(`${adapter}: disabled links suppress primary/auxiliary callbacks, restore href, and preserve breadcrumb semantics`,async()=>{
  const host=document.createElement('div');document.body.append(host);let calls=0;
  const activation=(event:Event)=>{event.preventDefault();calls++;};
  let setDisabled:(disabled:boolean)=>Promise<void>;
  if(adapter==='react'){
    const root=createRoot(host);setDisabled=async disabled=>{await act(()=>root.render(r('div',null,r(ReactLink,{href:'#destination',disabled,variant:'neutral',onClick:activation,onAuxClick:activation},'Destination'),r(ReactBreadcrumb,{items,label:'Hierarchy'}))));};
    cleanups.push(async()=>{await act(()=>root.unmount());});
  }else if(adapter==='vue'){
    const disabled=ref(false),app=createApp({render:()=>h('div',{},[h(VueLink,{href:'#destination',disabled:disabled.value,variant:'neutral',onClick:activation,onAuxclick:activation},()=> 'Destination'),h(VueBreadcrumb,{items,label:'Hierarchy'})])});app.mount(host);
    setDisabled=async value=>{disabled.value=value;await nextTick();};cleanups.push(()=>app.unmount());
  }else{
    const fixture=TestBed.createComponent(Host);host.append(fixture.nativeElement);
    setDisabled=async value=>{fixture.componentInstance.disabled=value;fixture.detectChanges();calls=fixture.componentInstance.calls;};
  }
  await setDisabled(false);const link=host.querySelector<HTMLAnchorElement>('.hw-link')!;
  expect(link.getAttribute('data-variant')).toBe('neutral');expect(link.getAttribute('href')).toBe('#destination');
  link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));link.dispatchEvent(new MouseEvent('auxclick',{bubbles:true,cancelable:true,button:1}));
  await setDisabled(true);expect(calls).toBe(2);expect(link.hasAttribute('href')).toBe(false);expect(link.getAttribute('aria-disabled')).toBe('true');expect(link.tabIndex).toBe(-1);
  for(const type of ['click','auxclick']){const event=new MouseEvent(type,{bubbles:true,cancelable:true});link.dispatchEvent(event);expect(event.defaultPrevented).toBe(true);}
  await setDisabled(false);expect(calls).toBe(2);expect(link.getAttribute('href')).toBe('#destination');expect(link.hasAttribute('aria-disabled')).toBe(false);
  const nav=host.querySelector('nav')!;expect(nav.getAttribute('aria-label')).toBe('Hierarchy');expect(nav.querySelectorAll('a[href]')).toHaveLength(1);
  expect(nav.querySelector('[aria-disabled="true"]')?.textContent).toBe('Unavailable');expect(nav.querySelector('[aria-disabled="true"]')?.hasAttribute('href')).toBe(false);expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('Current');
});
