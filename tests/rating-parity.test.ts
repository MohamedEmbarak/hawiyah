import '@angular/compiler';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {HwRatingComponent, HwRatingDisplayComponent} from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import {act, createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {createApp, createSSRApp, h, nextTick, reactive} from 'vue';
import {renderToString} from 'vue/server-renderer';
import {afterEach, beforeAll, expect, it, vi} from 'vitest';
import {Rating as ReactRating, RatingDisplay as ReactRatingDisplay} from '../packages/react/src/expanded-controls';
import {Rating as VueRating, RatingDisplay as VueRatingDisplay} from '../packages/vue/src/controls';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cleanup: Array<() => void | Promise<void>> = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {for (const fn of cleanup.splice(0)) await fn(); TestBed.resetTestingModule(); document.body.replaceChildren();});

async function display(adapter: string) {
  const host = document.createElement('div'); document.body.append(host);
  const state = {value: 3.5, max: 5, showValue: true}; let sync: () => Promise<void>;
  if (adapter === 'react') {
    const root = createRoot(host); cleanup.push(async () => {await act(() => root.unmount());});
    sync = async () => {await act(() => root.render(r(ReactRatingDisplay, {...state, label: 'تقييم الخدمة', id: 'score', className: 'consumer-score', dir: 'rtl'})));};
  } else if (adapter === 'vue') {
    const model = reactive({...state}); const app = createApp({render: () => h(VueRatingDisplay, {...model, label: 'تقييم الخدمة', id: 'score', class: 'consumer-score', dir: 'rtl'})}); app.mount(host); cleanup.push(() => app.unmount());
    sync = async () => {Object.assign(model, state); await nextTick();};
  } else {
    const fixture = TestBed.createComponent(HwRatingDisplayComponent); host.append(fixture.nativeElement); cleanup.push(() => fixture.destroy());
    sync = async () => {fixture.componentRef.setInput('label', 'تقييم الخدمة'); for (const [key, value] of Object.entries(state)) fixture.componentRef.setInput(key, value); fixture.detectChanges();};
  }
  await sync(); return {host, state, sync};
}
function expectScore(host: HTMLElement, score: number, max: number) {
  const root = host.querySelector<HTMLElement>('.hw-rating-display')!;
  expect(root.getAttribute('role')).toBe('img'); expect(root.getAttribute('aria-label')).toBe(`تقييم الخدمة: ${score} من ${max}`);
  expect(root.querySelector('.hw-rating-stars')?.getAttribute('aria-hidden')).toBe('true');
  const fills = [...root.querySelectorAll<HTMLElement>('.hw-rating-fill')]; expect(fills).toHaveLength(max);
  fills.forEach((fill, index) => expect(fill.style.getPropertyValue('--hw-rating-fill')).toBe(`${Math.min(1, Math.max(0, score - index)) * 100}%`));
  expect(root.querySelector('input, button, [tabindex]')).toBeNull();
}

async function input(adapter: string, controlled = false) {
  const host = document.createElement('form'); document.body.append(host);
  const state = {value: 3.9, max: 5, readOnly: false, disabled: false}; const changed = vi.fn(); let sync: () => Promise<void>;
  if (adapter === 'react') {
    const root = createRoot(host); cleanup.push(async () => {await act(() => root.unmount());});
    sync = async () => {await act(() => root.render(r(ReactRating, {label: 'التقييم', value: controlled ? state.value : undefined, defaultValue: state.value, max: state.max, readOnly: state.readOnly, disabled: state.disabled, name: 'score', required: true, onValueChange: changed})));};
  } else if (adapter === 'vue') {
    const model = reactive({...state}); const app = createApp({render: () => h(VueRating, {label: 'التقييم', modelValue: controlled ? model.value : undefined, defaultValue: model.value, max: model.max, readonly: model.readOnly, disabled: model.disabled, name: 'score', required: true, 'onUpdate:modelValue': changed})}); app.mount(host); cleanup.push(() => app.unmount());
    sync = async () => {Object.assign(model, state); await nextTick();};
  } else {
    const fixture = TestBed.createComponent(HwRatingComponent); host.append(fixture.nativeElement); cleanup.push(() => fixture.destroy()); fixture.componentInstance.valueChange.subscribe(changed);
    sync = async () => {fixture.componentRef.setInput('label', 'التقييم'); fixture.componentRef.setInput('name', 'score'); fixture.componentRef.setInput('required', true); for (const [key, value] of Object.entries(state)) fixture.componentRef.setInput(key, value); fixture.detectChanges();};
  }
  await sync(); return {host, state, sync, changed, click: async (value: number) => {await act(async () => {host.querySelector<HTMLInputElement>(`input[value="${value}"]`)!.click(); await nextTick();}); await sync();}};
}
function selected(host: HTMLElement) {return host.querySelector<HTMLInputElement>('input:checked')?.value ?? '';}

for (const adapter of ['react', 'vue', 'angular']) {
  it(`${adapter}: fractional aggregate display exposes one named score and decorative fill, without form controls`, async () => {
    const m = await display(adapter); expectScore(m.host, 3.5, 5); expect(m.host.querySelector('.hw-rating-score')?.textContent).toBe('3.5/5');
    m.state.value = 1.25; await m.sync(); expectScore(m.host, 1.25, 5);
    m.state.showValue = false; await m.sync(); expect(m.host.querySelector('.hw-rating-score')).toBeNull(); expectScore(m.host, 1.25, 5);
    if (adapter !== 'angular') {const root = m.host.querySelector('.hw-rating-display')!; expect(root.id).toBe('score'); expect(root.classList.contains('consumer-score')).toBe(true); expect(root.getAttribute('dir')).toBe('rtl');}
  });
  it(`${adapter}: nonfinite values and bounded maxima cannot create invalid aggregate scores`, async () => {
    const m = await display(adapter);
    for (const [value, max, expectedValue, expectedMax] of [[NaN, NaN, 0, 5], [Infinity, Infinity, 0, 5], [-Infinity, -Infinity, 0, 5], [-2, 0, 0, 1], [99, 99, 20, 20], [3.8, 3.9, 3, 3]]) {
      m.state.value = value; m.state.max = max; await m.sync(); expectScore(m.host, expectedValue, expectedMax);
    }
  });
  it(`${adapter}: integer input normalizes prefilled scores and maximum consistently without change emissions`, async () => {
    const m = await input(adapter, true); expect(selected(m.host)).toBe('3'); expect(m.host.querySelectorAll('input')).toHaveLength(5); expect(m.host.querySelector('input')?.required).toBe(true);
    for (const [value, max, expected, count] of [[NaN, NaN, '', 5], [Infinity, Infinity, '', 5], [-2, 0, '', 1], [99, 99, '20', 20], [3.8, 3.9, '3', 3]]) {
      m.state.value = value; m.state.max = max; await m.sync(); expect(selected(m.host)).toBe(expected); expect(m.host.querySelectorAll('input')).toHaveLength(count);
    }
    expect(m.changed).not.toHaveBeenCalled(); expect(new FormData(m.host).get('score')).toBe('3');
  });
  it(`${adapter}: selection emits an integer and readonly or inherited disabled controls reject changes`, async () => {
    const m = await input(adapter); await m.click(4); expect(selected(m.host)).toBe('4'); expect(m.changed).toHaveBeenLastCalledWith(4);
    m.state.readOnly = true; await m.sync(); const before = selected(m.host); await m.click(2); expect(selected(m.host)).toBe(before); expect(m.changed).toHaveBeenCalledTimes(1);
    const key = new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true, cancelable: true}); m.host.querySelector('input:checked')!.dispatchEvent(key); expect(key.defaultPrevented).toBe(true);
    m.state.readOnly = false; await m.sync(); const disabled = document.createElement('fieldset'); disabled.disabled = true; m.host.before(disabled); disabled.append(m.host);
    await m.click(1); expect(selected(m.host)).toBe(before); expect(m.changed).toHaveBeenCalledTimes(1); expect(new FormData(m.host).has('score')).toBe(false);
  });
}

for (const adapter of ['react', 'vue']) it(`${adapter}: uncontrolled radio input resets to its original normalized score`, async () => {
  const m = await input(adapter); await m.click(5); expect(selected(m.host)).toBe('5');
  await act(async () => {m.host.reset(); await new Promise(resolve => queueMicrotask(resolve)); await nextTick();}); await m.sync();
  expect(selected(m.host)).toBe('3'); expect(new FormData(m.host).get('score')).toBe('3');
});

it('angular: rating CVA preserves touch, reset and disabled behavior', () => {
  class Host {score = new FormControl(3);}
  Component({standalone: true, imports: [ReactiveFormsModule, HwRatingComponent], template: '<hw-rating label="التقييم" name="score" [formControl]="score" />'})(Host);
  const fixture = TestBed.createComponent(Host); document.body.append(fixture.nativeElement); cleanup.push(() => fixture.destroy()); fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement; const control = fixture.componentInstance.score;
  host.querySelector<HTMLInputElement>('input[value="4"]')!.click(); fixture.detectChanges(); expect(control.value).toBe(4);
  host.querySelector<HTMLInputElement>('input[value="4"]')!.dispatchEvent(new Event('blur')); expect(control.touched).toBe(true);
  control.reset(); fixture.detectChanges(); expect(selected(host)).toBe(''); expect(control.value).toBeNull();
  control.disable(); fixture.detectChanges(); host.querySelector<HTMLInputElement>('input[value="2"]')!.click(); fixture.detectChanges(); expect(control.value).toBeNull(); expect(selected(host)).toBe('');
});

it('React and Vue SSR retain fractional fills and the default accessible Arabic score', async () => {
  const renderings = [renderToStaticMarkup(r(ReactRatingDisplay, {label: 'تقييم الخدمة', value: 2.5})), await renderToString(createSSRApp({render: () => h(VueRatingDisplay, {label: 'تقييم الخدمة', value: 2.5})}))];
  for (const html of renderings) {const host = document.createElement('div'); host.innerHTML = html; expectScore(host, 2.5, 5); expect(host.querySelector('.hw-rating-score')?.textContent).toBe('2.5/5');}
});
