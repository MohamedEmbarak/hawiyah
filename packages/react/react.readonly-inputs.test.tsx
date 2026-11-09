import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { Checkbox, Radio, Switch } from './src/forms.js';
import { Slider } from './src/expanded-controls.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await act(() => root.unmount()); document.body.replaceChildren(); });
it('keeps read-only choices focusable and submitted while preventing native toggles and change callbacks', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); roots.push(root);
  const changed = vi.fn(); const clicked = vi.fn();
  await act(() => root.render(<form><Checkbox name="checkbox" value="yes" defaultChecked readOnly label="Checkbox" onClick={clicked} onChange={changed} /><Switch name="switch" value="yes" defaultChecked readOnly label="Switch" onChange={changed} /><Radio name="radio" value="first" defaultChecked readOnly label="First" onChange={changed} /><Radio name="radio" value="second" readOnly label="Second" onChange={changed} /></form>));
  const inputs = [...host.querySelectorAll('input')];
  for (const input of inputs) { input.focus(); expect(document.activeElement).toBe(input); await act(() => input.click()); }
  expect(inputs.map(input => input.checked)).toEqual([true, true, true, false]); expect(changed).not.toHaveBeenCalled(); expect(clicked).toHaveBeenCalledOnce();
  expect([...new FormData(host.querySelector('form')!).entries()]).toEqual([['checkbox', 'yes'], ['switch', 'yes'], ['radio', 'first']]);
  expect(inputs.every(input => input.getAttribute('aria-disabled') === 'true')).toBe(true);
  const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }); inputs[0]!.dispatchEvent(space); expect(space.defaultPrevented).toBe(true);
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }); inputs[0]!.dispatchEvent(tab); expect(tab.defaultPrevented).toBe(false);
});
it('blocks read-only range gestures but preserves focus, native values, consumer handlers and browser keys', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); roots.push(root);
  const changed = vi.fn(); const keyed = vi.fn(); const pointer = vi.fn();
  await act(() => root.render(<form><Slider label="Amount" name="amount" defaultValue={35} readOnly onValueChange={changed} onKeyDown={keyed} onPointerDown={pointer} /></form>));
  const input = host.querySelector('input')!; input.focus(); expect(document.activeElement).toBe(input);
  expect(input.classList.contains('hw-slider')).toBe(true); expect(input.classList.contains('hw-input')).toBe(false); expect(host.querySelector('.hw-field')!.classList.contains('hw-slider')).toBe(false);
  expect(input.disabled).toBe(false); expect(input.getAttribute('aria-readonly')).toBe('true');
  const down = new Event('pointerdown', { bubbles: true, cancelable: true }); input.dispatchEvent(down); expect(down.defaultPrevented).toBe(true); expect(pointer).toHaveBeenCalledOnce();
  for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']) { const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }); input.dispatchEvent(event); expect(event.defaultPrevented).toBe(true); }
  for (const key of ['Tab', 'Escape', 'a']) { const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }); input.dispatchEvent(event); expect(event.defaultPrevented).toBe(false); }
  expect(keyed).toHaveBeenCalledTimes(9); expect(changed).not.toHaveBeenCalled(); expect(new FormData(host.querySelector('form')!).get('amount')).toBe('35');
  await act(() => root.render(<fieldset disabled><Slider label="Amount" defaultValue={35} onValueChange={changed} /></fieldset>));
  const disabledInput = host.querySelector('input')!;
  await act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(disabledInput, '70'); disabledInput.dispatchEvent(new Event('input', { bubbles: true })); });
  expect(changed).not.toHaveBeenCalled(); expect(disabledInput.value).toBe('35');
});
it('preserves an uncontrolled radio selection when switching to readonly and honors consumer cancellation', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); roots.push(root);
  const render = (readOnly: boolean) => act(() => root.render(<form><Radio name="choice" label="First" value="first" defaultChecked readOnly={readOnly} /><Radio name="choice" label="Second" value="second" readOnly={readOnly} /><Checkbox label="Canceled" defaultChecked onClick={event => event.preventDefault()} /></form>));
  await render(false); let inputs = [...host.querySelectorAll('input')]; await act(() => inputs[1]!.click()); expect(inputs.slice(0, 2).map(input => input.checked)).toEqual([false, true]);
  await render(true); inputs = [...host.querySelectorAll('input')]; await act(() => inputs[0]!.click()); expect(inputs.slice(0, 2).map(input => input.checked)).toEqual([false, true]);
  await act(() => inputs[2]!.click()); expect(inputs[2]!.checked).toBe(true);
  await act(async () => { host.querySelector('form')!.reset(); await Promise.resolve(); });
  await act(() => inputs[1]!.click()); expect(inputs.slice(0, 2).map(input => input.checked)).toEqual([true, false]);
  await render(false); await act(() => inputs[0]!.click()); expect(inputs.slice(0, 2).map(input => input.checked)).toEqual([true, false]);
});
