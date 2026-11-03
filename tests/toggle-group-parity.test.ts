import '@angular/compiler';
import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {NqToggleGroupComponent} from '../packages/angular/dist/fesm2022/nasaq-angular.mjs';
import {act,createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {createApp,h,nextTick,reactive} from 'vue';
import {afterEach,beforeAll,expect,it} from 'vitest';
import {ToggleGroup as ReactToggle} from '../packages/react/src/expanded-interactive';
import {ToggleGroup as VueToggle} from '../packages/vue/src/expansion-interactive';
import {createToggleGroup} from '../packages/vanilla/src/content';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const cleanups:Array<()=>void|Promise<void>>=[];
beforeAll(()=>TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting()));
afterEach(async()=>{for(const cleanup of cleanups.splice(0))await cleanup();TestBed.resetTestingModule();document.body.replaceChildren();});
const options=[{value:'a',label:'First'},{value:'b',label:'Second'},{value:'blocked',label:'Unavailable',disabled:true}];
class Host {options=options;multiple=false;readOnly=signal(true);disabled=signal(false);value:string|string[]='a';changes:unknown[]=[];changed(value:unknown){this.changes.push(value);} }
Component({standalone:true,imports:[NqToggleGroupComponent],template:`<form><nq-toggle-group label="View" name="view" [options]="options" [multiple]="multiple" [readOnly]="readOnly()" [disabled]="disabled()" [(value)]="value" (valueChange)="changed($event)" /></form>`})(Host);
async function mount(adapter:string,multiple=false,external=false){
  const host=document.createElement('div');document.body.append(host);
  const state={readonly:true,disabled:false},initial=multiple?['a','blocked','missing']:'a',changes:unknown[]=[];
  if(external)host.innerHTML='<form id="outside"></form>';
  const target=document.createElement('div');host.append(target);
  let sync:()=>Promise<void>,run:(fn:()=>void)=>Promise<void>;
  if(adapter==='react'){
    const root=createRoot(target);run=async fn=>{await act(fn);await act(async()=>{await Promise.resolve();});};
    sync=async()=>{await act(()=>root.render(r(external?'div':'form',{},r(ReactToggle,{label:'View',name:'view',form:external?'outside':undefined,options,multiple:multiple as true,defaultValue:initial as string[],readOnly:state.readonly,disabled:state.disabled,onValueChange:value=>changes.push(value)}))));};cleanups.push(async()=>{await act(()=>root.unmount());});
  }else if(adapter==='vue'){
    const props=reactive({...state}),app=createApp({render:()=>h(external?'div':'form',{},h(VueToggle,{label:'View',name:'view',form:external?'outside':undefined,options,multiple,defaultValue:initial,readonly:props.readonly,disabled:props.disabled,'onUpdate:modelValue':value=>changes.push(value)}))});app.mount(target);
    run=async fn=>{fn();await nextTick();await Promise.resolve();await nextTick();};sync=async()=>{Object.assign(props,state);await nextTick();};cleanups.push(()=>app.unmount());
  }else if(adapter==='angular'){
    const fixture=TestBed.createComponent(Host);fixture.componentInstance.multiple=multiple;fixture.componentInstance.value=initial;target.append(fixture.nativeElement);
    run=async fn=>{fn();fixture.detectChanges();await Promise.resolve();fixture.detectChanges();changes.splice(0,changes.length,...fixture.componentInstance.changes);};sync=async()=>{fixture.componentInstance.readOnly.set(state.readonly);fixture.componentInstance.disabled.set(state.disabled);fixture.detectChanges();};
  }else{
    target.innerHTML=`<form><fieldset class="nq-toggle-group" data-nq="toggle-group" data-nq-readonly="true" ${multiple?'data-nq-multiple="true" data-nq-name="view"':''}><legend>View</legend>${options.map((o,i)=>multiple?`<button type="button" data-nq-value="${o.value}" aria-pressed="${i!==1}" ${o.disabled?'disabled':''}>${o.label}</button>`:`<label><input type="radio" name="view" value="${o.value}" ${i===0?'checked':''} ${o.disabled?'disabled':''}>${o.label}</label>`).join('')}</fieldset></form>`;
    const fieldset=target.querySelector('fieldset')!,controller=createToggleGroup(fieldset,{onValueChange:value=>changes.push(value)});cleanups.push(()=>controller.destroy());
    run=async fn=>{fn();await Promise.resolve();await Promise.resolve();};sync=async()=>{fieldset.dataset.nqReadonly=String(state.readonly);fieldset.disabled=state.disabled;await Promise.resolve();};
  }
  await sync();return {host,form:host.querySelector('form')!,state,sync,run,changes};
}
for(const adapter of ['vanilla','react','vue','angular']){
  it(`${adapter}: readonly radio selection stays focusable, stable and successful in forms`,async()=>{
    const {host,form,state,sync,run,changes}=await mount(adapter);const inputs=host.querySelectorAll<HTMLInputElement>('input[type=radio]');
    expect(inputs[0]!.disabled).toBe(false);inputs[0]!.focus();expect(document.activeElement).toBe(inputs[0]);expect(inputs[0]!.getAttribute('aria-disabled')).toBe('true');
    const key=new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true});await run(()=>inputs[0]!.dispatchEvent(key));expect(key.defaultPrevented).toBe(true);
    await run(()=>inputs[1]!.click());expect(inputs[0]!.checked).toBe(true);expect(inputs[1]!.checked).toBe(false);expect(new FormData(form).get('view')).toBe('a');expect(changes).toEqual([]);
    state.readonly=false;await sync();await run(()=>inputs[1]!.click());expect(inputs[1]!.checked).toBe(true);expect(new FormData(form).get('view')).toBe('b');expect(changes).toEqual(['b']);
  });
  it(`${adapter}: multiple readonly values exclude unavailable destinations and disabled groups submit nothing`,async()=>{
    const {host,form,state,sync,run,changes}=await mount(adapter,true);expect(new FormData(form).getAll('view')).toEqual(['a']);
    const buttons=host.querySelectorAll<HTMLButtonElement>('.nq-toggle-group button');buttons[0]!.focus();expect(document.activeElement).toBe(buttons[0]);
    await run(()=>buttons[1]!.click());expect(changes).toEqual([]);expect(new FormData(form).getAll('view')).toEqual(['a']);
    state.readonly=false;await sync();await run(()=>buttons[1]!.click());expect(new FormData(form).getAll('view')).toEqual(['a','b']);
    state.disabled=true;await sync();expect(new FormData(form).getAll('view')).toEqual([]);
  });
}
for(const adapter of ['react','vue'])it(`${adapter}: external form reset restores multiple selection`,async()=>{
  const {host,form,state,sync,run}=await mount(adapter,true,true);state.readonly=false;await sync();await run(()=>host.querySelectorAll<HTMLButtonElement>('.nq-toggle-group button')[1]!.click());expect(new FormData(form).getAll('view')).toEqual(['a','b']);
  await run(()=>form.reset());expect(new FormData(form).getAll('view')).toEqual(['a']);expect(host.querySelectorAll('.nq-toggle-group button')[1]!.getAttribute('aria-pressed')).toBe('false');
});
