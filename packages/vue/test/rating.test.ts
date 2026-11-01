import { afterEach, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, type App } from 'vue';
import { Rating } from '../src/controls.js';
let app: App | undefined;
afterEach(() => { app?.unmount(); document.body.replaceChildren(); });
function mount(props: Record<string, unknown>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => () => h('form', [h(Rating, { label: 'التقييم', name: 'rating', ...props })]))); app.mount(host);
  return host;
}
it('submits one rating and restores the default after native form reset', async () => {
  const host = mount({ defaultValue: 3, required: true }); const inputs = [...host.querySelectorAll<HTMLInputElement>('input')];
  inputs[4]!.click(); await nextTick(); expect(new FormData(host.querySelector('form')!).getAll('rating')).toEqual(['5']);
  host.querySelector('form')!.reset(); await Promise.resolve(); await nextTick();
  expect(new FormData(host.querySelector('form')!).getAll('rating')).toEqual(['3']);
});
it('retains readonly value and keyboard focus while allowing Tab', async () => {
  const changed = vi.fn(); const host = mount({ modelValue: 3, readonly: true, 'onUpdate:modelValue': changed });
  const inputs = [...host.querySelectorAll<HTMLInputElement>('input')]; inputs[2]!.focus(); expect(document.activeElement).toBe(inputs[2]);
  inputs[4]!.click(); await nextTick();
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }); inputs[2]!.dispatchEvent(event); expect(event.defaultPrevented).toBe(true);
  }
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }); inputs[2]!.dispatchEvent(tab); expect(tab.defaultPrevented).toBe(false);
  expect(new FormData(host.querySelector('form')!).getAll('rating')).toEqual(['3']); expect(changed).not.toHaveBeenCalled();
});
