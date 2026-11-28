import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { text, withText } from './fixtures/application-text';
import { page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const cities = [{ value: 'riyadh', label: 'Riyadh' }, { value: 'jeddah', label: 'Jeddah' }];
/** Each wrapper host with the element that takes its name: the native control, or the fieldset of a group. */
const controls: [tag: string, attributes: string, named: string][] = [
  ['hw-text-field', '', 'input'], ['hw-textarea', '', 'textarea'], ['hw-select', '[options]="cities"', 'select'], ['hw-checkbox', '', 'input'], ['hw-switch', '', 'input'],
  ['hw-radio-group', '[options]="cities"', 'fieldset'], ['hw-number-field', '', 'input'], ['hw-slider', '', 'input'], ['hw-range-slider', withText.rangeSlider, 'fieldset'],
  ['hw-rating', withText.rating, 'fieldset'], ['hw-toggle-group', '[options]="cities"', 'fieldset'],
  ['hw-combobox', `[options]="cities" ${withText.combobox}`, 'input[role=combobox]'], ['hw-password-field', withText.passwordField, 'input'], ['hw-search-field', 'clearLabel="Clear"', 'input'],
  ['hw-pin-input', '', 'input'], ['hw-tag-input', withText.tagInput, 'input.hw-input'], ['hw-multi-select', `[options]="cities" ${withText.multiSelect}`, 'fieldset'],
  ['hw-file-upload', '', 'input'], ['hw-file-dropzone', 'dropLabel="Drop files here"', 'input'],
];
const forwarded = ['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid'];

describe('attributes on wrapper hosts', () => {
  for (const [tag, attributes, named] of controls) {
    it(`[ATTR-03][fields-basic-2] ${tag}: aria-label, aria-labelledby, aria-describedby and aria-invalid written on the host reach ${named} and leave the host`, () => {
      const { root, update } = page(`<h2 id="heading">Heading</h2><p id="note">Note</p>
        <${tag} ${attributes} aria-label="Static name" aria-describedby="note" aria-invalid="true" />
        <${tag} ${attributes} aria-labelledby="heading" aria-invalid="false" />
        <${tag} ${attributes} [aria-label]="name" [aria-describedby]="described" [aria-invalid]="invalid" />`, { cities, text, name: 'Bound name', described: 'note', invalid: false });
      const hosts = [...root.querySelectorAll(tag)], targets = hosts.map(host => host.querySelector(named)!);
      for (const host of hosts) for (const name of forwarded) expect(host.hasAttribute(name), `${name} on the host`).toBe(false);
      expect(targets[0]!.getAttribute('aria-label')).toBe('Static name'); expect(targets[0]!.getAttribute('aria-describedby')!.split(' ')[0]).toBe('note'); expect(targets[0]!.getAttribute('aria-invalid')).toBe('true');
      expect(targets[1]!.getAttribute('aria-labelledby')).toBe('heading'); expect(targets[1]!.hasAttribute('aria-label')).toBe(false); expect(targets[1]!.hasAttribute('aria-invalid')).toBe(false);
      expect(targets[2]!.getAttribute('aria-label')).toBe('Bound name'); expect(targets[2]!.getAttribute('aria-describedby')!.split(' ')[0]).toBe('note'); expect(targets[2]!.hasAttribute('aria-invalid')).toBe(false);
      update({ name: 'Renamed', described: null as unknown as string, invalid: true });
      expect(targets[2]!.getAttribute('aria-label')).toBe('Renamed'); expect(targets[2]!.getAttribute('aria-invalid')).toBe('true'); expect(hosts[2]!.hasAttribute('aria-label')).toBe(false);
      // No label or legend element is rendered for a control that is named by an attribute alone.
      for (const host of hosts) expect(host.querySelector('legend, label[for]:not(.hw-choice)')?.textContent ?? '').toBe(tag === 'hw-multi-select' ? 'Search options' : '');
    });

    it(`[ATTR-04] ${tag}: the host id, class and style stay on the host and the control keeps controlId`, () => {
      const { root } = page(`<${tag} ${attributes} id="outer" class="mine" style="margin: 1px" controlId="inner" aria-label="Name" />`, { cities, text });
      const host = root.querySelector(tag)!;
      expect(host.id).toBe('outer'); expect(host.classList.contains('mine')).toBe(true); expect(host.getAttribute('style')).toContain('margin');
      const ids = [...root.querySelectorAll('[id]')].map(element => element.id);
      expect(new Set(ids).size).toBe(ids.length); expect(ids.filter(id => id === 'outer')).toHaveLength(1);
      // A group has no single control with the id: its options derive their ids from it.
      expect(ids.some(id => id === 'inner' || id.startsWith('inner-')) || host.querySelector('[name="inner"]') !== null).toBe(true);
    });
  }
});
