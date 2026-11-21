// Forms the Arabic glossary (docs/guides/glossary.md) excludes, searched in the
// guide's Arabic text sources and the Arabic component pages. The forms are read
// from the table "Forms the glossary excludes" of that file (leadAmendments A14),
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
  ...files(appDir, (name) => name === 'i18n.ts'),
  ...files(join(appDir, 'i18n'), (name) => /\.(ts|json)$/.test(name) && !name.endsWith('.spec.ts')),
];


/** Lines of `text` that contain an excluded form. */
export function excludedForms(text) {
  return excludedLines(text, EXCLUDED).map((item) => `${item.line}: ${item.text} (use ${item.use})`);
}

describe('Arabic glossary', () => {
  it('reads its twelve excluded forms from docs/guides/glossary.md', () => {
    expect(EXCLUDED).toHaveLength(12);
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
    // G21: نمط names any WAI-ARIA pattern when the reference follows in the same sentence; never a colour mode.
    expect(excludedForms('يتبع المكوّن نمط الأكورديون في ممارسات التأليف الخاصة بـWAI-ARIA.')).toEqual([]);
    expect(excludedForms('يتبع المكوّن نمط الأقسام القابلة للطي في ممارسات التأليف الخاصة بـWAI-ARIA.')).toEqual([]);
    expect(excludedForms('يتبع المكوّن نمط الأكورديون.')).toHaveLength(1);
    expect(excludedForms('نمط الوضع الداكن في ممارسات التأليف الخاصة بـWAI-ARIA.')).toHaveLength(1);
    expect(excludedForms('نمط الألوان في ممارسات التأليف.')).toHaveLength(1);
    expect(excludedForms('مبنية لتتوافق مع كود المنصات، ولكود المنصات أصنافه، والسمة `dga` بالطُّرُز المرئية، بموجب ترخيص Apache 2.0، في اتجاهَي القراءة كليهما.')).toEqual([]);
  });
});
