import '@angular/compiler';
import { formatCalendarDate } from '@nasaq/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NqCalendarComponent, NqDataTableComponent, NqDatePickerComponent, NqGridComponent, NqMenuComponent, NqMultiSelectComponent, NqNumberFieldComponent, NqPinInputComponent, NqRangeSliderComponent, NqTagInputComponent, NqTreeViewComponent } from '@nasaq/angular';

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  // JSDOM lacks the native dialog lifecycle used by disabled/reset handling.
  if (!HTMLDialogElement.prototype.showModal) HTMLDialogElement.prototype.showModal = function() { this.open = true; };
  if (!HTMLDialogElement.prototype.close) HTMLDialogElement.prototype.close = function() {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});
afterEach(() => TestBed.resetTestingModule());
const imports = [FormsModule, ReactiveFormsModule, NqCalendarComponent, NqDataTableComponent, NqDatePickerComponent, NqGridComponent, NqMenuComponent, NqMultiSelectComponent, NqNumberFieldComponent, NqPinInputComponent, NqRangeSliderComponent, NqTagInputComponent, NqTreeViewComponent];
function host<T extends object>(type: new () => T, template: string) {
  Component({standalone: true, changeDetection: ChangeDetectionStrategy.Default, imports, template})(type);
  const fixture = TestBed.createComponent(type); fixture.detectChanges(); return fixture;
}
function key(element: Element, key: string) { element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true})); }
function input(element: HTMLInputElement, value: string) { element.value = value; element.dispatchEvent(new Event('input', {bubbles: true})); }

describe('Angular expansion behavior', () => {
  it('normalizes pasted Arabic digits and resets numeric, pin and array CVAs through ngForm', async () => {
    class Host { pin = '123456'; count: number | null = 3; tags = ['first']; disabled = false; }
    const fixture = host(Host, `<form #form="ngForm"><nq-pin-input label="Code" name="pin" [(ngModel)]="pin" [disabled]="disabled" /><nq-number-field label="Count" name="count" [(ngModel)]="count" /><nq-tag-input label="Tags" name="tags" [(ngModel)]="tags" /><button type="button" (click)="form.resetForm()">Reset</button></form>`);
    await fixture.whenStable(); fixture.detectChanges();
    const pin = fixture.nativeElement.querySelector('[autocomplete="one-time-code"]') as HTMLInputElement;
    input(pin, '١٢۳۴٥۶'); fixture.detectChanges();
    expect(fixture.componentInstance.pin).toBe('123456');
    input(fixture.nativeElement.querySelector('input[type="number"]'), '');
    expect(fixture.componentInstance.count).toBe(null);
    const buttons = fixture.nativeElement.querySelectorAll('button'); buttons[buttons.length - 1].click();
    await fixture.whenStable(); fixture.detectChanges();
    expect(pin.value).toBe('');
    expect(fixture.nativeElement.querySelectorAll('.nq-tag-input input[type="hidden"]').length).toBe(0);
    fixture.componentInstance.disabled = true; fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(pin.disabled).toBe(true);
  });

  it('constrains crossing range thumbs and submits distinct named values', () => {
    class Host { range: [number, number] = [20, 70]; }
    const fixture = host(Host, `<form><nq-range-slider label="Budget" lowerName="from" upperName="to" [(value)]="range" /></form>`);
    const ranges = fixture.nativeElement.querySelectorAll('input[type="range"]') as NodeListOf<HTMLInputElement>;
    input(ranges[0]!, '90'); fixture.detectChanges();
    expect(fixture.componentInstance.range).toEqual([70, 70]);
    expect(ranges[0]!.value).toBe('70');
    input(ranges[1]!, '10'); fixture.detectChanges();
    expect(fixture.componentInstance.range).toEqual([70, 70]);
    const data = new FormData(fixture.nativeElement.querySelector('form'));
    expect(data.get('from')).toBe('70'); expect(data.get('to')).toBe('70');
  });

  it('keeps multi-select values in FormData while filtering and enforces required selection', () => {
    class Host { selected: string[] = []; options = [{value: 'riyadh', label: 'الرياض'}, {value: 'jeddah', label: 'جدة'}, {value: 'blocked', label: 'Unavailable', disabled: true}]; }
    const fixture = host(Host, `<form><nq-multi-select label="Cities" name="city" [options]="options" [(value)]="selected" required /></form>`);
    const search = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    expect(search.checkValidity()).toBe(false);
    fixture.nativeElement.querySelector('input[type="checkbox"]').click(); fixture.detectChanges();
    expect(search.checkValidity()).toBe(true);
    input(search, 'جدة'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input[type="checkbox"]').length).toBe(1);
    expect(new FormData(fixture.nativeElement.querySelector('form')).getAll('city')).toEqual(['riyadh']);
  });

  it('navigates calendar dates in RTL, clamps at min/max, and switches display calendar without changing ISO selection', () => {
    const fixture = TestBed.createComponent(NqCalendarComponent);
    fixture.componentRef.setInput('label', 'Choose date'); fixture.componentRef.setInput('value', '2026-10-15'); fixture.componentRef.setInput('locale', 'en'); fixture.componentRef.setInput('direction', 'rtl'); fixture.componentRef.setInput('min', '2026-10-14'); fixture.componentRef.setInput('max', '2026-10-16'); fixture.detectChanges();
    const date = fixture.nativeElement.querySelector('[data-date="2026-10-15"]') as HTMLButtonElement;
    date.focus(); key(date, 'ArrowLeft'); fixture.detectChanges();
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-16');
    key(document.activeElement!, 'ArrowLeft'); fixture.detectChanges();
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-16');
    fixture.componentRef.setInput('calendar', 'islamic-umalqura'); fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('2026-10-15');
    expect(fixture.nativeElement.querySelector('[data-date="2026-10-15"]')?.parentElement?.getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('h3').textContent).not.toContain('October');
  });

  it('preserves selected ISO date when switching DatePicker calendars and reopens on that selected month', () => {
    const fixture = TestBed.createComponent(NqDatePickerComponent); fixture.componentRef.setInput('label', 'Date'); fixture.componentRef.setInput('value', '2026-10-15'); fixture.componentRef.setInput('locale', 'en'); fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = function() { this.open = true; }; dialog.close = function() { this.open = false; this.dispatchEvent(new Event('close')); };
    const opener = fixture.nativeElement.querySelector('button[aria-haspopup="dialog"]') as HTMLButtonElement;
    opener.click(); fixture.detectChanges();
    let committed = 0; fixture.componentInstance.valueChange.subscribe(() => committed++);
    const selector = fixture.nativeElement.querySelector('.nq-calendar-system select') as HTMLSelectElement;
    selector.value = 'islamic-umalqura'; selector.dispatchEvent(new Event('change', {bubbles: true})); fixture.detectChanges();
    expect(fixture.componentInstance.calendar).toBe('islamic-umalqura'); expect(committed).toBe(0);
    expect(fixture.componentInstance.value).toBe('2026-10-15');
    expect((fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement).value).toBe('2026-10-15');
    fixture.componentInstance.pickerCalendar!.navigate('2027-01-01'); fixture.detectChanges(); dialog.close(); fixture.detectChanges();
    opener.click(); fixture.detectChanges();
    expect(fixture.componentInstance.pickerCalendar!.month).toBe('2026-10-15');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-15');
  });

  it('bounds Saudi calendar keyboard navigation and labels historical dates from the Saudi table', () => {
    const fixture = TestBed.createComponent(NqCalendarComponent);
    fixture.componentRef.setInput('label', 'Date'); fixture.componentRef.setInput('value', '1924-08-01'); fixture.componentRef.setInput('calendar', 'islamic-umalqura'); fixture.componentRef.setInput('locale', 'en'); fixture.componentRef.setInput('direction', 'ltr'); fixture.detectChanges();
    const first = fixture.nativeElement.querySelector('[data-date="1924-08-01"]') as HTMLButtonElement;
    expect(first.getAttribute('aria-label')).toContain('1 Muharram 1343 AH');
    expect((fixture.nativeElement.querySelector('[aria-label="Previous month"]') as HTMLButtonElement).disabled).toBe(true);
    first.focus(); key(first, 'ArrowLeft'); fixture.detectChanges(); expect(document.activeElement).toBe(first);
    key(first, 'PageUp'); fixture.detectChanges(); expect(document.activeElement).toBe(first);
  });

  it('keeps calendar month arrows within min/max months', () => {
    const fixture = TestBed.createComponent(NqCalendarComponent);
    fixture.componentRef.setInput('value', '2026-10-15');
    fixture.componentRef.setInput('min', '2026-09-14');
    fixture.componentRef.setInput('max', '2026-11-16');
    fixture.detectChanges();
    const previous = fixture.nativeElement.querySelector('[aria-label="Previous month"]') as HTMLButtonElement;
    const next = fixture.nativeElement.querySelector('[aria-label="Next month"]') as HTMLButtonElement;
    next.click(); fixture.detectChanges();
    expect(next.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.nq-calendar-day:not(:disabled)')).not.toBeNull();
    previous.click(); fixture.detectChanges(); previous.click(); fixture.detectChanges();
    expect(previous.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.nq-calendar-day:not(:disabled)')).not.toBeNull();
    fixture.componentRef.setInput('value', '2026-10-15');
    fixture.componentRef.setInput('min', '2026-10-14');
    fixture.componentRef.setInput('max', '2026-10-16');
    fixture.detectChanges();
    next.click(); fixture.detectChanges();
    expect(previous.disabled).toBe(true); expect(next.disabled).toBe(true);
  });

  it('invalidates unsupported Hijri dates without rewriting ISO values and restores native validity in Gregorian mode', () => {
    const fixture = TestBed.createComponent(NqDatePickerComponent);
    fixture.componentRef.setInput('label', 'Historic date');
    fixture.componentRef.setInput('value', '1900-01-01');
    fixture.componentRef.setInput('calendar', 'islamic-umalqura');
    fixture.componentRef.setInput('unsupportedMessage', 'التاريخ خارج النطاق المدعوم');
    fixture.detectChanges();
    const control = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    expect(control.value).toBe('1900-01-01');
    expect(control.checkValidity()).toBe(false);
    expect(control.validationMessage).toBe('التاريخ خارج النطاق المدعوم');
    expect(control.getAttribute('aria-invalid')).toBe('true');
    fixture.componentRef.setInput('unsupportedMessage', 'خارج النطاق 1924-08-01 إلى 2077-11-16.'); fixture.detectChanges();
    expect([...fixture.nativeElement.querySelectorAll('[role=status] bdi[dir=ltr]')].map(node => (node as HTMLElement).textContent)).toEqual(['1924-08-01', '2077-11-16']);
    expect(control.value).toBe('1900-01-01');
    fixture.componentInstance.switchCalendar('gregory'); fixture.detectChanges();
    expect(control.value).toBe('1900-01-01'); expect(control.checkValidity()).toBe(true);
    fixture.componentRef.setInput('min', '1950-01-01'); fixture.detectChanges();
    expect(control.checkValidity()).toBe(false); expect(control.validity.customError).toBe(true);
    fixture.componentRef.setInput('min', ''); fixture.componentInstance.switchCalendar('islamic-umalqura'); fixture.detectChanges();
    input(control, '2078-01-01'); fixture.detectChanges();
    expect(control.checkValidity()).toBe(false);
    input(control, '2026-10-15'); fixture.detectChanges();
    expect(control.checkValidity()).toBe(true);
  });

  it('shows an associated canonical selected date below the closed picker field', () => {
    const fixture = TestBed.createComponent(NqDatePickerComponent);
    fixture.componentRef.setInput('label', 'Date'); fixture.componentRef.setInput('hint', 'Original day'); fixture.componentRef.setInput('value', '2029-08-11'); fixture.componentRef.setInput('calendar', 'islamic-umalqura'); fixture.componentRef.setInput('locale', 'en-SA'); fixture.detectChanges();
    const control = fixture.nativeElement.querySelector('input[type=text]') as HTMLInputElement;
    const output = fixture.nativeElement.querySelector('.nq-date-picker-value') as HTMLOutputElement;
    expect((fixture.nativeElement.querySelector('dialog') as HTMLDialogElement).open).toBe(false);
    expect(output.hidden).toBe(false);
    expect(output.textContent).toBe(formatCalendarDate('2029-08-11', { calendar: 'islamic-umalqura', locale: 'en-SA', dateStyle: 'full' }));
    expect(output.htmlFor.value).toBe(control.id);
    expect(control.getAttribute('aria-describedby')!.split(' ')).toContain(output.id);
    expect(control.getAttribute('aria-describedby')).toContain(control.id + '-hint');
    const calendarSelector = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    calendarSelector.value = 'gregory'; calendarSelector.dispatchEvent(new Event('change', {bubbles: true})); fixture.detectChanges();
    expect(control.value).toBe('2029-08-11');
    expect(output.textContent).toBe(formatCalendarDate('2029-08-11', { calendar: 'gregory', locale: 'en-SA', dateStyle: 'full' }));
    fixture.componentInstance.writeValue(''); fixture.detectChanges(); expect(output.hidden).toBe(true); expect(output.textContent).toBe('');
    fixture.componentInstance.writeValue('1900-01-01'); fixture.componentInstance.switchCalendar('islamic-umalqura'); fixture.detectChanges(); expect(output.hidden).toBe(true); expect(output.textContent).toBe(''); expect(control.checkValidity()).toBe(false);
  });

  it('updates reactive-form calendar validation on switching, value writes, disable and reset', () => {
    class Host { date = new FormControl<string | null>('1900-01-01'); system = 'islamic-umalqura'; }
    const fixture = host(Host, `<form><nq-date-picker label="Date" name="date" [formControl]="date" [calendar]="system" /></form>`);
    const native = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    const control = fixture.componentInstance.date;
    expect(control.hasError('calendarUnsupported')).toBe(true);
    expect(native.checkValidity()).toBe(false);
    fixture.componentInstance.system = 'gregory'; fixture.changeDetectorRef.markForCheck(); fixture.detectChanges();
    expect(control.valid).toBe(true); expect(native.value).toBe('1900-01-01');
    fixture.componentInstance.system = 'islamic-umalqura'; fixture.changeDetectorRef.markForCheck(); fixture.detectChanges();
    expect(control.hasError('calendarUnsupported')).toBe(true);
    control.disable(); fixture.detectChanges();
    expect(control.errors).toBeNull(); expect(native.checkValidity()).toBe(true);
    control.enable(); fixture.detectChanges();
    expect(control.hasError('calendarUnsupported')).toBe(true);
    control.setValue('2077-11-16'); fixture.detectChanges(); expect(control.valid).toBe(true);
    control.setValue('2077-11-17'); fixture.detectChanges(); expect(control.hasError('calendarUnsupported')).toBe(true);
    control.reset(); fixture.detectChanges();
    expect(control.valid).toBe(true); expect(native.value).toBe(''); expect(native.checkValidity()).toBe(true);
  });

  it('exposes unsupported calendar errors through ngModel and respects disabled fieldsets', async () => {
    class Host { date: string | null = '1900-01-01'; fieldsetDisabled = false; }
    const fixture = host(Host, `<form><fieldset [disabled]="fieldsetDisabled"><nq-date-picker label="Date" name="date" [(ngModel)]="date" calendar="islamic-umalqura" /></fieldset></form>`);
    await fixture.whenStable(); fixture.detectChanges();
    const form = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
    const native = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    expect(form.controls['date']!.hasError('calendarUnsupported')).toBe(true);
    expect(native.checkValidity()).toBe(false);
    fixture.componentInstance.fieldsetDisabled = true; fixture.changeDetectorRef.markForCheck(); fixture.detectChanges();
    expect(native.matches(':disabled')).toBe(true); expect(native.checkValidity()).toBe(true);
    expect(new FormData(fixture.nativeElement.querySelector('form')).has('date')).toBe(false);
    fixture.componentInstance.fieldsetDisabled = false; fixture.changeDetectorRef.markForCheck(); fixture.detectChanges();
    form.resetForm(); await fixture.whenStable(); fixture.detectChanges();
    expect(form.controls['date']!.hasError('calendarUnsupported')).toBe(false);
    expect(native.value).toBe(''); expect(native.checkValidity()).toBe(true);
  });

  it('skips disabled menu items, invokes an action, and returns focus', () => {
    const fixture = TestBed.createComponent(NqMenuComponent); fixture.componentRef.setInput('label', 'Actions'); fixture.componentRef.setInput('items', [{id: 'first', label: 'First'}, {id: 'blocked', label: 'Blocked', disabled: true}, {id: 'last', label: 'Last'}]); fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement; trigger.click(); fixture.detectChanges();
    expect(document.activeElement?.textContent).toBe('First');
    key(document.activeElement!, 'ArrowDown'); fixture.detectChanges();
    expect(document.activeElement?.textContent).toBe('Last');
    let action = ''; fixture.componentInstance.action.subscribe(value => action = value);
    (document.activeElement as HTMLButtonElement).click(); fixture.detectChanges();
    expect(action).toBe('last'); expect(document.activeElement).toBe(trigger); expect(fixture.componentInstance.open).toBe(false);
  });

  it('expands RTL trees, skips disabled children and supports keyboard selection', () => {
    const fixture = TestBed.createComponent(NqTreeViewComponent); fixture.componentRef.setInput('label', 'Services'); fixture.componentRef.setInput('direction', 'rtl'); fixture.componentRef.setInput('nodes', [{id: 'parent', label: 'Parent', children: [{id: 'blocked', label: 'Blocked', disabled: true}, {id: 'child', label: 'Child'}]}]); fixture.detectChanges();
    const parent = fixture.nativeElement.querySelector('[role="treeitem"]') as HTMLElement; parent.focus(); key(parent, 'ArrowLeft'); fixture.detectChanges();
    expect(parent.getAttribute('aria-expanded')).toBe('true'); key(parent, 'ArrowLeft'); fixture.detectChanges();
    expect(document.activeElement?.getAttribute('data-node')).toBe('child'); key(document.activeElement!, ' '); fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('child'); key(document.activeElement!, 'ArrowRight'); fixture.detectChanges();
    expect(document.activeElement).toBe(parent);
  });

  it('sorts data stably with aria-sort and emits responsive CSS variables', () => {
    class Host { rows = [{name: 'Item 10'}, {name: 'Item 2'}, {name: 'Item 2'}]; columns = [{key: 'name', label: 'Name', sortable: true}]; }
    const fixture = host(Host, `<nq-grid [columns]="{base: 1, md: 3}" [gap]="{base: 2, lg: 6}"><nq-data-table caption="Results" [rows]="rows" [columns]="columns" /></nq-grid>`);
    fixture.nativeElement.querySelector('th button').click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('th').getAttribute('aria-sort')).toBe('ascending');
    expect(fixture.nativeElement.querySelector('tbody td').textContent).toBe('Item 2');
    expect(fixture.componentInstance.rows[0]!.name).toBe('Item 10');
    const grid = fixture.nativeElement.querySelector('.nq-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--nq-layout-columns-md')).toBe('3');
    expect(grid.style.getPropertyValue('--nq-layout-gap-lg')).toContain('--nq-space-6');
  });
});
