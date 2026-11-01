import { afterEach, expect, it, vi } from 'vitest';
import { createAccordion } from '../src/accordion.js';

afterEach(() => document.body.replaceChildren());
it('enhances native details, coordinates named items, emits once and cleans up', () => {
  const root = document.createElement('div');
  root.innerHTML = '<details class="nq-accordion-item" name="test" data-nq-value="a" open><summary>A</summary><div>First</div></details><details class="nq-accordion-item" name="test" data-nq-value="b"><summary>B</summary><div>Second</div></details>';
  document.body.append(root);
  const change = vi.fn(); const controller = createAccordion(root, { onOpenChange: change });
  root.querySelectorAll('summary')[1]!.click();
  expect([...root.querySelectorAll('details')].map(item => item.open)).toEqual([false, true]);
  expect(change.mock.calls).toEqual([['a', false], ['b', true]]);
  root.querySelectorAll('details').forEach(item => item.dispatchEvent(new Event('toggle')));
  expect(change).toHaveBeenCalledTimes(2);
  controller.destroy();
  expect([...root.querySelectorAll('details')].map(item => item.getAttribute('name'))).toEqual(['test', 'test']);
  controller.setOpen('b', false); expect(change).toHaveBeenCalledTimes(2);
});

it('rejects multiple content wrappers so no closing sibling remains keyboard reachable', () => {
  const root = document.createElement('div');
  root.innerHTML = '<details class="nq-accordion-item"><summary>A</summary><div>First</div><button>Outside</button></details>';
  expect(() => createAccordion(root)).toThrow('exactly one content wrapper');
  expect(root.querySelector('summary')!.hasAttribute('aria-expanded')).toBe(false);
});
