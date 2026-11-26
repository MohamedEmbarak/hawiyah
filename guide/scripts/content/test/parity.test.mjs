// Arabic and English parity, including live token parity (HWC-PAR4).

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { liveTokenDifference, readArabicExceptions, styleHooks, tokensMatch } from '../parity.mjs';
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

  // The review of the Arabic pilot pages: a value that is Latin by nature is not reader text.
  it('exempts the value of an email, url, tel or number field and a value without any letter, in every framework form (HWC-PAR8)', () => {
    const blocks = {
      vanilla: '<button class="hw-button" type="button" data-variant="primary">متابعة</button>',
      react: '<Button variant="primary">متابعة</Button>',
      vue: '<HwButton variant="primary">متابعة</HwButton>',
      angular: 'template: `<button hwButton variant="primary">متابعة</button>`',
    };
    const live = (framework, markup) => runPair({ ar: validAr().replace(blocks[framework], framework === 'angular' ? `template: \`${markup}\`` : markup) }).findings
      .filter((item) => item.code === 'HWC-PAR8')
      .map((item) => item.message.split(' has no')[0]);
    // An email value in Latin passes on the Arabic page, in each form.
    expect(live('vanilla', '<input class="hw-input" name="email" type="email" value="applicant@example.com">')).toEqual([]);
    expect(live('vanilla', '<input class="hw-input" value="https://example.com/a" type="url"><input class="hw-input" type="tel" value="+966 11 000 0000"><input class="hw-input" type="number" value="12e3">')).toEqual([]);
    expect(live('react', '<TextField label="البريد الإلكتروني" type="email" defaultValue="applicant" />')).toEqual([]);
    expect(live('vue', '<TextField label="البريد الإلكتروني" type="email" default-value="applicant" />')).toEqual([]);
    expect(live('angular', '<hw-text-field label="البريد الإلكتروني" type="email" value="applicant" /><hw-text-field label="الموقع" [type]="\'url\'" [value]="\'example.com\'" />')).toEqual([]);
    // A value without any letter needs no Arabic letter.
    expect(live('react', '<TextField label="المبلغ" defaultValue="1,250.00" />')).toEqual([]);
    // A text value in English still fails, in each form.
    expect(live('vanilla', '<input class="hw-input" name="org" type="text" value="Example Company">')).toEqual(['live block "primary" (vanilla) value']);
    expect(live('react', '<TextField label="الجهة" defaultValue="Example" />')).toEqual(['live block "primary" (react) defaultValue']);
    expect(live('vue', '<TextField label="الجهة" type="text" default-value="Example" />')).toEqual(['live block "primary" (vue) default-value']);
    expect(live('angular', '<hw-text-field label="الجهة" value="Example" />')).toEqual(['live block "primary" (angular) value']);
  });

  // The intake of the first Arabic component pages: HWC-PAR8 read expressions, option values
  // and styling hooks as reader text, and the text of a textarea as code (HWC-PAR4).
  describe('reader text only (HWC-PAR8)', () => {
    const blocks = {
      vanilla: '<button class="hw-button" type="button" data-variant="primary">متابعة</button>',
      react: '<Button variant="primary">متابعة</Button>',
      vue: '<HwButton variant="primary">متابعة</HwButton>',
      angular: 'template: `<button hwButton variant="primary">متابعة</button>`',
    };
    const block = (framework, markup) => (framework === 'angular' ? `template: \`${markup}\`` : markup);
    /** The PAR8 findings of the fixture with some of the four blocks of the primary group replaced, in both pages or in Arabic only. */
    const par8 = (arabic, english = {}) => {
      const put = (text, replace) => Object.entries(replace).reduce((out, [framework, markup]) => swap(out, blocks[framework], block(framework, markup)), text);
      return runPair({ en: put(validEn().replaceAll('Continue', 'متابعة'), english), ar: put(validAr(), arabic) }).findings
        .filter((item) => item.code === 'HWC-PAR8')
        .map((item) => item.message.replace(/; translate it.*/, ''));
    };

    it('reads the string literals of a bound expression, not the expression', () => {
      expect(par8({ vue: '<Switch label="الإشعارات" :default-value="true" />', angular: '<hw-switch label="الإشعارات" [value]="true" />' })).toEqual([]);
      expect(par8({ angular: '<hw-avatar-group label="الفريق" [getOverflowLabel]="overflowLabel" />' })).toEqual([]);
      // A literal inside the expression that the reader sees is judged under the name of the binding.
      expect(par8({ vue: '<Switch :label="\'Notifications\'" />', angular: '<hw-switch [label]="\'Notifications\'" />' })).toEqual([
        'live block "primary" (vue) :label has no Arabic script: "Notifications"',
        'live block "primary" (angular) [label] has no Arabic script: "Notifications"',
      ]);
      expect(par8({ vue: '<AvatarGroup label="الفريق" :get-overflow-label="(count: number) => (count === 1 ? \'شخص واحد آخر\' : `${count} more people`)" />' })).toEqual([
        'live block "primary" (vue) :get-overflow-label has no Arabic script: "more people`"',
      ]);
      expect(par8({ vue: '<AvatarGroup label="الفريق" :items="[{ name: \'Rana Cole\' }]" />' })).toEqual(['live block "primary" (vue) name has no Arabic script: "Rana Cole"']);
    });

    it('reads the value of a component that the group writes as an option value as a token, and a shown value as reader text', () => {
      const radios = '<input class="hw-radio" type="radio" name="delivery" value="post"><option value="email">البريد الإلكتروني</option>';
      expect(par8({ vanilla: `${blocks.vanilla}${radios}`, react: '<><Radio name="delivery" value="post" label="بالبريد" /><Select defaultValue="email" /></>', vue: '<RadioGroup default-value="post" /><Select default-value="email" />' })).toEqual([]);
      // Without the option in the group, the value of a component stays reader text.
      expect(par8({ react: '<Radio name="delivery" value="post" label="بالبريد" />' })).toEqual(['live block "primary" (react) value has no Arabic script: "post"']);
      // The value of a text input is shown, in the native markup and in the component.
      expect(par8({ vanilla: `${blocks.vanilla}<input class="hw-input" name="org" value="post">`, react: '<TextField label="الجهة" defaultValue="post" />' })).toEqual([
        'live block "primary" (vanilla) value has no Arabic script: "post"',
        'live block "primary" (react) defaultValue has no Arabic script: "post"',
      ]);
    });

    it('reads a data-* attribute that the stylesheet selects as a styling hook', () => {
      expect(styleHooks().has('data-message')).toBe(true);
      expect(styleHooks().has('data-copied-message')).toBe(false);
      expect(par8({ vanilla: '<button class="hw-button" type="button" data-variant="primary" data-message="true">متابعة</button>' })).toEqual([]);
      expect(par8({ vanilla: '<button class="hw-button" type="button" data-variant="primary" data-copied-message="true">متابعة</button>' })).toEqual(['live block "primary" (vanilla) data-copied-message has no Arabic script: "true"']);
    });

    it('reads the name of a component as reader text where the English group reads it so, and as a field name elsewhere', () => {
      const vanilla = '<span class="hw-avatar" role="img" aria-label="Rana Cole"><span aria-hidden="true">RC</span></span>';
      const english = { vanilla, react: '<><Avatar name="Rana Cole" /><TextField label="Name" name="applicant" /></>' };
      const arabicVanilla = '<span class="hw-avatar" role="img" aria-label="رنا كمال"><span aria-hidden="true">رك</span></span>';
      expect(par8({ vanilla: arabicVanilla, react: '<><Avatar name="Rana Cole" /><TextField label="الاسم" name="applicant" /></>' }, english)).toEqual(['live block "primary" (react) name has no Arabic script: "Rana Cole"']);
      expect(par8({ vanilla: arabicVanilla, react: '<><Avatar name="رنا كمال" /><TextField label="الاسم" name="applicant" /></>' }, english)).toEqual([]);
    });

    // The Arabic pages of Notification list, Service details and Site verification: a bound
    // value or an Angular template written over several lines was read line by line, a Vue
    // slot and an interpolation as text, and a host name as a phrase to translate.
    it('reads a bound value and an Angular template written over several lines as one expression and one template', () => {
      const items = (title) => `[\n    {\n      title: '${title}',\n      read: true,\n    },\n  ]`;
      expect(par8({ vue: `<NotificationList\n  label="الإشعارات"\n  :items="${items('استلام الطلب')}"\n/>`, angular: `<hw-notification-list\n  label="الإشعارات"\n  [items]="${items('استلام الطلب')}"\n/>` })).toEqual([]);
      expect(par8({ vue: `<NotificationList\n  label="الإشعارات"\n  :items="${items('Request received')}"\n/>`, angular: `<hw-notification-list\n  label="Notifications"\n  [items]="${items('استلام الطلب')}"\n/>` })).toEqual([
        'live block "primary" (vue) title has no Arabic script: "Request received"',
        'live block "primary" (angular) label has no Arabic script: "Notifications"',
      ]);
    });

    it('reads a Vue slot as an expression and an interpolation as code, and the text around it as reader text', () => {
      const slot = (text) => `<ServiceDetails title="حالة المستند">\n  <template #requirement="{ item, index }">\n    <a class="hw-link" :href="index === 0 ? '/a' : '/b'">${text}</a>\n  </template>\n</ServiceDetails>`;
      expect(par8({ vue: slot('{{ item }}'), angular: '<p>@for (item of items; track item) {<span>{{ item }}</span>}</p>' })).toEqual([]);
      expect(par8({ vue: slot('{{ item }} requests') })).toEqual(['live block "primary" (vue) text has no Arabic script: "{{ item }} requests"']);
    });

    it('reads markup text that is one host name as Latin by nature', () => {
      expect(par8({ vanilla: `${blocks.vanilla}<h2>اسم النطاق: <bdi>portal.example.test</bdi></h2>` })).toEqual([]);
      expect(par8({ vanilla: `${blocks.vanilla}<h2>اسم النطاق: <bdi>Portal example</bdi></h2>` })).toEqual(['live block "primary" (vanilla) text has no Arabic script: "Portal example"']);
    });

    it('reads the value of a component as a token where the group writes it as the data-hw-value of an item', () => {
      const vanilla = '<button class="hw-tab" type="button" role="tab" data-hw-value="overview">نظرة عامة</button>';
      expect(par8({ vanilla, angular: '<hw-tabs label="تفاصيل الطلب"><hw-tab value="overview" label="نظرة عامة"><p>الطلب قيد المراجعة.</p></hw-tab></hw-tabs>' })).toEqual([]);
      expect(par8({ angular: '<hw-tabs label="تفاصيل الطلب"><hw-tab value="overview" label="نظرة عامة"><p>الطلب قيد المراجعة.</p></hw-tab></hw-tabs>' })).toEqual(['live block "primary" (angular) value has no Arabic script: "overview"']);
    });

    it('reads the text of a textarea as reader text that differs between the pages (HWC-PAR4)', () => {
      expect(liveTokenDifference('html', '<textarea class="hw-textarea" readonly>The request was received.</textarea>', '<textarea class="hw-textarea" readonly>استُلم الطلب.</textarea>')).toBe(null);
      expect(par8({ vanilla: `${blocks.vanilla}<textarea class="hw-textarea" readonly>The request was received.</textarea>` })).toEqual(['live block "primary" (vanilla) text has no Arabic script: "The request was received."']);
    });
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
