import '@angular/compiler';
import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { HwAccordionComponent } from '@hawiyah/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());

it('preserves native user toggles with open:false and synchronizes changed inputs', () => {
  const fixture = TestBed.createComponent(HwAccordionComponent);
  fixture.componentRef.setInput('items', [{ id: 'one', title: 'Heading', content: 'Body', open: false }]);
  fixture.detectChanges();
  const changed = vi.fn(); fixture.componentInstance.toggled.subscribe(changed);
  const details = fixture.nativeElement.querySelector('details') as HTMLDetailsElement;
  details.querySelector('summary')!.click(); fixture.detectChanges();
  expect(details.open).toBe(true); expect(changed).toHaveBeenCalledExactlyOnceWith({ id: 'one', open: true });
  details.dispatchEvent(new Event('toggle')); expect(changed).toHaveBeenCalledOnce();
  fixture.componentRef.setInput('items', [{ id: 'one', title: 'Heading', content: 'Body', open: true }]); fixture.detectChanges();
  fixture.componentRef.setInput('items', [{ id: 'one', title: 'Heading', content: 'Body', open: false }]); fixture.detectChanges();
  expect(details.open).toBe(false);
  expect(details.querySelector('.hw-accordion-content')!.hasAttribute('inert')).toBe(true);
  expect(changed).toHaveBeenCalledOnce();
});

it('coordinates exclusive peers without duplicate delayed toggle events', () => {
  const fixture = TestBed.createComponent(HwAccordionComponent);
  fixture.componentRef.setInput('exclusive', true);
  fixture.componentRef.setInput('items', [{ id: 'one', title: 'First', content: 'A', open: true }, { id: 'two', title: 'Second', content: 'B' }]);
  fixture.detectChanges();
  const changed = vi.fn(); fixture.componentInstance.toggled.subscribe(changed);
  const details = [...fixture.nativeElement.querySelectorAll('details')] as HTMLDetailsElement[];
  details[1]!.querySelector('summary')!.click(); fixture.detectChanges();
  expect(details.map(item => item.open)).toEqual([false, true]);
  details.forEach(item => item.dispatchEvent(new Event('toggle')));
  expect(changed.mock.calls).toEqual([[{ id: 'one', open: false }], [{ id: 'two', open: true }]]);
});
