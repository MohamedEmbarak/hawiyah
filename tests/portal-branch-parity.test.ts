import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { HwPortalHeaderComponent } from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import { act, createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { createApp, createSSRApp, h, nextTick } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { PortalHeader as ReactHeader } from '../packages/react/src/expanded-content';
import { PortalLayout as ReactLayout } from '../packages/react/src/portal';
import { PortalLayout as VueLayout } from '../packages/vue/src/portal';
import { PortalHeader as VueHeader } from '../packages/vue/src/patterns';

const items = [
  { label: 'الخدمات', href: '#services', current: true, groups: [
    { label: 'الأفراد', links: [{ label: 'الطلبات', href: '#requests', current: true }] },
    { links: [{ label: 'المواعيد', href: '#appointments' }] },
    { label: 'لا تظهر', links: [] },
  ] },
  { label: 'المساعدة', href: '#help', groups: [{ links: [{ label: 'اتصل بنا', href: '#contact' }] }] },
  { label: 'الأخبار', href: '#news', groups: [{ links: [] }] },
];
type Adapter = 'react' | 'vue' | 'angular';
// The application's copy: the strings the adapters used to supply.
const texts = { navigationLabel: 'التنقل الرئيسي', menuLabel: 'القائمة' };
const props = { brand: 'هوية', links: items, ...texts };
const cleanups: Array<() => void | Promise<void>> = [];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  TestBed.resetTestingModule();
  document.body.replaceChildren();
});

async function mount(adapter: Adapter) {
  const host = document.createElement('div');
  document.body.append(host);
  let run: (action: () => void) => Promise<void>;
  if (adapter === 'react') {
    const root = createRoot(host);
    const ref = createRef<HTMLElement>();
    run = async action => { await act(action); };
    await run(() => root.render(createElement(ReactHeader, { brand: 'هوية', links: items, ...texts, ref })));
    expect(ref.current).toBe(host.querySelector('header'));
    cleanups.push(() => run(() => root.unmount()));
  } else if (adapter === 'vue') {
    const app = createApp(VueHeader, props);
    app.mount(host);
    run = async action => { action(); await nextTick(); };
    cleanups.push(() => app.unmount());
  } else {
    const fixture = TestBed.createComponent(HwPortalHeaderComponent);
    for (const [key, value] of Object.entries(props)) fixture.componentRef.setInput(key, value);
    host.append(fixture.nativeElement);
    fixture.detectChanges();
    run = async action => { action(); fixture.detectChanges(); };
    cleanups.push(() => fixture.destroy());
  }
  const branches = Array.from(host.querySelectorAll<HTMLDetailsElement>('details[data-hw-portal-branch]'));
  const summaries = branches.map(branch => branch.querySelector('summary')!);
  const toggle = host.querySelector<HTMLButtonElement>('.hw-portal-menu-toggle')!;
  return { host, branches, summaries, toggle, run };
}

for (const adapter of ['react', 'vue', 'angular'] as const) {
  it(adapter + ' preserves overview destinations, section labels and the actual current child link', async () => {
    const { host, branches } = await mount(adapter);
    expect(branches).toHaveLength(2);
    expect(branches[0].dataset.current).toBe('true');
    expect(branches[0].querySelectorAll('.hw-portal-branch-group')).toHaveLength(2);
    expect(branches[0].querySelector('.hw-portal-branch-group h2')?.textContent).toBe('الأفراد');
    expect(branches[0].querySelector('.hw-portal-branch-panel > :first-child')?.getAttribute('href')).toBe('#services');
    expect(Array.from(host.querySelectorAll('[aria-current]'), link => link.getAttribute('href'))).toEqual(['#requests']);
    expect(host.querySelector('nav > ul > li:last-child > a')?.getAttribute('href')).toBe('#news');
    expect(host.querySelectorAll('[role="menu"],[role="menuitem"]')).toHaveLength(0);
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('التنقل الرئيسي');
    const toggle = host.querySelector('.hw-portal-menu-toggle')!;
    expect(toggle.getAttribute('aria-label') ?? toggle.textContent?.trim()).toBe('القائمة');
  });

  it(adapter + ' opens one branch and dismisses one disclosure level per Escape', async () => {
    const { branches, summaries, toggle, run } = await mount(adapter);
    await run(() => toggle.click());
    await run(() => summaries[0].click());
    expect(branches[0].open).toBe(true);
    await run(() => summaries[1].click());
    expect(branches.map(branch => branch.open)).toEqual([false, true]);
    const escape = () => new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    const first = escape();
    const link = branches[1].querySelector('a')!;
    await run(() => { link.focus(); link.dispatchEvent(first); });
    expect(first.defaultPrevented).toBe(true);
    expect(branches[1].open).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(summaries[1]);
    await run(() => summaries[1].dispatchEvent(escape()));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it(adapter + ' keeps disclosure state scoped when independent headers receive keyboard activation', async () => {
    const first = await mount(adapter);
    const second = await mount(adapter);
    await first.run(() => first.summaries[0].click());
    await second.run(() => second.summaries[1].click());
    expect(first.branches[0].open).toBe(true);
    expect(second.branches[1].open).toBe(true);
    await second.run(() => second.summaries[1].dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape', bubbles: true, cancelable: true,
    })));
    expect(second.branches[1].open).toBe(false);
    expect(first.branches[0].open).toBe(true);
  });

  it(adapter + ' closes branches on link activation, mobile toggle, pointer outside and focus departure', async () => {
    const { branches, summaries, toggle, run } = await mount(adapter);
    const external = document.createElement('button');
    document.body.append(external);
    for (const dismiss of [
      () => toggle.click(),
      () => external.dispatchEvent(new Event('pointerdown', { bubbles: true })),
      () => { summaries[0].focus(); external.focus(); },
      () => {
        const overview = branches[0].querySelector('a')!;
        overview.addEventListener('click', event => event.preventDefault(), { once: true });
        overview.click();
      },
    ]) {
      await run(() => summaries[0].click());
      expect(branches[0].open).toBe(true);
      await run(dismiss);
      expect(branches[0].open).toBe(false);
    }
  });
}

it('renders initially collapsed, navigable group markup on the React and Vue server', async () => {
  const markup = [
    renderToStaticMarkup(createElement(ReactHeader, { brand: 'هوية', links: items, ...texts })),
    await renderToString(createSSRApp({ render: () => h(VueHeader, props) })),
  ];
  for (const html of markup) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    expect(parsed.querySelectorAll('details:not([open])')).toHaveLength(2);
    expect(parsed.querySelector('.hw-portal-branch-overview')?.getAttribute('href')).toBe('#services');
  }
});

it('renders the React and Vue layout without footerProps: the footer text is reported missing and nothing throws', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const layout = { brand: 'هوية', mainId: 'portal-main', skipLabel: 'انتقل إلى المحتوى', menuLabel: 'القائمة', navigationLabel: 'التنقل الرئيسي' };
    const markup = [
      renderToStaticMarkup(createElement(ReactLayout, layout as never, createElement('h1', null, 'الخدمات'))),
      await renderToString(createSSRApp({ render: () => h(VueLayout, layout, () => h('h1', {}, 'الخدمات')) })),
    ];
    for (const html of markup) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      expect(parsed.querySelector('.hw-skip-link')?.getAttribute('href')).toBe('#portal-main');
      expect(parsed.querySelectorAll('footer.hw-portal-footer')).toHaveLength(1);
      expect(parsed.querySelector('main h1')?.textContent).toBe('الخدمات');
    }
  } finally { warn.mockRestore(); }
});
