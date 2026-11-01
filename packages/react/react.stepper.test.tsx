import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it } from 'vitest';
import { Stepper } from './src/display.js';
import type { StepItem } from './src/display.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await act(() => root.unmount()); document.body.replaceChildren(); });
const items: StepItem[] = [{ value: 'one', label: 'البيانات' }, { value: 'two', label: 'المراجعة', description: 'راجع البيانات' }, { value: 'three', label: 'الإرسال' }];
it('keeps completed, current and upcoming states synchronized when controlled progress changes', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container); roots.push(root);
  const render = async (activeIndex?: number) => act(() => root.render(<Stepper items={items} current="two" activeIndex={activeIndex} className="custom" />));
  const states = () => [...container.querySelectorAll<HTMLElement>('li')].map(step => step.dataset.state);
  await render(); expect(states()).toEqual(['complete', 'current', 'upcoming']);
  expect(container.querySelector('ol')!.getAttribute('aria-label')).toBe('التقدم');
  expect(container.querySelector('ol')!.classList.contains('custom')).toBe(true);
  await render(2); expect(states()).toEqual(['complete', 'complete', 'current']);
  await render(0); expect(states()).toEqual(['current', 'upcoming', 'upcoming']);
  await render(items.length); expect(states()).toEqual(['complete', 'complete', 'complete']);
  expect(container.querySelector('[aria-current]')).toBeNull();
  for (const invalid of [-1, -2, 1.5, Infinity, NaN, 4]) {
    await render(invalid); expect(states()).toEqual(['upcoming', 'upcoming', 'upcoming']);
  }
  expect(container.querySelector('button, a, [tabindex], [activeindex]')).toBeNull();
});
it('preserves explicit status, English names and static server rendering', () => {
  const html = renderToStaticMarkup(<Stepper items={[{ ...items[0]!, status: 'upcoming' }, { ...items[1]!, status: 'current' }, items[2]!]} activeIndex={3} label="Progress" aria-label="Application progress" />);
  const container = document.createElement('div'); container.innerHTML = html;
  expect([...container.querySelectorAll<HTMLElement>('li')].map(step => step.dataset.state)).toEqual(['upcoming', 'current', 'complete']);
  expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  expect(container.querySelector('ol')!.getAttribute('aria-label')).toBe('Application progress');
});
