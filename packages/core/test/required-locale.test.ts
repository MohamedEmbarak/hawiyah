// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import * as core from '../src/index.js';
import { formatCalendarDate, formatDate, formatNumber, getCalendarMonth, sortRows } from '../src/index.js';

// What the helpers returned while 'ar-SA' was their built-in default. The caller now passes it.
const formerDefault = 'ar-SA';

describe('no default locale in core', () => {
  it('makes a missing locale a type error', () => {
    const fixture = fileURLToPath(new URL('./fixtures/required-locale.ts', import.meta.url));
    const program = ts.createProgram([fixture], { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], skipLibCheck: true, verbatimModuleSyntax: true, isolatedModules: true, resolveJsonModule: true, noUncheckedIndexedAccess: true, types: [] });
    const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => `${diagnostic.file?.fileName.split('/').pop() ?? ''}:${diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : 0} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
    // An accepted call under @ts-expect-error is reported as an unused directive, so an empty list proves all thirteen are rejected.
    expect(diagnostics).toEqual([]);
    expect(readFileSync(fixture, 'utf8').match(/^\/\/ @ts-expect-error/gm)).toHaveLength(13);
  }, 60_000);

  it('refuses to run without a locale and never falls back to the host or to a built-in one', () => {
    const loose = core as unknown as { formatNumber(value: number, options?: object): string; formatDate(value: number, options?: object): string; sortRows(rows: object[], key: string, direction: string, locale?: unknown): object[]; getCalendarMonth(options?: object): object; formatCalendarDate(value: string, options?: object): string };
    const missing = [undefined, null, '', '   ', [], [''], 0, {}];
    for (const locale of missing) {
      expect(() => loose.formatNumber(1, { locale }), String(JSON.stringify(locale))).toThrow(TypeError);
      expect(() => loose.formatDate(0, { locale })).toThrow(TypeError);
      expect(() => loose.sortRows([{ value: 1 }], 'value', 'ascending', locale)).toThrow(TypeError);
      expect(() => loose.getCalendarMonth({ month: '2026-01-01', locale })).toThrow(TypeError);
      expect(() => loose.formatCalendarDate('2026-01-01', { locale })).toThrow(TypeError);
    }
    expect(() => loose.formatNumber(1)).toThrow('Hawiyah: formatNumber requires a locale from the application.');
    expect(() => loose.formatDate(0)).toThrow('Hawiyah: formatDate requires a locale from the application.');
    expect(() => loose.sortRows([], 'value', 'ascending')).toThrow('Hawiyah: sortRows requires a locale from the application.');
    expect(() => loose.getCalendarMonth()).toThrow('Hawiyah: getCalendarMonth requires a locale from the application.');
    expect(() => loose.formatCalendarDate('2026-01-01')).toThrow('Hawiyah: formatCalendarDate requires a locale from the application.');
  });

  it('gives the output of the former default when the caller passes ar-SA', () => {
    // Literal values recorded from the previous build, in which 'ar-SA' was the built-in default and no locale was passed.
    expect(formatNumber(1234567.891, { locale: formerDefault })).toBe('1,234,567.891');
    expect(formatNumber(0.256, { locale: formerDefault, style: 'percent' })).toBe('26\u066a');
    expect(formatNumber(12n, { locale: formerDefault, minimumIntegerDigits: 3 })).toBe('012');
    expect(formatDate('2026-01-01T22:00:00Z', { locale: formerDefault })).toBe('2\u200f/1\u200f/2026');
    expect(formatDate('2026-01-01T22:00:00Z', { locale: formerDefault, year: 'numeric', month: '2-digit', day: '2-digit' })).toBe('02\u200f/01\u200f/2026');
    expect(formatDate(Date.UTC(2026, 0, 1, 22), { locale: formerDefault, dateStyle: 'long' })).toBe('2 يناير 2026');
    expect(formatDate('2026-03-01T00:00:00Z', { locale: formerDefault, calendar: 'islamic-umalqura', dateStyle: 'medium' })).toBe('12 رمضان 1447 هـ');
    const rows = [{ id: 1, value: 'ياسر' }, { id: 2, value: 'أحمد' }, { id: 3, value: null }, { id: 4, value: 'بدر' }, { id: 5, value: 'Item 10' }, { id: 6, value: 'item 2' }];
    expect(sortRows(rows, 'value', 'ascending', formerDefault).map(row => row.id)).toEqual([2, 4, 1, 6, 5, 3]);
    expect(sortRows(rows, 'value', 'descending', formerDefault).map(row => row.id)).toEqual([5, 6, 1, 4, 2, 3]);
    expect(rows.map(row => row.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(sortRows([{ value: null }, { value: 1 }, { value: 3 }], 'value', 'descending', formerDefault)).toEqual([{ value: 3 }, { value: 1 }, { value: null }]);
    expect(getCalendarMonth({ month: '2025-07-10', calendar: 'islamic-umalqura', locale: formerDefault }).label).toBe('محرم 1447 هـ');
    expect(formatCalendarDate('2029-08-11', { calendar: 'islamic-umalqura', locale: formerDefault })).toContain('1451');
  });

  it('accepts a priority list of locales as Intl does', () => {
    expect(formatNumber(1234.5, { locale: ['en-US', 'ar-SA'] })).toBe('1,234.5');
    expect(sortRows([{ value: 'b' }, { value: 'a' }], 'value', 'ascending', ['en', 'ar-SA'])).toEqual([{ value: 'a' }, { value: 'b' }]);
  });

  it('names no locale and reads none from the host anywhere in source', () => {
    const directory = new URL('../src/', import.meta.url);
    for (const file of readdirSync(directory).filter(name => name.endsWith('.ts'))) {
      const code = readFileSync(new URL(file, directory), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      expect(code, file).not.toMatch(/['"`][a-z]{2,3}-[A-Z]{2}['"`]/u);
      expect(code, file).not.toMatch(/locale\s*=\s*['"`]|resolvedOptions\(\)\.locale|navigator\.languages?|toLocale(?:String|DateString|TimeString|UpperCase|LowerCase)\(\s*\)|localeCompare\(/u);
      for (const call of code.matchAll(/new Intl\.\w+\(([^,)]*)/gu)) expect(call[1]!.trim(), `${file}: ${call[0]}`).toBe('locale');
    }
    for (const name of ['getCalendarLabels', 'getSiteVerificationLabels', 'fileUploadLabels']) expect(core, name).not.toHaveProperty(name);
  });
});
