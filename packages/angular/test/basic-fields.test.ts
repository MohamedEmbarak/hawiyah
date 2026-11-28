import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { contentOf, page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const cities = [{ value: 'riyadh', label: 'Riyadh' }, { value: 'jeddah', label: 'Jeddah' }];
const ids = (element: Element, attribute = 'aria-describedby') => (element.getAttribute(attribute) ?? '').split(' ').filter(Boolean);
const noDuplicateIds = (root: Element) => { const all = [...root.querySelectorAll('[id]')].map(element => element.id); expect(new Set(all).size).toBe(all.length); };

describe('names of the basic controls', () => {
  it('[NAME-01] label alone names the control through label for, or the legend of a group', () => {
    const { root } = page(`<hw-text-field label="Name" /><hw-select label="City" [options]="cities" /><hw-checkbox label="Agree" /><hw-switch label="Notify" /><hw-slider label="Volume" /><hw-radio-group label="Branch" [options]="cities" />`, { cities });
    for (const tag of ['hw-text-field', 'hw-select', 'hw-checkbox', 'hw-switch', 'hw-slider']) {
      const host = root.querySelector(tag)!, control = host.querySelector('input, select')!, label = host.querySelector('label')!;
      expect(label.getAttribute('for')).toBe(control.id); expect(control.id).not.toBe(''); expect(control.hasAttribute('aria-label')).toBe(false); expect(control.hasAttribute('aria-labelledby')).toBe(false);
    }
    // The shared label carries an id, as in the other adapters.
    expect(root.querySelector('hw-text-field label')!.id).toBe(`${root.querySelector('hw-text-field input')!.id}-label`);
    expect(root.querySelector('hw-radio-group fieldset > legend.hw-label')!.textContent).toBe('Branch');
  });

  it('[NAME-02][NAME-03][fields-basic-2][choices-3] aria-label or aria-labelledby alone: no label or legend element, the attribute on the named element, no warning', () => {
    const { root } = page(`<h2 id="heading">Heading</h2><hw-text-field aria-label="Name" /><hw-select aria-label="City" [options]="cities" /><hw-checkbox aria-label="Agree" /><hw-switch aria-label="Notify" /><hw-slider aria-label="Volume" /><hw-toggle-group aria-label="View" [options]="cities" />
      <hw-text-field aria-labelledby="heading" /><hw-select aria-labelledby="heading" [options]="cities" /><hw-checkbox aria-labelledby="heading" /><hw-switch aria-labelledby="heading" /><hw-slider aria-labelledby="heading" /><hw-toggle-group aria-labelledby="heading" [options]="cities" />`, { cities });
    for (const tag of ['hw-text-field', 'hw-select', 'hw-checkbox', 'hw-switch', 'hw-slider', 'hw-toggle-group']) {
      const [labelled, labelledBy] = [...root.querySelectorAll(tag)].map(host => host.querySelector(tag === 'hw-toggle-group' ? 'fieldset' : 'input, select')!);
      expect(labelled!.getAttribute('aria-label')).not.toBeNull(); expect(labelledBy!.getAttribute('aria-labelledby')).toBe('heading');
      for (const host of root.querySelectorAll(tag)) { expect(host.querySelector('legend, label.hw-label')).toBeNull(); expect(host.querySelector('label.hw-choice')?.textContent ?? '').toBe(''); }
    }
  });
});

describe('hw-field with Hawiyah controls', () => {
  it('[NAME-05][fields-basic-3] a text field, a select and a number field inside a field take its id, label, descriptions, required and invalid state', () => {
    const { root, update } = page(`<hw-field label="Name" hint="As in the passport" [error]="error" required><hw-text-field name="name" hint="Own hint" /></hw-field>
      <hw-field label="City" hint="Where you live" [error]="error" required><hw-select name="city" [options]="cities" /></hw-field>
      <hw-field label="Amount" hint="In riyals" [error]="error" required aria-describedby="outside"><hw-number-field name="amount" /></hw-field><p id="outside">Outside</p>`, { cities, error: 'Required' });
    for (const [index, field] of [...root.querySelectorAll('hw-field')].entries()) {
      const control = field.querySelector<HTMLInputElement | HTMLSelectElement>('input, select')!, labels = field.querySelectorAll('label');
      expect(labels).toHaveLength(1); expect(labels[0]!.getAttribute('for')).toBe(control.id); expect(labels[0]!.id).toBe(`${control.id}-label`);
      expect(control.getAttribute('aria-labelledby')).toBe(labels[0]!.id); expect(control.required).toBe(true); expect(control.getAttribute('aria-invalid')).toBe('true');
      const described = ids(control);
      expect(described).toContain(`${control.id}-hint`); expect(described).toContain(`${control.id}-error`);
      for (const id of described) expect(root.querySelector(`[id="${id}"]`), id).not.toBeNull();
      if (index === 0) { expect(described).toHaveLength(3); expect(root.querySelector(`[id="${described[2]}"]`)!.textContent).toBe('Own hint'); expect(described[2]).not.toBe(`${control.id}-hint`); }
      if (index === 2) expect(described[0]).toBe('outside');
    }
    for (const host of root.querySelectorAll('hw-field')) expect(host.hasAttribute('aria-describedby')).toBe(false);
    noDuplicateIds(root);
    update({ error: '' });
    for (const control of root.querySelectorAll('hw-field input, hw-field select')) expect(control.hasAttribute('aria-invalid')).toBe(false);
  });

  it('[MSG-01][MSG-03] the order is label, control, hint, error; hint and error are paragraphs with ids from the control id, and the application\'s error has no role', () => {
    const { root } = page(`<hw-field controlId="plain" label="Plain" hint="Hint" error="Error"><input class="hw-input" id="plain"></hw-field><hw-text-field controlId="text" label="Text" hint="Hint" error="Error" /><hw-checkbox controlId="check" label="Check" hint="Hint" error="Error" /><hw-range-slider controlId="range" label="Range" lowerLabel="Minimum" upperLabel="Maximum" hint="Hint" error="Error" />`);
    for (const id of ['plain', 'text', 'check', 'range']) {
      const hint = root.querySelector(`[id="${id}-hint"]`)!, error = root.querySelector(`[id="${id}-error"]`)!, box = hint.parentElement!;
      expect(hint.localName).toBe('p'); expect(hint.className).toBe('hw-hint'); expect(error.localName).toBe('p'); expect(error.className).toBe('hw-error'); expect(error.hasAttribute('role')).toBe(false);
      const children = [...box.children]; expect(children.slice(-2)).toEqual([hint, error]);
      const control = box.querySelector('input')!; expect(control.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(children[0]!.matches('label, legend')).toBe(true);
    }
  });

  it('[MSG-02] aria-describedby lists the application\'s ids, the field\'s ids, the hint and the error, in that order and once each', () => {
    const { root } = page(`<p id="a">A</p><p id="b">B</p><hw-text-field controlId="text" aria-describedby="a b a" hint="Hint" error="Error" /><hw-field controlId="field" hint="Field hint" aria-describedby="b"><hw-text-field aria-describedby="a b" hint="Hint" error="Error" /></hw-field>`);
    expect(ids(root.querySelector('#text')!)).toEqual(['a', 'b', 'text-hint', 'text-error']);
    const inner = root.querySelector('#field')!, described = ids(inner);
    expect(described.slice(0, 3)).toEqual(['a', 'b', 'field-hint']); expect(described).toHaveLength(5); expect(new Set(described).size).toBe(5);
    expect(described.slice(3).map(id => root.querySelector(`[id="${id}"]`)!.textContent)).toEqual(['Hint', 'Error']);
  });

  it('[INV-06][INV-07] error sets aria-invalid on the control, an explicit aria-invalid sets it, and aria-invalid="false" does not', () => {
    const { root } = page(`<hw-text-field controlId="error" error="Error" /><hw-text-field controlId="explicit" aria-invalid="true" /><hw-text-field controlId="no" aria-invalid="false" /><hw-text-field controlId="none" /><hw-select controlId="select" error="Error" [options]="[]" /><hw-radio-group controlId="group" error="Error" [options]="[]" />`);
    expect(['error', 'explicit', 'no', 'none', 'select'].map(id => root.querySelector(`#${id}`)!.getAttribute('aria-invalid'))).toEqual(['true', 'true', null, null, 'true']);
    expect(root.querySelector('hw-radio-group fieldset')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('[REQ-03] required inherited from the field: the marker on the field label and required on the control', () => {
    const { root } = page(`<hw-field label="Name" required><hw-text-field /></hw-field><hw-field label="Other"><hw-text-field /></hw-field>`);
    const [required, optional] = [...root.querySelectorAll('hw-field')];
    const marker = required!.querySelector('label > .hw-required-marker:last-child')!;
    expect(marker.textContent).toBe(' *'); expect(marker.getAttribute('aria-hidden')).toBe('true'); expect(required!.querySelectorAll('.hw-required-marker')).toHaveLength(1); expect(required!.querySelector('input')!.required).toBe(true);
    expect(optional!.querySelector('.hw-required-marker')).toBeNull(); expect(optional!.querySelector('input')!.required).toBe(false);
  });

  it('[FIELD-01] a native control inside hw-field is bound through a template reference, and controlId and label are optional', () => {
    const { root } = page(`<hw-field #f label="City" hint="Hint" error="Error" required aria-describedby="outside"><select class="hw-select" [id]="f.controlId" [required]="f.required" [attr.aria-describedby]="f.descriptionIds" [attr.aria-invalid]="f.invalid ? 'true' : null"><option>Riyadh</option></select></hw-field><hw-field #g><input class="hw-input" [id]="g.controlId" [attr.aria-labelledby]="g.labelId"></hw-field>`);
    const select = root.querySelector('select')!, id = select.id;
    expect(id).toMatch(/^hw-field-/); expect(root.querySelector('label')!.getAttribute('for')).toBe(id); expect(select.required).toBe(true); expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(ids(select)).toEqual(['outside', `${id}-hint`, `${id}-error`]);
    const bare = root.querySelectorAll('hw-field')[1]!; expect(bare.querySelector('label')).toBeNull(); expect(bare.querySelector('input')!.hasAttribute('aria-labelledby')).toBe(false); expect(bare.querySelector('input')!.id).toMatch(/^hw-field-/);
  });
});

describe('basic controls', () => {
  it('[TEXT-FIELD-01][fields-basic-10] focused and blurred fire once per focus and blur of the native control, with the event', () => {
    const { root, state } = page(`<hw-text-field (focused)="seen('text focus', $event)" (blurred)="seen('text blur', $event)" /><hw-textarea (focused)="seen('area focus', $event)" (blurred)="seen('area blur', $event)" /><hw-select [options]="cities" (focused)="seen('select focus', $event)" (blurred)="seen('select blur', $event)" /><hw-number-field (focused)="seen('number focus', $event)" (blurred)="seen('number blur', $event)" /><hw-checkbox (focused)="seen('check focus', $event)" (blurred)="seen('check blur', $event)" /><hw-slider (focused)="seen('slider focus', $event)" (blurred)="seen('slider blur', $event)" readOnly />`, { cities, seen: vi.fn() });
    for (const control of root.querySelectorAll<HTMLElement>('input, textarea, select')) { control.focus(); control.blur(); }
    expect(state.seen.mock.calls.map(call => call[0])).toEqual(['text', 'area', 'select', 'number', 'check', 'slider'].flatMap(name => [`${name} focus`, `${name} blur`]));
    expect(state.seen.mock.calls.every(call => call[1] instanceof FocusEvent)).toBe(true);
  });

  it('[SELECT-03][fields-basic-5] projected option and optgroup elements follow the options of the input, notify their value and are selected by a bound value, also when they arrive later', () => {
    const { root, state, update } = page(`<hw-select label="City" name="city" placeholder="Choose" [options]="cities" [value]="value" (valueChange)="changed($event)"><option value="abha">Abha</option><optgroup label="North">@if (late) {<option value="tabuk">Tabuk</option>}</optgroup></hw-select>`, { cities, value: 'abha', late: false, changed: vi.fn() });
    const select = root.querySelector<HTMLSelectElement>('select.hw-select')!;
    expect([...select.children].map(child => `${child.localName}:${child.getAttribute('value') ?? child.getAttribute('label')}`)).toEqual(['option:', 'option:riyadh', 'option:jeddah', 'option:abha', 'optgroup:North']);
    expect(select.value).toBe('abha');
    select.value = 'riyadh'; select.dispatchEvent(new Event('change', { bubbles: true })); expect(state.changed).toHaveBeenLastCalledWith('riyadh');
    // The value is set before its option exists; the select shows it once the option is rendered.
    update({ value: 'tabuk' }); expect(select.value).not.toBe('tabuk');
    update({ late: true }); expect(select.value).toBe('tabuk'); expect([...new FormData(document.createElement('form')).entries()]).toEqual([]);
    select.value = 'abha'; select.dispatchEvent(new Event('change', { bubbles: true })); expect(state.changed).toHaveBeenLastCalledWith('abha');
  });

  it('[TEXTAREA-01][fields-basic-6] a textarea has no rows attribute unless the application gives one', () => {
    const { root } = page(`<hw-textarea /><hw-textarea [rows]="6" />`);
    const [plain, tall] = [...root.querySelectorAll('textarea')];
    expect(plain!.hasAttribute('rows')).toBe(false); expect(tall!.getAttribute('rows')).toBe('6');
  });

  it('[CHECKBOX-01][choices-4] a checked checkbox and switch submit "on" by default and submitValue when it is given', () => {
    const { root } = page(`<form><hw-checkbox name="a" label="A" [value]="true" /><hw-checkbox name="b" label="B" [value]="true" submitValue="accepted" /><hw-switch name="c" label="C" [value]="true" /><hw-switch name="d" label="D" [value]="true" submitValue="yes" /><hw-checkbox name="e" label="E" submitValue="no" /></form>`);
    expect([...new FormData(root.querySelector('form')!).entries()]).toEqual([['a', 'on'], ['b', 'accepted'], ['c', 'on'], ['d', 'yes']]);
    expect(root.querySelector('input[name=a]')!.hasAttribute('value')).toBe(false); expect(root.querySelector('input[name=b]')!.getAttribute('value')).toBe('accepted');
  });

  it('[CHECKBOX-02][RICH-01] label.hw-choice holds the input and then the text, without a span; projected content is the label when label is not given', () => {
    const { root } = page(`<hw-checkbox label="Agree" /><hw-switch label="Notify" /><hw-radio-group [options]="cities" /><hw-checkbox>I accept the <a href="https://example.org/terms">terms</a></hw-checkbox><hw-switch>Send <strong>news</strong></hw-switch><hw-checkbox label="Wins">Projected</hw-checkbox>`, { cities });
    const choices = [...root.querySelectorAll('label.hw-choice')];
    expect(choices).toHaveLength(7);
    for (const choice of choices) { expect(choice.querySelector('span')).toBeNull(); expect(contentOf(choice)[0]).toBe(choice.querySelector('input')); }
    expect(choices.map(choice => choice.textContent)).toEqual(['Agree', 'Notify', 'Riyadh', 'Jeddah', 'I accept the terms', 'Send news', 'Wins']);
    const link = choices[4]!.querySelector('a')!; expect(link.previousSibling!.textContent).toBe('I accept the '); expect(choices[4]!.getAttribute('for')).toBe(choices[4]!.querySelector('input')!.id);
  });
});
