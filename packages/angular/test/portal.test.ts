import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, expect, it } from 'vitest';
import { NqPortalHeaderComponent, NqPortalLayoutComponent } from '@nasaq/angular';
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());
it('closes responsive navigation on Escape, selection, outside press and focus leaving', () => {
  const fixture = TestBed.createComponent(NqPortalHeaderComponent);
  fixture.componentRef.setInput('brand', 'نسق'); fixture.componentRef.setInput('links', [{ label: 'الخدمات', href: '#main' }]); fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement; const trigger = host.querySelector('button')!; const nav = host.querySelector('nav')!; const link = nav.querySelector('a')!;
  expect(trigger.getAttribute('aria-controls')).toBe(nav.id);
  trigger.click(); fixture.detectChanges(); expect(nav.dataset.open).toBe('true'); link.focus();
  link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); fixture.detectChanges();
  expect(nav.dataset.open).toBe('false'); expect(document.activeElement).toBe(trigger);
  trigger.click(); fixture.detectChanges(); link.click(); fixture.detectChanges(); expect(nav.dataset.open).toBe('false');
  trigger.click(); fixture.detectChanges(); document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })); fixture.detectChanges(); expect(nav.dataset.open).toBe('false');
  trigger.click(); fixture.detectChanges(); trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body })); fixture.detectChanges(); expect(nav.dataset.open).toBe('false');
});
it('provides the portal shell and a matching focusable skip target', () => {
  const fixture = TestBed.createComponent(NqPortalLayoutComponent); fixture.componentRef.setInput('brand', 'نسق'); fixture.componentRef.setInput('breadcrumbs', [{ label: 'الخدمات' }]); fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement; const main = host.querySelector('main')!;
  expect(host.querySelector('.nq-portal-layout')!.getAttribute('lang')).toBe('ar'); expect(main.tabIndex).toBe(-1);
  expect(host.querySelector('.nq-skip-link')!.getAttribute('href')).toBe(`#${main.id}`);
  expect(host.querySelector('footer')).not.toBeNull(); expect(host.querySelector('.nq-breadcrumb')).not.toBeNull();
});
