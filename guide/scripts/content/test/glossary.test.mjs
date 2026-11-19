// Forms the Arabic glossary (docs/components/README.md) excludes, searched in the
// guide's Arabic text sources and the Arabic component pages: a style sheet is ورقة
// الأنماط, the Kind column is الفئة (الصنف is the CSS class), a controller is
// المتحكم, and نمط is used only as نمط التبويبات with the reference to the pattern.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const guideDir = fileURLToPath(new URL('../../../', import.meta.url));
const docsDir = join(guideDir, '..', 'docs', 'components');
const appDir = join(guideDir, 'src', 'app');

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

const EXCLUDED = [
  { form: /ملف الأنماط/, use: 'ورقة الأنماط' },
  { form: /وحد(?:ة|ات) (?:ال)?تحكم/, use: 'المتحكم' },
  { form: /^\|[^\n]*\|\s*الصنف\s*\|[^\n]*\|\s*$/m, use: 'الفئة as the Kind column header' },
  { form: /نمط(?! التبويبات في ممارسات التأليف)/, use: 'نمط only as نمط التبويبات with the reference to the pattern' },
];

/** Lines of `text` that contain an excluded form. */
export function excludedForms(text) {
  const found = [];
  text.split('\n').forEach((line, index) => {
    for (const { form, use } of EXCLUDED) if (form.test(line)) found.push(`${index + 1}: ${line.trim().slice(0, 60)} (use ${use})`);
  });
  return found;
}

describe('Arabic glossary', () => {
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
    expect(excludedForms('| الاسم | الصنف | النوع | مطلوب | القيمة الافتراضية |')).toHaveLength(1);
    expect(excludedForms('اختر نمط الوضع الداكن.')).toHaveLength(1);
    expect(excludedForms('تتبع التبويبات نمط التبويبات في ممارسات التأليف الخاصة بـWAI-ARIA، وتمنح ورقة الأنماط العنصر شكله بالصنف `hw-tab`.')).toEqual([]);
  });
});
