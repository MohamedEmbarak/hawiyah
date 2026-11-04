import '@angular/compiler';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {NqTooltipComponent} from '../packages/angular/dist/fesm2022/nasaq-angular.mjs';
import {act, createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {createApp, h, nextTick} from 'vue';
import {afterEach, beforeAll, expect, it, vi} from 'vitest';
import {Tooltip as ReactTooltip} from '../packages/react/src/interactive';
import {Tooltip as VueTooltip} from '../packages/vue/src/interactive';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); vi.useRealTimers(); });

type Adapter = 'react' | 'vue' | 'angular';
async function setup(adapter: Adapter) {
  const host = document.createElement('div');
  const external = document.createElement('button');
  const hint = Object.assign(document.createElement('span'), {id: 'other-hint', textContent: 'دليل الخدمة'});
  document.body.append(host, external, hint);
  let run: (fn: () => void) => Promise<void>;
  let destroy: () => Promise<void>;
  const props = {'aria-label': 'التفاصيل', 'aria-describedby': hint.id};
  if (adapter === 'react') {
    const root = createRoot(host);
    run = async fn => { await act(fn); };
    await run(() => root.render(createElement(ReactTooltip, {content: 'معلومات إضافية', children: createElement('button',props)})));
    destroy = () => run(() => root.unmount());
  } else if (adapter === 'vue') {
    const app = createApp({render: () => h(VueTooltip,{content:'معلومات إضافية'}, () => h('button',props))});
    app.mount(host);
    run = async fn => {fn(); await nextTick();};
    destroy = async () => {app.unmount();};
  } else {
    const fixture = TestBed.createComponent(NqTooltipComponent);
    fixture.componentRef.setInput('text','معلومات إضافية');
    host.append(fixture.nativeElement);
    fixture.detectChanges();
    run = async fn => {fn(); fixture.detectChanges();};
    destroy = async () => {fixture.destroy();};
  }
  const tip = host.querySelector<HTMLElement>('[role="tooltip"]')!;
  const wrapper = tip.parentElement!;
  const trigger = host.querySelector<HTMLElement>('[aria-describedby]')!;
  const hover = (enter: boolean) => {
    const opts = {bubbles:true,relatedTarget:external};
    wrapper.dispatchEvent(new MouseEvent(enter ? 'mouseover' : 'mouseout',opts));
    wrapper.dispatchEvent(new MouseEvent(enter ? 'mouseenter' : 'mouseleave',{...opts,bubbles:false}));
  };
  return {tip, trigger, external, hover, run, destroy};
}
const escape = () => new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true});

for (const adapter of ['react','vue','angular'] as const) {
  it(adapter + ' dismisses hover-only tooltips on Escape without moving focus or intercepting later keys', async () => {
    const {tip, trigger, external, hover, run, destroy} = await setup(adapter);
    try {
      external.focus();
      await run(() => hover(true));
      expect(tip.hidden).toBe(false);
      expect(trigger.getAttribute('aria-describedby')?.split(/\s+/)).toContain(tip.id);
      if (adapter !== 'angular') {
        expect(trigger.getAttribute('aria-describedby')?.split(/\s+/)).toContain('other-hint');
        expect(trigger.getAttribute('aria-label')).toBe('التفاصيل');
      }
      const handled = escape();
      await run(() => external.dispatchEvent(handled));
      expect(handled.defaultPrevented).toBe(true);
      expect(tip.hidden).toBe(true);
      expect(document.activeElement).toBe(external);
      const later = escape();
      await run(() => external.dispatchEvent(later));
      expect(later.defaultPrevented).toBe(false);
      await run(() => {hover(false); hover(true);});
      expect(tip.hidden).toBe(false);
    } finally { await destroy(); }
    const afterRemoval = escape();
    external.dispatchEvent(afterRemoval);
    expect(afterRemoval.defaultPrevented).toBe(false);
  });

  it(adapter + ' preserves visibility while focus or hover remains and allows travel to the tooltip', async () => {
    const {tip, trigger, external, hover, run, destroy} = await setup(adapter);
    vi.useFakeTimers();
    try {
      await run(() => {trigger.focus(); hover(true); hover(false); vi.advanceTimersByTime(200);});
      expect(tip.hidden).toBe(false);
      await run(() => {hover(true); external.focus(); vi.advanceTimersByTime(200);});
      expect(tip.hidden).toBe(false);
      await run(() => {hover(false); vi.advanceTimersByTime(40);});
      expect(tip.hidden).toBe(false);
      await run(() => {hover(true); vi.advanceTimersByTime(200);});
      expect(tip.hidden).toBe(false);
      await run(() => {hover(false); vi.advanceTimersByTime(200);});
      expect(tip.hidden).toBe(true);
    } finally { await destroy(); }
  });
}
