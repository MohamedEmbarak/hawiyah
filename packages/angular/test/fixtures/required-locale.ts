// Compiled by required-locale.test.ts with the Angular compiler; no test imports it.
// Each template of WithoutLocale omits only `locale`, so every diagnostic is about that input.
import { Component } from '@angular/core';
import { HwCalendarComponent, HwDataTableComponent, HwDatePickerComponent } from '@hawiyah/angular';

const imports = [HwCalendarComponent, HwDataTableComponent, HwDatePickerComponent];

@Component({ selector: 'app-with-locale', standalone: true, imports, template: `
<hw-calendar label="Date" [locale]="locale" previousLabel="Previous month" nextLabel="Next month" />
<hw-date-picker label="Date" locale="ar-SA" calendarLabel="Choose a date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri" rangeLabel="Supported dates" invalidMessage="Enter a valid date." unsupportedMessage="Outside the supported range." />
<hw-data-table caption="Requests" emptyMessage="None" [locale]="locale" />` })
export class WithLocale { locale = 'ar-SA'; }

@Component({ selector: 'app-without-locale', standalone: true, imports, template: `
<hw-calendar label="Date" previousLabel="Previous month" nextLabel="Next month" />
<hw-date-picker label="Date" calendarLabel="Choose a date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri" rangeLabel="Supported dates" invalidMessage="Enter a valid date." unsupportedMessage="Outside the supported range." />
<hw-data-table caption="Requests" emptyMessage="None" />` })
export class WithoutLocale {}
