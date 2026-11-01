import { afterEach, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import type { App } from 'vue';
import { Stepper } from '../src/display.js';
import type { StepItem } from '../src/display.js';

const apps: App[] = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); });
const items: StepItem[] = [{ value: 'one', label: 'البيانات' }, { value: 'two', label: 'المراجعة' }, { value: 'three', label: 'الإرسال' }];
it('updates controlled progress in either direction while preserving the legacy value API', async () => {
  const activeIndex = ref<number>();
  const container = document.createElement('div'); document.body.append(container);
  const app = createApp({ render: () => h(Stepper, { items, current: 'two', activeIndex: activeIndex.value, class: 'custom' }) }); apps.push(app); app.mount(container);
  const states = () => [...container.querySelectorAll<HTMLElement>('li')].map(step => step.dataset.state);
  expect(states()).toEqual(['complete', 'current', 'upcoming']);
  expect(container.querySelector('ol')!.getAttribute('aria-label')).toBe('التقدم');
  expect(container.querySelector('ol')!.classList.contains('custom')).toBe(true);
  for (const [value, expected] of [[2, ['complete', 'complete', 'current']], [0, ['current', 'upcoming', 'upcoming']], [3, ['complete', 'complete', 'complete']]] as const) {
    activeIndex.value = value; await nextTick(); expect(states()).toEqual(expected);
  }
  expect(container.querySelector('[aria-current]')).toBeNull();
  for (const invalid of [-1, -2, 1.5, Infinity, NaN, 4]) {
    activeIndex.value = invalid; await nextTick(); expect(states()).toEqual(['upcoming', 'upcoming', 'upcoming']);
  }
  expect(container.querySelector('button, a, [tabindex], [activeindex]')).toBeNull();
});
it('keeps explicit item status higher priority and respects an English accessible name', () => {
  const container = document.createElement('div'); document.body.append(container);
  const app = createApp({ render: () => h(Stepper, { items: [{ ...items[0]!, status: 'upcoming' }, { ...items[1]!, status: 'current' }, items[2]!], activeIndex: 3, label: 'Progress' }) }); apps.push(app); app.mount(container);
  expect([...container.querySelectorAll<HTMLElement>('li')].map(step => step.dataset.state)).toEqual(['upcoming', 'current', 'complete']);
  expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  expect(container.querySelector('ol')!.getAttribute('aria-label')).toBe('Progress');
});
