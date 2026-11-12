import './fixtures/texts';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as hawiyah from '@hawiyah/angular';
import { page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const cities = [{ value: 'riyadh', label: 'Riyadh' }, { value: 'jeddah', label: 'Jeddah' }];
const rating = (value: number, max: number) => `${value} of ${max}`;
const type = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };
const choose = (select: HTMLSelectElement, value: string) => { select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); };

interface Case { name: string; tag: string; attributes: string; initial: unknown; changed: unknown; given: string; start: unknown; change(host: HTMLElement): void }
/** One control of the forms cluster each: how the reader changes it, and the value it then holds. `given` is a template expression for an initial value, `start` that value. */
const cases: Case[] = [
  { name: 'TextField', tag: 'hw-text-field', attributes: 'name="f"', initial: '', changed: 'typed', given: "'first'", start: 'first', change: host => type(host.querySelector('input')!, 'typed') },
  { name: 'Textarea', tag: 'hw-textarea', attributes: 'name="f"', initial: '', changed: 'typed', given: "'first'", start: 'first', change: host => type(host.querySelector('textarea')!, 'typed') },
  { name: 'Select', tag: 'hw-select', attributes: 'name="f" placeholder="Choose" [options]="cities"', initial: '', changed: 'jeddah', given: "'riyadh'", start: 'riyadh', change: host => choose(host.querySelector('select')!, 'jeddah') },
  { name: 'Checkbox', tag: 'hw-checkbox', attributes: 'name="f" label="Agree"', initial: false, changed: true, given: 'true', start: true, change: host => host.querySelector('input')!.click() },
  { name: 'Switch', tag: 'hw-switch', attributes: 'name="f" label="Notify"', initial: false, changed: true, given: 'true', start: true, change: host => host.querySelector('input')!.click() },
  { name: 'RadioGroup', tag: 'hw-radio-group', attributes: 'name="f" [options]="cities"', initial: '', changed: 'jeddah', given: "'riyadh'", start: 'riyadh', change: host => host.querySelectorAll('input')[1]!.click() },
  { name: 'NumberField', tag: 'hw-number-field', attributes: 'name="f"', initial: null, changed: 7, given: '3', start: 3, change: host => type(host.querySelector('input')!, '7') },
  { name: 'Slider', tag: 'hw-slider', attributes: 'name="f"', initial: 0, changed: 70, given: '35', start: 35, change: host => type(host.querySelector('input')!, '70') },
  { name: 'RangeSlider', tag: 'hw-range-slider', attributes: 'lowerName="low" upperName="high" lowerLabel="Minimum" upperLabel="Maximum"', initial: [0, 100], changed: [30, 100], given: '[20, 80]', start: [20, 80], change: host => type(host.querySelector('input')!, '30') },
  { name: 'Rating', tag: 'hw-rating', attributes: 'name="f" [getRatingLabel]="rating"', initial: 0, changed: 4, given: '2', start: 2, change: host => host.querySelectorAll('input')[3]!.click() },
  { name: 'ToggleGroup', tag: 'hw-toggle-group', attributes: 'name="f" label="View" [options]="cities"', initial: '', changed: 'jeddah', given: "'riyadh'", start: 'riyadh', change: host => host.querySelectorAll('input')[1]!.click() },
  { name: 'ToggleGroup multiple', tag: 'hw-toggle-group', attributes: 'name="f" label="Views" multiple [options]="cities"', initial: [], changed: ['jeddah'], given: "['riyadh']", start: ['riyadh'], change: host => host.querySelectorAll('button')[1]!.click() },
];

function mount(entry: Case, extra = '', template = (control: string) => `<form>${control}</form>`) {
  const changed = vi.fn();
  const view = page(template(`<${entry.tag} ${entry.attributes} ${extra} (valueChange)="changed($event)" />`), { cities, rating, changed, readOnly: false, disabled: false });
  const host = view.root.querySelector<HTMLElement>(entry.tag)!, form = view.root.querySelector('form')!;
  const component = view.fixture.debugElement.query(By.css(entry.tag)).componentInstance as { value: unknown };
  const submitted = () => [...new FormData(form).entries()].map(([name, value]) => `${name}=${String(value)}`);
  /** A reset from script is reported in the next microtask; the render shows hidden inputs and bound state. */
  const reset = async () => { form.reset(); await Promise.resolve(); await Promise.resolve(); view.fixture.detectChanges(); };
  return { ...view, host, form, component, changed, submitted, reset };
}

describe('native form reset without Angular Forms', () => {
  for (const entry of cases) {
    it(`[RESET-01][RESET-02][fields-basic-8] ${entry.name}: after a change and a reset the shown, submitted and held value are the initial value, reported once`, async () => {
      const view = mount(entry);
      const before = view.submitted();
      entry.change(view.host); view.fixture.detectChanges();
      expect(view.component.value).toEqual(entry.changed); expect(view.submitted()).not.toEqual(before); expect(view.changed).toHaveBeenCalledTimes(1);
      await view.reset();
      expect(view.component.value).toEqual(entry.initial); expect(view.submitted()).toEqual(before);
      expect(view.changed).toHaveBeenCalledTimes(2); expect(view.changed).toHaveBeenLastCalledWith(entry.initial);
      // A second reset finds nothing to change.
      await view.reset(); expect(view.changed).toHaveBeenCalledTimes(2); expect(view.submitted()).toEqual(before);
    });

    it(`[RESET-03] ${entry.name}: a reset that changes nothing reports nothing, with and without an initial value`, async () => {
      for (const extra of ['', `[value]="${entry.given}"`]) {
        const view = mount(entry, extra);
        const before = view.submitted(), held = view.component.value;
        await view.reset();
        expect(view.changed).not.toHaveBeenCalled(); expect(view.submitted()).toEqual(before); expect(view.component.value).toEqual(held);
      }
    });

    it(`[RESET-05] ${entry.name}: with an initial value that the application does not write again, held, shown and submitted value agree on it after the reset`, async () => {
      const view = mount(entry, `[value]="${entry.given}"`);
      const before = view.submitted(), initial = entry.start;
      expect(view.component.value).toEqual(initial);
      entry.change(view.host); view.fixture.detectChanges();
      if (entry.name !== 'Checkbox' && entry.name !== 'Switch') expect(view.submitted()).not.toEqual(before);
      await view.reset();
      expect(view.component.value).toEqual(initial); expect(view.submitted()).toEqual(before); expect(view.changed).toHaveBeenLastCalledWith(initial);
    });

    it(`[RESET-06] ${entry.name}: a default-prevented reset changes nothing and reports nothing`, async () => {
      const view = mount(entry);
      entry.change(view.host); view.fixture.detectChanges();
      const after = view.submitted();
      view.form.addEventListener('reset', event => event.preventDefault());
      await view.reset();
      expect(view.component.value).toEqual(entry.changed); expect(view.submitted()).toEqual(after); expect(view.changed).toHaveBeenCalledTimes(1);
    });

    it(`[RESET-08] ${entry.name}: the form input associates the control with a form elsewhere, which submits and resets it`, async () => {
      const view = mount(entry, 'form="outer"', control => `<form id="outer"></form>${control}`);
      const before = view.submitted();
      for (const control of view.host.querySelectorAll('input, select, textarea')) expect(control.getAttribute('form')).toBe('outer');
      expect(view.host.querySelector('fieldset[form], fieldset[name]')).toBeNull();
      entry.change(view.host); view.fixture.detectChanges();
      expect(view.submitted()).not.toEqual(before);
      await view.reset();
      expect(view.component.value).toEqual(entry.initial); expect(view.submitted()).toEqual(before); expect(view.changed).toHaveBeenLastCalledWith(entry.initial);
    });
  }

  it('[RESET-04] with [(value)] the application applies the notification: its model, the DOM and FormData agree on the initial value', async () => {
    const view = page(`<form><hw-text-field name="text" [(value)]="text" /><hw-checkbox name="check" label="Agree" [(value)]="check" /><hw-toggle-group name="views" label="Views" multiple [options]="cities" [(value)]="views" /><hw-slider name="level" [(value)]="level" /></form>`, { cities, text: 'first', check: true, views: ['riyadh'] as string | string[], level: 35 });
    const form = view.root.querySelector('form')!, submitted = () => [...new FormData(form).entries()].map(([name, value]) => `${name}=${String(value)}`);
    const model = () => ({ text: view.state.text, check: view.state.check, views: view.state.views, level: view.state.level });
    const before = submitted();
    type(view.root.querySelector('hw-text-field input')!, 'typed'); view.root.querySelector<HTMLInputElement>('hw-checkbox input')!.click(); view.root.querySelectorAll<HTMLButtonElement>('hw-toggle-group button')[1]!.click(); type(view.root.querySelector('hw-slider input')!, '70'); view.fixture.detectChanges();
    expect(model()).toEqual({ text: 'typed', check: false, views: ['riyadh', 'jeddah'], level: 70 }); expect(submitted()).not.toEqual(before);
    form.reset(); await Promise.resolve(); await Promise.resolve(); view.fixture.detectChanges();
    expect(model()).toEqual({ text: 'first', check: true, views: ['riyadh'], level: 35 }); expect(submitted()).toEqual(before);
    expect(view.root.querySelector<HTMLInputElement>('hw-text-field input')!.value).toBe('first'); expect(view.root.querySelector<HTMLInputElement>('hw-checkbox input')!.checked).toBe(true);
  });

  it('[RESET-07][choices-2] read-only and disabled controls are reset like editable ones, and a read-only control that never changed keeps its value', async () => {
    const view = page(`<form><hw-text-field name="text" [readOnly]="locked" (valueChange)="changed('text', $event)" /><hw-select name="select" placeholder="Choose" [options]="cities" [disabled]="locked" (valueChange)="changed('select', $event)" /><hw-toggle-group name="view" label="View" [options]="cities" [readOnly]="locked" (valueChange)="changed('view', $event)" />
      <hw-checkbox name="kept" label="Kept" readOnly [value]="true" (valueChange)="changed('kept', $event)" /><hw-slider name="level" readOnly [value]="35" (valueChange)="changed('level', $event)" /><hw-toggle-group name="fixed" label="Fixed" readOnly [options]="cities" value="jeddah" (valueChange)="changed('fixed', $event)" /></form>`, { cities, locked: false, changed: vi.fn() });
    const form = view.root.querySelector('form')!, submitted = () => [...new FormData(form).entries()].map(([name, value]) => `${name}=${String(value)}`);
    expect(submitted()).toEqual(['text=', 'select=', 'kept=on', 'level=35', 'fixed=jeddah']);
    type(view.root.querySelector('hw-text-field input')!, 'typed'); choose(view.root.querySelector('select')!, 'jeddah'); view.root.querySelectorAll<HTMLInputElement>('hw-toggle-group input')[0]!.click();
    view.update({ locked: true }); view.state.changed.mockClear();
    expect(submitted()).toEqual(['text=typed', 'view=riyadh', 'kept=on', 'level=35', 'fixed=jeddah']);
    form.reset(); await Promise.resolve(); await Promise.resolve(); view.fixture.detectChanges();
    expect(view.state.changed.mock.calls).toEqual([['text', ''], ['select', ''], ['view', '']]);
    expect(submitted()).toEqual(['text=', 'kept=on', 'level=35', 'fixed=jeddah']);
    expect(view.root.querySelector<HTMLSelectElement>('select')!.value).toBe(''); expect(view.root.querySelector<HTMLInputElement>('hw-checkbox input')!.checked).toBe(true); expect(view.root.querySelector<HTMLInputElement>('hw-slider input')!.value).toBe('35');
  });
});

describe('native form reset with Angular Forms', () => {
  const imports = [ReactiveFormsModule, FormsModule, ...Object.values(hawiyah).filter(value => typeof value === 'function' && 'ɵcmp' in value)] as never[];
  function mount<T extends object>(Host: new () => T, template: string) {
    Component({ standalone: true, imports, template })(Host);
    const fixture = TestBed.createComponent(Host); document.body.append(fixture.nativeElement); fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const reset = async () => { form.reset(); await fixture.whenStable(); await Promise.resolve(); await Promise.resolve(); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); };
    return { fixture, form, reset, submitted: () => [...new FormData(form).entries()].map(([name, value]) => `${name}=${String(value)}`) };
  }

  it('[RESET-10] in a form group the form model owns the value: the DOM shows what Angular Forms wrote and the component reports nothing itself', async () => {
    class Host {
      changed = vi.fn(); cities = cities;
      group = new FormGroup({ text: new FormControl('first'), kept: new FormControl('same', { nonNullable: true }), check: new FormControl(true), city: new FormControl('riyadh', { nonNullable: true }), views: new FormControl<string[]>(['riyadh']), level: new FormControl(35, { nonNullable: true }) });
    }
    const view = mount(Host, `<form [formGroup]="group"><hw-text-field name="text" formControlName="text" (valueChange)="changed('text')" /><hw-text-field name="kept" formControlName="kept" (valueChange)="changed('kept')" /><hw-checkbox name="check" label="Agree" formControlName="check" (valueChange)="changed('check')" /><hw-select name="city" [options]="cities" placeholder="Choose" formControlName="city" (valueChange)="changed('city')" /><hw-toggle-group name="views" label="Views" multiple [options]="cities" formControlName="views" (valueChange)="changed('views')" /><hw-slider name="level" formControlName="level" (valueChange)="changed('level')" /></form>`);
    const host = view.fixture.componentInstance;
    expect(view.submitted()).toEqual(['text=first', 'kept=same', 'check=on', 'city=riyadh', 'views=riyadh', 'level=35']);
    const text = view.form.querySelector<HTMLInputElement>('hw-text-field input')!; text.value = 'typed'; text.dispatchEvent(new Event('input', { bubbles: true })); view.fixture.detectChanges();
    expect(host.group.value.text).toBe('typed'); host.changed.mockClear();
    await view.reset();
    // Nullable controls are emptied by Angular Forms; nonNullable ones return to their initial value, also when it equals the current one.
    expect(host.group.getRawValue()).toEqual({ text: null, kept: 'same', check: null, city: 'riyadh', views: null, level: 35 });
    expect(view.submitted()).toEqual(['text=', 'kept=same', 'city=riyadh', 'level=35']);
    expect(view.form.querySelector<HTMLInputElement>('hw-checkbox input')!.checked).toBe(false); expect(view.form.querySelector('hw-toggle-group [aria-pressed="true"]')).toBeNull();
    expect(host.changed).not.toHaveBeenCalled();
  });

  it('[RESET-10] with ngModel inside a form the model is emptied by Angular Forms and shown, and the component reports nothing itself', async () => {
    class Host { changed = vi.fn(); text = 'first'; check = true; }
    const view = mount(Host, `<form><hw-text-field name="text" [(ngModel)]="text" (valueChange)="changed('text')" /><hw-checkbox name="check" label="Agree" [(ngModel)]="check" (valueChange)="changed('check')" /></form>`);
    await view.fixture.whenStable(); view.fixture.detectChanges();
    expect(view.submitted()).toEqual(['text=first', 'check=on']);
    await view.reset();
    expect(view.fixture.componentInstance.text).toBeNull(); expect(view.fixture.componentInstance.check).toBeNull();
    expect(view.submitted()).toEqual(['text=']); expect(view.fixture.componentInstance.changed).not.toHaveBeenCalled();
  });

  it('[RESET-10] a control that Angular Forms does not reset keeps its value: the component writes what it holds back to the DOM', async () => {
    class Host { changed = vi.fn(); text = new FormControl('first'); check = new FormControl(true); cities = cities; city = new FormControl('jeddah'); }
    const view = mount(Host, `<form><hw-text-field name="text" [formControl]="text" (valueChange)="changed('text')" /><hw-checkbox name="check" label="Agree" [formControl]="check" (valueChange)="changed('check')" /><hw-radio-group name="city" [options]="cities" [formControl]="city" (valueChange)="changed('city')" /></form>`);
    await view.reset();
    expect(view.submitted()).toEqual(['text=first', 'check=on', 'city=jeddah']); expect(view.fixture.componentInstance.text.value).toBe('first'); expect(view.fixture.componentInstance.changed).not.toHaveBeenCalled();
  });
});
