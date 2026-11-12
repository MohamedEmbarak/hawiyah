import { resetTextWarnings } from '@hawiyah/core';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createStepper } from '../src/stepper.js';
import { enhance } from '../src/index.js';

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });
function setup() {
  const list = document.createElement('ol'); list.className = 'hw-stepper'; list.dataset.hwCompleteLabel = 'مكتملة'; list.dataset.hwUpcomingLabel = 'قادمة';
  list.innerHTML = '<li class="hw-step"><span>البيانات</span></li><li class="hw-step" aria-current="step"><span>المراجعة</span></li><li class="hw-step"><span>الإرسال</span></li>';
  document.body.append(list); return list;
}
it('keeps direct list item state, aria-current and original DOM synchronized and restores on destroy', () => {
  const list = setup(); const before = list.cloneNode(true); const labels = [...list.querySelectorAll('li > span:first-child')];
  const controller = createStepper(list, { label: 'التقدم' });
  const states = () => [...list.querySelectorAll<HTMLElement>('li')].map(step => step.dataset.state);
  expect(controller.activeIndex).toBe(1); expect(states()).toEqual(['complete', 'current', 'upcoming']);
  expect(list.getAttribute('aria-label')).toBe('التقدم');
  controller.setActiveIndex(2); expect(states()).toEqual(['complete', 'complete', 'current']);
  controller.setActiveIndex(0); expect(states()).toEqual(['current', 'upcoming', 'upcoming']);
  controller.setActiveIndex(3); expect(states()).toEqual(['complete', 'complete', 'complete']); expect(list.querySelector('[aria-current]')).toBeNull();
  for (const invalid of [-1, -2, 1.5, Infinity, NaN, 4]) {
    controller.setActiveIndex(invalid); expect(states()).toEqual(['upcoming', 'upcoming', 'upcoming']); expect(controller.activeIndex).toBe(-1);
  }
  expect([...list.querySelectorAll('li > span:first-child')]).toEqual(labels); expect(list.querySelector('button, a, [tabindex]')).toBeNull();
  controller.destroy(); controller.setActiveIndex(2); controller.refresh(); controller.destroy(); expect(list.isEqualNode(before)).toBe(true);
});
it('supports explicit states, accessible labels, dynamic direct items and excludes nested lists', () => {
  const list = setup(); list.setAttribute('aria-labelledby', 'heading');
  list.children[0]!.setAttribute('data-status', 'upcoming'); list.children[1]!.setAttribute('data-status', 'current');
  const controller = createStepper(list, { activeIndex: 3 });
  expect([...list.children].map(step => step.getAttribute('data-state'))).toEqual(['upcoming', 'current', 'complete']);
  expect(list.hasAttribute('aria-label')).toBe(false);
  list.insertAdjacentHTML('beforeend', '<li class="hw-step"><span>New</span><ol><li class="hw-step" data-state="untouched">Nested</li></ol></li>');
  controller.refresh(); expect(list.children[3]!.getAttribute('data-state')).toBe('current');
  expect(list.querySelector('ol')!.querySelector('li')!.getAttribute('data-state')).toBe('untouched');
  controller.destroy(); expect(list.children[3]!.hasAttribute('data-state')).toBe(false);
});
it('enhances declarative markup and retains an explicit English name', () => {
  const list = setup(); list.dataset.hw = 'stepper'; list.dataset.activeIndex = '2'; list.setAttribute('aria-label', 'Progress');
  const before = list.cloneNode(true); const cleanup = enhance(list);
  expect(list.children[2]!.getAttribute('aria-current')).toBe('step'); expect(list.getAttribute('aria-label')).toBe('Progress');
  cleanup(); expect(list.isEqualNode(before)).toBe(true);
});

const statusTexts = (list: HTMLElement) => [...list.children].map(step => step.querySelector(':scope > [data-hw-step-status]')?.textContent ?? null);
it('[STEPPER-01] [STEPPER-02] complete and upcoming steps carry a visually hidden state text after their label', () => {
  const list = setup(); const controller = createStepper(list, { label: 'Progress', completeLabel: 'Completed', upcomingLabel: 'Not started' });
  const [first, second, third] = [...list.children] as HTMLElement[];
  expect(first!.children[1]!.outerHTML).toBe('<span class="hw-sr-only" data-hw-step-status="">Completed</span>');
  expect(third!.children[1]!.textContent).toBe('Not started'); expect(second!.querySelector('[data-hw-step-status]')).toBeNull(); expect(second!.getAttribute('aria-current')).toBe('step');
  controller.destroy(); third!.dataset.status = 'complete'; const again = createStepper(list, { label: 'Progress', completeLabel: 'Completed', upcomingLabel: 'Not started' });
  expect(statusTexts(list)).toEqual(['Completed', null, 'Completed']); again.destroy(); expect(warn).not.toHaveBeenCalled();
});
it('[TEXT-01] a missing completeLabel renders no state span on complete steps and warns once', () => {
  const list = setup(); delete list.dataset.hwCompleteLabel; const controller = createStepper(list, { label: 'Progress' });
  expect(statusTexts(list)).toEqual([null, null, 'قادمة']); controller.setActiveIndex(2);
  expect(warn.mock.calls.filter(([message]: unknown[]) => String(message).includes('"completeLabel"'))).toHaveLength(1); controller.destroy();
});
it('[STEPPER-03] setActiveIndex moves the texts; destroy() removes created spans and restores an authored one', () => {
  const list = setup(); list.children[2]!.insertAdjacentHTML('beforeend', '<span class="hw-sr-only" data-hw-step-status>authored</span>'); const before = list.cloneNode(true);
  const controller = createStepper(list, { label: 'Progress' });
  expect(statusTexts(list)).toEqual(['مكتملة', null, 'قادمة']); controller.setActiveIndex(2);
  expect(statusTexts(list)).toEqual(['مكتملة', 'مكتملة', '']); controller.setActiveIndex(0); expect(statusTexts(list)).toEqual([null, 'قادمة', 'قادمة']);
  controller.destroy(); expect(list.isEqualNode(before)).toBe(true);
});
it('[STEPPER-04] [SHAPE-01] the documented step markup: label span, then the state text, then the description in p.hw-hint', () => {
  const list = setup(); list.children[0]!.insertAdjacentHTML('beforeend', '<p class="hw-hint">Your details</p>');
  const controller = createStepper(list, { label: 'Progress' }); const first = list.children[0]!;
  expect([...first.children].map(node => node.localName + (node.hasAttribute('data-hw-step-status') ? '[status]' : '') + (node.className === 'hw-hint' ? '.hw-hint' : ''))).toEqual(['span', 'span[status]', 'p.hw-hint']);
  expect(list.querySelector('small')).toBeNull(); expect([...list.children].map(step => step.getAttribute('data-state'))).toEqual(['complete', 'current', 'upcoming']); controller.destroy();
});
