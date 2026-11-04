import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { NqToastRegionComponent } from '../packages/angular/dist/fesm2022/nasaq-angular.mjs';
import { act, createElement as react } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { createApp, createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { ToastRegion as ReactToast } from '../packages/react/src/expanded-interactive';
import { ToastRegion as VueToast } from '../packages/vue/src/expansion-interactive';
import { createToastRegion } from '../packages/vanilla/src/disclosures';
import { prepareToastDismissFocus } from '../packages/core/src/toast-focus';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const disposal: Array<() => void | Promise<void>> = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {
  for (const dispose of disposal.splice(0)) await dispose();
  TestBed.resetTestingModule();
  document.body.replaceChildren();
});

type Adapter = 'react' | 'vue' | 'angular';
function notices() {
  return [
    {id: 'one', title: 'الأول', message: 'طلب محفوظ', tone: 'success' as const},
    {id: 'pinned', title: 'مستمر', message: 'مرجع الطلب', tone: 'neutral' as const, dismissible: false},
    {id: 'two', title: 'الثاني', message: 'بيانات الطلب', tone: 'danger' as const},
    {id: 'urgent', title: 'عاجل', message: 'راجع موعدك', tone: 'info' as const, urgent: true},
  ];
}

async function mount(adapter: Adapter) {
  const host = document.createElement('div');
  const external = document.createElement('button');
  document.body.append(host, external);
  let messages = notices(), listening = true;
  let response: 'accept' | 'reject' | 'redirect' = 'accept';
  let paint: () => void;
  let run: (action: () => void) => Promise<void>;
  const remove = (id: string) => { messages = messages.filter(message => message.id !== id); paint(); };
  const dismiss = vi.fn((id: string) => {
    if (response === 'redirect') external.focus();
    if (response !== 'reject') remove(id);
  });
  if (adapter === 'react') {
    const root = createRoot(host);
    paint = () => root.render(react(ReactToast, {
      variant: 'banner', position: 'inline', onDismiss: listening ? dismiss : undefined,
      messages: messages.map(message => ({...message, description: message.message})),
    }));
    run = async action => { await act(async () => action()); };
    disposal.push(() => run(() => root.unmount()));
  } else if (adapter === 'vue') {
    const revision = ref(0);
    const app = createApp({render() {
      void revision.value;
      return h(VueToast, {variant: 'banner', position: 'inline', messages, ...(listening ? {onDismiss: dismiss} : {})});
    }});
    app.mount(host);
    paint = () => { revision.value++; };
    run = async action => { action(); await nextTick(); await nextTick(); };
    disposal.push(() => app.unmount());
  } else {
    const fixture = TestBed.createComponent(NqToastRegionComponent);
    host.append(fixture.nativeElement);
    let subscription: {unsubscribe(): void} | undefined;
    paint = () => {
      fixture.componentRef.setInput('messages', messages);
      fixture.componentRef.setInput('variant', 'banner');
      fixture.componentRef.setInput('position', 'inline');
      if (listening && !subscription) subscription = fixture.componentInstance.dismissed.subscribe(dismiss);
      if (!listening && subscription) { subscription.unsubscribe(); subscription = undefined; }
    };
    run = async action => { action(); fixture.detectChanges(); };
    disposal.push(() => fixture.destroy());
  }
  await run(paint);
  const region = host.querySelector<HTMLElement>('.nq-toast-region')!;
  const button = (id: string) => region.querySelector<HTMLButtonElement>(`[data-nq-toast="${id}"] [data-nq-dismiss]`);
  const press = (id: string) => run(() => { const close = button(id)!; close.focus(); close.click(); });
  return {region, button, press, external, dismiss, run,
    mode(value: typeof response) {response = value;},
    remove: (id: string) => run(() => remove(id)),
    listen: (value: boolean) => run(() => {listening = value; paint();}),
  };
}

for (const adapter of ['react', 'vue', 'angular'] as const) {
  it(`${adapter} separates urgency from tone and recovers focus through accepted banner dismissals`, async () => {
    const ui = await mount(adapter);
    const polite = ui.region.querySelector('[role="status"]'), urgent = ui.region.querySelector('[role="alert"]');
    expect(ui.region.getAttribute('aria-label')).toBe('الإشعارات');
    expect(ui.region.dataset.variant).toBe('banner'); expect(ui.region.dataset.position).toBe('inline');
    expect(ui.region.hasAttribute('aria-live')).toBe(false);
    expect(polite?.querySelector('[data-tone="danger"]')).not.toBeNull();
    expect(urgent?.querySelector('[data-tone="info"]')).not.toBeNull();
    expect(ui.region.querySelectorAll('.nq-toast-icon[aria-hidden="true"]')).toHaveLength(4);
    expect(ui.button('pinned')).toBeNull();
    expect(ui.button('one')?.getAttribute('aria-label')).toBe('إغلاق الإشعار: الأول');
    await ui.press('one'); expect(document.activeElement).toBe(ui.button('two'));
    await ui.press('urgent'); expect(document.activeElement).toBe(ui.button('two'));
    await ui.press('two'); expect(document.activeElement).toBe(ui.region);
    expect(ui.dismiss.mock.calls.map(([id]) => id)).toEqual(['one', 'urgent', 'two']);
    expect(ui.region.querySelector('[role="status"]')).toBe(polite);
    expect(ui.region.querySelector('[role="alert"]')).toBe(urgent);
    expect(ui.region.querySelector('[data-nq-toast="pinned"]')).not.toBeNull();
  });
  it(`${adapter} discards rejected requests and respects owner-directed and external focus`, async () => {
    const ui = await mount(adapter);
    ui.mode('reject'); await ui.press('one'); expect(document.activeElement).toBe(ui.button('one'));
    // Removing the message in a later, unrelated update must not replay the rejection.
    await ui.remove('one'); expect(document.activeElement).toBe(document.body);
    ui.mode('redirect'); await ui.press('two'); expect(document.activeElement).toBe(ui.external);
    await ui.remove('urgent'); expect(document.activeElement).toBe(ui.external);
  });
  it(`${adapter} exposes dismiss actions only while the owner listens`, async () => {
    const ui = await mount(adapter);
    await ui.listen(false); expect(ui.region.querySelector('[data-nq-dismiss]')).toBeNull();
    await ui.listen(true); expect(ui.button('one')).not.toBeNull(); expect(ui.button('pinned')).toBeNull();
  });
}

it('React and Vue retain authored inline placement in server-rendered markup', async () => {
  const attrs = {'data-variant': 'inline', 'data-position': 'bottom-start'};
  const html = [renderToStaticMarkup(react(ReactToast, {...attrs, messages: []})), await renderToString(createSSRApp({render: () => h(VueToast, {...attrs, messages: []})}))];
  for (const markup of html) {
    const host = document.createElement('div'); host.innerHTML = markup;
    const region = host.querySelector('.nq-toast-region')!;
    expect(region.getAttribute('data-variant')).toBe('inline');
    expect(region.getAttribute('data-position')).toBe('bottom-start');
    expect(region.querySelectorAll('[aria-live]')).toHaveLength(2);
    expect(region.querySelector('.nq-toast-icon')).toBeNull();
  }
});

it('vanilla retains mixed live buckets, protects pinned messages, skips disabled actions and restores authored markup', () => {
  const root = document.createElement('section'); root.className = 'nq-toast-region'; root.lang = 'ar';
  root.innerHTML = '<div data-nq-live="polite"><div data-nq-toast id="one"><strong>الأول</strong><button data-nq-dismiss>×</button></div><div data-nq-toast id="pinned" data-nq-dismissible="false"><button data-nq-dismiss>×</button></div><div data-nq-toast id="blocked"><button data-nq-dismiss disabled>×</button></div></div><div data-nq-live="assertive"><div data-nq-toast="last"><strong>الأخير</strong><button data-nq-dismiss>×</button></div></div>';
  document.body.append(root);
  const original = root.outerHTML, callback = vi.fn();
  const controller = createToastRegion(root, {variant: 'banner', position: 'inline', onDismiss: callback});
  expect(root.getAttribute('role')).toBe('region'); expect(root.hasAttribute('aria-live')).toBe(false);
  expect(root.querySelector('[role="alert"]')?.getAttribute('aria-live')).toBe('assertive');
  const first = root.querySelector<HTMLButtonElement>('#one button')!, last = root.querySelector<HTMLButtonElement>('[data-nq-toast="last"] button')!;
  expect(first.getAttribute('aria-label')).toBe('إغلاق الإشعار: الأول');
  expect(root.querySelector<HTMLButtonElement>('#pinned button')!.hidden).toBe(true);
  controller.dismiss('pinned'); expect(root.querySelector<HTMLElement>('#pinned')!.hidden).toBe(false);
  first.focus(); first.click(); expect(document.activeElement).toBe(last);
  last.click(); expect(document.activeElement).toBe(root);
  expect(callback.mock.calls.map(([id]) => id)).toEqual(['one', 'last']);
  controller.destroy(); expect(root.outerHTML).toBe(original);
});

it('vanilla preserves unrelated focus and does not intercept nested region dismissals', () => {
  const root = document.createElement('div'); root.className = 'nq-toast-region';
  root.innerHTML = '<div data-nq-toast id="outer" role="alert"><button data-nq-dismiss>Dismiss</button></div><div class="nq-toast-region"><div data-nq-toast id="inner"><button data-nq-dismiss>Dismiss</button></div></div>';
  const external = document.createElement('button'); document.body.append(root, external);
  const dismissed = vi.fn(); const controller = createToastRegion(root, {onDismiss: dismissed});
  expect(root.getAttribute('role')).toBe('status');
  expect(root.querySelector('#outer')?.hasAttribute('aria-relevant')).toBe(false);
  external.focus(); controller.dismiss('outer'); expect(document.activeElement).toBe(external);
  root.querySelector<HTMLButtonElement>('#inner button')!.click();
  expect(root.querySelector<HTMLElement>('#inner')!.hidden).toBe(false);
  expect(dismissed.mock.calls).toEqual([['outer']]); controller.destroy();
});


it('retains owner focus when a notice keeps its identity through DOM replacement', () => {
  const region = document.createElement('section'); region.className = 'nq-toast-region'; region.tabIndex = -1;
  region.innerHTML = '<div data-nq-toast="one"><button data-nq-dismiss>Close</button></div><div data-nq-toast="two"><button data-nq-dismiss>Close</button></div>';
  document.body.append(region);
  const original = region.querySelector<HTMLElement>('[data-nq-toast="one"]')!;
  original.querySelector('button')!.focus();
  const recover = prepareToastDismissFocus(region, original);
  original.replaceWith(original.cloneNode(true));
  recover(); expect(document.activeElement).toBe(document.body);
});

it('vanilla handles authored messages appended or unpinned after mounting', async () => {
  const root = document.createElement('div'); root.lang = 'en'; document.body.append(root);
  const controller = createToastRegion(root);
  const notice = document.createElement('div'); notice.dataset.nqToast = 'later'; notice.dataset.nqDismissible = 'false';
  notice.innerHTML = '<div class="nq-toast-content"><strong>Later</strong><p>Details</p></div><button data-nq-dismiss>×</button>';
  root.append(notice); await Promise.resolve();
  const close = notice.querySelector('button')!;
  expect(close.hidden).toBe(true); expect(close.getAttribute('aria-label')).toBe('Dismiss notification: Later');
  delete notice.dataset.nqDismissible; await Promise.resolve(); expect(close.hidden).toBe(false);
  close.hidden = true; close.setAttribute('aria-label', 'Application action');
  notice.querySelector('strong')!.textContent = 'Updated'; await Promise.resolve();
  expect(close.hidden).toBe(true); expect(close.getAttribute('aria-label')).toBe('Application action');
  controller.destroy(); expect(close.hidden).toBe(true); expect(close.getAttribute('aria-label')).toBe('Application action');
});


it('Vue consumes a one-shot dismiss listener without leaving inert actions', async () => {
  const host = document.createElement('div'); document.body.append(host);
  const dismiss = vi.fn();
  const app = createApp({render: () => h(VueToast, {messages: notices(), onDismissOnce: dismiss})});
  app.mount(host); disposal.push(() => app.unmount());
  host.querySelector<HTMLButtonElement>('[data-nq-dismiss]')!.click();
  await nextTick();
  expect(dismiss.mock.calls).toEqual([['one']]);
  expect(host.querySelector('[data-nq-dismiss]')).toBeNull();
  expect(host.querySelectorAll('[data-nq-toast]')).toHaveLength(4);
});
