import '@angular/compiler';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {NqSearchFieldComponent} from '../packages/angular/dist/fesm2022/nasaq-angular.mjs';
import {act,createElement as r,createRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {createApp,createSSRApp,h,nextTick,reactive} from 'vue';
import {renderToString} from 'vue/server-renderer';
import {afterEach,beforeAll,expect,it,vi} from 'vitest';
import {SearchField as ReactSearch} from '../packages/react/src/search-field';
import {SearchField as VueSearch} from '../packages/vue/src/search-field';

globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const cleanups:Array<()=>void|Promise<void>>=[];
beforeAll(()=>TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting()));
afterEach(async()=>{for(const cleanup of cleanups.splice(0))await cleanup();TestBed.resetTestingModule();vi.restoreAllMocks();document.body.replaceChildren();});
const suggestions=['خدمة الأحوال','خدمة المركبات','خدمة العمل','معلومات'];
type State={value:string;suggestions?:readonly string[];maxSuggestions:number;disabled:boolean;readOnly:boolean;showSearchButton:boolean};
async function mount(adapter:string,initial:Partial<State>={},controlled=false){
  const form=document.createElement('form'),fieldset=document.createElement('fieldset'),host=document.createElement('div');document.body.append(form);form.append(fieldset);fieldset.append(host);
  const state:State={value:'خدمة',suggestions,maxSuggestions:2,disabled:false,readOnly:false,showSearchButton:true,...initial};
  const changes=vi.fn(),searches=vi.fn(),forwarded=createRef<HTMLInputElement>();let sync:()=>Promise<void>,flush:()=>Promise<void>,dispose:()=>Promise<void>,resetModel:()=>void=()=>{},instance:any;
  if(adapter==='react'){
    const root=createRoot(host);dispose=async()=>{await act(()=>root.unmount());};
    sync=async()=>{await act(()=>root.render(r(ReactSearch,{...state,value:controlled?state.value:undefined,defaultValue:state.value,onValueChange:changes,onSearch:searches,ref:forwarded,id:'search-query',label:'البحث',hint:'تلميح',error:'راجع البحث',name:'query',required:true})));};
    flush=async()=>{await act(async()=>{await Promise.resolve();});};
  }else if(adapter==='vue'){
    const model=reactive({...state}),app=createApp({render:()=>h(VueSearch,{...model,readonly:model.readOnly,modelValue:controlled?model.value:undefined,defaultValue:model.value,'onUpdate:modelValue':changes,onSearch:searches,ref:'search',id:'search-query',label:'البحث',hint:'تلميح',error:'راجع البحث',name:'query',required:true})});app.mount(host);instance=app._instance?.refs.search;
    dispose=async()=>app.unmount();sync=async()=>{Object.assign(model,state);await nextTick();};flush=async()=>{await nextTick();await nextTick();};
  }else{
    const fixture=TestBed.createComponent(NqSearchFieldComponent);host.append(fixture.nativeElement);instance=fixture.componentInstance;instance.valueChange.subscribe(changes);instance.searched.subscribe(searches);dispose=async()=>fixture.destroy();
    sync=async()=>{for(const [key,value]of Object.entries({...state,controlId:'search-query',label:'البحث',hint:'تلميح',error:'راجع البحث',name:'query',required:true}))fixture.componentRef.setInput(key,value);fixture.detectChanges();};
    flush=async()=>{await Promise.resolve();fixture.detectChanges();};resetModel=()=>instance.writeValue(state.value);
  }
  let alive=true;const destroy=async()=>{if(alive){alive=false;await dispose();}};cleanups.push(destroy);
  await sync();await flush();
  const input=()=>host.querySelector<HTMLInputElement>('input')!,list=()=>host.querySelector<HTMLElement>('[role="listbox"]')!;
  const run=async(fn:()=>void)=>{await act(async()=>{fn();await Promise.resolve();});await flush();};
  const key=async(key:string,options:KeyboardEventInit={})=>{const event=new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...options});await run(()=>input().dispatchEvent(event));return event;};
  const type=async(value:string)=>run(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input(),value);input().dispatchEvent(new Event('input',{bubbles:true}));});
  return{form,fieldset,host,state,changes,searches,forwarded,instance,input,list,run,key,type,destroy,sync:async()=>{await sync();await flush();},reset:()=>run(()=>{form.reset();resetModel();})};
}
for(const adapter of ['react','vue','angular']){
  it(`${adapter}: optional combobox keeps native field associations, matched text and bounded options`,async()=>{
    const m=await mount(adapter);expect(m.input().getAttribute('role')).toBe('combobox');expect(m.input().getAttribute('aria-expanded')).toBe('false');expect(m.input().getAttribute('aria-controls')).toBe(m.list().id);expect(m.input().getAttribute('aria-invalid')).toBe('true');
    for(const id of m.input().getAttribute('aria-describedby')!.split(' '))expect(document.getElementById(id)).not.toBeNull();expect(m.host.querySelector('label')!.htmlFor).toBe(m.input().id);
    await m.run(()=>m.input().focus());expect(m.list().hidden).toBe(false);expect(m.list().querySelectorAll('[role="option"]')).toHaveLength(2);for(const option of m.list().querySelectorAll('[role="option"]'))expect(option.getAttribute('dir')).toBe('auto');expect(m.list().querySelector('strong')!.textContent).toBe('خدمة');expect(m.host.querySelector('[role="status"]')!.textContent).toContain('2');
    expect(m.host.querySelector('.nq-search-submit')!.getAttribute('aria-label')).toBe('بحث');expect(m.host.querySelector('.nq-search-clear')!.getAttribute('aria-label')).toBe('مسح البحث');expect(new FormData(m.form).get('query')).toBe('خدمة');
    if(adapter==='react')expect(m.forwarded.current).toBe(m.input());if(adapter==='vue'){expect(m.instance.element).toBe(m.input());expect(typeof m.instance.focus).toBe('function');}if(adapter==='angular')expect(typeof m.instance.focus).toBe('function');
  });
  it(`${adapter}: wrapping arrow navigation selects a suggestion without search or form submission`,async()=>{
    const m=await mount(adapter);await m.run(()=>m.input().focus());await m.key('ArrowUp');expect(m.input().getAttribute('aria-activedescendant')).toBe(`${m.list().id}-1`);await m.key('ArrowDown');expect(m.input().getAttribute('aria-activedescendant')).toBe(`${m.list().id}-0`);
    const enter=await m.key('Enter');expect(enter.defaultPrevented).toBe(true);expect(m.input().value).toBe(suggestions[0]);expect(m.changes).toHaveBeenLastCalledWith(suggestions[0]);expect(m.searches).not.toHaveBeenCalled();expect(m.list().hidden).toBe(true);expect(m.input().hasAttribute('aria-activedescendant')).toBe(false);expect(document.activeElement).toBe(m.input());
    expect(new FormData(m.form).get('query')).toBe(suggestions[0]);
  });
  it(`${adapter}: primary pointer selection and clearing retain focus without activating on pointerdown`,async()=>{
    const m=await mount(adapter);await m.run(()=>m.input().focus());const option=m.list().querySelector<HTMLElement>('[role="option"]')!,down=new MouseEvent('pointerdown',{bubbles:true,cancelable:true,button:0});
    await m.run(()=>option.dispatchEvent(down));expect(down.defaultPrevented).toBe(true);expect(m.changes).not.toHaveBeenCalled();await m.run(()=>option.click());expect(m.input().value).toBe(suggestions[0]);expect(document.activeElement).toBe(m.input());
    const clear=m.host.querySelector<HTMLButtonElement>('.nq-search-clear')!,clearDown=new MouseEvent('pointerdown',{bubbles:true,cancelable:true,button:0});await m.run(()=>clear.dispatchEvent(clearDown));expect(clearDown.defaultPrevented).toBe(true);await m.run(()=>clear.click());expect(m.input().value).toBe('');expect(m.list().hidden).toBe(true);expect(document.activeElement).toBe(m.input());
    await m.reset();expect(m.input().value).toBe('خدمة');expect(m.list().hidden).toBe(true);
  });
  it(`${adapter}: plain Enter searches trimmed free text but leaves form submission available`,async()=>{
    const m=await mount(adapter,{value:'  خدمة  '});await m.run(()=>m.input().focus());const enter=await m.key('Enter');expect(enter.defaultPrevented).toBe(false);expect(m.searches).toHaveBeenLastCalledWith('خدمة');expect(m.list().hidden).toBe(true);
    await m.type('سؤال حر');const free=await m.key('Enter');expect(free.defaultPrevented).toBe(false);expect(m.searches).toHaveBeenLastCalledWith('سؤال حر');
    await m.type('   ');const count=m.searches.mock.calls.length;await m.key('Enter');await m.run(()=>m.host.querySelector<HTMLButtonElement>('.nq-search-submit')!.click());expect(m.searches).toHaveBeenCalledTimes(count);
  });
  it(`${adapter}: composition and modifiers never select or search, and Escape respects the dialog layer`,async()=>{
    const m=await mount(adapter);const dialog=document.createElement('dialog');document.body.append(dialog);dialog.append(m.form);dialog.open=true;const parentEscape=vi.fn();dialog.addEventListener('keydown',event=>{if(event.key==='Escape' && !event.defaultPrevented){parentEscape();dialog.open=false;}});
    await m.run(()=>m.input().focus());await m.key('Escape');expect(m.list().hidden).toBe(true);expect(dialog.open).toBe(true);expect(parentEscape).not.toHaveBeenCalled();await m.key('Escape');expect(dialog.open).toBe(false);expect(parentEscape).toHaveBeenCalledTimes(1);
    await m.run(()=>m.input().dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true})));await m.key('ArrowDown');await m.key('Enter');expect(m.list().hidden).toBe(true);expect(m.searches).not.toHaveBeenCalled();
    await m.run(()=>m.input().dispatchEvent(new CompositionEvent('compositionend',{bubbles:true})));for(const modifiers of [{isComposing:true},{ctrlKey:true},{metaKey:true},{altKey:true},{shiftKey:true}]){await m.key('Enter',modifiers);await m.key('ArrowDown',modifiers);}expect(m.searches).not.toHaveBeenCalled();expect(m.input().hasAttribute('aria-activedescendant')).toBe(false);
  });
  it(`${adapter}: readonly remains searchable, while native disabled state blocks all changes and closes suggestions`,async()=>{
    const m=await mount(adapter);await m.run(()=>m.input().focus());m.state.readOnly=true;await m.sync();expect(m.list().hidden).toBe(true);await m.key('ArrowDown');await m.run(()=>m.host.querySelector<HTMLButtonElement>('.nq-search-clear')!.click());expect(m.changes).not.toHaveBeenCalled();await m.key('Enter');expect(m.searches).toHaveBeenLastCalledWith('خدمة');
    m.state.readOnly=false;await m.sync();await m.key('ArrowDown');expect(m.list().hidden).toBe(false);await m.run(()=>{m.fieldset.disabled=true;});expect(m.list().hidden).toBe(true);const count=m.searches.mock.calls.length;await m.key('Enter');await m.run(()=>m.host.querySelector<HTMLButtonElement>('.nq-search-submit')!.click());expect(m.searches).toHaveBeenCalledTimes(count);expect(m.changes).not.toHaveBeenCalled();
    await m.run(()=>{m.fieldset.disabled=false;});await m.key('ArrowDown');expect(m.list().hidden).toBe(false);
  });
  it(`${adapter}: second Escape requests modal cancellation without clearing the query and honors canceled close`,async()=>{
    const m=await mount(adapter),dialog=document.createElement('dialog');document.body.append(dialog);dialog.append(m.form);dialog.open=true;
    const originalMatches=dialog.matches.bind(dialog);vi.spyOn(dialog,'matches').mockImplementation(selector=>selector===':modal'?true:originalMatches(selector));
    const requestClose=vi.fn(()=>{const cancel=new Event('cancel',{cancelable:true});dialog.dispatchEvent(cancel);if(!cancel.defaultPrevented){dialog.open=false;dialog.dispatchEvent(new Event('close'));}});
    Object.defineProperty(dialog,'requestClose',{configurable:true,value:requestClose});
    await m.run(()=>m.input().focus());const first=await m.key('Escape');expect(first.defaultPrevented).toBe(true);expect(requestClose).not.toHaveBeenCalled();expect(dialog.open).toBe(true);
    const second=await m.key('Escape');expect(second.defaultPrevented).toBe(true);expect(requestClose).toHaveBeenCalledTimes(1);expect(dialog.open).toBe(false);expect(m.input().value).toBe('خدمة');expect(m.changes).not.toHaveBeenCalled();
    dialog.open=true;dialog.addEventListener('cancel',event=>event.preventDefault(),{once:true});const canceled=await m.key('Escape');expect(canceled.defaultPrevented).toBe(true);expect(requestClose).toHaveBeenCalledTimes(2);expect(dialog.open).toBe(true);expect(m.input().value).toBe('خدمة');
    await m.key('Escape',{isComposing:true});await m.key('Escape',{ctrlKey:true});expect(requestClose).toHaveBeenCalledTimes(2);
    dialog.setAttribute('closedby','none');const blocked=await m.key('Escape');expect(requestClose).toHaveBeenCalledTimes(2);expect(blocked.defaultPrevented).toBe(false);
  });
  it(`${adapter}: changed suggestions, limits, outside press and blur clear stale active descendants`,async()=>{
    const m=await mount(adapter);await m.run(()=>m.input().focus());await m.key('ArrowDown');m.state.suggestions=['خدمة جديدة'];await m.sync();expect(m.list().hidden).toBe(true);expect(m.input().hasAttribute('aria-activedescendant')).toBe(false);
    await m.key('ArrowDown');expect(m.list().querySelectorAll('[role="option"]')).toHaveLength(1);m.state.maxSuggestions=0;await m.sync();expect(m.list().hidden).toBe(true);expect(m.input().getAttribute('aria-expanded')).toBe('false');
    m.state.maxSuggestions=8;await m.sync();await m.key('ArrowDown');await m.run(()=>document.body.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,button:0})));expect(m.list().hidden).toBe(true);
    await m.key('ArrowDown');await m.run(()=>m.input().blur());expect(m.list().hidden).toBe(true);
  });
  it(`${adapter}: suggestions can be omitted and teardown removes native outside listeners`,async()=>{
    const m=await mount(adapter,{suggestions:undefined,showSearchButton:false}),remove=vi.spyOn(document,'removeEventListener');expect(m.input().hasAttribute('role')).toBe(false);expect(m.host.querySelector('[role="listbox"]')).toBeNull();expect(m.host.querySelector('.nq-search-submit')).toBeNull();await m.run(()=>m.input().focus());await m.key('Enter');expect(m.searches).toHaveBeenCalledWith('خدمة');await m.destroy();expect(remove.mock.calls.some(([name])=>name==='pointerdown')).toBe(true);
  });
}
for(const adapter of ['react','vue'])it(`${adapter}: controlled owners retain the value when a suggestion change is rejected`,async()=>{
  const m=await mount(adapter,{},true);await m.run(()=>m.input().focus());await m.key('ArrowDown');await m.key('Enter');expect(m.changes).toHaveBeenLastCalledWith(suggestions[0]);expect(m.input().value).toBe('خدمة');expect(m.list().hidden).toBe(true);
  m.state.value='معلومات';await m.sync();expect(m.input().value).toBe('معلومات');expect(m.input().hasAttribute('aria-activedescendant')).toBe(false);
});
it('React and Vue SSR render closed suggestions without claiming an active option',async()=>{
  const renders=[renderToStaticMarkup(r(ReactSearch,{label:'البحث',defaultValue:'خدمة',suggestions})),await renderToString(createSSRApp({render:()=>h(VueSearch,{label:'البحث',defaultValue:'خدمة',suggestions})}))];
  for(const html of renders){const host=document.createElement('div');host.innerHTML=html;expect(host.querySelector('input')!.getAttribute('role')).toBe('combobox');expect(host.querySelector('input')!.getAttribute('aria-expanded')).toBe('false');expect(host.querySelector<HTMLElement>('[role="listbox"]')!.hidden).toBe(true);expect(host.querySelector('input')!.hasAttribute('aria-activedescendant')).toBe(false);expect(host.querySelector('.nq-search-submit')).toBeNull();}
});
it('React SearchField preserves callback-ref cleanup across value and suggestion state updates',async()=>{
  const host=document.createElement('div');document.body.append(host);const root=createRoot(host),cleaned=vi.fn(),forwarded=vi.fn(()=>cleaned);
  await act(()=>root.render(r(ReactSearch,{label:'Search',defaultValue:'خدمة',suggestions,ref:forwarded})));
  const input=host.querySelector<HTMLInputElement>('input')!;expect(forwarded).toHaveBeenCalledTimes(1);expect(forwarded).toHaveBeenCalledWith(input);
  await act(()=>{input.focus();input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));});
  await act(()=>input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true})));expect(cleaned).not.toHaveBeenCalled();expect(forwarded).toHaveBeenCalledTimes(1);
  await act(()=>root.unmount());expect(cleaned).toHaveBeenCalledTimes(1);expect(input.hasAttribute('data-nq-filled')).toBe(false);
});
