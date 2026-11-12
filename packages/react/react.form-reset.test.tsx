import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { resetTextWarnings } from '@hawiyah/core';
import { Checkbox, NumberField, Radio, RangeSlider, Select, Slider, Switch, Textarea, TextField, ToggleGroup } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); });
afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount());
  document.body.replaceChildren();
  expect((warn.mock.calls as unknown[][]).filter(call => String(call[0]).startsWith('Hawiyah:'))).toEqual([]);
  warn.mockRestore();
});
async function mount(node: ReactNode) {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); roots.push(root);
  await act(async () => root.render(node));
  return { host, root, form: host.querySelector('form')!, render: (next: ReactNode) => act(async () => root.render(next)) };
}
const q = <T extends Element = HTMLInputElement>(host: Element, selector: string) => host.querySelector<T>(selector)!;
function setValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')!.set!.call(element, value);
  element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
}
const reset = (form: HTMLFormElement) => act(async () => { form.reset(); });
const options = [{ value: 'a', label: 'أ' }, { value: 'b', label: 'ب' }, { value: 'c', label: 'ج' }];

it('[RESET-01][fields-basic-8] uncontrolled controls show, submit and hold their reset target', async () => {
  const { host, form } = await mount(<form>
    <TextField name="text" label="الاسم" defaultValue="a" />
    <Textarea name="area" label="الوصف" defaultValue="b" />
    <Select name="select" label="المدينة" options={options} defaultValue="b" />
    <Checkbox name="check" label="موافق" defaultChecked />
    <Switch name="switch" label="تنبيهات" />
    <NumberField name="number" label="العدد" defaultValue="3" />
    <Slider name="slider" label="المستوى" defaultValue={30} />
    <RangeSlider name="range" label="النطاق" lowerLabel="الأدنى" upperLabel="الأعلى" min={10} max={90} />
    <ToggleGroup name="view" label="العرض" options={options} defaultValue="a" />
  </form>);
  await act(async () => {
    setValue(q(host, '[name=text]'), 'x'); setValue(q(host, '[name=area]'), 'y'); setValue(q(host, '[name=select]'), 'c');
    q(host, '[name=check]').click(); q(host, '[name=switch]').click(); setValue(q(host, '[name=number]'), '9');
    setValue(q(host, '[name=slider]'), '80'); setValue(host.querySelectorAll<HTMLInputElement>('[name=range]')[0], '40');
    q(host, '[name=view][value=c]').click();
  });
  expect(new FormData(form).get('slider')).toBe('80'); expect(new FormData(form).getAll('range')).toEqual(['40', '90']); expect(new FormData(form).get('view')).toBe('c');
  await reset(form);
  const data = new FormData(form);
  expect(Object.fromEntries(['text', 'area', 'select', 'check', 'switch', 'number', 'slider', 'view'].map(name => [name, data.get(name)]))).toEqual({ text: 'a', area: 'b', select: 'b', check: 'on', switch: null, number: '3', slider: '30', view: 'a' });
  expect(data.getAll('range')).toEqual(['10', '90']);
  expect(q(host, '[name=view][value=a]').checked).toBe(true);
});

it('[RESET-02][RESET-03][actions-11] composite controls notify once with the target, and only when the reset changed the value', async () => {
  const slider = vi.fn(), range = vi.fn(), single = vi.fn(), multiple = vi.fn(), untouched = vi.fn(), untouchedMultiple = vi.fn(), untouchedDefault = vi.fn();
  const { host, form } = await mount(<form>
    <Slider name="slider" label="المستوى" defaultValue={30} onValueChange={slider} />
    <RangeSlider name="range" label="النطاق" lowerLabel="الأدنى" upperLabel="الأعلى" onValueChange={range} />
    <ToggleGroup name="single" label="فردي" options={options} defaultValue="a" onValueChange={single} />
    <ToggleGroup multiple name="multiple" label="متعدد" options={options} onValueChange={multiple} />
    <ToggleGroup name="untouched" label="دون تغيير" options={options} onValueChange={untouched} />
    <ToggleGroup multiple name="untouched-multiple" label="متعدد دون تغيير" options={options} onValueChange={untouchedMultiple} />
    <ToggleGroup multiple name="untouched-default" label="افتراضي" options={options} defaultValue={['b']} onValueChange={untouchedDefault} />
  </form>);
  await act(async () => {
    setValue(q(host, '[name=slider]'), '70'); setValue(host.querySelectorAll<HTMLInputElement>('[name=range]')[1], '60');
    q(host, '[name=single][value=b]').click();
    host.querySelectorAll<HTMLButtonElement>('button')[1].click();
  });
  for (const spy of [slider, range, single, multiple]) spy.mockClear();
  await reset(form);
  expect(slider.mock.calls).toEqual([[30]]); expect(range.mock.calls).toEqual([[[0, 100]]]);
  expect(single.mock.calls).toEqual([['a']]); expect(multiple.mock.calls).toEqual([[[]]]);
  expect(untouched).not.toHaveBeenCalled(); expect(untouchedMultiple).not.toHaveBeenCalled(); expect(untouchedDefault).not.toHaveBeenCalled();
  await reset(form);
  expect(slider).toHaveBeenCalledTimes(1); expect(single).toHaveBeenCalledTimes(1); expect(multiple).toHaveBeenCalledTimes(1);
});

it('[RESET-04] controlled controls whose application applies the notification agree on the target', async () => {
  function App() {
    const [level, setLevel] = useState(70); const [view, setView] = useState('c'); const [tags, setTags] = useState<string[]>(['a', 'b']);
    return <form>
      <Slider name="slider" label="المستوى" defaultValue={30} value={level} onValueChange={setLevel} />
      <ToggleGroup name="view" label="العرض" options={options} defaultValue="a" value={view} onValueChange={setView} />
      <ToggleGroup multiple name="tags" label="الوسوم" options={options} value={tags} onValueChange={setTags} />
      <output id="state">{`${level}|${view}|${tags.join(',')}`}</output>
    </form>;
  }
  const { host, form } = await mount(<App />);
  await reset(form);
  expect(q(host, '#state').textContent).toBe('30|a|');
  expect(q(host, '[name=slider]').value).toBe('30'); expect(q(host, '[name=view][value=a]').checked).toBe(true);
  expect(Object.fromEntries(new FormData(form))).toEqual({ slider: '30', view: 'a' });
});

it('[RESET-05][fields-basic-8][actions-v1] controlled controls whose application ignores the notification show and submit its value', async () => {
  const ignore = () => undefined; const notified = vi.fn();
  const { host, form } = await mount(<form>
    <Select name="select" label="المدينة" options={options} value="b" onChange={ignore} />
    <Checkbox name="check" label="موافق" checked onChange={ignore} />
    <Radio name="radio" value="r" label="خيار" checked onChange={ignore} />
    <Switch name="switch" label="تنبيهات" checked onChange={ignore} />
    <Slider name="slider" label="المستوى" value={20} onValueChange={notified} />
    <ToggleGroup name="view" label="العرض" options={options} value="c" onValueChange={notified} />
    <ToggleGroup multiple name="tags" label="الوسوم" options={options} value={['b']} onValueChange={notified} />
  </form>);
  await reset(form);
  expect(q<HTMLSelectElement>(host, '[name=select]').value).toBe('b');
  expect([q(host, '[name=check]').checked, q(host, '[name=radio]').checked, q(host, '[name=switch]').checked]).toEqual([true, true, true]);
  expect(q(host, '[name=slider]').value).toBe('20'); expect(q(host, '[name=view][value=c]').checked).toBe(true);
  expect(Object.fromEntries(new FormData(form))).toEqual({ select: 'b', check: 'on', radio: 'r', switch: 'on', slider: '20', view: 'c', tags: 'b' });
  expect(notified.mock.calls).toEqual([[50], [''], [[]]]);
});

it('[RESET-06] a default-prevented reset changes nothing and notifies nothing', async () => {
  const notified = vi.fn();
  const { host, form } = await mount(<form>
    <Slider name="slider" label="المستوى" defaultValue={30} onValueChange={notified} />
    <ToggleGroup name="view" label="العرض" options={options} onValueChange={notified} />
  </form>);
  await act(async () => { setValue(q(host, '[name=slider]'), '70'); q(host, '[name=view][value=b]').click(); });
  notified.mockClear();
  form.addEventListener('reset', event => event.preventDefault());
  await reset(form);
  expect(notified).not.toHaveBeenCalled(); expect(Object.fromEntries(new FormData(form))).toEqual({ slider: '70', view: 'b' });
});

it('[RESET-07][choices-2] read-only and disabled controls reset; untouched read-only controls keep their value', async () => {
  const notified = vi.fn();
  const { host, form } = await mount(<form>
    <Checkbox name="check" label="موافق" defaultChecked readOnly />
    <Slider name="slider" label="المستوى" defaultValue={30} readOnly />
    <ToggleGroup name="view" label="العرض" options={options} defaultValue="b" readOnly />
    <Slider name="disabled" label="معطل" defaultValue={30} value={70} disabled onValueChange={notified} />
    <ToggleGroup name="locked" label="مقفل" options={options} defaultValue="a" value="c" disabled onValueChange={notified} />
  </form>);
  await reset(form);
  expect(Object.fromEntries(new FormData(form))).toEqual({ check: 'on', slider: '30', view: 'b' });
  expect(q(host, '[name=check]').checked).toBe(true);
  expect(notified.mock.calls).toEqual([[30], ['a']]);
});

it('[RESET-08] controls associated with an external form through `form` follow its reset', async () => {
  const notified = vi.fn();
  const { host } = await mount(<div>
    <form id="external" />
    <Slider name="slider" form="external" label="المستوى" defaultValue={30} onValueChange={notified} />
    <ToggleGroup name="view" form="external" label="العرض" options={options} defaultValue="a" onValueChange={notified} />
    <RangeSlider name="range" form="external" label="النطاق" lowerLabel="الأدنى" upperLabel="الأعلى" onValueChange={notified} />
  </div>);
  const form = q<HTMLFormElement>(host, '#external');
  await act(async () => { setValue(q(host, '[name=slider]'), '70'); q(host, '[name=view][value=b]').click(); setValue(host.querySelectorAll<HTMLInputElement>('[name=range]')[0], '20'); });
  expect(new FormData(form).get('slider')).toBe('70'); notified.mockClear();
  await reset(form);
  expect(notified.mock.calls).toEqual([[30], ['a'], [[0, 100]]]);
  expect(new FormData(form).get('view')).toBe('a'); expect(new FormData(form).getAll('range')).toEqual(['0', '100']);
});

it('[RESET-11] native pass-through controls: uncontrolled returns to defaultValue without onChange, controlled keeps the application value', async () => {
  const changed = vi.fn();
  const { host, form } = await mount(<form>
    <TextField name="free" label="حر" defaultValue="a" onChange={changed} />
    <TextField name="held" label="ثابت" value="kept" onChange={changed} />
    <Textarea name="area" label="الوصف" value="kept" onChange={changed} />
  </form>);
  await act(async () => { setValue(q(host, '[name=free]'), 'typed'); });
  changed.mockClear();
  await reset(form);
  expect(changed).not.toHaveBeenCalled();
  expect(Object.fromEntries(new FormData(form))).toEqual({ free: 'a', held: 'kept', area: 'kept' });
});

it('[SELECT-02] Select without defaultValue resets to its first enabled option, with defaultValue to that value', async () => {
  const { host, form } = await mount(<form>
    <Select name="plain" label="بلا افتراضي" options={[{ value: 'x', label: 'س', disabled: true }, ...options]} />
    <Select name="preset" label="افتراضي" options={options} defaultValue="c" />
  </form>);
  await act(async () => { setValue(q<HTMLSelectElement>(host, '[name=plain]'), 'c'); setValue(q<HTMLSelectElement>(host, '[name=preset]'), 'a'); });
  await reset(form);
  expect(Object.fromEntries(new FormData(form))).toEqual({ plain: 'a', preset: 'c' });
});

it('[SSR-03] no reset listener is registered during the server render', () => {
  const listen = vi.spyOn(EventTarget.prototype, 'addEventListener');
  renderToString(<form>
    <TextField name="t" label="ن" /><Textarea name="a" label="و" /><Select name="s" label="م" options={options} /><Checkbox name="c" label="م" /><Radio name="r" label="خ" /><Switch name="w" label="ت" /><NumberField name="n" label="ع" />
    <Slider name="l" label="م" /><RangeSlider name="g" label="ن" lowerLabel="أ" upperLabel="ب" /><ToggleGroup name="v" label="ع" options={options} /><ToggleGroup multiple name="m" label="م" options={options} />
  </form>);
  expect(listen.mock.calls.filter(call => call[0] === 'reset')).toEqual([]);
  listen.mockRestore();
});
