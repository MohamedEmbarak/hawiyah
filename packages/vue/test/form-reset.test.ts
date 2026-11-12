import { afterEach, expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, type App, type Component } from 'vue';
import { Checkbox, Select, Switch, Textarea, TextField } from '../src/forms.js';
import { NumberField, RangeSlider, Slider } from '../src/controls.js';
import { ToggleGroup } from '../src/expansion-interactive.js';
import { rangeSliderText } from './texts.js';

let app: App | undefined;
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); });
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
/** The reset is reported in the microtask after a scripted reset; the model is written back on the next tick. */
const settle = async () => { await Promise.resolve(); await nextTick(); await nextTick(); };
const type = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };
const choose = (select: HTMLSelectElement, value: string) => { select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); };
const options = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }];

interface Case {
  name: string; component: Component; props: Record<string, unknown>;
  /** Changes the value as the reader would. */ change(host: HTMLElement): void;
  /** The value the control shows. */ shown(host: HTMLElement): unknown;
  target: unknown; other: unknown; shownTarget: unknown; shownOther: unknown; submittedTarget: string[]; submittedOther: string[];
}
const input = (host: HTMLElement, selector = 'input') => host.querySelector<HTMLInputElement>(selector)!;
const ranges = (host: HTMLElement) => [...host.querySelectorAll<HTMLInputElement>('input[type=range]')];
const cases: Case[] = [
  { name: 'TextField', component: TextField, props: { label: 'Name', defaultValue: 'a' }, change: host => type(input(host), 'b'), shown: host => input(host).value,
    target: 'a', other: 'b', shownTarget: 'a', shownOther: 'b', submittedTarget: ['a'], submittedOther: ['b'] },
  { name: 'Textarea', component: Textarea, props: { label: 'Notes', defaultValue: 'a' }, change: host => type(host.querySelector('textarea')!, 'b'), shown: host => host.querySelector('textarea')!.value,
    target: 'a', other: 'b', shownTarget: 'a', shownOther: 'b', submittedTarget: ['a'], submittedOther: ['b'] },
  { name: 'Select', component: Select, props: { label: 'Letter', options, defaultValue: 'a' }, change: host => choose(host.querySelector('select')!, 'c'), shown: host => host.querySelector('select')!.value,
    target: 'a', other: 'c', shownTarget: 'a', shownOther: 'c', submittedTarget: ['a'], submittedOther: ['c'] },
  { name: 'Checkbox', component: Checkbox, props: { label: 'Agree' }, change: host => input(host).click(), shown: host => input(host).checked,
    target: false, other: true, shownTarget: false, shownOther: true, submittedTarget: [], submittedOther: ['on'] },
  { name: 'Switch', component: Switch, props: { label: 'Alerts' }, change: host => input(host).click(), shown: host => input(host).checked,
    target: false, other: true, shownTarget: false, shownOther: true, submittedTarget: [], submittedOther: ['on'] },
  { name: 'NumberField', component: NumberField, props: { label: 'Count', defaultValue: 3 }, change: host => type(input(host), '7'), shown: host => input(host).value,
    target: 3, other: 7, shownTarget: '3', shownOther: '7', submittedTarget: ['3'], submittedOther: ['7'] },
  { name: 'Slider', component: Slider, props: { label: 'Level', min: 0, max: 10 }, change: host => type(input(host), '8'), shown: host => input(host).value,
    target: 5, other: 8, shownTarget: '5', shownOther: '8', submittedTarget: ['5'], submittedOther: ['8'] },
  { name: 'RangeSlider', component: RangeSlider, props: { ...rangeSliderText, label: 'Price', min: 0, max: 10 }, change: host => type(ranges(host)[0]!, '3'), shown: host => ranges(host).map(range => range.value),
    target: [0, 10], other: [3, 10], shownTarget: ['0', '10'], shownOther: ['3', '10'], submittedTarget: ['0', '10'], submittedOther: ['3', '10'] },
  { name: 'ToggleGroup single', component: ToggleGroup, props: { label: 'Size', options }, change: host => input(host, 'input[value=b]').click(),
    shown: host => [...host.querySelectorAll<HTMLInputElement>('input[type=radio]')].filter(radio => radio.checked).map(radio => radio.value),
    target: '', other: 'b', shownTarget: [], shownOther: ['b'], submittedTarget: [], submittedOther: ['b'] },
  { name: 'ToggleGroup multiple', component: ToggleGroup, props: { label: 'Days', options, multiple: true }, change: host => host.querySelectorAll<HTMLButtonElement>('button')[1]!.click(),
    shown: host => [...host.querySelectorAll('button')].map(button => button.getAttribute('aria-pressed')),
    target: [], other: ['b'], shownTarget: ['false', 'false', 'false'], shownOther: ['false', 'true', 'false'], submittedTarget: [], submittedOther: ['b'] },
];

function uncontrolled(test: Case) {
  const events: unknown[] = [];
  const host = mount(() => h('form', [h(test.component, { ...test.props, name: 'v', 'onUpdate:modelValue': (value: unknown) => events.push(value) })]));
  return { host, form: host.querySelector('form')!, events };
}

for (const test of cases) {
  it(`[RESET-01][RESET-02][fields-basic-8][actions-11] ${test.name}: a changed control returns to its target, shows and submits it, and notifies once`, async () => {
    const { host, form, events } = uncontrolled(test);
    test.change(host); await nextTick();
    expect(test.shown(host)).toEqual(test.shownOther); expect(new FormData(form).getAll('v')).toEqual(test.submittedOther);
    events.length = 0;
    form.reset(); await settle();
    expect(events).toEqual([test.target]);
    expect(test.shown(host)).toEqual(test.shownTarget); expect(new FormData(form).getAll('v')).toEqual(test.submittedTarget);
  });

  it(`[RESET-03][actions-11] ${test.name}: an untouched control does not notify on reset`, async () => {
    const { host, form, events } = uncontrolled(test);
    form.reset(); await settle(); form.reset(); await settle();
    expect(events).toEqual([]); expect(test.shown(host)).toEqual(test.shownTarget);
  });

  it(`[RESET-04] ${test.name}: a bound value that applies the notification agrees with the DOM and FormData`, async () => {
    const value = ref<unknown>(test.other);
    const host = mount(() => h('form', [h(test.component, { ...test.props, name: 'v', modelValue: value.value, 'onUpdate:modelValue': (next: unknown) => { value.value = next; } })]));
    const form = host.querySelector('form')!;
    form.reset(); await settle();
    expect(value.value).toEqual(test.target); expect(test.shown(host)).toEqual(test.shownTarget); expect(new FormData(form).getAll('v')).toEqual(test.submittedTarget);
  });

  it(`[RESET-05][fields-basic-8][actions-v1] ${test.name}: a bound value that ignores the notification is shown and submitted again`, async () => {
    const events: unknown[] = [];
    const host = mount(() => h('form', [h(test.component, { ...test.props, name: 'v', modelValue: test.other, 'onUpdate:modelValue': (next: unknown) => events.push(next) })]));
    const form = host.querySelector('form')!;
    form.reset(); await settle();
    expect(events).toEqual([test.target]);
    expect(test.shown(host)).toEqual(test.shownOther); expect(new FormData(form).getAll('v')).toEqual(test.submittedOther);
  });

  it(`[RESET-06] ${test.name}: a default-prevented reset changes nothing and notifies nothing`, async () => {
    const { host, form, events } = uncontrolled(test);
    test.change(host); await nextTick(); events.length = 0;
    form.addEventListener('reset', event => event.preventDefault());
    form.reset(); await settle();
    expect(events).toEqual([]); expect(test.shown(host)).toEqual(test.shownOther); expect(new FormData(form).getAll('v')).toEqual(test.submittedOther);
  });
}

it('[RESET-07][choices-2] read-only and disabled controls reset like editable ones', async () => {
  const value = ref('b'); const locked = ref('b'); const events: string[] = [];
  const host = mount(() => h('form', [
    h(TextField, { label: 'Read-only', name: 'r', readonly: true, defaultValue: 'a', modelValue: value.value, 'onUpdate:modelValue': (next: string) => { events.push(next); value.value = next; } }),
    h(TextField, { label: 'Disabled', name: 'd', disabled: true, defaultValue: 'a', modelValue: locked.value, 'onUpdate:modelValue': (next: string) => { events.push(next); locked.value = next; } }),
  ]));
  host.querySelector('form')!.reset(); await settle();
  expect(events).toEqual(['a', 'a']); expect([...host.querySelectorAll('input')].map(input => input.value)).toEqual(['a', 'a']);
});

it('[RESET-07][choices-2] never-changed read-only checkbox, slider and toggle group keep their value in the DOM and FormData', async () => {
  const events: unknown[] = []; const record = (next: unknown) => events.push(next);
  const host = mount(() => h('form', [
    h(Checkbox, { label: 'Agree', name: 'c', readonly: true, defaultValue: true, 'onUpdate:modelValue': record }),
    h(Slider, { label: 'Level', name: 's', readonly: true, defaultValue: 7, 'onUpdate:modelValue': record }),
    h(ToggleGroup, { label: 'Size', name: 't', readonly: true, options, defaultValue: 'b', 'onUpdate:modelValue': record }),
  ]));
  const form = host.querySelector('form')!;
  form.reset(); await settle();
  expect(events).toEqual([]);
  expect(host.querySelector<HTMLInputElement>('input.hw-checkbox')!.checked).toBe(true);
  expect(host.querySelector<HTMLInputElement>('input.hw-slider')!.value).toBe('7');
  expect(host.querySelector<HTMLInputElement>('input[value=b]')!.checked).toBe(true);
  const data = new FormData(form);
  expect([data.get('c'), data.get('s'), data.get('t')]).toEqual(['on', '7', 'b']);
});

it('[RESET-08] controls associated with an external form through `form` are reset by that form', async () => {
  const events: unknown[] = []; const record = (next: unknown) => events.push(next);
  const host = mount(() => h('div', [
    h('form', { id: 'external' }),
    h(TextField, { label: 'Name', name: 'n', form: 'external', defaultValue: 'a', 'onUpdate:modelValue': record }),
    h(RangeSlider, { ...rangeSliderText, label: 'Price', name: 'r', form: 'external', min: 0, max: 10, 'onUpdate:modelValue': record }),
    h(ToggleGroup, { label: 'Size', name: 't', form: 'external', options, 'onUpdate:modelValue': record }),
  ]));
  const form = host.querySelector('form')!;
  type(host.querySelector<HTMLInputElement>('input.hw-input')!, 'b');
  type(ranges(host)[0]!, '4');
  host.querySelector<HTMLInputElement>('input[value=c]')!.click();
  await nextTick();
  expect(new FormData(form).getAll('n')).toEqual(['b']); expect(new FormData(form).getAll('r')).toEqual(['4', '10']); expect(new FormData(form).get('t')).toBe('c');
  events.length = 0;
  form.reset(); await settle();
  expect(events).toEqual(['a', [0, 10], '']);
  expect(new FormData(form).getAll('n')).toEqual(['a']); expect(new FormData(form).getAll('r')).toEqual(['0', '10']); expect(new FormData(form).get('t')).toBeNull();
});

it('[SELECT-01][fields-basic-9] a Select with a placeholder and no defaultValue resets to the prompt once', async () => {
  const events: string[] = [];
  const host = mount(() => h('form', [h(Select, { label: 'Letter', name: 's', placeholder: 'Choose', options, 'onUpdate:modelValue': (next: string) => events.push(next) })]));
  const form = host.querySelector('form')!; const select = host.querySelector('select')!;
  choose(select, 'c'); await nextTick(); events.length = 0;
  form.reset(); await settle();
  expect(select.value).toBe(''); expect(new FormData(form).get('s')).toBe(''); expect(events).toEqual(['']);
  form.reset(); await settle();
  expect(events).toEqual(['']);
});

it('[SELECT-02] a Select without placeholder and defaultValue resets to its first enabled option; with defaultValue to that value', async () => {
  const events: string[] = [];
  const host = mount(() => h('form', [
    h(Select, { label: 'First', name: 'f', options: [{ value: 'x', label: 'X', disabled: true }, ...options], 'onUpdate:modelValue': (next: string) => events.push(`f:${next}`) }),
    h(Select, { label: 'Default', name: 'd', options, defaultValue: 'b', 'onUpdate:modelValue': (next: string) => events.push(`d:${next}`) }),
  ]));
  const form = host.querySelector('form')!; const [first, second] = [...host.querySelectorAll('select')];
  choose(first!, 'c'); choose(second!, 'c'); await nextTick(); events.length = 0;
  form.reset(); await settle();
  expect([first!.value, second!.value]).toEqual(['a', 'b']); expect(events).toEqual(['f:a', 'd:b']);
});
