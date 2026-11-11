import '@angular/compiler';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {HwFileDropzoneComponent} from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import {act,createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {createApp,h} from 'vue';
import {afterEach,beforeAll,expect,it,vi} from 'vitest';
import {resetTextWarnings} from '../packages/core/dist/index.js';
import {FileDropzone as ReactFileDropzone} from '../packages/react/src/expanded-controls';
import {FileDropzone as VueFileDropzone} from '../packages/vue/src/controls';
import {Field as VueField} from '../packages/vue/src/forms';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
beforeAll(()=>TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting()));
const cleanups:Array<()=>void|Promise<void>>=[];
afterEach(async()=>{for(const cleanup of cleanups.splice(0))await cleanup();TestBed.resetTestingModule();document.body.replaceChildren();});
const instruction='Drop the signed form here or choose a file';
class Host { instruction=instruction; }
Component({standalone:true,imports:[HwFileDropzoneComponent],template:`<section id="plain"><hw-file-dropzone name="plain" accept=".pdf" [dropLabel]="instruction" /></section><section id="labelled"><hw-file-dropzone label="Signed form" name="labelled" [dropLabel]="instruction" /></section>`})(Host);
async function mount(adapter:string){
  const host=document.createElement('div');document.body.append(host);
  if(adapter==='react'){
    const root=createRoot(host);await act(()=>root.render(r('div',null,r('section',{id:'plain'},r(ReactFileDropzone,{name:'plain',accept:'.pdf',dropLabel:instruction})),r('section',{id:'labelled'},r(ReactFileDropzone,{label:'Signed form',name:'labelled',dropLabel:instruction})))));
    cleanups.push(async()=>{await act(()=>root.unmount());});
  }else if(adapter==='vue'){
    const app=createApp({render:()=>h('div',{},[h('section',{id:'plain'},h(VueFileDropzone,{name:'plain',accept:'.pdf',dropLabel:instruction})),h('section',{id:'labelled'},h(VueFileDropzone,{label:'Signed form',name:'labelled',dropLabel:instruction}))])});
    app.mount(host);cleanups.push(()=>app.unmount());
  }else{
    const fixture=TestBed.createComponent(Host);host.append(fixture.nativeElement);fixture.detectChanges();
  }
  return host;
}
const text=(element:Element)=>element.textContent!.replace(/\s+/g,' ').trim();
// Decision D03: the input is named by `label` (or aria-label / a parent Field); dropLabel is the visible
// instruction that describes it and is never the fallback name.
for(const adapter of ['react','vue','angular'])it(`${adapter}: a FileDropzone is named by its label and described by its visible instruction, never named by it`,async()=>{
  resetTextWarnings();const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
  try{
    const host=await mount(adapter);
    const labelled=host.querySelector<HTMLInputElement>('#labelled input[type="file"]')!;
    expect(labelled.id).not.toBe('');
    expect([...labelled.labels!].map(text)).toEqual(['Signed form']);
    const described=labelled.getAttribute('aria-describedby')!.split(/\s+/).map(id=>host.ownerDocument.getElementById(id));
    expect(described.every(Boolean)).toBe(true);
    expect(described[0]!.classList.contains('hw-file-dropzone-instruction')).toBe(true);
    expect(text(described[0]!)).toBe(instruction);
    // The instruction appears once.
    expect(text(host.querySelector('#labelled')!).split(instruction)).toHaveLength(2);
    expect(text(host.querySelector('#plain')!).split(instruction)).toHaveLength(2);
    // Without a label the instruction does not become the name, and the missing name is reported.
    const plain=host.querySelector<HTMLInputElement>('#plain input[type="file"]')!;
    expect(plain.hasAttribute('aria-label')).toBe(false);
    expect(plain.hasAttribute('aria-labelledby')).toBe(false);
    expect(warn.mock.calls.some(call=>/^Hawiyah: (FileDropzone|hw-file-dropzone) requires "label"/.test(String(call[0])))).toBe(true);
    // No label is left empty (Angular renders an empty <label> today: recorded finding).
    expect([...plain.labels??[]].map(text)).toEqual([]);
    expect([...host.querySelectorAll('label')].filter(label=>!text(label))).toEqual([]);
  }finally{warn.mockRestore();}
});
it('vue: a parent Field or aria-label keeps naming the dropzone, and the instruction stays a paragraph',async()=>{
  const host=document.createElement('div');document.body.append(host);
  const app=createApp({render:()=>h('div',{},[h(VueField,{label:'Attachments'},()=>h(VueFileDropzone,{name:'field',dropLabel:instruction})),h('section',{id:'aria'},h(VueFileDropzone,{name:'aria','aria-label':'Evidence',dropLabel:instruction}))])});
  app.mount(host);cleanups.push(()=>app.unmount());
  const [field,aria]=[...host.querySelectorAll<HTMLInputElement>('input[type="file"]')];
  expect([...field!.labels!].map(text)).toEqual(['Attachments']);
  expect(aria!.getAttribute('aria-label')).toBe('Evidence');expect(aria!.labels!.length).toBe(0);
  expect([...host.querySelectorAll('.hw-file-dropzone > p')].filter(paragraph=>text(paragraph)===instruction)).toHaveLength(2);
});
