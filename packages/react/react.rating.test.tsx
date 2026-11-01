import { afterEach, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Rating } from './src/expanded-controls.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const mounted: ReturnType<typeof createRoot>[] = [];
afterEach(async () => { for (const root of mounted.splice(0)) await act(async () => root.unmount()); document.body.replaceChildren(); });
it('keeps one submitted rating and restores the default on native reset', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); mounted.push(root);
  await act(async () => root.render(<form><Rating label="التقييم" name="rating" defaultValue={3} required /></form>));
  const inputs = [...host.querySelectorAll<HTMLInputElement>('input')];
  expect(inputs.filter(input => input.checked).map(input => input.value)).toEqual(['3']);
  await act(async () => inputs[4]!.click());
  expect(new FormData(host.querySelector('form')!).getAll('rating')).toEqual(['5']);
  await act(async () => host.querySelector('form')!.reset());
  expect(new FormData(host.querySelector('form')!).getAll('rating')).toEqual(['3']);
});
it('keeps readonly radios focusable and rejects clicks and value keys without blocking Tab', async () => {
  const changed = vi.fn(); const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); mounted.push(root);
  await act(async () => root.render(<form><Rating label="التقييم" name="rating" value={3} readOnly onValueChange={changed} /></form>));
  const inputs = [...host.querySelectorAll<HTMLInputElement>('input')];
  await act(async () => inputs[2]!.focus()); expect(document.activeElement).toBe(inputs[2]);
  await act(async () => inputs[4]!.click());
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    await act(async () => inputs[2]!.dispatchEvent(event)); expect(event.defaultPrevented).toBe(true);
  }
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  await act(async () => inputs[2]!.dispatchEvent(tab)); expect(tab.defaultPrevented).toBe(false);
  expect(new FormData(host.querySelector('form')!).getAll('rating')).toEqual(['3']); expect(changed).not.toHaveBeenCalled();
});
