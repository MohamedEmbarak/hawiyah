import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { text, withText } from './fixtures/application-text';
import { page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const cities = [{ value: 'riyadh', label: 'Riyadh' }, { value: 'jeddah', label: 'Jeddah' }];
/** Every labelled form control of the two clusters, with the element that carries the native requirement: `all` for each radio, none for range inputs and for the controls that explain it in their hint. */
const controls: [name: string, tag: string, attributes: string, native: string | null, all?: boolean][] = [
  ['TextField', 'hw-text-field', '', 'input'], ['Textarea', 'hw-textarea', '', 'textarea'], ['Select', 'hw-select', '[options]="cities"', 'select'], ['NumberField', 'hw-number-field', '', 'input'],
  ['Slider', 'hw-slider', '', null], ['RangeSlider', 'hw-range-slider', withText.rangeSlider, null], ['PasswordField', 'hw-password-field', withText.passwordField, 'input'],
  ['SearchField', 'hw-search-field', 'clearLabel="Clear"', 'input'], ['Combobox', 'hw-combobox', `[options]="cities" ${withText.combobox}`, 'input[role=combobox]'], ['PinInput', 'hw-pin-input', '', 'input'],
  ['TagInput', 'hw-tag-input', withText.tagInput, null], ['MultiSelect', 'hw-multi-select', `[options]="cities" ${withText.multiSelect}`, null], ['Rating', 'hw-rating', withText.rating, 'input', true],
  ['ToggleGroup', 'hw-toggle-group', '[options]="cities"', 'input', true], ['FileUpload', 'hw-file-upload', '', 'input'], ['FileDropzone', 'hw-file-dropzone', 'dropLabel="Drop files here"', 'input'], ['RadioGroup', 'hw-radio-group', '[options]="cities"', 'input', true],
];

describe('required marker', () => {
  for (const [name, tag, attributes, native, all] of controls) {
    it(`[REQ-01][REQ-02][REQ-04][rich-inputs-20][fields-basic-7] ${name}: one marker as the last child of the label or legend when required, none otherwise`, () => {
      const { root } = page(`<${tag} ${attributes} label="Field" required /><${tag} ${attributes} label="Field" />`, { cities, text });
      const [required, optional] = [...root.querySelectorAll(tag)];
      const markers = required!.querySelectorAll('.hw-required-marker');
      expect(markers).toHaveLength(1);
      const marker = markers[0]!, label = marker.parentElement!;
      expect(marker.localName).toBe('span'); expect(marker.textContent).toBe(' *'); expect(marker.getAttribute('aria-hidden')).toBe('true');
      expect(label.matches('label.hw-label, legend.hw-label')).toBe(true); expect(label.lastElementChild).toBe(marker); expect(label.textContent).toBe('Field *');
      expect(optional!.querySelector('.hw-required-marker')).toBeNull(); expect(optional!.querySelector('label.hw-label, legend.hw-label')!.textContent).toBe('Field');
      // The marker is never the only carrier: text-like controls, the select and each radio of a group keep the native attribute; range inputs take none.
      const carriers = native ? [...required!.querySelectorAll<HTMLInputElement>(native)] : [];
      if (native) expect((all ? carriers : carriers.slice(0, 1)).every(control => control.required)).toBe(true);
      else if (tag === 'hw-tag-input' || tag === 'hw-multi-select') expect(required!.querySelector('input.hw-input')!.getAttribute('aria-required')).toBe('true');
      else expect([...required!.querySelectorAll('input')].some(control => control.hasAttribute('required'))).toBe(false);
    });
  }

  it('[REQ-02] the single choices show no marker in label.hw-choice and keep the native requirement', () => {
    const { root } = page(`<hw-checkbox label="Agree" required /><hw-switch label="Notify" required />`);
    expect(root.querySelector('.hw-required-marker')).toBeNull(); expect([...root.querySelectorAll('input')].every(input => input.required)).toBe(true);
  });
});
