import { afterEach, expect, it, vi } from 'vitest';
import { createAccordionMotion } from '../src/accordion-motion.js';
import { observeContentNavigation } from '../src/content-navigation.js';
import { observeFieldValue } from '../src/field-value.js';
import { observeFormReset } from '../src/form-reset.js';
import { observeReadonlyChoice } from '../src/readonly-choice.js';
import { observeTabOverflow } from '../src/tab-overflow.js';

// Server DOM implementations (the one bundled with Angular's platform-server, for example)
// have timers but no layout, no getRootNode and array-like, non-iterable child collections.
const without = (element: object, ...names: string[]) => { for (const name of names) Object.defineProperty(element, name, { configurable: true, value: undefined }); };
afterEach(() => { vi.useRealTimers(); document.body.replaceChildren(); });

it('does not measure tabs or start a timer when the DOM has no layout', () => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div><button>One</button><button>Two</button></div>';
  const container = document.querySelector('div')!; const tabs = [...container.querySelectorAll('button')];
  without(container, 'getBoundingClientRect'); tabs.forEach(tab => without(tab, 'getBoundingClientRect'));
  const onChange = vi.fn();
  const observer = observeTabOverflow({ container, tabs: () => tabs, enabled: () => true, onChange });
  observer.refresh();
  expect(vi.getTimerCount()).toBe(0);
  expect(() => vi.runAllTimers()).not.toThrow();
  expect(onChange).not.toHaveBeenCalled();
  expect(() => { observer.destroy(); observer.destroy(); }).not.toThrow();
});

it('does not measure content sections or start a timer when the DOM has no layout', () => {
  vi.useFakeTimers();
  document.body.innerHTML = '<nav><a href="#first" data-hw-section="first">First</a></nav><section id="first">First</section>';
  const navigation = document.querySelector('nav')!;
  without(navigation, 'getBoundingClientRect'); without(document.getElementById('first')!, 'getBoundingClientRect');
  const onCurrentChange = vi.fn();
  const observer = observeContentNavigation({ navigation, getItems: () => [{ id: 'first', label: 'First' }], getScrollRoot: () => null, offset: () => 80, onCurrentChange });
  observer.refresh();
  expect(vi.getTimerCount()).toBe(0);
  expect(observer.navigate('first')).toBe(false);
  expect(onCurrentChange).not.toHaveBeenCalled();
  expect(() => { observer.destroy(); observer.destroy(); }).not.toThrow();
});

it('guards a read-only choice when the input has no getRootNode', async () => {
  document.body.innerHTML = '<form><input type="radio" name="x" value="a" checked><input type="radio" name="x" value="b" readonly></form>';
  const [first, locked] = Array.from(document.querySelectorAll('input'));
  without(locked!, 'getRootNode');
  const guard = observeReadonlyChoice(locked!);
  locked!.click(); await Promise.resolve();
  expect(first!.checked).toBe(true); expect(locked!.checked).toBe(false);
  expect(() => guard.destroy()).not.toThrow();
});

it('observes a form reset and a field value when the control has no getRootNode', async () => {
  document.body.innerHTML = '<form><input name="x" value="initial"></form>';
  const input = document.querySelector('input')!; const form = document.querySelector('form')!;
  without(input, 'getRootNode');
  const onReset = vi.fn(); const resets = observeFormReset(input, onReset); const value = observeFieldValue(input);
  input.value = ''; input.dispatchEvent(new Event('input')); await Promise.resolve();
  expect(input.dataset.hwFilled).toBe('false');
  form.reset(); await Promise.resolve();
  expect(onReset).toHaveBeenCalledTimes(1); expect(input.dataset.hwFilled).toBe('true');
  expect(() => { resets.destroy(); value.destroy(); }).not.toThrow();
});

it('creates accordion motion when child collections are not iterable and getRootNode is missing', () => {
  const details = document.createElement('details');
  details.innerHTML = '<summary>Heading</summary><div>Body</div>'; details.open = true;
  document.body.append(details);
  const [summary, content] = Array.from(details.children) as HTMLElement[];
  Object.defineProperty(details, 'children', { configurable: true, value: { length: 2, 0: summary, 1: content, item: (index: number) => [summary, content][index] } });
  without(details, 'getRootNode');
  const motion = createAccordionMotion(details, content!);
  expect(summary!.getAttribute('aria-expanded')).toBe('true');
  motion.setOpen(false, true);
  expect(details.open).toBe(false); expect(content!.hasAttribute('inert')).toBe(true);
  motion.destroy();
  expect(summary!.hasAttribute('aria-expanded')).toBe(false);
});
