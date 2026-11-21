// Arabic and English parity, including live token parity (HWC-PAR4).

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { liveTokenDifference, readArabicExceptions, tokensMatch } from '../parity.mjs';
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
    expect(codes({ ar: swap(validAr(), '| `label` | `string` | `true` | — |\n\nتسمّي', '| `label` | `string` | `false` | — |\n\nتسمّي') })).toEqual(['HWC-PAR5']);
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

  it('refuses an entry of arabic-exceptions.json shorter than 12 characters', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hawiyah-arabic-exceptions-'));
    try {
      const file = join(dir, 'arabic-exceptions.json');
      writeFileSync(file, JSON.stringify([{ file: 'docs/components/x.ar.md', text: 'e', reason: 'r', approvedBy: 'lead' }]));
      expect(() => readArabicExceptions(file)).toThrow('arabic-exceptions.json entry 1: the text "e" is shorter than 12 characters');
      writeFileSync(file, JSON.stringify([{ file: 'docs/components/x.ar.md', text: 'The example shows one primary action.', reason: 'r', approvedBy: 'lead' }]));
      expect(readArabicExceptions(file)).toHaveLength(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('requires Arabic script in Arabic prose and live text, with key names and listed exceptions allowed (HWC-PAR8)', () => {
    const english = swap(validAr(), 'يعرض المثال إجراءً أساسيًا واحدًا.', 'The example shows one primary action.');
    expect(codes({ ar: english })).toEqual(['HWC-PAR8']);
    const file = 'guide/scripts/content/test/fixtures/docs/components/fixture-a.ar.md';
    expect(codes({ ar: english, exceptions: [{ file, text: 'The example shows one primary action.', reason: 'test' }] })).toEqual([]);
    // An entry names the whole text, never a part of it (G13 of the 5a fix round).
    expect(codes({ ar: english, exceptions: [{ file, text: 'one primary action', reason: 'test' }] })).toEqual(['HWC-PAR8']);
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

  describe('key elements and the keyboard table (5a.7, 5a.8, HWC-KEYS)', () => {
    const EN_TABLE = 'Table: Keyboard\n\n| Key | Action |\n| :-- | --: |\n| Enter | Activates the control. |\n| Space | Activates the control. |';
    const AR_TABLE = 'جدول: لوحة المفاتيح\n\n| المفتاح | الإجراء |\n| :-- | --: |\n| Enter | يفعّل عنصر التحكم. |\n| Space | يفعّل عنصر التحكم. |';
    const table = (caption, header, rows) => `${caption}\n\n${header}\n| :-- | --: |\n${rows.map(([key, action]) => `| ${key} | ${action} |`).join('\n')}`;
    const en = (rows, caption = 'Table: Keyboard interaction of Fixture A') => swap(validEn(), EN_TABLE, table(caption, '| Key | Action |', rows));
    const ar = (rows, caption = 'جدول: التفاعل من لوحة المفاتيح مع المكوّن: النموذج أ') => swap(validAr(), AR_TABLE, table(caption, '| المفتاح | الإجراء |', rows));
    const keyFindings = (replace) => runPair(replace).findings.filter((item) => item.code !== 'HWC-STALE');
    const EN_ROWS = [['<kbd>Right Arrow</kbd>, <kbd>Left Arrow</kbd>', 'Moves to the next or the previous item in reading order.'], ['<kbd>Shift</kbd> + <kbd>Tab</kbd>', 'Leaves the control.']];

    it('accepts a keyboard table with key elements and Arabic arrow names in another order in an arrow row (A3)', () => {
      const result = runPair({ en: en(EN_ROWS), ar: ar([['<kbd>السهم الأيسر</kbd>، <kbd>السهم الأيمن</kbd>', 'ينقل إلى العنصر التالي أو السابق في ترتيب القراءة.'], ['<kbd>Shift</kbd> + <kbd>Tab</kbd>', 'يغادر عنصر التحكم.']]) });
      expect(result.findings.filter((item) => item.code !== 'HWC-STALE')).toEqual([]);
      expect(result.manifestPage.keyboard).toEqual({
        en: { caption: 'Keyboard interaction of Fixture A', line: 98, rows: [{ keys: ['ArrowRight', 'ArrowLeft'], action: 'Moves to the next or the previous item in reading order.' }, { keys: ['Shift+Tab'], action: 'Leaves the control.' }] },
        ar: { caption: 'التفاعل من لوحة المفاتيح مع المكوّن: النموذج أ', line: 108, rows: [{ keys: ['ArrowLeft', 'ArrowRight'], action: 'ينقل إلى العنصر التالي أو السابق في ترتيب القراءة.' }, { keys: ['Shift+Tab'], action: 'يغادر عنصر التحكم.' }] },
      });
      const table = result.models.en.sections.find((section) => section.id === 'accessibility').blocks.find((block) => block.type === 'table');
      expect(table.keyboard).toBe(true);
      expect(table.rows[1].c0).toEqual([{ type: 'kbd', value: 'Shift', latin: true }, { type: 'text', value: ' + ' }, { type: 'kbd', value: 'Tab', latin: true }]);
      const arTable = result.models.ar.sections.find((section) => section.id === 'accessibility').blocks.find((block) => block.type === 'table');
      expect(arTable.rows[0].c0[0]).toEqual({ type: 'kbd', value: 'السهم الأيسر', latin: false });
    });

    it('reports other keys, another order outside an arrow row, and an English arrow name on the Arabic page', () => {
      const messages = (rows) => keyFindings({ en: en(EN_ROWS), ar: ar(rows) }).map((item) => `${item.code} ${item.message}`);
      expect(messages([['<kbd>السهم الأيسر</kbd>، <kbd>السهم الأيمن</kbd>', 'ينقل.'], ['<kbd>Tab</kbd> + <kbd>Shift</kbd>', 'يغادر.']])).toEqual([
        'HWC-KEYS the keys Tab, Shift in Arabic differ from Shift, Tab in English; both pages name the same keys in the same order (only a cell of arrow keys may order them per language)',
      ]);
      expect(messages([['<kbd>Right Arrow</kbd>، <kbd>السهم الأيسر</kbd>', 'ينقل.'], ['<kbd>Shift</kbd> + <kbd>Tab</kbd>', 'يغادر.']])[0]).toBe('HWC-KEYS the key element "Right Arrow" names no key; in Arabic this key is written السهم الأيمن');
      expect(messages([['<kbd>السهم الأيسر</kbd>', 'ينقل.'], ['<kbd>Shift</kbd> + <kbd>Tab</kbd>', 'يغادر.']])).toEqual([
        'HWC-KEYS the keys ArrowLeft in Arabic differ from ArrowRight, ArrowLeft in English; both pages name the same keys in the same order (only a cell of arrow keys may order them per language)',
      ]);
    });

    it('reports a keyboard table with another caption, headers or a Key cell that is not key elements', () => {
      const messages = (text) => runPair({ en: text }).findings.filter((item) => item.code === 'HWC-KEYS' && !item.file.endsWith('.ar.md')).map((item) => item.message);
      expect(messages(en(EN_ROWS, 'Table: Keyboard interaction of Tabs'))).toEqual(['the keyboard table caption is "Keyboard interaction of Tabs"; write "Keyboard interaction of Fixture A"']);
      expect(messages(en([['Enter', 'Activates.']]))).toEqual(['the Key cell holds "Enter"; it holds key elements only, joined by + in a chord and separated by a comma']);
      expect(messages(en([['<kbd>Enter</kbd> <kbd>Space</kbd>', 'Activates.']]))).toEqual(['two key elements stand next to each other; join a chord with + and separate alternatives with a comma']);
      expect(messages(en([['<kbd>Enter</kbd>,', 'Activates.']]))).toEqual(['the Key cell ends with a separator']);
      expect(messages(en([['<kbd>Return</kbd>', 'Activates.']]))[0]).toMatch(/^the key element "Return" names no key; the key names are Tab, Shift, Ctrl/);
      expect(messages(swap(en(EN_ROWS), '| Key | Action |', '| Keys | Action |'))).toEqual(['the keyboard table header is "| Keys | Action |"; write "| Key | Action |"']);
    });

    // G20 of the 5a fix round: the mechanical rules of a row, which the contract stated before a check held them.
    it('reports the comma of the other language or "or" between keys, an arrow cell whose forward key is not first, and an Action cell that is not one sentence', () => {
      const enMessages = (rows) => runPair({ en: en(rows) }).findings.filter((item) => item.code === 'HWC-KEYS' && !item.file.endsWith('.ar.md')).map((item) => item.message);
      const arMessages = (rows) => keyFindings({ en: en(EN_ROWS), ar: ar(rows) }).filter((item) => item.code === 'HWC-KEYS').map((item) => item.message);
      const SHIFT_TAB = ['<kbd>Shift</kbd> + <kbd>Tab</kbd>', 'Leaves the control.'];
      const AR_SHIFT_TAB = ['<kbd>Shift</kbd> + <kbd>Tab</kbd>', 'يغادر عنصر التحكم.'];
      expect(enMessages([['<kbd>Right Arrow</kbd>، <kbd>Left Arrow</kbd>', 'Moves.'], SHIFT_TAB])).toEqual(['the Key cell holds "،"; it holds key elements only, joined by + in a chord and separated by a comma']);
      expect(enMessages([['<kbd>Right Arrow</kbd> or <kbd>Left Arrow</kbd>', 'Moves.'], SHIFT_TAB])).toEqual(['the Key cell holds "or"; it holds key elements only, joined by + in a chord and separated by a comma']);
      expect(arMessages([['<kbd>السهم الأيسر</kbd>, <kbd>السهم الأيمن</kbd>', 'ينقل.'], AR_SHIFT_TAB])).toEqual(['the Key cell holds ","; it holds key elements only, joined by + in a chord and separated by an Arabic comma (،)']);
      expect(arMessages([['<kbd>السهم الأيسر</kbd> أو <kbd>السهم الأيمن</kbd>', 'ينقل.'], AR_SHIFT_TAB])).toEqual(['the Key cell holds "أو"; it holds key elements only, joined by + in a chord and separated by an Arabic comma (،)']);
      // The forward key first: Right Arrow in English, Left Arrow in Arabic, Down Arrow in both.
      expect(enMessages([['<kbd>Left Arrow</kbd>, <kbd>Right Arrow</kbd>', 'Moves.'], SHIFT_TAB])).toEqual(['the Key cell names Left Arrow before Right Arrow; in an arrow cell the key that moves forward in reading order comes first']);
      expect(enMessages([['<kbd>Up Arrow</kbd>, <kbd>Down Arrow</kbd>', 'Moves.'], SHIFT_TAB])).toEqual(['the Key cell names Up Arrow before Down Arrow; in an arrow cell the key that moves forward in reading order comes first']);
      expect(arMessages([['<kbd>السهم الأيمن</kbd>، <kbd>السهم الأيسر</kbd>', 'ينقل.'], AR_SHIFT_TAB])).toEqual(['the Key cell names السهم الأيمن before السهم الأيسر; in an arrow cell the key that moves forward in reading order comes first']);
      // One sentence per Action cell, ended by a full stop.
      expect(enMessages([['<kbd>Right Arrow</kbd>, <kbd>Left Arrow</kbd>', 'Moves to the next item. It wraps.'], SHIFT_TAB])).toEqual(['the Action cell "Moves to the next item. It wraps." is 2 sentences; it states the outcome in one sentence']);
      expect(enMessages([['<kbd>Right Arrow</kbd>, <kbd>Left Arrow</kbd>', 'Moves to the next item'], SHIFT_TAB])).toEqual(['the Action cell "Moves to the next item" is not a sentence that ends with a full stop; it states the outcome in one sentence']);
      expect(arMessages([['<kbd>السهم الأيسر</kbd>، <kbd>السهم الأيمن</kbd>', 'ينقل إلى العنصر التالي. ويلتفّ.'], AR_SHIFT_TAB])).toEqual(['the Action cell "ينقل إلى العنصر التالي. ويلتفّ." is 2 sentences; it states the outcome in one sentence']);
    });
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
