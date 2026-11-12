import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { contentOf, page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const percent = (value: number) => `${value} percent`;
const range = (lower: number, upper: number) => `${lower} to ${upper}`;
const type = (input: HTMLInputElement, value: string) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };

describe('hw-slider value text', () => {
  it('[FMT-03][choices-6] by default there is no output element and no aria-valuetext', () => {
    const { root } = page(`<hw-slider label="Volume" [value]="30" />`);
    expect(root.querySelector('output')).toBeNull(); expect(root.querySelector('input')!.hasAttribute('aria-valuetext')).toBe(false);
  });

  it('[FMT-01] showValue without a formatter: output.hw-slider-value shows the value as it is, and the input has no aria-valuetext', () => {
    const { root, fixture } = page(`<hw-slider controlId="volume" label="Volume" showValue [value]="30" hint="Hint" />`);
    const output = root.querySelector('output')!, input = root.querySelector('input')!;
    expect(output.className).toBe('hw-slider-value'); expect(output.getAttribute('for')).toBe('volume'); expect(output.textContent).toBe('30'); expect(input.hasAttribute('aria-valuetext')).toBe(false);
    expect([...root.querySelector('.hw-field')!.children].map(child => child.localName)).toEqual(['label', 'input', 'output', 'p']);
    type(input, '55'); fixture.detectChanges(); expect(output.textContent).toBe('55');
  });

  it('[FMT-02] formatValue gives the output and aria-valuetext their text, and both follow the value', () => {
    const { root, fixture, update } = page(`<hw-slider label="Volume" showValue [formatValue]="percent" [value]="value" /><hw-slider label="Quiet" [formatValue]="percent" [value]="value" />`, { percent, value: 30 });
    const [shown, quiet] = [...root.querySelectorAll('hw-slider')];
    expect(shown!.querySelector('output')!.textContent).toBe('30 percent'); expect(shown!.querySelector('input')!.getAttribute('aria-valuetext')).toBe('30 percent');
    expect(quiet!.querySelector('output')).toBeNull(); expect(quiet!.querySelector('input')!.getAttribute('aria-valuetext')).toBe('30 percent');
    type(shown!.querySelector('input')!, '55'); fixture.detectChanges(); expect(shown!.querySelector('output')!.textContent).toBe('55 percent'); expect(shown!.querySelector('input')!.getAttribute('aria-valuetext')).toBe('55 percent');
    update({ value: 80 }); expect(quiet!.querySelector('input')!.getAttribute('aria-valuetext')).toBe('80 percent');
  });
});

describe('hw-range-slider structure and value text', () => {
  it('[RANGE-SLIDER-01][choices-9] the fieldset holds the legend, two label.hw-label that each wrap one input.hw-slider, the output, the hint and the error', () => {
    const { root } = page(`<hw-range-slider controlId="price" label="Price" lowerLabel="Minimum" upperLabel="Maximum" [getRangeLabel]="range" [value]="[20, 60]" hint="Hint" error="Error" />`, { range });
    const fieldset = root.querySelector('fieldset.hw-field.hw-range-slider')!;
    expect([...fieldset.children].map(child => `${child.localName}${child.className ? `.${child.className}` : ''}`)).toEqual(['legend.hw-label', 'label.hw-label', 'label.hw-label', 'output.hw-range-slider-value', 'p.hw-hint', 'p.hw-error']);
    const labels = [...fieldset.querySelectorAll(':scope > label')];
    expect(labels.map(label => contentOf(label).map(node => node.nodeType === Node.TEXT_NODE ? node.textContent : `${(node as Element).localName}.${(node as Element).className}#${(node as Element).id}`))).toEqual([['Minimum', 'input.hw-slider#price-lower'], ['Maximum', 'input.hw-slider#price-upper']]);
    for (const label of labels) { expect(label.hasAttribute('for')).toBe(false); expect(label.querySelector('input')!.required).toBe(false); }
    expect(fieldset.querySelector('output')!.getAttribute('for')).toBe('price-lower price-upper'); expect(fieldset.getAttribute('aria-describedby')).toBe('price-hint price-error');
  });

  it('[FMT-02] formatValue gives each thumb its aria-valuetext; without it the inputs have none', () => {
    const { root } = page(`<hw-range-slider lowerLabel="Minimum" upperLabel="Maximum" [formatValue]="percent" [value]="[20, 60]" /><hw-range-slider lowerLabel="Minimum" upperLabel="Maximum" [value]="[20, 60]" readOnly />`, { percent });
    const [formatted, plain] = [...root.querySelectorAll('hw-range-slider')];
    expect([...formatted!.querySelectorAll('input')].map(input => input.getAttribute('aria-valuetext'))).toEqual(['20 percent', '60 percent']);
    expect([...plain!.querySelectorAll('input')].map(input => input.getAttribute('aria-valuetext'))).toEqual([null, null]); expect([...plain!.querySelectorAll('input')].map(input => input.getAttribute('aria-readonly'))).toEqual(['true', 'true']);
  });

  it('[FMT-04][R16] without getRangeLabel no output and no separator is rendered; with it the output shows its result and follows the thumbs', () => {
    const { root, fixture } = page(`<hw-range-slider lowerLabel="Minimum" upperLabel="Maximum" [value]="[20, 60]" /><hw-range-slider lowerLabel="Minimum" upperLabel="Maximum" [getRangeLabel]="range" [value]="[20, 60]" />`, { range });
    const [plain, labelled] = [...root.querySelectorAll('hw-range-slider')];
    expect(plain!.querySelector('output')).toBeNull(); expect(plain!.textContent).toBe('MinimumMaximum');
    const output = labelled!.querySelector('output')!; expect(output.textContent).toBe('20 to 60');
    type(labelled!.querySelectorAll('input')[0]!, '35'); fixture.detectChanges(); expect(output.textContent).toBe('35 to 60');
  });
});
