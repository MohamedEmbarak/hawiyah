import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const options = [{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }, { value: 'map', label: 'Map', disabled: true }];

describe('hw-toggle-group labelHidden', () => {
  it('[tg-label-hidden] hides the legend visually and keeps it first, with its text', () => {
    const { root } = page(`<hw-toggle-group label="View" labelHidden [options]="options" value="list" /><hw-toggle-group label="Layout" [labelHidden]="true" multiple [options]="options" />`, { options });
    for (const [index, text] of ['View', 'Layout'].entries()) {
      const fieldset = root.querySelectorAll('fieldset.hw-toggle-group')[index]!, legend = fieldset.firstElementChild!;
      expect(legend.localName).toBe('legend'); expect(legend.className).toBe('hw-label hw-sr-only'); expect(legend.textContent).toBe(text); expect(fieldset.querySelectorAll('legend')).toHaveLength(1);
    }
  });

  it('[tg-label-visible] leaves the legend visible without labelHidden', () => {
    const { root, update } = page(`<hw-toggle-group label="View" [options]="options" /><hw-toggle-group label="Layout" [labelHidden]="hidden" [options]="options" />`, { options, hidden: false });
    const legends = [...root.querySelectorAll('fieldset.hw-toggle-group > legend')];
    expect(legends.map(legend => legend.className)).toEqual(['hw-label', 'hw-label']);
    update({ hidden: true }); expect(legends[1]!.className).toBe('hw-label hw-sr-only');
    update({ hidden: false }); expect(legends[1]!.className).toBe('hw-label');
  });

  it('[tg-name-unchanged] keeps the legend as the name of the group and the options working, in single and in multiple mode', () => {
    const { root, fixture, state } = page(`<hw-toggle-group label="View" labelHidden [options]="options" [(value)]="single" /><hw-toggle-group label="Filters" labelHidden multiple [options]="options" [(value)]="many" />`, { options, single: 'list' as string | string[], many: [] as string | string[] });
    const [single, many] = [...root.querySelectorAll('fieldset.hw-toggle-group')];
    for (const [fieldset, text] of [[single!, 'View'], [many!, 'Filters']] as const) { expect(fieldset.hasAttribute('aria-label')).toBe(false); expect(fieldset.hasAttribute('aria-labelledby')).toBe(false); expect(fieldset.querySelector('legend')!.textContent).toBe(text); }
    const radios = [...single!.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(radios.map(radio => radio.value)).toEqual(['list', 'grid', 'map']); expect(radios.map(radio => radio.checked)).toEqual([true, false, false]); expect([...single!.querySelectorAll('label')].map(label => label.textContent)).toEqual(['List', 'Grid', 'Map']);
    radios[1]!.click(); fixture.detectChanges(); expect(state.single).toBe('grid');
    const buttons = [...many!.querySelectorAll<HTMLButtonElement>('button.hw-button')];
    expect(buttons.map(button => button.textContent)).toEqual(['List', 'Grid', 'Map']); expect(buttons.map(button => button.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'false']);
    buttons[0]!.click(); fixture.detectChanges(); expect(state.many).toEqual(['list']); expect(buttons[0]!.getAttribute('aria-pressed')).toBe('true');
  });

  it('[tg-hint-error] leaves the hint and error associations as they are', () => {
    const { root, update } = page(`<hw-toggle-group label="View" [labelHidden]="hidden" hint="Choose how results are shown" error="Choose a view" [options]="options" />`, { options, hidden: false });
    const fieldset = root.querySelector('fieldset.hw-toggle-group')!;
    const associations = () => ({ describedBy: fieldset.getAttribute('aria-describedby'), invalid: fieldset.getAttribute('aria-invalid'), hint: fieldset.querySelector('.hw-hint')!.id, error: fieldset.querySelector('.hw-error')!.id });
    const visible = associations();
    expect(visible.describedBy!.split(' ')).toEqual([visible.hint, visible.error]); expect(visible.hint).not.toBe('');
    update({ hidden: true });
    expect(fieldset.querySelector('legend')!.className).toBe('hw-label hw-sr-only'); expect(associations()).toEqual(visible);
  });
});
