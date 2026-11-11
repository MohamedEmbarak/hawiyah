import '@angular/compiler';
import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, expect, it } from 'vitest';
import { HwStepperComponent } from '@hawiyah/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());
it('preserves numeric current and updates activeIndex forward, backward, complete and not started', () => {
  const fixture = TestBed.createComponent(HwStepperComponent);
  fixture.componentRef.setInput('steps', [{ label: 'البيانات' }, { label: 'المراجعة' }, { label: 'الإرسال' }]);
  fixture.componentRef.setInput('current', 1); fixture.componentRef.setInput('label', 'التقدم'); fixture.detectChanges();
  const list = fixture.nativeElement.querySelector('ol') as HTMLOListElement;
  const states = () => [...list.querySelectorAll<HTMLElement>('li')].map(step => step.dataset.state);
  expect(states()).toEqual(['complete', 'current', 'upcoming']); expect(list.getAttribute('aria-label')).toBe('التقدم');
  for (const [index, expected] of [[2, ['complete', 'complete', 'current']], [0, ['current', 'upcoming', 'upcoming']], [3, ['complete', 'complete', 'complete']]] as const) {
    fixture.componentRef.setInput('activeIndex', index); fixture.detectChanges(); expect(states()).toEqual(expected);
  }
  expect(list.querySelector('[aria-current]')).toBeNull();
  for (const invalid of [-1, -2, 1.5, Infinity, NaN, 4]) {
    fixture.componentRef.setInput('activeIndex', invalid); fixture.detectChanges(); expect(states()).toEqual(['upcoming', 'upcoming', 'upcoming']);
  }
  expect(list.querySelector('button, a, [tabindex]')).toBeNull();
});
it('allows explicit step status and an English accessible name', () => {
  const fixture = TestBed.createComponent(HwStepperComponent);
  fixture.componentRef.setInput('steps', [{ label: 'Details', status: 'upcoming' }, { label: 'Review', status: 'current' }, { label: 'Send' }]);
  fixture.componentRef.setInput('activeIndex', 3); fixture.componentRef.setInput('label', 'Progress'); fixture.detectChanges();
  const list = fixture.nativeElement.querySelector('ol') as HTMLOListElement;
  expect([...list.querySelectorAll<HTMLElement>('li')].map(step => step.dataset.state)).toEqual(['upcoming', 'current', 'complete']);
  expect(list.querySelectorAll('[aria-current="step"]')).toHaveLength(1); expect(list.getAttribute('aria-label')).toBe('Progress');
});
