// Forms the Arabic glossary (docs/guides/glossary.md) excludes, searched in the
// guide's Arabic text sources and the Arabic component pages. The forms are read
// from the table "Forms the glossary excludes" of that file,
// each a JavaScript regular expression in code; the file also holds the frozen API
// terms, the category labels of categories.json and the proper-noun exception.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GLOSSARY_FILE, excludedLines, glossaryTables, readExcluded } from '../glossary.mjs';

const guideDir = fileURLToPath(new URL('../../../', import.meta.url));
const docsDir = join(guideDir, '..', 'docs', 'components');
const appDir = join(guideDir, 'src', 'app');

const glossaryText = readFileSync(GLOSSARY_FILE, 'utf8');
const EXCLUDED = readExcluded(glossaryText);

function files(dir, test) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...files(path, test));
    else if (test(entry.name)) out.push(path);
  }
  return out;
}

const sources = [
  ...files(docsDir, (name) => name.endsWith('.ar.md')),
  // The Arabic guides and templates (docs/guides, docs/templates) and those of the fixture of scripts/test/kinds.
  ...['guides', 'templates'].flatMap((dir) => [join(guideDir, '..', 'docs', dir), join(guideDir, 'scripts', 'test', 'kinds', 'fixtures', dir)])
    .flatMap((dir) => files(dir, (name) => name.endsWith('.ar.md'))),
  ...files(appDir, (name) => name === 'i18n.ts'),
  ...files(join(appDir, 'i18n'), (name) => /\.(ts|json)$/.test(name) && !name.endsWith('.spec.ts')),
];


/** Lines of `text` that contain an excluded form. */
export function excludedForms(text) {
  return excludedLines(text, EXCLUDED).map((item) => `${item.line}: ${item.text} (use ${item.use})`);
}

describe('Arabic glossary', () => {
  // The pin of the list, renewed with the ten forms of the review of the first two Arabic pages.
  it('reads its twenty-two excluded forms from docs/guides/glossary.md', () => {
    expect(EXCLUDED).toHaveLength(22);
    expect(EXCLUDED.every((item) => item.form instanceof RegExp && item.use)).toBe(true);
  });

  it('holds the frozen API terms, one term each for an HTML attribute, a prop and a CSS property, the category labels and the proper-noun exception', () => {
    const tables = glossaryTables(glossaryText);
    const terms = new Map((tables['Arabic terms of the guide'] ?? []).slice(1).map(([concept, arabic]) => [concept, arabic]));
    for (const concept of ['slot (Vue)', 'event (Vue)', 'emit (an event)', 'output (Angular)', 'content projection (Angular)', 'default value', 'required', 'type', 'density', 'locale', 'direction']) {
      expect(terms.get(concept), concept).toMatch(/[\u0600-\u06FF]/);
    }
    const three = ['HTML attribute', 'React or Vue prop', 'CSS property'].map((concept) => terms.get(concept));
    expect(new Set(three).size).toBe(3);
    const categories = JSON.parse(readFileSync(join(appDir, 'i18n', 'categories.json'), 'utf8'));
    const labels = (tables['Category labels'] ?? []).slice(1).map(([category, arabic]) => [category, arabic]);
    expect(labels).toEqual(Object.keys(categories.en).map((id) => [`${categories.en[id]} (${id})`, categories.ar[id]]));
    expect(glossaryText).toContain('## Proper nouns');
    expect(glossaryText).toContain('«كود المنصات»');
  });

  it('reads the Arabic pages and the text sources', () => {
    expect(sources.filter((file) => file.endsWith('.ar.md')).length).toBeGreaterThan(1);
    expect(sources.some((file) => file.endsWith(join('landing', 'i18n.ts')))).toBe(true);
  });

  for (const file of sources) {
    it(`no excluded form in ${relative(join(guideDir, '..'), file)}`, () => {
      expect(excludedForms(readFileSync(file, 'utf8'))).toEqual([]);
    });
  }

  it('finds each excluded form', () => {
    expect(excludedForms('حمّل ملف الأنماط مرة واحدة.')).toHaveLength(1);
    expect(excludedForms('تملك وحدة التحكم الحالة.')).toHaveLength(1);
    // The header form and the form of الصنف without a class name after it.
    expect(excludedForms('| الاسم | الصنف | النوع | مطلوب | القيمة الافتراضية |')).toHaveLength(2);
    expect(excludedForms('اختر نمط الوضع الداكن.')).toHaveLength(1);
    // The forms of the verification (W2) that the first four patterns let through.
    expect(excludedForms('حمّل ملفات الأنماط مرة واحدة.')).toHaveLength(1);
    expect(excludedForms('حمّل ملف أنماط هوية.')).toHaveLength(1);
    expect(excludedForms('حمّل ملف CSS المجمّع.')).toHaveLength(1);
    expect(excludedForms('اكتب زرًا بالفئة `hw-button`.')).toHaveLength(1);
    expect(excludedForms('صنف الخاصية prop في Vue.')).toHaveLength(1);
    expect(excludedForms('تملك وحدة التحكّم الحالة.')).toHaveLength(1);
    expect(excludedForms('أخفِ اللوحة بالسمة hidden.')).toHaveLength(1);
    expect(excludedForms('انسخ الكود.')).toHaveLength(1);
    expect(excludedForms('ثبّت مهايئ React.')).toHaveLength(1);
    expect(excludedForms('ينتقل السهمان في كلا الاتجاهين.')).toHaveLength(1);
    expect(excludedForms('يعرض الزر بالفئات المرئية لهوية.')).toHaveLength(1);
    expect(excludedForms('بموجب رخصة Apache 2.0.')).toHaveLength(1);
    expect(excludedForms('تتبع التبويبات نمط التبويبات في ممارسات التأليف الخاصة بـWAI-ARIA، وتمنح ورقة الأنماط العنصر شكله بالصنف `hw-tab`.')).toEqual([]);
    // نمط names any WAI-ARIA pattern when the reference follows in the same sentence; never a colour mode.
    expect(excludedForms('يتبع المكوّن نمط الأكورديون في ممارسات التأليف الخاصة بـWAI-ARIA.')).toEqual([]);
    expect(excludedForms('يتبع المكوّن نمط الأقسام القابلة للطي في ممارسات التأليف الخاصة بـWAI-ARIA.')).toEqual([]);
    expect(excludedForms('يتبع المكوّن نمط الأكورديون.')).toHaveLength(1);
    expect(excludedForms('نمط الوضع الداكن في ممارسات التأليف الخاصة بـWAI-ARIA.')).toHaveLength(1);
    expect(excludedForms('نمط الألوان في ممارسات التأليف.')).toHaveLength(1);
    expect(excludedForms('مبنية لتتوافق مع كود المنصات، ولكود المنصات أصنافه، والسمة `dga` بالطُّرُز المرئية، بموجب ترخيص Apache 2.0، في اتجاهَي القراءة كليهما.')).toEqual([]);
  });

  // The rows that the review of the first two Arabic pages proposed, with the forms it names.
  it('finds each form that the review of the first two Arabic pages excludes, and lets the preferred form through', () => {
    expect(excludedForms('تُخفى العلامة عن التقنيات المساندة.')).toHaveLength(1);
    expect(excludedForms('تُخفى عن تقنية مساندة.')).toHaveLength(1);
    expect(excludedForms('تضبط الخاصية المظهر المعبّأ.')).toHaveLength(1);
    expect(excludedForms('يكون الحقل بمظهر الإطار.')).toHaveLength(1);
    expect(excludedForms('يحتفظ الحقل الذي للقراءة فقط بقيمته.')).toHaveLength(1);
    expect(excludedForms('ولا يستخدم حقل الإدخال النصي أيًّا منهما.')).toHaveLength(1);
    expect(excludedForms('ويُعرض العنوان عنوانًا من المستوى الثالث.')).toHaveLength(1);
    expect(excludedForms('قائمة وصفية مكدّسة.')).toHaveLength(1);
    expect(excludedForms('حيث يدعمها نوع الإدخال.')).toHaveLength(1);
    expect(excludedForms('يظهر الرابط. ومع `href` تعرض البطاقة رابطًا.')).toHaveLength(1);
    expect(excludedForms('اربط `[(value)]` لتحديد ثنائي الاتجاه.')).toHaveLength(1);
    expect(excludedForms('اربط `[(value)]` لقيمة نصية ثنائية الاتجاه.')).toHaveLength(1);
    expect(excludedForms([
      'تُخفى العلامة عن التقنيات المساعدة، ويميّز الشكل `outline` الإجراءات المساندة.',
      'تضبط الخاصية المظهر المملوء؛ ودونهما يكون الحقل بالمظهر ذي الإطار، والمظهر ذو الإطار هو الافتراضي.',
      'يحتفظ الحقل المخصّص للقراءة فقط بقيمته، ويرتبط النص الإرشادي بعنصر الإدخال، بحيث يقرؤه القارئ.',
      'ويُعرض عنوان البطاقة في عنصر عنوان من المستوى الثالث، والبطاقة تضمّ عنوانًا مع تصنيف.',
      'قائمة وصفية متراصّة، وعند كتابة `href` تعرض البطاقة رابطًا، ومرّر `value` مع `onValueChange`.',
      'اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة، أو ربطاً ثنائي الاتجاه بالتحديد.',
    ].join('\n'))).toEqual([]);
  });

  it('keeps the name of a pattern outside WAI-ARIA in Latin script', () => {
    const terms = new Map((glossaryTables(glossaryText)['Arabic terms of the guide'] ?? []).slice(1).map(([concept, arabic]) => [concept, arabic]));
    expect(terms.get('pattern outside WAI-ARIA (the row Platform patterns of docs/coverage.md)')).toBe('The name in Latin script: الصف Platform patterns');
    expect(excludedForms('تُدرج البطاقة في الصف Platform patterns من نطاق المكوّنات.')).toEqual([]);
    expect(excludedForms('تُدرج البطاقة في نمط المنصات.')).toHaveLength(1);
  });
});
