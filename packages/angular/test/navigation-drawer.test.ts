import '@angular/compiler';
import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest';
import { HwNavigationDrawerComponent } from '@hawiyah/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } });
});
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });
it('composes the native Drawer with page links, disclosure groups and disabled entries', async () => {
  const fixture = TestBed.createComponent(HwNavigationDrawerComponent);
  fixture.componentRef.setInput('title', 'القائمة'); fixture.componentRef.setInput('navigationLabel', 'التنقل الرئيسي'); fixture.componentRef.setInput('closeLabel', 'إغلاق القائمة'); fixture.componentRef.setInput('titleId', 'menu-title'); fixture.componentRef.setInput('items', [
    { id: 'services', label: 'الخدمات', href: '#services', children: [{ id: 'request', label: 'طلب خدمة', href: '#request', current: true }] },
    { id: 'disabled', label: 'غير متاح', href: '#disabled', disabled: true },
    { id: 'disabled-group', label: 'Disabled group', disabled: true, children: [{ id: 'hidden', label: 'Hidden', href: '#hidden' }] },
  ]); fixture.detectChanges();
  const trigger = document.createElement('button'); document.body.append(trigger); trigger.focus();
  fixture.componentInstance.show(trigger); fixture.detectChanges();
  const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
  expect(dialog.open).toBe(true); expect(dialog.dataset.side).toBe('start');
  expect(dialog.querySelector('nav')!.getAttribute('aria-label')).toBe('التنقل الرئيسي');
  expect(dialog.querySelector('.hw-dialog-header button')!.getAttribute('aria-label')).toBe('إغلاق القائمة');
  expect(dialog.getAttribute('aria-labelledby')).toBe('menu-title'); expect(dialog.querySelector('h2')!.id).toBe('menu-title');
  expect((fixture.nativeElement as HTMLElement).hasAttribute('title')).toBe(false);
  expect(dialog.querySelector('a[href="#disabled"], a[href="#hidden"]')).toBeNull();
  const summary = dialog.querySelector('summary')!; summary.click(); expect(summary.parentElement!.hasAttribute('open')).toBe(true);
  const link = dialog.querySelector<HTMLAnchorElement>('a[href="#request"]')!;
  const prevent = (event: Event) => event.preventDefault(); dialog.addEventListener('click', prevent);
  link.click(); await Promise.resolve(); expect(dialog.open).toBe(true);
  dialog.removeEventListener('click', prevent); link.focus(); link.click(); await Promise.resolve(); fixture.detectChanges();
  expect(dialog.open).toBe(false); expect(document.activeElement).toBe(trigger);
});
