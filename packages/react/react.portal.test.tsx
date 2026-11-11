import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';
import { PortalHeader, PortalLayout } from './src/index.js';
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it('closes the responsive disclosure on Escape, link, outside press and focus leaving', async () => {
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
  try {
    await act(async () => root.render(<><PortalHeader brand="هوية" navigationLabel="التنقل الرئيسي" menuLabel="القائمة" navigation={[{ label: 'الخدمات', href: '#main' }]} /><button id="outside">خارج</button></>));
    const trigger = container.querySelector<HTMLButtonElement>('.hw-portal-menu-toggle')!;
    const nav = container.querySelector('nav')!; const link = nav.querySelector('a')!;
    expect(trigger.getAttribute('aria-controls')).toBe(nav.id);
    await act(async () => trigger.click()); expect(nav.dataset.open).toBe('true');
    await act(async () => { link.focus(); link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); });
    expect(nav.dataset.open).toBe('false'); expect(document.activeElement).toBe(trigger);
    await act(async () => trigger.click()); await act(async () => link.click()); expect(nav.dataset.open).toBe('false');
    await act(async () => trigger.click()); await act(async () => document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))); expect(nav.dataset.open).toBe('false');
    await act(async () => trigger.click()); await act(async () => container.querySelector<HTMLButtonElement>('#outside')!.focus()); expect(nav.dataset.open).toBe('false');
  } finally { await act(async () => root.unmount()); container.remove(); }
});
it('renders an Arabic portal shell with matching skip target and page landmarks during SSR', () => {
  const html = renderToString(<PortalLayout lang="ar" dir="rtl" brand="هوية" skipLabel="انتقل إلى المحتوى" menuLabel="القائمة" navigationLabel="التنقل الرئيسي" footerProps={{ externalLabel: 'يفتح في نافذة جديدة' }} breadcrumbLabel="مسار التنقل" secondaryLabel="التنقل الثانوي" mainId="services" breadcrumbs={[{ label: 'الخدمات', current: true }]} secondaryNavigation={[{ label: 'دليل', href: '/guide', current: true }]}><h1>الخدمات</h1></PortalLayout>);
  expect(html).toContain('lang="ar" dir="rtl"'); expect(html).toContain('href="#services"'); expect(html).toContain('<main id="services" tabindex="-1"');
  expect(html).toContain('hw-secondary-nav'); expect(html).toContain('hw-breadcrumb'); expect(html).toContain('hw-portal-footer');
});
