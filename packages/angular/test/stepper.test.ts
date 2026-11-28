import '@angular/compiler';
import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, expect, it } from 'vitest';
import { HwStepperComponent } from '@hawiyah/angular';
import { contentOf, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const texts = 'completeLabel="Complete" upcomingLabel="Not started"';
const three = [{ value: 'details', label: 'Details', description: 'About you' }, { value: 'review', label: 'Review' }, { value: 'send', label: 'Send' }];
const states = (root: Element) => [...root.querySelectorAll<HTMLElement>('li')].map(step => step.dataset['state']);

it('takes the current step by value and updates activeIndex forward, backward, complete and not started', () => {
  const fixture = TestBed.createComponent(HwStepperComponent);
  fixture.componentRef.setInput('items', [{ value: 'data', label: 'البيانات' }, { value: 'review', label: 'المراجعة' }, { value: 'send', label: 'الإرسال' }]);
  fixture.componentRef.setInput('completeLabel', 'مكتملة'); fixture.componentRef.setInput('upcomingLabel', 'قادمة');
  fixture.componentRef.setInput('current', 'review'); fixture.componentRef.setInput('label', 'التقدم'); fixture.detectChanges();
  const list = fixture.nativeElement.querySelector('ol') as HTMLOListElement;
  expect(states(list)).toEqual(['complete', 'current', 'upcoming']); expect(list.getAttribute('aria-label')).toBe('التقدم');
  for (const [index, expected] of [[2, ['complete', 'complete', 'current']], [0, ['current', 'upcoming', 'upcoming']], [3, ['complete', 'complete', 'complete']]] as const) {
    fixture.componentRef.setInput('activeIndex', index); fixture.detectChanges(); expect(states(list)).toEqual(expected);
  }
  expect(list.querySelector('[aria-current]')).toBeNull();
  for (const invalid of [-1, -2, 1.5, Infinity, NaN, 4]) {
    fixture.componentRef.setInput('activeIndex', invalid); fixture.detectChanges(); expect(states(list)).toEqual(['upcoming', 'upcoming', 'upcoming']);
  }
  expect(list.querySelector('button, a, [tabindex]')).toBeNull();
});

it('[STEPPER-01][nav-a-14] complete and upcoming steps carry a visually hidden state text after the label; the current step carries aria-current alone', () => {
  const { root } = page(`<hw-stepper label="Progress" ${texts} [items]="items" current="review" />`, { items: three });
  const [first, second, third] = [...root.querySelectorAll('li.hw-step')];
  expect(states(root)).toEqual(['complete', 'current', 'upcoming']);
  for (const [step, text] of [[first!, 'Complete'], [third!, 'Not started']] as const) {
    const status = step.querySelector('[data-hw-step-status]')!;
    expect(status.className).toBe('hw-sr-only'); expect(status.textContent).toBe(text); expect(status.previousElementSibling).toBe(step.firstElementChild); expect(step.firstElementChild!.localName).toBe('span');
  }
  expect(second!.querySelector('[data-hw-step-status]')).toBeNull(); expect(second!.getAttribute('aria-current')).toBe('step'); expect(root.querySelectorAll('[aria-current]')).toHaveLength(1);
});

it('[STEPPER-02] the state text follows an explicit status of an item', () => {
  const { root } = page(`<hw-stepper label="Progress" ${texts} [items]="items" [activeIndex]="0" />`, { items: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C', status: 'complete' }] });
  const steps = [...root.querySelectorAll('li.hw-step')];
  expect(states(root)).toEqual(['current', 'upcoming', 'complete']);
  expect(steps.map(step => step.querySelector('[data-hw-step-status]')?.textContent ?? null)).toEqual([null, 'Not started', 'Complete']);
});

it('[STEPPER-04][nav-a-15] the description is a paragraph beside the label, not text inside it', () => {
  const { root } = page(`<hw-stepper label="Progress" ${texts} [items]="items" current="details" />`, { items: three });
  const step = root.querySelector('li.hw-step')!;
  expect(root.querySelector('small')).toBeNull();
  expect([...step.children].map(child => `${child.localName}.${child.className}`)).toEqual(['span.', 'p.hw-hint']);
  expect(contentOf(step.firstElementChild!).map(node => node.textContent)).toEqual(['Details']); expect(step.querySelector('p.hw-hint')!.textContent).toBe('About you');
  // An upcoming step: label, state text, description.
  const { root: later } = page(`<hw-stepper label="Progress" ${texts} [items]="items" />`, { items: three });
  expect([...later.querySelector('li.hw-step')!.children].map(child => `${child.localName}.${child.className}`)).toEqual(['span.', 'span.hw-sr-only', 'p.hw-hint']);
});

it('[STEPPER-05][nav-a-15] with neither current nor activeIndex every step is upcoming and none is current', () => {
  const { root, update } = page(`<hw-stepper label="Progress" ${texts} [items]="items" [current]="current" />`, { items: three, current: undefined as string | undefined });
  expect(states(root)).toEqual(['upcoming', 'upcoming', 'upcoming']); expect(root.querySelector('[aria-current]')).toBeNull();
  update({ current: 'send' }); expect(states(root)).toEqual(['complete', 'complete', 'current']);
  update({ current: 'unknown' }); expect(states(root)).toEqual(['upcoming', 'upcoming', 'upcoming']);
});

it('[SHAPE-01] the shared item shape {value, label, description, status} renders label, state and description per step', () => {
  const { root } = page(`<hw-stepper label="Progress" ${texts} [items]="items" current="review" />`, { items: [{ value: 'details', label: 'Details', description: 'About you', status: 'complete' }, { value: 'review', label: 'Review' }, { value: 'send', label: 'Send', description: 'Last step' }] });
  expect([...root.querySelectorAll('li.hw-step')].map(step => [step.getAttribute('data-state'), ...[...step.children].map(child => child.textContent)])).toEqual([['complete', 'Details', 'Complete', 'About you'], ['current', 'Review'], ['upcoming', 'Send', 'Not started', 'Last step']]);
});

it('[TEXT-01][nav-a-14] a missing completeLabel renders no state element on complete steps and warns once', () => {
  const warnings = missingTextWarnings();
  const { root, update } = page(`<hw-stepper label="Progress" upcomingLabel="Not started" [items]="items" current="send" />`, { items: three });
  update();
  expect(root.querySelector('[data-hw-step-status]')).toBeNull();
  expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-stepper requires "completeLabel"']);
});

it('allows explicit step status and an English accessible name', () => {
  const { root } = page(`<hw-stepper label="Progress" ${texts} [items]="items" [activeIndex]="3" />`, { items: [{ value: 'details', label: 'Details', status: 'upcoming' }, { value: 'review', label: 'Review', status: 'current' }, { value: 'send', label: 'Send' }] });
  const list = root.querySelector('ol')!;
  expect(states(list)).toEqual(['upcoming', 'current', 'complete']);
  expect(list.querySelectorAll('[aria-current="step"]')).toHaveLength(1); expect(list.getAttribute('aria-label')).toBe('Progress');
});
