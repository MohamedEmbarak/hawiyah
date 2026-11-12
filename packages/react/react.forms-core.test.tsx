import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act } from 'react';
import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { resetTextWarnings } from '@hawiyah/core';
import { Checkbox, Field, NumberField, RangeSlider, Select, Slider, Switch, Textarea, TextField, ToggleGroup } from './src/index.js';
import type { ToggleGroupProps } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
let warn: ReturnType<typeof vi.spyOn>;
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
let expected: string[] = [];
beforeEach(() => { resetTextWarnings(); expected = []; warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); });
afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount());
  document.body.replaceChildren();
  expect(warnings()).toEqual(expected);
  warn.mockRestore();
});
async function mount(node: ReactNode) {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); roots.push(root);
  await act(async () => root.render(node));
  return { host, form: host.querySelector('form')!, render: (next: ReactNode) => act(async () => root.render(next)) };
}
const q = <T extends Element = HTMLInputElement>(host: Element, selector: string) => host.querySelector<T>(selector)!;
const children = (element: Element) => Array.from(element.children).map(child => child.localName + (child.className ? `.${child.className.split(' ').join('.')}` : ''));
const options = [{ value: 'a', label: 'أ' }, { value: 'b', label: 'ب' }];
function setValue(element: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

it('[NAME-01][NAME-02][NAME-03][fields-basic-2][choices-3] label, aria-label or aria-labelledby name the control without a warning', async () => {
  const { host } = await mount(<div>
    <h2 id="heading">العنوان</h2>
    <TextField id="labelled" label="الاسم" />
    <TextField id="t" aria-label="الاسم" /><Select id="s" aria-label="المدينة" options={options} /><Checkbox id="c" aria-label="موافق" /><Switch id="w" aria-label="تنبيهات" />
    <Slider id="l" aria-label="المستوى" /><ToggleGroup aria-label="العرض" options={options} /><TextField id="by" aria-labelledby="heading" /><ToggleGroup aria-labelledby="heading" options={options} />
  </div>);
  expect(q(host, 'label[for=labelled]').textContent).toBe('الاسم');
  for (const id of ['t', 's', 'c', 'w', 'l']) expect(q(host, `#${id}`).getAttribute('aria-label')).toBeTruthy();
  expect(host.querySelectorAll('label.hw-label').length).toBe(1);
  expect(host.querySelectorAll('legend').length).toBe(0);
  expect(host.querySelector('fieldset[aria-label]')!.getAttribute('aria-label')).toBe('العرض');
  expect(q(host, '#by').getAttribute('aria-labelledby')).toBe('heading');
});

it('[INV-06][INV-07][MSG-02] error and an explicit aria-invalid set aria-invalid; describedby lists application, hint, error ids once', async () => {
  const { host } = await mount(<div>
    <TextField id="err" label="الاسم" error="مطلوب" />
    <TextField id="explicit" aria-label="الاسم" aria-invalid />
    <TextField id="falsy" aria-label="الاسم" aria-invalid="false" />
    <TextField id="described" label="الاسم" hint="تلميح" error="خطأ" aria-describedby="extra described-hint" />
  </div>);
  expect(q(host, '#err').getAttribute('aria-invalid')).toBe('true');
  expect(q(host, '#explicit').getAttribute('aria-invalid')).toBe('true');
  expect(q(host, '#falsy').getAttribute('aria-invalid')).not.toBe('true');
  expect(q(host, '#described').getAttribute('aria-describedby')).toBe('extra described-hint described-error');
});

it('[NAME-05][REQ-03][fields-basic-3] a control inside Field takes its id, name, descriptions, required and invalid state', async () => {
  const { host } = await mount(<div>
    <Field controlId="city" label="المدينة" hint="تلميح الحقل" error="خطأ الحقل" required><Select options={options} /></Field>
    <Field controlId="name" label="الاسم" required><TextField /></Field>
    <Field controlId="count" label="العدد" hint="تلميح" error="خطأ"><NumberField hint="تلميح الرقم" /></Field>
  </div>);
  const select = q<HTMLSelectElement>(host, 'select');
  expect(select.id).toBe('city'); expect(select.required).toBe(true); expect(select.getAttribute('aria-labelledby')).toBe('city-label');
  expect(select.getAttribute('aria-describedby')).toBe('city-hint city-error'); expect(select.getAttribute('aria-invalid')).toBe('true');
  expect(q(host, '#city-label').lastElementChild!.className).toBe('hw-required-marker');
  expect(q(host, '#name').required).toBe(true);
  const number = q(host, '#count');
  expect(number.getAttribute('aria-labelledby')).toBe('count-label'); expect(number.getAttribute('aria-invalid')).toBe('true');
  expect(number.getAttribute('aria-describedby')!.split(' ').slice(0, 2)).toEqual(['count-hint', 'count-error']);
  const ids = Array.from(host.querySelectorAll('[id]'), element => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(host.querySelectorAll('label.hw-label').length).toBe(3);
});

it('[MSG-01][MSG-03] label, control, hint, error in order; hint and error are p elements and an application error has no role', async () => {
  const { host } = await mount(<div>
    <Field id="field" controlId="f" label="حقل" hint="تلميح" error="خطأ"><input /></Field>
    <TextField id="t" label="الاسم" hint="تلميح" error="خطأ" />
    <Checkbox id="c" label="موافق" hint="تلميح" error="خطأ" />
    <RangeSlider id="r" label="النطاق" lowerLabel="الأدنى" upperLabel="الأعلى" hint="تلميح" error="خطأ" />
  </div>);
  expect(children(q(host, '#field'))).toEqual(['label.hw-label', 'input', 'p.hw-hint', 'p.hw-error']);
  expect(children(q(host, '#t').parentElement!)).toEqual(['label.hw-label', 'input.hw-input', 'p.hw-hint', 'p.hw-error']);
  expect(children(q(host, '#c').closest('.hw-field')!)).toEqual(['label.hw-choice', 'p.hw-hint', 'p.hw-error']);
  expect(q(host, '#t-hint').localName).toBe('p'); expect(q(host, '#t-error').localName).toBe('p'); expect(q(host, '#c-error').localName).toBe('p');
  expect(children(q(host, '#r')).slice(-2)).toEqual(['p.hw-hint', 'p.hw-error']);
  expect(Array.from(host.querySelectorAll('.hw-error'), error => error.getAttribute('role'))).toEqual([null, null, null, null]);
});

it('[TEXT-FIELD-01][fields-basic-10] onFocus and onBlur fire once per focus and blur with a FocusEvent', async () => {
  const focus = vi.fn(), blur = vi.fn();
  const { host } = await mount(<div>
    <TextField id="t" label="ن" onFocus={focus} onBlur={blur} /><Textarea id="a" label="و" onFocus={focus} onBlur={blur} /><Select id="s" label="م" options={options} onFocus={focus} onBlur={blur} />
    <NumberField id="n" label="ع" onFocus={focus} onBlur={blur} /><Checkbox id="c" label="م" onFocus={focus} onBlur={blur} /><Slider id="l" label="م" onFocus={focus} onBlur={blur} />
  </div>);
  for (const id of ['t', 'a', 's', 'n', 'c', 'l']) await act(async () => { q<HTMLElement>(host, `#${id}`).focus(); q<HTMLElement>(host, `#${id}`).blur(); });
  expect(focus).toHaveBeenCalledTimes(6); expect(blur).toHaveBeenCalledTimes(6);
  expect(focus.mock.calls.every(call => call[0].nativeEvent instanceof FocusEvent)).toBe(true);
});

it('[TEXTAREA-01][SELECT-03][CHECKBOX-01][CHECKBOX-02][RICH-01] native pass-through markup', async () => {
  const { host, form } = await mount(<form>
    <Textarea id="plain" label="و" /><Textarea id="rows" label="و" rows={6} />
    <Select name="s" label="م" options={options} defaultValue="c"><option value="c">ج</option><optgroup label="مجموعة"><option value="d">د</option></optgroup></Select>
    <Checkbox name="on" label="أ" defaultChecked /><Switch name="value" value="yes" label="ب" defaultChecked />
    <Checkbox id="rich" label={<a href="#terms">الشروط</a>} />
  </form>);
  expect(q(host, '#plain').hasAttribute('rows')).toBe(false); expect(q(host, '#rows').getAttribute('rows')).toBe('6');
  expect(children(q(host, 'select'))).toEqual(['option', 'option', 'option', 'optgroup']); expect(q<HTMLSelectElement>(host, 'select').value).toBe('c');
  expect(new FormData(form).get('on')).toBe('on'); expect(new FormData(form).get('value')).toBe('yes');
  const label = q(host, '#rich').parentElement!;
  expect(label.className).toBe('hw-choice'); expect(children(label)).toEqual(['input.hw-checkbox', 'a']); expect(label.querySelector('span')).toBeNull();
});

it('[FMT-01][FMT-02][FMT-03][SLIDER-01][choices-6] Slider value output and formatting', async () => {
  const { host, form, render } = await mount(<form><Slider id="plain" name="plain" label="م" /><Slider id="shown" label="م" showValue defaultValue={30} /></form>);
  expect(q(host, '#plain').value).toBe('50'); expect(q(host, '#plain').closest('.hw-field')!.querySelector('output')).toBeNull();
  expect(q(host, '#plain').hasAttribute('aria-valuetext')).toBe(false);
  const output = q(host, '#shown').closest('.hw-field')!.querySelector('output')!;
  expect(output.className).toBe('hw-slider-value'); expect(output.htmlFor.value).toBe('shown'); expect(output.textContent).toBe('30');
  expect(q(host, '#shown').hasAttribute('aria-valuetext')).toBe(false);
  await render(<form><Slider id="plain" name="plain" label="م" /><Slider id="shown" label="م" showValue defaultValue={30} formatValue={value => `${value}٪`} /></form>);
  expect(output.textContent).toBe('30٪'); expect(q(host, '#shown').getAttribute('aria-valuetext')).toBe('30٪');
  await act(async () => { setValue(q(host, '#shown'), '40'); setValue(q(host, '#plain'), '90'); });
  expect(output.textContent).toBe('40٪'); expect(q(host, '#shown').getAttribute('aria-valuetext')).toBe('40٪');
  await act(async () => { form.reset(); });
  expect(q(host, '#plain').value).toBe('50');
});

it('[RANGE-SLIDER-01][RANGE-SLIDER-03][FMT-02][FMT-04][choices-9][R16] RangeSlider structure, names and range text', async () => {
  const props = { id: 'r', name: 'price', form: 'external', label: 'السعر', lowerLabel: 'الأدنى', upperLabel: 'الأعلى' };
  const { host, render } = await mount(<div><form id="external" /><RangeSlider {...props} hint="تلميح" error="خطأ" /></div>);
  const fieldset = q(host, '#r');
  expect(fieldset.className).toBe('hw-field hw-range-slider'); expect(fieldset.hasAttribute('name')).toBe(false); expect(fieldset.hasAttribute('form')).toBe(false);
  expect(children(fieldset)).toEqual(['legend.hw-label', 'label.hw-label', 'label.hw-label', 'p.hw-hint', 'p.hw-error']);
  const [lower, upper] = Array.from(fieldset.querySelectorAll<HTMLInputElement>('input'));
  expect(lower.parentElement!.textContent).toBe('الأدنى'); expect(lower.className).toBe('hw-slider'); expect(upper.parentElement!.localName).toBe('label');
  expect(lower.hasAttribute('aria-valuetext')).toBe(false); expect(lower.hasAttribute('required')).toBe(false);
  expect(new FormData(q<HTMLFormElement>(host, '#external')).getAll('price')).toEqual(['0', '100']);
  expect(fieldset.textContent).not.toMatch(/[–-]/);
  await render(<div><form id="external" /><RangeSlider {...props} lowerName="from" formatValue={value => `${value} ر.س`} getRangeLabel={(from, to) => `من ${from} إلى ${to}`} /></div>);
  expect(new FormData(q<HTMLFormElement>(host, '#external')).getAll('from')).toEqual(['0']);
  expect(new FormData(q<HTMLFormElement>(host, '#external')).getAll('price')).toEqual(['100']);
  expect(lower.getAttribute('aria-valuetext')).toBe('0 ر.س');
  const output = q(host, 'output.hw-range-slider-value');
  expect(output.getAttribute('for')).toBe(`${lower.id} ${upper.id}`); expect(output.textContent).toBe('من 0 إلى 100');
  await act(async () => { setValue(upper, '60'); });
  expect(output.textContent).toBe('من 0 إلى 60'); expect(upper.getAttribute('aria-valuetext')).toBe('60 ر.س');
});

it('[REQ-01][REQ-02][REQ-04][rich-inputs-20][fields-basic-7] one required marker, last child of the label or legend', async () => {
  const { host } = await mount(<div>
    <TextField id="t" label="ن" required /><Textarea id="a" label="و" required /><Select id="s" label="م" options={options} required /><NumberField id="n" label="ع" required />
    <Slider id="l" label="م" required /><RangeSlider id="r" label="ن" lowerLabel="أ" upperLabel="ب" required />
    <ToggleGroup id="g" label="ع" options={options} required /><TextField id="optional" label="ن" />
  </div>);
  for (const id of ['t', 'a', 's', 'n', 'l']) {
    const label = q(host, `label[for=${id}]`);
    expect(label.querySelectorAll('.hw-required-marker').length).toBe(1);
    expect(label.lastElementChild!.outerHTML).toBe('<span class="hw-required-marker" aria-hidden="true"> *</span>');
  }
  for (const id of ['r', 'g']) expect(q(host, `#${id} > legend`).lastElementChild!.className).toBe('hw-required-marker');
  expect(q(host, 'label[for=optional]').querySelector('.hw-required-marker')).toBeNull();
  for (const id of ['t', 'a', 's', 'n']) expect(q(host, `#${id}`).hasAttribute('required')).toBe(true);
  expect(q(host, '#l').hasAttribute('required')).toBe(false);
  expect(Array.from(host.querySelectorAll<HTMLInputElement>('#r input'), input => input.required)).toEqual([false, false]);
  expect(Array.from(host.querySelectorAll<HTMLInputElement>('#g input[type=radio]'), input => input.required)).toEqual([true, true]);
});

it('[TOGGLE-GROUP-01][TOGGLE-GROUP-04][TOGGLE-GROUP-05][MSG-01][actions-9][E02][actions-5] ToggleGroup markup', async () => {
  const { host } = await mount(<div>
    <ToggleGroup id="single" name="view" form="f" label="العرض" options={options} hint="تلميح" error="خطأ" aria-describedby="extra" />
    <ToggleGroup id="multiple" multiple name="tags" form="f" label="الوسوم" options={options} defaultValue={['a']} hint="تلميح" error="خطأ" required />
  </div>);
  const single = q(host, '#single');
  expect(single.hasAttribute('name')).toBe(false); expect(single.hasAttribute('form')).toBe(false);
  expect(children(single)).toEqual(['legend.hw-label', 'label', 'label', 'p.hw-hint', 'p.hw-error']);
  const option = single.querySelector('label')!;
  expect(option.outerHTML).not.toMatch(/hw-choice|hw-radio|data-selected|<span/); expect(children(option)).toEqual(['input']);
  expect(option.querySelector('input')!.getAttribute('name')).toBe('view'); expect(option.querySelector('input')!.getAttribute('form')).toBe('f');
  const hint = single.querySelector('.hw-hint')!.id, error = single.querySelector('.hw-error')!.id;
  expect(single.getAttribute('aria-describedby')).toBe(`extra ${hint} ${error}`); expect(single.getAttribute('aria-invalid')).toBe('true');
  const multiple = q(host, '#multiple');
  expect(children(multiple)).toEqual(['legend.hw-label', 'input', 'button.hw-button', 'button.hw-button', 'p.hw-hint', 'p.hw-error', 'input']);
  const probe = multiple.children[1] as HTMLInputElement;
  expect([probe.type, probe.disabled, probe.getAttribute('form')]).toEqual(['hidden', true, 'f']);
  for (const button of Array.from(multiple.querySelectorAll('button'))) expect([button.dataset.variant, button.dataset.size, button.type, button.hasAttribute('aria-pressed')]).toEqual(['secondary', 'md', 'button', true]);
  expect(multiple.querySelector('legend .hw-required-marker')).toBeNull();
  expect((multiple.lastElementChild as HTMLInputElement).value).toBe('a');
});

it('[NAME-04][E02] a ToggleGroup without a name renders no legend and warns once', async () => {
  const { host } = await mount(<ToggleGroup {...({ options } as unknown as ToggleGroupProps)} />);
  expect(host.querySelector('legend')).toBeNull();
  expected = ['Hawiyah: ToggleGroup requires "label". Hawiyah ships no built-in strings, so the application supplies this text; nothing is rendered in its place.'];
});

it('[INV-01][INV-03][INV-04][INV-05][actions-9] a required single ToggleGroup is invalid after a failed submission until chosen or reset', async () => {
  const { host, form } = await mount(<form><ToggleGroup id="g" name="view" label="العرض" options={options} required /></form>);
  const group = q(host, '#g');
  expect(group.hasAttribute('aria-invalid')).toBe(false);
  await act(async () => { form.requestSubmit(); });
  expect(group.getAttribute('aria-invalid')).toBe('true');
  await act(async () => { q(host, '[value=b]').click(); });
  expect(group.hasAttribute('aria-invalid')).toBe(false);
  await act(async () => { form.reset(); });
  await act(async () => { form.requestSubmit(); });
  expect(group.getAttribute('aria-invalid')).toBe('true');
  await act(async () => { form.reset(); });
  expect(group.hasAttribute('aria-invalid')).toBe(false);
});

it('[SSR-01][SELECT-04] server HTML of a field, a slider, a select with option children and toggle groups equals the first client render', async () => {
  const node = <form>
    <Select name="s" label="م" options={options} defaultValue="c"><option value="c">ج</option><optgroup label="مجموعة"><option value="d">د</option></optgroup></Select>
    <Field controlId="f" label="حقل" required error="خطأ"><TextField /></Field>
    <Slider id="l" label="م" showValue formatValue={value => `${value}٪`} />
    <ToggleGroup name="v" label="ع" options={options} hint="تلميح" error="خطأ" required />
    <ToggleGroup multiple name="m" label="م" options={options} defaultValue={['a']} hint="تلميح" error="خطأ" />
  </form>;
  const host = document.createElement('div'); host.innerHTML = renderToString(node); document.body.append(host);
  const html = host.innerHTML; const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  let root!: ReturnType<typeof hydrateRoot>;
  await act(async () => { root = hydrateRoot(host, node); });
  expect(errors).not.toHaveBeenCalled(); expect(host.innerHTML.replace(/ data-hw-filled="[a-z]+"/g, '')).toBe(html);
  errors.mockRestore(); await act(async () => root.unmount());
});
