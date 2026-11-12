import '@angular/compiler';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {HwIconButtonComponent} from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import {act, createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {createApp, h, nextTick, reactive} from 'vue';
import {afterEach, beforeAll, expect, it} from 'vitest';
import {IconButton as ReactIconButton} from '../packages/react/src/expanded-content';
import {IconButton as VueIconButton} from '../packages/vue/src/content';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cleanup: Array<() => void | Promise<void>> = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {
  for (const fn of cleanup.splice(0)) await fn();
  TestBed.resetTestingModule(); document.body.replaceChildren();
});
async function mount(adapter: string, relations = false) {
  const host = document.createElement('div'); document.body.append(host);
  const form = document.createElement('form'); form.id = 'icon-form'; document.body.append(form);
  const data: string[] = []; let clicks = 0;
  form.addEventListener('submit', event => {
    event.preventDefault(); data.push(String(new FormData(form, (event as SubmitEvent).submitter).get('action')));
  });
  const state: {loading: boolean; disabled: boolean; expanded: boolean | null; form: string | undefined} = {loading: false, disabled: false, expanded: false, form: relations ? form.id : undefined};
  const shared = relations ? {shape: 'circle', type: 'submit', form: form.id, name: 'action', value: 'search'} : {};
  const aria = relations ? {'aria-controls': 'results', 'aria-expanded': false, 'aria-describedby': 'search-help', 'aria-haspopup': 'dialog'} : {};
  let sync: () => Promise<void>, focus: () => void;
  if (adapter === 'react') {
    const root = createRoot(host); let button: HTMLButtonElement | null = null;
    sync = async () => { await act(() => root.render(r(ReactIconButton, {...shared, ...aria, loading: state.loading, disabled: state.disabled, 'aria-expanded': relations ? state.expanded : undefined, form: state.form, label: 'Search', ref: el => {button = el;}, onClick: () => clicks++}))); };
    focus = () => button?.focus(); cleanup.push(async () => {await act(() => root.unmount());});
  } else if (adapter === 'vue') {
    const props = reactive({...state}); let instance: {focus(): void} | null = null;
    const app = createApp({render: () => h(VueIconButton, {...shared, ...aria, loading: props.loading, disabled: props.disabled, 'aria-expanded': relations ? props.expanded : undefined, form: props.form, label: 'Search', ref: el => {instance = el as typeof instance;}, onClick: () => clicks++})});
    app.mount(host); sync = async () => {Object.assign(props, state); await nextTick();};
    focus = () => instance?.focus(); cleanup.push(() => app.unmount());
  } else {
    const fixture = TestBed.createComponent(HwIconButtonComponent); host.append(fixture.nativeElement);
    fixture.componentRef.setInput('label', 'Search');
    for (const [key, value] of Object.entries(shared)) fixture.componentRef.setInput(key, value);
    if (relations) for (const [key, value] of Object.entries({controls:'results', expanded:false, 'aria-describedby':'search-help', hasPopup:'dialog'})) fixture.componentRef.setInput(key, value);
    fixture.componentInstance.activated.subscribe(() => clicks++);
    sync = async () => {fixture.componentRef.setInput('loading', state.loading); fixture.componentRef.setInput('disabled', state.disabled); if(relations) {fixture.componentRef.setInput('expanded', state.expanded); fixture.componentRef.setInput('form', state.form);} fixture.detectChanges();};
    focus = () => fixture.componentInstance.focus(); cleanup.push(() => fixture.destroy());
  }
  await sync(); return {host, form, button: host.querySelector('button')!, state, sync, focus, data, clicks: () => clicks};
}
for (const adapter of ['react', 'vue', 'angular']) {
  it(`${adapter}: icon actions preserve native form, disclosure relationships and public focus`, async () => {
    const m = await mount(adapter, true), b = m.button;
    expect(b.getAttribute('aria-label')).toBe('Search'); expect(b.dataset.variant).toBe('ghost'); expect(b.dataset.shape).toBe('circle');
    expect(b.getAttribute('aria-controls')).toBe('results'); expect(b.getAttribute('aria-expanded')).toBe('false');
    expect(b.getAttribute('aria-describedby')).toBe('search-help'); expect(b.getAttribute('aria-haspopup')).toBe('dialog');
    m.focus(); expect(document.activeElement).toBe(b); b.click(); expect(m.data).toEqual(['search']); expect(m.clicks()).toBe(1);
  });
  it(`${adapter}: optional disclosure state can be removed after true and false`, async () => {
    const m = await mount(adapter, true);
    for (const expanded of [true, false, null]) {
      m.state.expanded = expanded; await m.sync();
      expect(m.button.getAttribute('aria-expanded')).toBe(expanded == null ? null : String(expanded));
    }
  });
  it(`${adapter}: an explicit empty form attribute disassociates from an ancestor form`, async () => {
    const m = await mount(adapter, true); m.form.append(m.host);
    m.state.form = ''; await m.sync(); expect(m.button.form).toBe(null); m.button.click(); expect(m.data).toEqual([]);
    m.state.form = undefined; await m.sync(); expect(m.button.form).toBe(m.form); m.button.click(); expect(m.data).toEqual(['search']);
  });
  it(`${adapter}: loading and disabled icon actions block activation and recover`, async () => {
    const m = await mount(adapter), b = m.button; expect(b.type).toBe('button');
    m.state.loading = true; await m.sync(); expect(b.disabled).toBe(true); expect(b.getAttribute('aria-busy')).toBe('true'); b.click(); expect(m.clicks()).toBe(0);
    m.state.disabled = true; m.state.loading = false; await m.sync(); expect(b.disabled).toBe(true); b.click(); expect(m.clicks()).toBe(0);
    m.state.disabled = false; await m.sync(); expect(b.disabled).toBe(false); expect(b.getAttribute('aria-busy')).not.toBe('true'); b.click(); expect(m.clicks()).toBe(1);
  });
}
