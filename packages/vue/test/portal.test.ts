import { createApp, createSSRApp, h, nextTick } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { expect, it } from 'vitest';
import { PortalHeader, PortalLayout } from '../src/index.js';
it('keeps disclosure links keyboard accessible and closes with Escape, selection and outside focus', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const app = createApp({ render: () => h('div', [h(PortalHeader, { brand: 'هوية', links: [{ label: 'الخدمات', href: '#main' }], menuLabel: 'القائمة', navigationLabel: 'التنقل الرئيسي' }), h('button', { id: 'outside' }, 'خارج')]) }); app.mount(container);
  try {
    const trigger = container.querySelector<HTMLButtonElement>('.hw-portal-menu-toggle')!; const nav = container.querySelector('nav')!; const link = nav.querySelector('a')!;
    expect(trigger.getAttribute('aria-controls')).toBe(nav.id);
    trigger.click(); await nextTick(); expect(nav.dataset.open).toBe('true'); link.focus();
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); await nextTick();
    expect(nav.dataset.open).toBe('false'); expect(document.activeElement).toBe(trigger);
    trigger.click(); await nextTick(); link.click(); await nextTick(); expect(nav.dataset.open).toBe('false');
    trigger.click(); await nextTick(); document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })); await nextTick(); expect(nav.dataset.open).toBe('false');
    trigger.click(); await nextTick(); container.querySelector<HTMLButtonElement>('#outside')!.focus(); await nextTick(); expect(nav.dataset.open).toBe('false');
  } finally { app.unmount(); container.remove(); }
});
it('composes Arabic landmarks and a focusable skip target in SSR', async () => {
  const html = await renderToString(createSSRApp({ render: () => h(PortalLayout, { brand: 'هوية', mainId: 'services', dir: 'rtl', skipLabel: 'انتقل إلى المحتوى', menuLabel: 'القائمة', navigationLabel: 'التنقل الرئيسي', secondaryLabel: 'التنقل الثانوي', breadcrumbLabel: 'مسار التنقل', footerLabel: 'روابط التذييل', footerProps: { externalLabel: 'يفتح في نافذة جديدة' }, breadcrumbs: [{ label: 'الخدمات', current: true }], secondaryNavigation: [{ label: 'الدليل', href: '/guide' }] }, () => h('h1', 'الخدمات')) }));
  expect(html).toContain('dir="rtl"'); expect(html).not.toContain('lang='); expect(html).toContain('href="#services"'); expect(html).toContain('<main id="services" tabindex="-1"');
  expect(html).toContain('hw-secondary-nav'); expect(html).toContain('hw-breadcrumb'); expect(html).toContain('hw-portal-footer');
});
