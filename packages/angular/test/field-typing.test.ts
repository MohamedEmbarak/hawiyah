import '@angular/compiler';
import { ChangeDetectorRef, Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormsModule } from '@angular/forms';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HwNumberFieldComponent, HwTextFieldComponent } from '@hawiyah/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());

function host<T extends object>(type: new () => T, template: string) {
  Component({ standalone: true, imports: [FormsModule, HwNumberFieldComponent, HwTextFieldComponent], template })(type);
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}
/** Applies a change made to the host's own state, as an application would by marking the host for check. */
function refresh(fixture: ComponentFixture<unknown>) { fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck(); fixture.detectChanges(); }
const native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!;
/** Records every value the component assigns to the input. A browser discards the text being
 * typed whenever a number or date input is assigned a value, so no assignment may follow typing. */
function recordWrites(input: HTMLInputElement): string[] {
  const writes: string[] = [];
  Object.defineProperty(input, 'value', { configurable: true, get() { return native.get!.call(this); }, set(value: string) { writes.push(String(value)); native.set!.call(this, value); } });
  return writes;
}
/** What the browser does for one keystroke: the control holds the new text, reports it
 * sanitized ('' while it is not yet a number or a date), and fires an input event. */
function keystrokes(fixture: { detectChanges(): void }, input: HTMLInputElement, ...texts: string[]) {
  for (const text of texts) { native.set!.call(input, text); input.dispatchEvent(new Event('input', { bubbles: true })); fixture.detectChanges(); }
}

describe('Angular fields never rewrite text while it is typed', () => {
  it('commits -5 and 1e2 in NumberField without assigning the input', async () => {
    class Host { seats: number | null = 12; }
    const fixture = host(Host, `<hw-number-field label="Seats" [(value)]="seats" />`);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('12'); expect(input.getAttribute('value')).toBe('12');
    const writes = recordWrites(input);
    // Select all, then "-" and "5": "-" alone is not a number, so the control reports ''.
    keystrokes(fixture, input, '-');
    expect(fixture.componentInstance.seats).toBe(null); expect(writes).toEqual([]);
    keystrokes(fixture, input, '-5');
    expect(fixture.componentInstance.seats).toBe(-5); expect(input.value).toBe('-5'); expect(writes).toEqual([]);
    keystrokes(fixture, input, '', '1', '1e', '1e2');
    expect(fixture.componentInstance.seats).toBe(100); expect(input.value).toBe('1e2'); expect(writes).toEqual([]);
    // A value from outside is still shown.
    fixture.componentInstance.seats = 7; refresh(fixture);
    expect(input.value).toBe('7'); expect(writes).toEqual(['7']);
    fixture.componentInstance.seats = null; refresh(fixture);
    expect(input.value).toBe(''); expect(input.hasAttribute('value')).toBe(false);
  });

  it('keeps NumberField drafts with ngModel and clears them on form reset', async () => {
    class Host { count: number | null = 3; }
    const fixture = host(Host, `<form #form="ngForm"><hw-number-field label="Count" name="count" [(ngModel)]="count" /><button type="button" (click)="form.resetForm()">Reset</button></form>`);
    await fixture.whenStable(); fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('3');
    const writes = recordWrites(input);
    keystrokes(fixture, input, '-'); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.componentInstance.count).toBe(null); expect(writes).toEqual([]);
    keystrokes(fixture, input, '-2'); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.componentInstance.count).toBe(-2); expect(writes).toEqual([]);
    keystrokes(fixture, input, '-');
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable(); fixture.detectChanges();
    // The reset writes the empty value even though the model was already null: a draft may be showing.
    expect(fixture.componentInstance.count).toBe(null); expect(writes).toEqual(['']);
  });

  it('commits -5 and 1e2 in TextField type="number" without assigning the input', () => {
    class Host { amount = '12'; }
    const fixture = host(Host, `<hw-text-field label="Amount" type="number" [(value)]="amount" />`);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('12');
    const writes = recordWrites(input);
    keystrokes(fixture, input, '-', '-5');
    expect(fixture.componentInstance.amount).toBe('-5'); expect(writes).toEqual([]);
    keystrokes(fixture, input, '', '1', '1e', '1e2');
    expect(fixture.componentInstance.amount).toBe('1e2'); expect(input.value).toBe('1e2'); expect(writes).toEqual([]);
  });

  it('does not clear a TextField type="date" while one of its segments is edited', async () => {
    class Host { date = '2024-05-01'; }
    const fixture = host(Host, `<hw-text-field label="Date" type="date" name="date" [(ngModel)]="date" />`);
    await fixture.whenStable(); fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2024-05-01');
    const writes = recordWrites(input);
    // Deleting the month leaves an incomplete date, which the control reports as ''.
    keystrokes(fixture, input, ''); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.componentInstance.date).toBe(''); expect(writes).toEqual([]);
    keystrokes(fixture, input, '2024-07-01'); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.componentInstance.date).toBe('2024-07-01'); expect(input.value).toBe('2024-07-01'); expect(writes).toEqual([]);
    fixture.componentInstance.date = '2025-01-31'; refresh(fixture); await fixture.whenStable(); fixture.detectChanges();
    expect(input.value).toBe('2025-01-31'); expect(writes).toEqual(['2025-01-31']);
  });

  it('shows external TextField changes, including one equal to what was shown before typing', () => {
    class Host { name = 'Maha'; }
    const fixture = host(Host, `<hw-text-field label="Name" [value]="name" (valueChange)="typed = $event" />`);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Maha');
    keystrokes(fixture, input, 'Mahax');
    expect(input.value).toBe('Mahax');
    fixture.componentInstance.name = 'Noura'; refresh(fixture);
    expect(input.value).toBe('Noura');
  });
});
