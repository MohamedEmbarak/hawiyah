import '@angular/compiler';
import { supplyText } from './fixtures/texts';
import { text } from './fixtures/application-text';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { HwDatePickerComponent } from '@hawiyah/angular';

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  if (!HTMLDialogElement.prototype.showModal) HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  if (!HTMLDialogElement.prototype.close) HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event('close')); };
});
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });
it('preserves canonical form values during invalid drafts and updates custom range validity and CVA resets', () => {
  const fixture = TestBed.createComponent(HwDatePickerComponent); supplyText(fixture, text.datePicker); const form = document.createElement('form'); document.body.append(form); form.append(fixture.nativeElement);
  for (const [name, value] of Object.entries({label: 'Date', name: 'date', required: true, value: '2026-10-15', min: '2026-10-01', max: '2026-10-31'})) fixture.componentRef.setInput(name, value);
  fixture.detectChanges(); const changed = vi.fn(); fixture.componentInstance.valueChange.subscribe(changed);
  const input = form.querySelector<HTMLInputElement>('input[type=text]')!;
  const edit = (value: string) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); fixture.detectChanges(); };
  expect(form.querySelector('input[type=date]')).toBeNull(); expect(input.name).toBe(''); expect(input.willValidate).toBe(true);
  input.focus(); edit('2026-02-30'); expect(input.value).toBe('2026-02-30'); expect(input.checkValidity()).toBe(false); expect(changed).not.toHaveBeenCalled(); expect(new FormData(form).get('date')).toBe('2026-10-15'); expect(document.activeElement).toBe(input);
  edit('2026-11-01'); expect(changed).toHaveBeenLastCalledWith('2026-11-01'); expect(input.checkValidity()).toBe(false);
  edit('2026-10-21'); expect(input.checkValidity()).toBe(true); expect(new FormData(form).getAll('date')).toEqual(['2026-10-21']);
  edit(''); expect(changed).toHaveBeenLastCalledWith(''); expect(input.validity.valueMissing).toBe(true);
  fixture.componentInstance.writeValue('2026-10-15'); fixture.detectChanges(); expect(input.value).toBe('2026-10-15'); expect(input.checkValidity()).toBe(true);
  fixture.componentInstance.writeValue(null); fixture.detectChanges(); expect(input.value).toBe(''); expect(new FormData(form).get('date')).toBe('');
});

it('renders malformed external values as invalid drafts without passing them to the calendar model', () => {
  const fixture = TestBed.createComponent(HwDatePickerComponent); supplyText(fixture, text.datePicker); fixture.componentRef.setInput('value', 'not-a-date'); fixture.detectChanges();
  const input = fixture.nativeElement.querySelector('input[type=text]') as HTMLInputElement;
  expect(input.value).toBe('not-a-date'); expect(input.checkValidity()).toBe(false);
  expect((fixture.nativeElement.querySelector('input[type=hidden]') as HTMLInputElement).value).toBe('');
});
