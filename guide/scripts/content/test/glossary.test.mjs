// Forms the Arabic glossary (docs/components/README.md) excludes, searched in the
// guide's Arabic text sources and the Arabic component pages: a style sheet is ورقة
// الأنماط, the Kind column is الفئة (الصنف is the CSS class), a controller is
// المتحكم, نمط is used only as نمط التبويبات with the reference to the pattern, an
// HTML attribute is الخاصية (السمة is the theme), code is الشيفرة, an adapter is
// المحوّل, a visual family of Button is الطراز المرئي, a licence is الترخيص, and
// both reading directions are اتجاهَا القراءة.

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

// Arabic letters, for word boundaries (\b does not see them).
const AR = '\u0600-\u06FF';
const EXCLUDED = [
  { form: /ملف(?:ات)? (?:ال)?أنماط|ملف(?:ات)? CSS/, use: 'ورقة الأنماط' },
  { form: /وحد(?:ة|ات) (?:ال)?تحك\u0651?م/, use: 'المتحكم' },
  { form: /^\|[^\n]*\|\s*الصنف\s*\|[^\n]*\|\s*$/m, use: 'الفئة as the Kind column header' },
  { form: /نمط(?! التبويبات في ممارسات التأليف)/, use: 'نمط only as نمط التبويبات with the reference to the pattern' },
  { form: /(?:[وفبلك]?ال|[وفبلك])فئة\s+`?hw-/, use: 'الصنف for a CSS class (الفئة is the Kind column)' },
  { form: new RegExp(`(?:^|[^${AR}])(?:[وفبلك]?ال|[وفبلك])?صنف(?![${AR}])(?!\\s+\`)`), use: 'الصنف only for a CSS class, followed by its name in code (the Kind column is الفئة)' },
  { form: /سمة[\u064B-\u0652]?\s+`?(?!dga\b|custom\b|data-hw-theme\b)[A-Za-z]/, use: 'الخاصية for an HTML attribute (السمة is the theme)' },
  { form: new RegExp(`(?:^|[^${AR}])(?:[وفبلك]?ال)كود`), use: 'الشيفرة for code (كود المنصات is the Platforms Code)' },
  { form: /مهاي[ئي]/, use: 'المحوّل for an adapter' },
  { form: /في كلا الاتجاهين/, use: 'في اتجاهَي القراءة كليهما' },
  { form: /(?:[وفبلك]?ال|[وفبلك])فئات? المرئية/, use: 'الطراز المرئي, الطُّرُز المرئية for a visual family of Button' },
  { form: /رخصة/, use: 'الترخيص' },
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
    expect(excludedForms('مبنية لتتوافق مع كود المنصات، ولكود المنصات أصنافه، والسمة `dga` بالطُّرُز المرئية، بموجب ترخيص Apache 2.0، في اتجاهَي القراءة كليهما.')).toEqual([]);
  });
});
