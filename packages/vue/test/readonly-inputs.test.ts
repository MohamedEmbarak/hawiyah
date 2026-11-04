import { afterEach, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import type { App } from 'vue';
import { Slider, RangeSlider } from '../src/controls.js';

const apps: App[] = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); });
it('associates a range group with its current validation error', async () => {
  const host = document.createElement('div'); document.body.append(host);
  const error = ref('Review the range');
  const app = createApp({render: () => h(RangeSlider, {label: 'Days', hint: 'Select two bounds', error: error.value, defaultValue: [20, 80]})});
  apps.push(app); app.mount(host);
  const group = host.querySelector('fieldset')!;
  const descriptions = () => group.getAttribute('aria-describedby')!.split(' ').map(id => document.getElementById(id)?.textContent);
  expect(group.getAttribute('aria-invalid')).toBe('true');
  expect(descriptions()).toEqual(['Select two bounds', 'Review the range']);
  error.value = ''; await nextTick();
  expect(group.hasAttribute('aria-invalid')).toBe(false);
  expect(descriptions()).toEqual(['Select two bounds']);
});
it('keeps readonly sliders focusable and does not swallow Escape or browser shortcut keys', () => {
  const host = document.createElement('div'); document.body.append(host);
  const app = createApp({ render: () => h('div', {}, [h(Slider, { readonly: true, defaultValue: 30, label: 'Amount' }), h(RangeSlider, { readonly: true, defaultValue: [20, 80], lowerLabel: 'Minimum', upperLabel: 'Maximum' })]) }); apps.push(app); app.mount(host);
  for (const input of host.querySelectorAll('input[type="range"]')) {
    (input as HTMLInputElement).focus(); expect(document.activeElement).toBe(input); expect(input.getAttribute('aria-readonly')).toBe('true');
    const arrow = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }); input.dispatchEvent(arrow); expect(arrow.defaultPrevented).toBe(true);
    for (const key of ['Tab', 'Escape', 'a']) { const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }); input.dispatchEvent(event); expect(event.defaultPrevented).toBe(false); }
  }
});
