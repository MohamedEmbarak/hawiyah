import '@angular/compiler';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {HwPaginationComponent} from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import {act, createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {createApp, createSSRApp, h, nextTick, reactive} from 'vue';
import {renderToString} from 'vue/server-renderer';
import {afterEach, beforeAll, expect, it, vi} from 'vitest';
import {Pagination as ReactPagination} from '../packages/react/src/display';
import {Pagination as VuePagination} from '../packages/vue/src/display';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cleanup: Array<() => void | Promise<void>> = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {for (const fn of cleanup.splice(0)) await fn(); TestBed.resetTestingModule(); document.body.replaceChildren();});
type State = {page: number; totalPages: number; disabled: boolean; siblingCount: number; hideOnSinglePage: boolean};
async function mount(adapter: string, initial: Partial<State> = {}, controlled = false) {
  const host = document.createElement('div'), ancestor = document.createElement('fieldset'); document.body.append(ancestor);ancestor.append(host);
  const state: State = {page: 1, totalPages: 10, disabled: false, siblingCount: 1, hideOnSinglePage: false, ...initial};
  const changed = vi.fn(); let sync: () => Promise<void>, flush: () => Promise<void>;
  if(adapter === 'react') {
    const root = createRoot(host); cleanup.push(async () => {await act(() => root.unmount());});
    sync = async () => {await act(() => root.render(r(ReactPagination, {...state, page: controlled ? state.page : undefined, defaultPage: state.page, onPageChange: changed, id: 'consumer-pages', className: 'consumer-pages'})));};
    flush = async () => {await act(async () => {await Promise.resolve();});};
  } else if(adapter === 'vue') {
    const model = reactive({...state}); const app = createApp({render: () => h(VuePagination, {...model, modelValue: controlled ? model.page : undefined, defaultValue: model.page, 'onUpdate:modelValue': changed, id: 'consumer-pages', class: 'consumer-pages'})});
    app.mount(host); cleanup.push(() => app.unmount());
    sync = async () => {Object.assign(model,state);await nextTick();}; flush = async () => {await nextTick();};
  } else {
    const fixture = TestBed.createComponent(HwPaginationComponent); host.append(fixture.nativeElement); cleanup.push(() => fixture.destroy()); fixture.componentInstance.pageChange.subscribe(changed);
    sync = async () => {for(const [key,value] of Object.entries(state)) fixture.componentRef.setInput(key,value); fixture.detectChanges();};
    flush = async () => {fixture.detectChanges();};
  }
  await sync();
  const run = async (fn: () => void) => {await act(async () => {fn();await Promise.resolve();}); await flush();};
  const root = () => host.querySelector<HTMLElement>('.hw-pagination')!;
  return {host,ancestor,state,changed,sync,flush,run,root,click: async (selector:string) => run(() => root().querySelector<HTMLElement>(selector)!.click())};
}
const current = (root: HTMLElement) => Number(root.querySelector('[aria-current="page"]')?.textContent);
const topPages = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>(':scope > [data-hw-page]')].map(node => Number(node.dataset.hwPage));

for(const adapter of ['react','vue','angular']) {
  it(`${adapter}: bounded window and native buttons preserve selection, boundaries and no-op callbacks`,async()=>{
    const m=await mount(adapter);expect(topPages(m.root())).toEqual([1,2,3,4,5,10]);expect(current(m.root())).toBe(1);
    expect(m.root().getAttribute('aria-label')).toBe('ترقيم الصفحات');expect(m.root().querySelector<HTMLButtonElement>('[data-hw-previous]')!.disabled).toBe(true);
    await m.click('[data-hw-next]');expect(current(m.root())).toBe(2);expect(m.changed).toHaveBeenLastCalledWith(2);
    await m.click('[aria-current="page"]');expect(m.changed).toHaveBeenCalledTimes(1);
    expect([...m.root().querySelectorAll('button')].every(node=>node.type==='button')).toBe(true);
    if(adapter!=='angular')expect(m.root().id).toBe('consumer-pages');
  });
  it(`${adapter}: gap selection closes its disclosure and returns focus to the newly current page`,async()=>{
    const m=await mount(adapter,{page:10,totalPages:20});expect(topPages(m.root())).toEqual([1,9,10,11,20]);
    const gap=m.root().querySelector<HTMLDetailsElement>('details')!;
    await m.run(()=>{gap.open=true;gap.dispatchEvent(new Event('toggle'));});
    expect([...gap.querySelectorAll<HTMLElement>('[data-hw-page]')].map(node=>Number(node.dataset.hwPage))).toEqual([2,3,4,5,6,7,8]);
    await m.click('details [data-hw-page="4"]');expect(current(m.root())).toBe(4);expect(m.changed).toHaveBeenLastCalledWith(4);
    expect(m.root().querySelector('details[open]')).toBeNull();expect(document.activeElement).toBe(m.root().querySelector('[aria-current="page"]'));
  });
  it(`${adapter}: Escape and outside click close disclosures, and only one gap opens at a time`,async()=>{
    const m=await mount(adapter,{page:10,totalPages:20});const [first,second]=[...m.root().querySelectorAll<HTMLDetailsElement>('details')];
    await m.run(()=>{first!.open=true;first!.dispatchEvent(new Event('toggle'));second!.open=true;second!.dispatchEvent(new Event('toggle'));});
    expect(first!.open).toBe(false);expect(second!.open).toBe(true);
    await m.run(()=>second!.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));
    expect(second!.open).toBe(false);expect(document.activeElement).toBe(second!.querySelector('summary'));
    await m.run(()=>{first!.open=true;first!.dispatchEvent(new Event('toggle'));document.body.click();});expect(first!.open).toBe(false);expect(m.changed).not.toHaveBeenCalled();
  });
  it(`${adapter}: large gaps remain bounded and accept only valid whole pages within their range`,async()=>{
    const m=await mount(adapter,{page:5000,totalPages:10000});expect(m.root().querySelectorAll('button').length).toBeLessThan(15);
    const gap=m.root().querySelector<HTMLDetailsElement>('details')!,input=gap.querySelector<HTMLInputElement>('input')!;
    expect(input.min).toBe('2');expect(input.max).toBe('4998');expect(input.name).toBe('');
    expect(input.dataset.hwFilled).toBe('true');
    await m.run(()=>{input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));});expect(input.dataset.hwFilled).toBe('false');
    await m.run(()=>{input.value='150';input.dispatchEvent(new Event('input',{bubbles:true}));});expect(input.dataset.hwFilled).toBe('true');
    const form=document.createElement('form');m.host.before(form);form.append(m.host);input.value='';expect(input.form).toBeNull();expect(input.checkValidity()).toBe(false);expect(form.checkValidity()).toBe(true);expect([...new FormData(form)]).toEqual([]);
    await m.run(()=>{gap.open=true;input.value='4999';gap.querySelector<HTMLButtonElement>('[data-hw-jump-submit]')!.click();});expect(current(m.root())).toBe(5000);expect(m.changed).not.toHaveBeenCalled();expect(input.getAttribute('aria-invalid')).toBe('true');
    await m.run(()=>{input.value='3.5';gap.querySelector<HTMLButtonElement>('[data-hw-jump-submit]')!.click();});expect(m.changed).not.toHaveBeenCalled();
    await m.run(()=>{input.value='150';input.dispatchEvent(new Event('input',{bubbles:true}));});expect(input.hasAttribute('aria-invalid')).toBe(false);
    await m.run(()=>{input.value='150';input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));});expect(current(m.root())).toBe(150);expect(m.changed).toHaveBeenLastCalledWith(150);expect(document.activeElement).toBe(m.root().querySelector('[aria-current="page"]'));
  });
  it(`${adapter}: invalid props, disabled state and single-page hiding are explicit and safe`,async()=>{
    const m=await mount(adapter,{page:Infinity,totalPages:NaN,siblingCount:NaN},true);expect(current(m.root())).toBe(1);expect(topPages(m.root())).toEqual([1]);
    m.state.page=100;m.state.totalPages=20;m.state.disabled=true;await m.sync();expect(current(m.root())).toBe(20);expect(m.root().querySelector('details')).toBeNull();
    expect([...m.root().querySelectorAll('button')].every(button=>button.disabled)).toBe(true);await m.click('[data-hw-previous]');expect(m.changed).not.toHaveBeenCalled();
    m.state.totalPages=1;m.state.hideOnSinglePage=true;await m.sync();expect(m.root().hidden).toBe(true);
  });
  it(`${adapter}: ancestor fieldset disabling closes and guards disclosures, and enabling restores keyboard access`,async()=>{
    const m=await mount(adapter,{page:10,totalPages:20});const gap=m.root().querySelector<HTMLDetailsElement>('details')!,summary=gap.querySelector<HTMLElement>('summary')!;
    await m.run(()=>{gap.open=true;gap.dispatchEvent(new Event('toggle'));});expect(gap.open).toBe(true);
    await m.run(()=>{m.ancestor.disabled=true;});expect(gap.open).toBe(false);expect(summary.getAttribute('aria-disabled')).toBe('true');expect(summary.tabIndex).toBe(-1);
    await m.run(()=>{summary.click();gap.open=true;gap.dispatchEvent(new Event('toggle'));});expect(gap.open).toBe(false);expect(m.changed).not.toHaveBeenCalled();
    await m.run(()=>{m.ancestor.disabled=false;});expect(summary.hasAttribute('aria-disabled')).toBe(false);expect(summary.hasAttribute('tabindex')).toBe(false);
    await m.run(()=>{summary.click();});expect(gap.open).toBe(true);
  });
}

for(const adapter of ['react','vue'])it(`${adapter}: controlled owners accept page changes without eager local replacement`,async()=>{
  const m=await mount(adapter,{},true);await m.click('[data-hw-next]');expect(current(m.root())).toBe(1);expect(m.changed).toHaveBeenLastCalledWith(2);
  m.state.page=2;await m.sync();expect(current(m.root())).toBe(2);expect(m.changed).toHaveBeenCalledTimes(1);
});

for(const adapter of ['react','vue'])it(`${adapter}: a rejected controlled gap selection does not steal focus on an unrelated later render`,async()=>{
  const m=await mount(adapter,{page:10,totalPages:20},true);const gap=m.root().querySelector<HTMLDetailsElement>('details')!;
  await m.run(()=>{gap.open=true;gap.dispatchEvent(new Event('toggle'));});await m.click('details [data-hw-page="4"]');expect(current(m.root())).toBe(10);expect(document.activeElement).toBe(gap.querySelector('summary'));
  const outside=document.createElement('button');document.body.append(outside);outside.focus();m.state.totalPages=21;await m.sync();expect(document.activeElement).toBe(outside);expect(m.changed).toHaveBeenCalledTimes(1);
});

it('React and Vue SSR render closed, named disclosures and bounded controls',async()=>{
  const renders=[renderToStaticMarkup(r(ReactPagination,{totalPages:10000,defaultPage:5000})),await renderToString(createSSRApp({render:()=>h(VuePagination,{totalPages:10000,defaultValue:5000})}))];
  for(const html of renders){const host=document.createElement('div');host.innerHTML=html;expect(host.querySelectorAll('button').length).toBeLessThan(15);expect(host.querySelectorAll('details:not([open])')).toHaveLength(2);expect(host.querySelector('summary')?.getAttribute('aria-label')).toBe('الصفحات 2 إلى 4998');expect(host.querySelector('a[href]')).toBeNull();}
});
