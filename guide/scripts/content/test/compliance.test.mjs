// The compliance sentence is one string in one source (src/app/i18n/compliance.json,
// glossary of docs/components/README.md): the footer and the landing import it, and
// the Platforms Code reference section of every component page opens with it. No
// other wording of the claim exists in the text sources or the component pages.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const guideDir = fileURLToPath(new URL('../../../', import.meta.url));
const docsDir = join(guideDir, '..', 'docs', 'components');
const appDir = join(guideDir, 'src', 'app');
const compliance = JSON.parse(readFileSync(join(appDir, 'i18n', 'compliance.json'), 'utf8'));

/** Words that only the compliance sentence may use. */
const MARKERS = {
  en: [/official DGA product/i, /certification/i, /built to comply/i],
  ar: [/منتجًا رسميًا/, /شهادة/, /لتتوافق مع كود المنصات/, /للامتثال لكود المنصات/],
};

function files(dir, test) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...files(path, test));
    else if (test(entry.name)) out.push(path);
  }
  return out;
}

/** The text of a file with every occurrence of the allowed strings removed. */
function remainder(text, allowed) {
  return allowed.reduce((rest, string) => rest.split(string).join(''), text);
}

const pages = readdirSync(docsDir).filter((name) => name.endsWith('.md') && name !== 'README.md');
const langOf = (name) => (name.endsWith('.ar.md') ? 'ar' : 'en');

/** The first paragraph after the Platforms Code reference heading of a page. */
function referenceOpening(text) {
  const lines = text.split('\n');
  const heading = lines.findIndex((line) => line === '## Platforms Code reference' || line === '## مرجع كود المنصات');
  if (heading < 0) return null;
  return lines.slice(heading + 1).find((line) => line.trim() !== '') ?? null;
}

describe('the compliance sentence', () => {
  it('has one English and one Arabic string, the footer wording', () => {
    expect(compliance.en).toBe(
      'Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification.',
    );
    expect(compliance.ar).toMatch(/^هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات/);
  });

  it('opens the Platforms Code reference section of every component page', () => {
    expect(pages.length).toBeGreaterThan(0);
    for (const name of pages) {
      const opening = referenceOpening(readFileSync(join(docsDir, name), 'utf8'));
      expect(opening, name).not.toBeNull();
      expect(opening?.startsWith(`${compliance[langOf(name)]} `), name).toBe(true);
    }
  });

  it('exists in no other wording in the component pages', () => {
    for (const name of pages) {
      const lang = langOf(name);
      const rest = remainder(readFileSync(join(docsDir, name), 'utf8'), [compliance[lang]]);
      for (const marker of MARKERS[lang]) expect(marker.test(rest), `${name}: ${marker}`).toBe(false);
    }
  });

  it('is imported, not written, by the guide text sources', () => {
    const sources = files(appDir, (name) => name.endsWith('.ts') && !name.endsWith('.spec.ts'));
    const importers = [];
    for (const file of sources) {
      const text = readFileSync(file, 'utf8');
      if (text.includes("compliance.json'")) importers.push(file.slice(appDir.length + 1));
      // The lead statement of the landing is the first sentence of the English string
      // and the first clause of the Arabic one; no other text may word the claim.
      const allowed = [compliance.en.split('. ')[0] + '.', compliance.ar.split('،')[0] + '.'];
      const rest = remainder(text, allowed);
      for (const marker of [...MARKERS.en, ...MARKERS.ar]) expect(marker.test(rest), `${file}: ${marker}`).toBe(false);
    }
    expect(importers.sort()).toEqual(['features/landing/i18n.ts', 'i18n/shell.ts']);
  });
});
