import { describe, expect, it } from 'vitest';
import { shellTexts } from './shell';
import { ARABIC_SCRIPT } from './text';

// Values that may be written without Arabic script in the Arabic dictionary.
const ALLOWLIST: readonly string[] = [];

const value = (entry: unknown): string => (typeof entry === 'function' ? String(entry('X')) : String(entry));

describe('shell texts', () => {
  it('have the same keys in both languages', () => {
    expect(Object.keys(shellTexts.ar).sort()).toEqual(Object.keys(shellTexts.en).sort());
  });

  it('have no empty value', () => {
    for (const lang of ['ar', 'en'] as const) {
      for (const [key, entry] of Object.entries(shellTexts[lang])) {
        expect(value(entry).trim(), `${lang}.${key}`).not.toBe('');
      }
    }
  });

  it('write every Arabic value in Arabic script', () => {
    for (const [key, entry] of Object.entries(shellTexts.ar)) {
      if (ALLOWLIST.includes(key)) continue;
      expect(ARABIC_SCRIPT.test(value(entry)), key).toBe(true);
    }
  });

  it('keep the attribution lines exactly', () => {
    expect(shellTexts.en.attribution).toBe(
      'Developed by the Development Team in the National Platforms Sector — National Information Center',
    );
    expect(shellTexts.ar.attribution).toBe('تم التطوير بواسطة فريق التطوير في قطاع المنصات الوطنية - مركز المعلومات الوطني');
  });

  it('compose the texts that take arguments', () => {
    expect(shellTexts.en.footerVersion('0.3.0')).toBe('Version 0.3.0. Licensed under the Apache License 2.0.');
    expect(shellTexts.ar.footerVersion('0.3.0')).toBe('الإصدار 0.3.0. مرخّصة بموجب ترخيص Apache 2.0.');
    expect(shellTexts.en.previewBody('abc1234')).toContain('at commit abc1234.');
    expect(shellTexts.ar.previewBody('abc1234')).toContain('عند الإيداع abc1234.');
  });
});
