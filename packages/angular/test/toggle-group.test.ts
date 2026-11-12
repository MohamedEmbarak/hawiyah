import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { attributesOf, contentOf, page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const options = [{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }, { value: 'map', label: 'Map', disabled: true }];
const settle = async (fixture: { detectChanges(): void }) => { await Promise.resolve(); await Promise.resolve(); fixture.detectChanges(); };

describe('hw-toggle-group markup', () => {
  it('[TOGGLE-GROUP-01][actions-5] in multiple mode every option is button.hw-button with data-variant secondary, data-size md and aria-pressed', () => {
    const { root } = page(`<hw-toggle-group label="Views" multiple readOnly [options]="options" [value]="['grid']" />`, { options });
    const buttons = [...root.querySelectorAll('fieldset.hw-toggle-group > button')];
    expect(buttons.map(button => attributesOf(button))).toEqual([
      { type: 'button', class: 'hw-button', 'data-variant': 'secondary', 'data-size': 'md', 'aria-disabled': 'true', 'aria-pressed': 'false' },
      { type: 'button', class: 'hw-button', 'data-variant': 'secondary', 'data-size': 'md', 'aria-disabled': 'true', 'aria-pressed': 'true' },
      { type: 'button', class: 'hw-button', 'data-variant': 'secondary', 'data-size': 'md', 'aria-disabled': 'true', 'aria-pressed': 'false', disabled: '' },
    ]);
  });

  it('[TOGGLE-GROUP-04][actions-9][E02] a single option is label > input[type=radio] + text without class, span or data-selected; name and form are on the radios, never on the fieldset', () => {
    const { root } = page(`<form id="outer"></form><hw-toggle-group label="View" name="view" form="outer" [options]="options" value="grid" />`, { options });
    const fieldset = root.querySelector('fieldset.hw-toggle-group')!;
    expect(fieldset.hasAttribute('name')).toBe(false); expect(fieldset.hasAttribute('form')).toBe(false); expect(fieldset.getAttribute('data-variant')).toBe('segmented');
    const labels = [...fieldset.querySelectorAll(':scope > label')];
    expect(labels).toHaveLength(3);
    for (const [index, label] of labels.entries()) {
      const [radio, text] = contentOf(label) as [HTMLInputElement, Text];
      expect(contentOf(label)).toHaveLength(2); expect(label.attributes).toHaveLength([...label.attributes].filter(attribute => /^_ng/.test(attribute.name)).length);
      expect(radio.localName).toBe('input'); expect(radio.type).toBe('radio'); expect(radio.hasAttribute('class')).toBe(false); expect(radio.hasAttribute('data-selected')).toBe(false);
      expect(radio.name).toBe('view'); expect(radio.getAttribute('form')).toBe('outer'); expect(text.nodeType).toBe(Node.TEXT_NODE); expect(text.textContent).toBe(options[index]!.label);
    }
    expect(new FormData(root.querySelector('form')!).get('view')).toBe('grid');
  });

  it('[TOGGLE-GROUP-05] in multiple mode a disabled hidden probe with the form value follows the legend, and the value inputs are inside the fieldset after hint and error', () => {
    const { root } = page(`<form id="outer"></form><hw-toggle-group label="Views" name="views" form="outer" multiple hint="Hint" error="Error" [options]="options" [value]="['list', 'grid', 'map']" />`, { options });
    const fieldset = root.querySelector('fieldset.hw-toggle-group')!, children = [...fieldset.children];
    expect(children.map(child => child.localName)).toEqual(['legend', 'input', 'button', 'button', 'button', 'p', 'p', 'input', 'input']);
    const probe = children[1] as HTMLInputElement; expect(probe.type).toBe('hidden'); expect(probe.disabled).toBe(true); expect(probe.getAttribute('form')).toBe('outer'); expect(probe.hasAttribute('name')).toBe(false);
    // A disabled option is not submitted.
    expect(children.slice(-2).map(input => attributesOf(input))).toEqual([{ type: 'hidden', name: 'views', form: 'outer', value: 'list' }, { type: 'hidden', name: 'views', form: 'outer', value: 'grid' }]);
    expect(new FormData(root.querySelector('form')!).getAll('views')).toEqual(['list', 'grid']); expect(root.querySelector('hw-toggle-group > input')).toBeNull();
  });

  it('[MSG-01][MSG-02][actions-9] hint and error are paragraphs after the options, and the fieldset is described by the application\'s ids, the hint and the error', () => {
    const { root } = page(`<p id="note">Note</p><hw-toggle-group controlId="view" label="View" aria-describedby="note" hint="Hint" error="Error" [options]="options" />`, { options });
    const fieldset = root.querySelector('fieldset')!;
    expect([...fieldset.children].slice(-2).map(child => `${child.localName}.${child.className}#${child.id}`)).toEqual(['p.hw-hint#view-hint', 'p.hw-error#view-error']);
    expect(fieldset.getAttribute('aria-describedby')).toBe('note view-hint view-error'); expect(fieldset.getAttribute('aria-invalid')).toBe('true'); expect(fieldset.querySelector('.hw-error')!.hasAttribute('role')).toBe(false);
  });
});

describe('hw-toggle-group required and reset', () => {
  it('[REQ-01][REQ-02][REQ-04] required in single mode: one marker as last child of the legend and required on every radio; none otherwise, and none in multiple mode', () => {
    const { root } = page(`<hw-toggle-group label="View" required [options]="options" /><hw-toggle-group label="Free" [options]="options" /><hw-toggle-group label="Views" required multiple [options]="options" />`, { options });
    const [required, free, multiple] = [...root.querySelectorAll('fieldset')];
    const marker = required!.querySelector('legend > .hw-required-marker:last-child')!;
    expect(marker.textContent).toBe(' *'); expect(marker.getAttribute('aria-hidden')).toBe('true'); expect(required!.querySelectorAll('.hw-required-marker')).toHaveLength(1);
    expect([...required!.querySelectorAll('input')].every(radio => radio.required)).toBe(true);
    expect(free!.querySelector('.hw-required-marker')).toBeNull(); expect([...free!.querySelectorAll('input')].some(radio => radio.required)).toBe(false); expect(multiple!.querySelector('.hw-required-marker')).toBeNull();
  });

  it('[INV-01][INV-03][INV-04][INV-05] a failed submission marks the required group invalid until an option is chosen or the form resets', async () => {
    const { root, fixture } = page(`<form><hw-toggle-group label="View" name="view" required [options]="options" /></form>`, { options });
    const form = root.querySelector('form')!, fieldset = root.querySelector('fieldset')!, radios = fieldset.querySelectorAll('input');
    expect(fieldset.hasAttribute('aria-invalid')).toBe(false);
    const seen: boolean[] = []; radios[0]!.addEventListener('invalid', event => seen.push(event.defaultPrevented));
    expect(form.checkValidity()).toBe(false); fixture.detectChanges();
    expect(fieldset.getAttribute('aria-invalid')).toBe('true'); expect(seen).toEqual([false]);
    radios[1]!.click(); fixture.detectChanges(); expect(fieldset.hasAttribute('aria-invalid')).toBe(false);
    form.reset(); await settle(fixture); expect(form.checkValidity()).toBe(false); fixture.detectChanges(); expect(fieldset.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await settle(fixture); expect(fieldset.hasAttribute('aria-invalid')).toBe(false);
  });

  it('[RESET-02][RESET-03][actions-11][actions-v1] a reset reports the initial selection once when it changed, never otherwise; the empty value of a multiple group is an array', async () => {
    const changed = vi.fn();
    const { root, fixture } = page(`<form><hw-toggle-group label="A" name="a" [options]="options" (valueChange)="changed('a', $event)" /><hw-toggle-group label="B" name="b" multiple [options]="options" (valueChange)="changed('b', $event)" /><hw-toggle-group label="C" name="c" [options]="options" value="grid" (valueChange)="changed('c', $event)" /><hw-toggle-group label="D" name="d" multiple [options]="options" [value]="['grid']" (valueChange)="changed('d', $event)" /></form>`, { options, changed });
    const form = root.querySelector('form')!, groups = [...root.querySelectorAll('fieldset')];
    form.reset(); await settle(fixture); expect(changed).not.toHaveBeenCalled();
    groups[0]!.querySelectorAll('input')[1]!.click(); groups[1]!.querySelectorAll('button')[0]!.click(); groups[2]!.querySelectorAll('input')[0]!.click(); groups[3]!.querySelectorAll('button')[0]!.click(); fixture.detectChanges();
    expect(changed.mock.calls).toEqual([['a', 'grid'], ['b', ['list']], ['c', 'list'], ['d', ['grid', 'list']]]); changed.mockClear();
    form.reset(); await settle(fixture);
    expect(changed.mock.calls).toEqual([['a', ''], ['b', []], ['c', 'grid'], ['d', ['grid']]]);
    expect([...new FormData(form).entries()]).toEqual([['c', 'grid'], ['d', 'grid']]);
    expect([...groups[2]!.querySelectorAll('input')].map(radio => radio.checked)).toEqual([false, true, false]); expect([...groups[3]!.querySelectorAll('button')].map(button => button.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
    form.reset(); await settle(fixture); expect(changed).toHaveBeenCalledTimes(4);
  });
});
