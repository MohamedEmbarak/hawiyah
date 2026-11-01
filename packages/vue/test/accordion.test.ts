import { afterEach, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import type { App } from 'vue';
import { Accordion } from '../src/display.js';

const apps: App[] = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); });
it('supports controlled changes without duplicate native toggle notifications', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const open = ref(false); const changed = vi.fn();
  const app = createApp(defineComponent(() => () => h(Accordion, {
    items: [{ value: 'one', title: 'Heading', content: 'Content', open: open.value }],
    onToggle: (_value, next) => { changed(next); open.value = next; },
  }))); apps.push(app); app.mount(container);
  container.querySelector('summary')!.click(); await nextTick();
  expect(container.querySelector('details')!.open).toBe(true);
  container.querySelector('details')!.dispatchEvent(new Event('toggle')); await nextTick();
  expect(changed).toHaveBeenCalledExactlyOnceWith(true);
  open.value = false; await nextTick();
  expect(container.querySelector('details')!.open).toBe(false);
  expect(container.querySelector('.nq-accordion-content')!.hasAttribute('inert')).toBe(true);
  expect(changed).toHaveBeenCalledOnce();
});

it('keeps native disclosure interactive with open:false and no update listener', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const app = createApp(Accordion, { items: [{ value: 'one', title: 'Heading', content: 'Content', open: false }] });
  apps.push(app); app.mount(container);
  container.querySelector('summary')!.click(); await nextTick();
  expect(container.querySelector('details')!.open).toBe(true);
});
