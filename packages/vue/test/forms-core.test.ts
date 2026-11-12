import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings } from '@hawiyah/core';
import { Checkbox, Field, Radio, Select, Switch, Textarea, TextField } from '../src/forms.js';
import { MultiSelect, NumberField, RangeSlider, Rating, Slider } from '../src/controls.js';
import { ToggleGroup } from '../src/expansion-interactive.js';
import { multiSelectText, rangeSliderText, ratingText } from './texts.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
const options = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }];
const type = (input: HTMLInputElement, value: string) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };

it('[NAME-01] `label` alone names the control through label[for] or the legend', () => {
  const host = mount(() => h('div', [h(TextField, { label: 'Name' }), h(ToggleGroup, { label: 'Size', options })]));
  const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  expect(host.querySelector(`label[for="${input.id}"]`)!.textContent).toBe('Name');
  expect(host.querySelector('fieldset > legend')!.textContent).toBe('Size');
});

it('[NAME-02][fields-basic-2][choices-3] aria-label alone: no label or legend, the attribute is on the named element, no warning', () => {
  const host = mount(() => h('div', [
    h(TextField, { 'aria-label': 'Name' }), h(Select, { 'aria-label': 'Letter', options }), h(Checkbox, { 'aria-label': 'Agree' }),
    h(Switch, { 'aria-label': 'Alerts' }), h(Slider, { 'aria-label': 'Level' }), h(ToggleGroup, { 'aria-label': 'Size', options }),
  ]));
  expect(host.querySelectorAll('label.hw-label, legend').length).toBe(0);
  expect([...host.querySelectorAll('[aria-label]')].map(node => node.localName)).toEqual(['input', 'select', 'input', 'input', 'input', 'fieldset']);
  expect(warnings()).toEqual([]);
});

it('[NAME-03] aria-labelledby alone pointing at a visible heading: no warning', () => {
  const host = mount(() => h('div', [h('h2', { id: 'heading' }, 'Size'), h(ToggleGroup, { 'aria-labelledby': 'heading', options }), h(TextField, { 'aria-labelledby': 'heading' })]));
  expect(host.querySelector('fieldset')!.getAttribute('aria-labelledby')).toBe('heading');
  expect(host.querySelector('legend')).toBeNull(); expect(warnings()).toEqual([]);
});

it('[NAME-04][E02] ToggleGroup without label, aria-label or aria-labelledby: no legend and one development warning', () => {
  const host = mount(() => h('div', [h(ToggleGroup, { options }), h(ToggleGroup, { options, multiple: true })]));
  expect(host.querySelector('legend')).toBeNull();
  expect(warnings()).toEqual([expect.stringContaining('Hawiyah: ToggleGroup requires "label"')]);
});

it('[NAME-05][fields-basic-3] TextField, Select and NumberField inside Field take the field id, label, descriptions, required and invalid state', () => {
  const host = mount(() => h('div', [
    h(Field, { label: 'Name', hint: 'Full name', error: 'Required', required: true }, () => h(TextField)),
    h(Field, { label: 'Letter', hint: 'One letter' }, () => h(Select, { options, hint: 'Own hint' })),
    h(Field, { label: 'Count' }, () => h(NumberField)),
  ]));
  const fields = [...host.querySelectorAll('.hw-field')].filter(field => field.parentElement === host.firstElementChild);
  const [text, select, number] = [host.querySelector('input.hw-input')!, host.querySelector('select')!, host.querySelector('input.hw-number-field')!];
  for (const [field, control] of [[fields[0]!, text], [fields[1]!, select], [fields[2]!, number]] as const) {
    const label = field.querySelector(':scope > label.hw-label')!;
    expect(label.getAttribute('for')).toBe(control.id);
    expect(control.getAttribute('aria-labelledby')).toBe(label.id);
    expect(field.querySelectorAll('label.hw-label').length).toBe(1);
  }
  expect(text.hasAttribute('required')).toBe(true); expect(text.getAttribute('aria-invalid')).toBe('true');
  expect(text.getAttribute('aria-describedby')).toBe(`${text.id}-hint ${text.id}-error`);
  const ids = [...host.querySelectorAll('[id]')].map(node => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(select.getAttribute('aria-describedby')!.split(' ')).toHaveLength(2);
});

it('[MSG-01][MSG-03] label, control, hint, error in that order; hint and error are p elements without a role (Field, TextField, Checkbox, RangeSlider)', () => {
  const host = mount(() => h('div', [
    h(Field, { label: 'Field', hint: 'H', error: 'E', controlId: 'f' }, () => h('input', { id: 'f' })),
    h(TextField, { id: 't', label: 'Text', hint: 'H', error: 'E' }),
    h(Checkbox, { id: 'c', label: 'Check', hint: 'H', error: 'E' }),
    h(RangeSlider, { ...rangeSliderText, id: 'r', label: 'Range', hint: 'H', error: 'E' }),
  ]));
  for (const id of ['f', 't', 'c']) {
    const field = host.querySelector(`#${id}`)!.closest('.hw-field')!;
    const children = [...field.children].map(child => child.localName + (child.id ? `#${child.id}` : ''));
    expect(children.slice(-2)).toEqual([`p#${id}-hint`, `p#${id}-error`]);
  }
  const range = host.querySelector('fieldset.hw-range-slider')!;
  const rangeId = range.querySelector('input')!.id.replace(/-lower$/, '');
  expect([...range.children].slice(-2).map(child => `${child.localName}#${child.id}`)).toEqual([`p#${rangeId}-hint`, `p#${rangeId}-error`]);
  expect(host.querySelectorAll('span.hw-hint, span.hw-error').length).toBe(0);
  for (const error of host.querySelectorAll('.hw-error')) expect(error.hasAttribute('role')).toBe(false);
});

it('[MSG-02] aria-describedby lists the application ids, the field ids, the hint and the error without duplicates', () => {
  const host = mount(() => h(Field, { hint: 'Field hint' }, () => h(TextField, { id: 'own', 'aria-describedby': 'app own-hint', hint: 'Own hint', error: 'Own error' })));
  const input = host.querySelector('input')!;
  const [fieldHint, ownHint] = [...host.querySelectorAll('p.hw-hint')].reverse();
  const ownError = host.querySelector('p.hw-error')!;
  expect(input.getAttribute('aria-describedby')).toBe(`app own-hint ${fieldHint!.id} ${ownHint!.id} ${ownError.id}`);
});

it('[INV-06][INV-07] `error` or an explicit aria-invalid sets aria-invalid; aria-invalid="false" does not', () => {
  const host = mount(() => h('div', [h(TextField, { label: 'A', error: 'Wrong' }), h(TextField, { label: 'B', 'aria-invalid': 'true' }), h(TextField, { label: 'C', 'aria-invalid': 'false' }), h(TextField, { label: 'D' })]));
  expect([...host.querySelectorAll('input')].map(input => input.getAttribute('aria-invalid'))).toEqual(['true', 'true', 'false', null]);
});

it('[REQ-01][REQ-02][REQ-04][rich-inputs-20][fields-basic-7] one marker as last child of the label or legend; native required except on range inputs', () => {
  const host = mount(() => h('div', [
    h(TextField, { label: 'Text', required: true }), h(Textarea, { label: 'Area', required: true }), h(Select, { label: 'Select', required: true, options }),
    h(NumberField, { label: 'Number', required: true }), h(Slider, { label: 'Slider', required: true }),
    h(RangeSlider, { ...rangeSliderText, label: 'Range', required: true }), h(Rating, { ...ratingText, label: 'Rating', required: true }),
    h(MultiSelect, { ...multiSelectText, label: 'Multi', required: true, options }), h(ToggleGroup, { label: 'Toggle', required: true, options }),
  ]));
  expect(host.querySelectorAll('.hw-required-marker')).toHaveLength(9);
  const labels = [...host.querySelectorAll('.hw-required-marker')].map(marker => marker.parentElement!);
  expect(labels.every(label => label.matches('label.hw-label, legend.hw-label'))).toBe(true);
  for (const label of labels) {
    const markers = label.querySelectorAll('.hw-required-marker');
    expect(markers).toHaveLength(1); expect(label.lastElementChild).toBe(markers[0]);
    expect(markers[0]!.getAttribute('aria-hidden')).toBe('true'); expect(markers[0]!.textContent).toBe(' *');
  }
  for (const control of host.querySelectorAll('input.hw-input:not([type=search]), textarea, select, .hw-toggle-group input[type=radio]')) expect(control.hasAttribute('required')).toBe(true);
  for (const range of host.querySelectorAll('input[type=range]')) expect(range.hasAttribute('required')).toBe(false);
  const plain = mount(() => h('div', [h(TextField, { label: 'Text' }), h(RangeSlider, { ...rangeSliderText, label: 'Range' }), h(ToggleGroup, { label: 'Toggle', options })]));
  expect(plain.querySelectorAll('.hw-required-marker').length).toBe(0);
});

it('[REQ-03] required inherited from Field: marker on the field label and `required` on the control', () => {
  const host = mount(() => h(Field, { label: 'Name', required: true }, () => h(TextField)));
  expect(host.querySelector('label.hw-label')!.lastElementChild!.className).toBe('hw-required-marker');
  expect(host.querySelector('input')!.required).toBe(true);
});

it('[CHECKBOX-01][choices-4] a checked checkbox and switch submit "on" by default and the given value when one is set', () => {
  const host = mount(() => h('form', [
    h(Checkbox, { label: 'A', name: 'a', defaultValue: true }), h(Switch, { label: 'B', name: 'b', defaultValue: true }),
    h(Checkbox, { label: 'C', name: 'c', defaultValue: true, value: 'yes' }), h(Switch, { label: 'D', name: 'd', defaultValue: true, value: 'enabled' }),
  ]));
  const data = new FormData(host.querySelector('form')!);
  expect(['a', 'b', 'c', 'd'].map(name => data.get(name))).toEqual(['on', 'on', 'yes', 'enabled']);
});

it('[CHECKBOX-02][RICH-01] label.hw-choice holds the input and the text with no span; a link given as content names the control', () => {
  const host = mount(() => h('div', [h(Checkbox, { label: 'Plain' }), h(Checkbox, {}, () => ['I accept the ', h('a', { href: '#terms' }, 'terms')])]));
  const [plain, rich] = [...host.querySelectorAll('label.hw-choice')];
  expect([...plain!.childNodes].map(node => node.nodeName)).toEqual(['INPUT', '#text']);
  expect(plain!.querySelector('span')).toBeNull();
  expect(rich!.firstElementChild!.localName).toBe('input'); expect(rich!.querySelector('input + a, a')!.textContent).toBe('terms');
  expect(rich!.textContent).toBe('I accept the terms');
});

it('[RO-04][choices-4] Checkbox, Radio and Switch take `readonly` and expose aria-disabled=true', async () => {
  const changed = vi.fn();
  const host = mount(() => h('div', [h(Checkbox, { label: 'A', readonly: true, 'onUpdate:modelValue': changed }), h(Radio, { label: 'B', name: 'r', readonly: true, 'onUpdate:modelValue': changed }), h(Switch, { label: 'C', readonly: true, 'onUpdate:modelValue': changed })]));
  const inputs = [...host.querySelectorAll('input')];
  expect(inputs.map(input => [input.getAttribute('aria-disabled'), input.disabled])).toEqual([['true', false], ['true', false], ['true', false]]);
  inputs.forEach(input => input.click()); await nextTick();
  expect(inputs.map(input => input.checked)).toEqual([false, false, false]); expect(changed).not.toHaveBeenCalled();
});

it('[TEXT-FIELD-01][fields-basic-10] @focus and @blur fire once per focus and blur with a FocusEvent', () => {
  const events: string[] = [];
  const record = (name: string) => ({ onFocus: (event: FocusEvent) => events.push(`${name}:${event.type}:${event instanceof FocusEvent}`), onBlur: (event: FocusEvent) => events.push(`${name}:${event.type}:${event instanceof FocusEvent}`) });
  const host = mount(() => h('div', [
    h(TextField, { label: 'T', ...record('text') }), h(Textarea, { label: 'A', ...record('area') }), h(Select, { label: 'S', options, ...record('select') }),
    h(NumberField, { label: 'N', ...record('number') }), h(Checkbox, { label: 'C', ...record('check') }), h(Slider, { label: 'R', ...record('slider') }),
  ]));
  for (const control of host.querySelectorAll<HTMLElement>('input, textarea, select')) { control.focus(); control.blur(); }
  expect(events).toEqual(['text', 'area', 'select', 'number', 'check', 'slider'].flatMap(name => [`${name}:focus:true`, `${name}:blur:true`]));
});

it('[TEXTAREA-01] the default textarea has no rows attribute; rows is passed through', () => {
  const host = mount(() => h('div', [h(Textarea, { label: 'A' }), h(Textarea, { label: 'B', rows: 6 })]));
  expect([...host.querySelectorAll('textarea')].map(area => area.getAttribute('rows'))).toEqual([null, '6']);
});

it('[FMT-01][FMT-03][choices-6] Slider shows String(value) only with showValue and writes no aria-valuetext without formatValue', () => {
  const host = mount(() => h('div', [h(Slider, { label: 'Shown', showValue: true, defaultValue: 30 }), h(Slider, { label: 'Hidden', defaultValue: 30 })]));
  const outputs = host.querySelectorAll('output.hw-slider-value');
  expect(outputs).toHaveLength(1);
  const input = host.querySelector<HTMLInputElement>('input.hw-slider')!;
  expect(outputs[0]!.textContent).toBe('30'); expect(outputs[0]!.getAttribute('for')).toBe(input.id);
  expect(outputs[0]!.previousElementSibling).toBe(input);
  expect(host.querySelectorAll('[aria-valuetext]').length).toBe(0);
});

it('[FMT-02][choices-6] formatValue gives the output and aria-valuetext and follows the value', async () => {
  const host = mount(() => h(Slider, { label: 'Level', showValue: true, defaultValue: 30, formatValue: (value: number) => `${value} percent` }));
  const input = host.querySelector<HTMLInputElement>('input')!;
  expect(input.getAttribute('aria-valuetext')).toBe('30 percent'); expect(host.querySelector('output')!.textContent).toBe('30 percent');
  type(input, '40'); await nextTick();
  expect(input.getAttribute('aria-valuetext')).toBe('40 percent'); expect(host.querySelector('output')!.textContent).toBe('40 percent');
});

it('[SLIDER-01][choices-6] a Slider without value and defaultValue starts at (min + max) / 2 and resets to it', async () => {
  const host = mount(() => h('form', [h(Slider, { label: 'Level', name: 's', min: 10, max: 20 })]));
  const input = host.querySelector<HTMLInputElement>('input')!;
  expect(input.value).toBe('15'); type(input, '18'); await nextTick();
  host.querySelector('form')!.reset(); await Promise.resolve(); await nextTick(); await nextTick();
  expect(input.value).toBe('15');
});

it('[RANGE-SLIDER-01][choices-9] fieldset, legend, two labels each wrapping one range input, then output, hint and error', () => {
  const host = mount(() => h(RangeSlider, { ...rangeSliderText, label: 'Price', hint: 'H', error: 'E', getRangeLabel: (lower: number, upper: number) => `${lower} to ${upper}` }));
  const fieldset = host.querySelector('fieldset.hw-field.hw-range-slider')!;
  expect([...fieldset.children].map(child => child.localName + (child.className ? `.${child.className.split(' ').join('.')}` : ''))).toEqual(['legend.hw-label', 'label.hw-label', 'label.hw-label', 'output.hw-range-slider-value', 'p.hw-hint', 'p.hw-error']);
  const [lower, upper] = [...fieldset.querySelectorAll<HTMLInputElement>('label > input.hw-slider[type=range]')];
  expect(lower!.id).toMatch(/-lower$/); expect(upper!.id).toMatch(/-upper$/);
  expect(fieldset.querySelector('output')!.getAttribute('for')).toBe(`${lower!.id} ${upper!.id}`);
});

it('[FMT-02][FMT-04][R16] RangeSlider: formatValue gives each thumb aria-valuetext; getRangeLabel fills the output and follows the thumbs', async () => {
  const host = mount(() => h('div', [
    h(RangeSlider, { ...rangeSliderText, label: 'Formatted', defaultValue: [20, 80], formatValue: (value: number) => `${value} SAR`, getRangeLabel: (lower: number, upper: number) => `${lower} to ${upper}` }),
    h(RangeSlider, { ...rangeSliderText, label: 'Plain', defaultValue: [20, 80] }),
  ]));
  const [formatted, plain] = [...host.querySelectorAll('fieldset')];
  expect([...formatted!.querySelectorAll('input')].map(input => input.getAttribute('aria-valuetext'))).toEqual(['20 SAR', '80 SAR']);
  expect(formatted!.querySelector('output')!.textContent).toBe('20 to 80');
  expect(plain!.querySelector('output')).toBeNull(); expect(plain!.querySelectorAll('[aria-valuetext]').length).toBe(0);
  expect(plain!.textContent).not.toMatch(/[–-]/);
  type(formatted!.querySelector('input')!, '30'); await nextTick();
  expect(formatted!.querySelector('output')!.textContent).toBe('30 to 80'); expect(formatted!.querySelector('input')!.getAttribute('aria-valuetext')).toBe('30 SAR');
});

it('[RANGE-SLIDER-03][choices-8] `name` submits both thumbs, lowerName and upperName override it, `form` reaches both inputs, the fieldset has neither', () => {
  const host = mount(() => h('div', [
    h('form', { id: 'outside' }),
    h('form', { id: 'inside' }, [h(RangeSlider, { ...rangeSliderText, label: 'Shared', name: 'price', defaultValue: [10, 90] }), h(RangeSlider, { ...rangeSliderText, label: 'Split', name: 'ignored', lowerName: 'from', upperName: 'to', defaultValue: [1, 2] })]),
    h(RangeSlider, { ...rangeSliderText, label: 'External', name: 'external', form: 'outside', defaultValue: [3, 4] }),
  ]));
  const [outside, inside] = [...host.querySelectorAll('form')];
  const data = new FormData(inside!);
  expect(data.getAll('price')).toEqual(['10', '90']); expect([data.get('from'), data.get('to'), data.get('ignored')]).toEqual(['1', '2', null]);
  expect(new FormData(outside!).getAll('external')).toEqual(['3', '4']);
  for (const fieldset of host.querySelectorAll('fieldset')) { expect(fieldset.hasAttribute('name')).toBe(false); expect(fieldset.hasAttribute('form')).toBe(false); }
});

it('[TOGGLE-GROUP-01][actions-5] multiple mode: every option is button.hw-button with data-variant=secondary, data-size=md and aria-pressed', () => {
  const host = mount(() => h(ToggleGroup, { label: 'Days', options, multiple: true, defaultValue: ['b'] }));
  expect([...host.querySelectorAll('button')].map(button => [button.className, button.type, button.dataset.variant, button.dataset.size, button.getAttribute('aria-pressed')]))
    .toEqual([['hw-button', 'button', 'secondary', 'md', 'false'], ['hw-button', 'button', 'secondary', 'md', 'true'], ['hw-button', 'button', 'secondary', 'md', 'false']]);
});

it('[TOGGLE-GROUP-04][actions-9][E02] option markup: label > radio + text with no class, span or data-selected; name and form only on the radios', () => {
  const host = mount(() => h(ToggleGroup, { label: 'Size', options, name: 'size', form: 'f', defaultValue: 'a' }));
  const fieldset = host.querySelector('fieldset')!;
  expect(fieldset.hasAttribute('name')).toBe(false); expect(fieldset.hasAttribute('form')).toBe(false);
  for (const label of fieldset.querySelectorAll('label')) {
    expect(label.attributes.length).toBe(0);
    expect([...label.childNodes].map(node => node.nodeName)).toEqual(['INPUT', '#text']);
    const radio = label.querySelector('input')!;
    expect(radio.className).toBe(''); expect([radio.name, radio.getAttribute('form')]).toEqual(['size', 'f']);
  }
});

it('[TOGGLE-GROUP-05][MSG-01][MSG-02][actions-9] multiple mode: probe after the legend, then options, hint, error and the hidden value inputs inside the fieldset', () => {
  const host = mount(() => h(ToggleGroup, { label: 'Days', options, multiple: true, name: 'days', form: 'f', hint: 'H', error: 'E', defaultValue: ['a', 'c'], 'aria-describedby': 'app' }));
  const fieldset = host.querySelector('fieldset')!;
  const children = [...fieldset.children];
  expect(children.map(child => child.localName)).toEqual(['legend', 'input', 'button', 'button', 'button', 'p', 'p', 'input', 'input']);
  const probe = children[1] as HTMLInputElement;
  expect([probe.type, probe.disabled, probe.getAttribute('form')]).toEqual(['hidden', true, 'f']);
  const [hint, error] = [children[5]!, children[6]!];
  expect([hint.className, error.className]).toEqual(['hw-hint', 'hw-error']);
  expect(fieldset.getAttribute('aria-describedby')).toBe(`app ${hint.id} ${error.id}`);
  expect(fieldset.getAttribute('aria-invalid')).toBe('true');
  expect(children.slice(7).map(input => [(input as HTMLInputElement).name, (input as HTMLInputElement).value])).toEqual([['days', 'a'], ['days', 'c']]);
});

it('[INV-01][INV-03][INV-04][INV-05] a required single ToggleGroup is invalid only after a failed submission, until a choice or a reset', async () => {
  const host = mount(() => h('form', [h(ToggleGroup, { label: 'Size', options, name: 'size', required: true })]));
  const form = host.querySelector('form')!; const fieldset = host.querySelector('fieldset')!;
  expect(fieldset.hasAttribute('aria-invalid')).toBe(false);
  expect(form.checkValidity()).toBe(false); await nextTick();
  expect(fieldset.getAttribute('aria-invalid')).toBe('true');
  host.querySelector<HTMLInputElement>('input[value=b]')!.click(); await nextTick();
  expect(fieldset.hasAttribute('aria-invalid')).toBe(false);
  form.reset(); await Promise.resolve(); await nextTick();
  form.checkValidity(); await nextTick(); expect(fieldset.getAttribute('aria-invalid')).toBe('true');
  form.reset(); await Promise.resolve(); await nextTick();
  expect(fieldset.hasAttribute('aria-invalid')).toBe(false);
});

it('[SSR-01] a Slider with showValue and formatValue and ToggleGroups with hint, error and required hydrate without mismatch', async () => {
  const Application = defineComponent(() => () => h('form', [
    h(Slider, { label: 'Level', showValue: true, required: true, formatValue: (value: number) => `${value}%` }),
    h(RangeSlider, { ...rangeSliderText, label: 'Price', required: true, formatValue: (value: number) => `${value}`, getRangeLabel: (lower: number, upper: number) => `${lower}/${upper}`, hint: 'H' }),
    h(ToggleGroup, { label: 'Size', options, required: true, hint: 'H', error: 'E' }),
    h(ToggleGroup, { label: 'Days', options, multiple: true, hint: 'H', error: 'E', defaultValue: ['a'] }),
    h(Field, { label: 'Name', required: true, error: 'E' }, () => h(TextField)),
  ]));
  const markup = await renderToString(createSSRApp(Application));
  const container = document.createElement('div'); container.innerHTML = markup; document.body.append(container);
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const hydrated = createSSRApp(Application);
  try {
    hydrated.mount(container); await nextTick();
    expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
  } finally { hydrated.unmount(); error.mockRestore(); }
});

it('[SSR-03] no reset listener is registered while rendering a form of these controls on the server', async () => {
  const added = vi.spyOn(EventTarget.prototype, 'addEventListener');
  try {
    await renderToString(createSSRApp({ render: () => h('form', [
      h(TextField, { label: 'T' }), h(Textarea, { label: 'A' }), h(Select, { label: 'S', options }), h(Checkbox, { label: 'C' }), h(Radio, { label: 'R' }), h(Switch, { label: 'W' }),
      h(NumberField, { label: 'N' }), h(Slider, { label: 'L' }), h(RangeSlider, { ...rangeSliderText, label: 'G' }), h(Rating, { ...ratingText, label: 'Rate' }), h(ToggleGroup, { label: 'O', options }),
    ]) }));
    expect(added.mock.calls.filter(call => call[0] === 'reset')).toEqual([]);
  } finally { added.mockRestore(); }
});

it('a bound ToggleGroup value is kept in sync with ref updates', async () => {
  const value = ref<string | readonly string[]>('a');
  const host = mount(() => h(ToggleGroup, { label: 'Size', options, modelValue: value.value, 'onUpdate:modelValue': (next: string | readonly string[]) => { value.value = next; } }));
  host.querySelector<HTMLInputElement>('input[value=c]')!.click(); await nextTick();
  expect(value.value).toBe('c');
});
