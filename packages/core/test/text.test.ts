// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as core from '../src/index.js';
import { getCalendarMonth } from '../src/calendar.js';
import { formatTextTemplate, hasText, requireText, resetTextWarnings } from '../src/text.js';

const flags = globalThis as { __HAWIYAH_DEV__?: boolean };
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); delete flags.__HAWIYAH_DEV__; resetTextWarnings(); });

describe('required text', () => {
  it('accepts renderable text and rejects empty values', () => {
    for (const value of ['Close', ' x ', 0, 12, () => 'Page 1', { type: 'span' }, ['', 'a']]) expect(hasText(value)).toBe(true);
    for (const value of [undefined, null, '', '   ', '\n\t', false, true, Number.NaN, [], ['', null]]) expect(hasText(value)).toBe(false);
  });

  it('warns once per component and input in development and never substitutes text', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(requireText('Dialog', 'closeLabel', '')).toBe(false);
    expect(requireText('Dialog', 'closeLabel', undefined)).toBe(false);
    expect(requireText('Dialog', 'title', '  ')).toBe(false);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]![0]).toBe('Hawiyah: Dialog requires "closeLabel". Hawiyah ships no built-in strings, so the application supplies this text; nothing is rendered in its place.');
    expect(requireText('Pagination', 'jumpLabel', null, 'the page jump is shown')).toBe(false);
    expect(warn.mock.calls[2]![0]).toContain('requires "jumpLabel" when the page jump is shown.');
  });

  it('is silent when the text is present', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(requireText('Dialog', 'closeLabel', 'إغلاق')).toBe(true);
    expect(requireText('Pagination', 'getPageLabel', (page: number) => `Page ${page}`)).toBe(true);
    expect(warn).not.toHaveBeenCalled();
  });

  it('does nothing but report absence in a production build', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'production');
    expect(requireText('Dialog', 'closeLabel', '')).toBe(false);
    expect(warn).not.toHaveBeenCalled();
    flags.__HAWIYAH_DEV__ = true;
    expect(requireText('Dialog', 'closeLabel', '')).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('lets a page without a bundler switch the warning off', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    flags.__HAWIYAH_DEV__ = false;
    expect(requireText('Tabs', 'overflowLabel', undefined)).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('runs without process, console or a document', () => {
    expect(typeof document).toBe('undefined');
    vi.stubGlobal('process', undefined);
    vi.stubGlobal('console', undefined);
    expect(() => requireText('Spinner', 'label', '')).not.toThrow();
    expect(requireText('Spinner', 'label', 'Loading')).toBe(true);
  });
});

describe('text templates', () => {
  it('fills only the placeholders it is given', () => {
    expect(formatTextTemplate('Page {page} of {total}', { page: 2, total: 9 })).toBe('Page 2 of 9');
    expect(formatTextTemplate('الصفحة {page}', { page: 3 })).toBe('الصفحة 3');
    expect(formatTextTemplate('{count} / {unknown} {toString}', { count: 4 })).toBe('4 / {unknown} {toString}');
    expect(formatTextTemplate('', { page: 1 })).toBe('');
  });
});

describe('no built-in strings in core', () => {
  it('keeps the removed registries only as exports without any text', () => {
    const removed = core as unknown as { getCalendarLabels(locale?: string): Record<string, string>; getSiteVerificationLabels(locale?: string): Record<string, string>; fileUploadLabels: Record<string, unknown> };
    const texts = [...Object.values(removed.getCalendarLabels('ar-SA')), ...Object.values(removed.getCalendarLabels('en')), ...Object.values(removed.getSiteVerificationLabels('ar')), ...Object.values(removed.getSiteVerificationLabels('en'))];
    expect(texts).toHaveLength(44);
    expect(texts.every(text => text === '')).toBe(true);
    const { getProgressLabel, getRemoveLabel, ...statuses } = removed.fileUploadLabels as { getProgressLabel(name: string): string; getRemoveLabel(name: string): string } & Record<string, string>;
    expect(Object.values(statuses)).toEqual(['', '', '', '', '']);
    expect(getProgressLabel('a.pdf') + getRemoveLabel('a.pdf')).toBe('');
  });

  it('holds no Arabic text and no language switch in source', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const directory = new URL('../src/', import.meta.url);
    for (const file of readdirSync(directory).filter(name => name.endsWith('.ts') && name !== 'ummalqura-data.ts')) {
      const source = readFileSync(new URL(file, directory), 'utf8');
      const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      expect(code, file).not.toMatch(/[\u0600-\u06FF]/u);
      expect(code, file).not.toMatch(/startsWith\('ar'\)|\/\^ar\b|closest\('\[lang\]'\)|documentElement\.lang|navigator\.language/);
    }
  });

  it('takes the Hijri era from Intl for the requested locale', () => {
    const month = (locale: string) => getCalendarMonth({ month: '2025-07-10', calendar: 'islamic-umalqura', locale }).label;
    const era = (locale: string) => new Intl.DateTimeFormat(locale, { era: 'short', year: 'numeric', calendar: 'islamic-umalqura', timeZone: 'UTC' }).formatToParts(new Date(Date.UTC(2025, 6, 10))).find(part => part.type === 'era')!.value;
    expect(month('ar-SA')).toBe('محرم 1447 هـ');
    expect(month('en')).toBe('Muharram 1447 AH');
    for (const locale of ['ur', 'tr', 'fr']) expect(month(locale).endsWith(` 1447 ${era(locale)}`)).toBe(true);
    expect(getCalendarMonth({ month: '2025-07-10', locale: 'en' }).label).toBe('July 2025');
  });
});
