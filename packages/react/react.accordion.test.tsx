import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { Accordion } from './src/display.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await act(() => root.unmount()); document.body.replaceChildren(); });

it('honors controlled disclosure and calls its change callback only once per request', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container); roots.push(root);
  const changed = vi.fn();
  function Example() {
    const [open, setOpen] = useState(false);
    return <Accordion items={[{ value: 'one', title: 'Heading', content: <button>Action</button>, open, onOpenChange(next) { changed(next); setOpen(next); } }]} />;
  }
  await act(() => root.render(<Example />));
  const details = container.querySelector('details')!;
  const summary = container.querySelector('summary')!;
  await act(() => summary.click());
  expect(details.open).toBe(true); expect(changed).toHaveBeenCalledExactlyOnceWith(true);
  await act(() => details.dispatchEvent(new Event('toggle')));
  expect(changed).toHaveBeenCalledOnce();
  await act(() => summary.click());
  expect(details.open).toBe(false); expect(changed).toHaveBeenCalledTimes(2);
  expect(container.querySelector('.nq-accordion-content')!.hasAttribute('inert')).toBe(true);
});

it('closes an uncontrolled exclusive peer and preserves its logical state after rerender', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container); roots.push(root);
  const items = [{ value: 'one', title: 'First', content: 'First body', defaultOpen: true }, { value: 'two', title: 'Second', content: 'Second body' }];
  await act(() => root.render(<Accordion exclusive items={items} />));
  await act(() => container.querySelectorAll('summary')[1]!.click());
  expect([...container.querySelectorAll('details')].map(item => item.open)).toEqual([false, true]);
  await act(() => root.render(<Accordion exclusive items={[...items]} />));
  expect([...container.querySelectorAll('details')].map(item => item.open)).toEqual([false, true]);
});

it('removes the previous group when exclusive changes from true to false', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container); roots.push(root);
  const items = [{ value: 'one', title: 'First', content: 'First body', defaultOpen: true }, { value: 'two', title: 'Second', content: 'Second body' }];
  await act(() => root.render(<Accordion exclusive items={items} />));
  await act(() => root.render(<Accordion exclusive={false} items={items} />));
  await act(() => container.querySelectorAll('summary')[1]!.click());
  expect([...container.querySelectorAll('details')].map(item => item.open)).toEqual([true, true]);
  expect([...container.querySelectorAll('details')].every(item => !item.hasAttribute('name'))).toBe(true);
});
