import '@angular/compiler';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {HwTableComponent, HwDataTableComponent} from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import {act, createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {createApp, h, nextTick, reactive} from 'vue';
import {afterEach, beforeAll, expect, it} from 'vitest';
import {Table as ReactTable} from '../packages/react/src/display';
import {DataTable as ReactDataTable} from '../packages/react/src/expanded-content';
import {Table as VueTable} from '../packages/vue/src/display';
import {DataTable as VueDataTable} from '../packages/vue/src/content';
import {createDataTable} from '../packages/vanilla/src/content';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cleanup: Array<() => void | Promise<void>> = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {for(const fn of cleanup.splice(0)) await fn(); TestBed.resetTestingModule(); document.body.replaceChildren();});
async function mount(adapter: string, sortable: boolean) {
  const host=document.createElement('div');document.body.append(host);
  const rows=[{name:'Beta',count:2},{name:'Alpha',count:1}];
  const columns=[{key:'name',label:'الاسم',header:'الاسم',rowHeader:true,sortable:false,cell:(row:typeof rows[number])=>row.name},{key:'count',label:'العدد',header:'العدد',sortable:true,cell:(row:typeof rows[number])=>row.count}];
  const state={rows,caption:'السجلات',variant:'bordered',size:'sm',emptyMessage:'لا توجد سجلات'};
  let sync:()=>Promise<void>;
  if(adapter==='react') {
    const root=createRoot(host);sync=async()=>{await act(()=>root.render(r((sortable?ReactDataTable:ReactTable) as any,{...state,columns})));};
    cleanup.push(async()=>{await act(()=>root.unmount());});
  } else if(adapter==='vue') {
    const props=reactive({...state});const app=createApp({render:()=>h(sortable?VueDataTable:VueTable,{...props,columns})});app.mount(host);
    sync=async()=>{Object.assign(props,state);await nextTick();};cleanup.push(()=>app.unmount());
  } else {
    const fixture=TestBed.createComponent((sortable?HwDataTableComponent:HwTableComponent) as any);host.append(fixture.nativeElement);
    fixture.componentRef.setInput('columns',columns);sync=async()=>{for(const [key,value] of Object.entries(state)) fixture.componentRef.setInput(key,value);fixture.detectChanges();};
    cleanup.push(()=>fixture.destroy());
  }
  await sync();return {host,state,sync,table:host.querySelector('table')!};
}
for(const adapter of ['react','vue','angular'])for(const sortable of [false,true]) {
  const name=`${adapter} ${sortable?'DataTable':'Table'}`;
  it(`${name}: variants preserve native row/column headers and a named keyboard scroll region`,async()=>{
    const m=await mount(adapter,sortable);const wrapper=m.host.querySelector<HTMLElement>('.hw-table-wrap')!;
    expect(wrapper.tabIndex).toBe(0);expect(wrapper.getAttribute('role')).toBe('region');
    const label=wrapper.getAttribute('aria-label')??document.getElementById(wrapper.getAttribute('aria-labelledby')!)?.textContent;
    expect(label).toBe('السجلات');wrapper.focus();expect(document.activeElement).toBe(wrapper);
    expect(m.table.dataset.variant).toBe('bordered');expect(m.table.dataset.size).toBe('sm');
    expect(m.table.querySelectorAll('thead th[scope="col"]')).toHaveLength(2);
    expect(m.table.querySelectorAll('tbody th[scope="row"]')).toHaveLength(2);
    m.state.variant='striped';m.state.size='lg';await m.sync();expect(m.table.dataset.variant).toBe('striped');expect(m.table.dataset.size).toBe('lg');
  });
  it(`${name}: empty results retain column context and recover after records arrive`,async()=>{
    const m=await mount(adapter,sortable);m.state.rows=[];await m.sync();
    const empty=m.table.querySelector('tbody td')!;expect(empty.textContent).toBe('لا توجد سجلات');expect(empty.getAttribute('colspan')).toBe('2');
    expect(m.table.querySelectorAll('thead th')).toHaveLength(2);
    m.state.rows=[{name:'Gamma',count:3}];await m.sync();expect(m.table.querySelector('tbody th[scope="row"]')?.textContent).toBe('Gamma');
  });
  if(sortable)it(`${name}: sorting updates order without mutating the supplied records or losing row headers`,async()=>{
    const m=await mount(adapter,true);const original=[...m.state.rows];
    const click=async()=>{await act(async()=>{m.table.querySelector<HTMLButtonElement>('thead button')!.click();await nextTick();});await m.sync();};
    await click();expect(m.table.querySelector('th[aria-sort="ascending"]')?.textContent).toContain('العدد');expect(m.table.querySelector('tbody th')?.textContent).toBe('Alpha');
    await click();expect(m.table.querySelector('th[aria-sort="descending"]')).not.toBeNull();expect(m.table.querySelector('tbody th')?.textContent).toBe('Beta');expect(m.state.rows).toEqual(original);
  });
}
it('vanilla sorting preserves authored row headers, native nodes, and cleanup order',()=>{
  const host=document.createElement('div');host.innerHTML='<table><caption>السجلات</caption><thead><tr><th scope="col">الاسم</th><th data-hw-key="count" data-hw-type="number"><button data-hw-sort="count">العدد</button></th></tr></thead><tbody><tr><th scope="row">Beta</th><td>2</td></tr><tr><th scope="row">Alpha</th><td>1</td></tr></tbody></table>';
  document.body.append(host);const original=[...host.querySelectorAll('tbody tr')];const controller=createDataTable(host);
  controller.sort('count');expect(host.querySelector('tbody tr')).toBe(original[1]);expect(host.querySelectorAll('tbody th[scope="row"]')).toHaveLength(2);
  controller.destroy();expect([...host.querySelectorAll('tbody tr')]).toEqual(original);
});
