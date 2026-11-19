// Arabic and English parity, including live token parity (HWC-PAR4).

import { describe, expect, it } from 'vitest';
import { liveTokenDifference, tokensMatch } from '../parity.mjs';
import { runPair, validAr, validEn } from './helpers.mjs';

const codes = (replace) => runPair(replace).findings.map((item) => item.code);
const swap = (text, from, to) => {
  if (!text.includes(from)) throw new Error(`fixture text not found: ${from}`);
  return text.replace(from, to);
};

describe('live token parity', () => {
  it('allows Arabic strings and text, language tags and rtl/ltr', () => {
    expect(liveTokenDifference('html', '<p lang="en" dir="ltr" title="Read">Read the terms</p>', '<p lang="ar" dir="rtl" title="اقرأ">اقرأ الشروط</p>')).toBe(null);
    expect(liveTokenDifference('tsx', '<Button label="Save">Save changes</Button>', '<Button label="حفظ">حفظ</Button>')).toBe(null);
    expect(liveTokenDifference('ts', 'template: `<b lang="en-GB">Go</b>`', 'template: `<b lang="ar-SA">انتقل</b>`')).toBe(null);
  });

  it('rejects other differences', () => {
    expect(liveTokenDifference('html', '<p class="hw-type">Read</p>', '<p class="hw-stack">اقرأ</p>')).toMatchObject({ index: 4 });
    expect(liveTokenDifference('html', '<p>Read</p>', '<p>Read again</p>')).toMatchObject({ en: { text: 'Read' }, ar: { text: 'Read again' } });
    expect(liveTokenDifference('tsx', '<A b="x" />', '<A b="x" c="y" />')).not.toBe(null);
    expect(tokensMatch({ kind: 'string', text: '"Save"' }, { kind: 'code', text: 'حفظ' })).toBe(false);
  });
});

describe('checkParity', () => {
  it('reports nothing for the valid pair', () => {
    expect(codes()).toEqual([]);
  });

  it('reports a different heading tree (HWC-PAR1)', () => {
    expect(codes({ ar: swap(validAr(), '#### الإعلانات', '### الإعلانات') })).toContain('HWC-PAR1');
  });

  it('reports a changed or reordered code block (HWC-PAR2)', () => {
    expect(codes({ ar: swap(validAr(), '```ts title="setup.ts"', '```js title="setup.ts"') })).toEqual(['HWC-PAR2']);
  });

  it('reports different live groups (HWC-PAR3) and tokens (HWC-PAR4)', () => {
    expect(codes({ ar: validAr().replaceAll('example=direction', 'example=other') })).toEqual(['HWC-PAR3']);
    expect(codes({ ar: swap(validAr(), 'class="hw-button" type="button"', 'class="hw-button" type="submit"') })).toEqual(['HWC-PAR4']);
  });

  it('reports different tables and API rows (HWC-PAR5)', () => {
    expect(codes({ ar: swap(validAr(), '| `label` | `string` | `true` | — |\n\n### Vue', '| `label` | `string` | `false` | — |\n\n### Vue') })).toEqual(['HWC-PAR5']);
  });

  it('reports different alerts (HWC-PAR6)', () => {
    expect(codes({ ar: swap(validAr(), '> [!NOTE]', '> [!WARNING]') })).toEqual(['HWC-PAR6']);
  });

  it('reports a different block sequence in a section (HWC-PAR7)', () => {
    expect(codes({ ar: swap(validAr(), 'يعرض المثال إجراءً أساسيًا واحدًا.\n\n', '') })).toContain('HWC-PAR7');
    const list = runPair({ ar: swap(validAr(), '- يتبع النص اتجاه الصفحة.', '- بند إضافي.\n- يتبع النص اتجاه الصفحة.') }).findings.filter((item) => item.code === 'HWC-PAR7');
    expect(list).toHaveLength(1);
    expect(list[0].message).toMatch(/bulleted list of \d+ items/);
  });

  it('requires Arabic script in Arabic prose and live text, with key names and listed exceptions allowed (HWC-PAR8)', () => {
    const english = swap(validAr(), 'يعرض المثال إجراءً أساسيًا واحدًا.', 'The example shows one primary action.');
    expect(codes({ ar: english })).toEqual(['HWC-PAR8']);
    expect(codes({ ar: english, exceptions: [{ file: 'guide/scripts/content/test/fixtures/docs/components/fixture-a.ar.md', text: 'one primary action', reason: 'test' }] })).toEqual([]);
    const live = runPair({ ar: validAr().replace('<button class="hw-button" type="button" data-variant="primary">متابعة</button>', '<button class="hw-button" type="button" data-variant="primary" aria-label="Continue the request">Continue</button>') }).findings;
    expect(live.filter((item) => item.code === 'HWC-PAR8').map((item) => item.message.split(' has no')[0])).toEqual([
      'live block "primary" (vanilla) aria-label',
      'live block "primary" (vanilla) text',
    ]);
    // Key names are exempt in table cells (the Key column) only.
    expect(codes({ ar: swap(validAr(), '| Enter |', '| Tab، Shift+Tab |') })).toEqual([]);
    expect(codes({ ar: swap(validAr(), 'يعرض المثال إجراءً أساسيًا واحدًا.', 'Tab، Enter') })).toEqual(['HWC-PAR8']);
    expect(codes({ ar: swap(validAr(), 'يعرض المثال إجراءً أساسيًا واحدًا.', 'The example shows one primary action، in English.') })).toEqual(['HWC-PAR8']);
  });

  it('treats a shown value as reader text, and keeps hidden values and field names as tokens (HWC-PAR8)', () => {
    const at = '<button class="hw-button" type="button" data-variant="primary">متابعة</button>';
    const live = (markup) => runPair({ ar: validAr().replace(at, `${at}${markup}`) }).findings
      .filter((item) => item.code === 'HWC-PAR8')
      .map((item) => item.message.split(' has no')[0]);
    expect(live('<input class="hw-input" name="person" value="Sara Ahmed">')).toEqual(['live block "primary" (vanilla) value']);
    expect(live('<input class="hw-input" type="text" value="Riyadh">')).toEqual(['live block "primary" (vanilla) value']);
    expect(live('<input type="checkbox" name="terms" value="accepted"><select class="hw-select"><option value="riyadh">الرياض</option></select>')).toEqual([]);
  });

  it('requires Arabic script in headings h2 to h6, except the framework names (HWC-PAR8)', () => {
    const ar = validAr();
    const h3 = ar.match(/^### (.+)$/m);
    expect(h3).not.toBeNull();
    const latin = runPair({ ar: ar.replace(h3[0], '### Vertical') }).findings.filter((item) => item.code === 'HWC-PAR8');
    expect(latin.map((item) => item.message)).toEqual(['the h3 has no Arabic script: "Vertical"; translate it, or list it in scripts/content/arabic-exceptions.json with a reason']);
    expect(codes({ ar: ar.replace(h3[0], '### JavaScript') }).filter((code) => code === 'HWC-PAR8')).toEqual([]);
    // A heading that is a key name is a word to translate.
    expect(codes({ ar: ar.replace(h3[0], '### Tab') }).filter((code) => code === 'HWC-PAR8')).toEqual(['HWC-PAR8']);
    expect(codes({ ar: ar.replace(h3[0], '### Home and End') }).filter((code) => code === 'HWC-PAR8')).toEqual(['HWC-PAR8']);
  });

  it('treats names that end in label, message, text or title and Latin phrases in live blocks as reader text (HWC-PAR8)', () => {
    const at = '<button class="hw-button" type="button" data-variant="primary">متابعة</button>';
    const with_ = (attributes) => runPair({ ar: validAr().replace(at, `<button class="hw-button" type="button" data-variant="primary" ${attributes}>متابعة</button>`) }).findings
      .filter((item) => item.code === 'HWC-PAR8')
      .map((item) => item.message.split(' has no')[0]);
    expect(with_('data-hw-overflow-label="More tabs of this group"')).toEqual(['live block "primary" (vanilla) data-hw-overflow-label']);
    expect(with_('data-copied-message="Copied"')).toEqual(['live block "primary" (vanilla) data-copied-message']);
    expect(with_('data-note="Read the terms first"')).toEqual(['live block "primary" (vanilla) data-note']);
    // Token values are not reader text, even with spaces; a single Latin word of another name is not either.
    expect(with_('data-size="md" aria-describedby="hint other" autocomplete="shipping street-address"')).toEqual([]);
    expect(with_('data-overflow-label="المزيد من التبويبات"')).toEqual([]);
  });

  it('reports stale translations and source keys of missing sections', () => {
    const findings = runPair({ en: swap(validEn(), 'The layout uses logical properties only.', 'The layout uses logical properties.') }).findings;
    expect(findings.map((item) => [item.code, item.message.split(' was ')[0]])).toEqual([['HWC-STALE', 'section "rtl-and-localisation"']]);
    const extra = swap(validAr(), 'source:\n', 'source:\n  usage: 000000000000\n');
    expect(runPair({ ar: extra }).findings.map((item) => [item.code, item.message])).toEqual([
      ['HWC-FM2', 'source lists the section "usage", which this page does not have'],
    ]);
  });
});
