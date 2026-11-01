import { afterEach, expect, it } from 'vitest';
import { createStepper } from '../src/stepper.js';
import { enhance } from '../src/index.js';

afterEach(() => document.body.replaceChildren());
function setup() {
  const list = document.createElement('ol'); list.className = 'nq-stepper';
  list.innerHTML = '<li class="nq-step"><span>البيانات</span></li><li class="nq-step" aria-current="step"><span>المراجعة</span></li><li class="nq-step"><span>الإرسال</span></li>';
  document.body.append(list); return list;
}
it('keeps direct list item state, aria-current and original DOM synchronized and restores on destroy', () => {
  const list = setup(); const before = list.cloneNode(true); const labels = [...list.querySelectorAll('span')];
  const controller = createStepper(list);
  const states = () => [...list.querySelectorAll<HTMLElement>('li')].map(step => step.dataset.state);
  expect(controller.activeIndex).toBe(1); expect(states()).toEqual(['complete', 'current', 'upcoming']);
  expect(list.getAttribute('aria-label')).toBe('التقدم');
  controller.setActiveIndex(2); expect(states()).toEqual(['complete', 'complete', 'current']);
  controller.setActiveIndex(0); expect(states()).toEqual(['current', 'upcoming', 'upcoming']);
  controller.setActiveIndex(3); expect(states()).toEqual(['complete', 'complete', 'complete']); expect(list.querySelector('[aria-current]')).toBeNull();
  for (const invalid of [-1, -2, 1.5, Infinity, NaN, 4]) {
    controller.setActiveIndex(invalid); expect(states()).toEqual(['upcoming', 'upcoming', 'upcoming']); expect(controller.activeIndex).toBe(-1);
  }
  expect([...list.querySelectorAll('span')]).toEqual(labels); expect(list.querySelector('button, a, [tabindex]')).toBeNull();
  controller.destroy(); controller.setActiveIndex(2); controller.refresh(); controller.destroy(); expect(list.isEqualNode(before)).toBe(true);
});
it('supports explicit states, accessible labels, dynamic direct items and excludes nested lists', () => {
  const list = setup(); list.setAttribute('aria-labelledby', 'heading');
  list.children[0]!.setAttribute('data-status', 'upcoming'); list.children[1]!.setAttribute('data-status', 'current');
  const controller = createStepper(list, { activeIndex: 3 });
  expect([...list.children].map(step => step.getAttribute('data-state'))).toEqual(['upcoming', 'current', 'complete']);
  expect(list.hasAttribute('aria-label')).toBe(false);
  list.insertAdjacentHTML('beforeend', '<li class="nq-step"><span>New</span><ol><li class="nq-step" data-state="untouched">Nested</li></ol></li>');
  controller.refresh(); expect(list.children[3]!.getAttribute('data-state')).toBe('current');
  expect(list.querySelector('ol')!.querySelector('li')!.getAttribute('data-state')).toBe('untouched');
  controller.destroy(); expect(list.children[3]!.hasAttribute('data-state')).toBe(false);
});
it('enhances declarative markup and retains an explicit English name', () => {
  const list = setup(); list.dataset.nq = 'stepper'; list.dataset.activeIndex = '2'; list.setAttribute('aria-label', 'Progress');
  const before = list.cloneNode(true); const cleanup = enhance(list);
  expect(list.children[2]!.getAttribute('aria-current')).toBe('step'); expect(list.getAttribute('aria-label')).toBe('Progress');
  cleanup(); expect(list.isEqualNode(before)).toBe(true);
});
