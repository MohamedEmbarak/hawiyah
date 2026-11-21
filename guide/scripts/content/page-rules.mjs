// The rules of one page that the build checks outside step 20, run by check:page on
// the page's own sources (G8 of the 5a fix round):
//   HWT-GLOSSARY    no form that docs/guides/glossary.md excludes in the Arabic page
//                   (scripts/content/test/glossary.test.mjs over every page);
//   HWT-COMPLIANCE  the section Platforms Code reference opens with the compliance
//                   sentence, and its marker words stand nowhere else
//                   (scripts/content/test/compliance.test.mjs over every page);
//   HWP-LATIN       on the Arabic page, no run of four or more Latin-script words in
//                   the reader text of the Markdown (step 72 over the prerendered
//                   page, which also reads the examples and the generated text).
import { readFileSync } from 'node:fs';
import { latinRuns, readAllowlist } from '../page-guards/guards.mjs';
import { excludedLines } from './glossary.mjs';
import { parseMarkdown } from './parse.mjs';
import { textUnits } from './prose.mjs';

export const COMPLIANCE = JSON.parse(readFileSync(new URL('../../src/app/i18n/compliance.json', import.meta.url), 'utf8'));
export const LATIN_ALLOWLIST_FILE = new URL('../page-guards/latin-allowlist.json', import.meta.url);

/** Words that only the compliance sentence may use (compliance.test.mjs). */
export const MARKERS = {
  en: [/official DGA product/i, /certification/i, /built to comply/i],
  ar: [/منتجًا رسميًا/, /شهادة/, /لتتوافق مع كود المنصات/, /للامتثال لكود المنصات/],
};

/** The first paragraph after the Platforms Code reference heading of a page, and its line. */
export function referenceOpening(text) {
  const lines = text.split('\n');
  const heading = lines.findIndex((line) => line === '## Platforms Code reference' || line === '## مرجع كود المنصات');
  if (heading < 0) return null;
  const index = lines.findIndex((line, i) => i > heading && line.trim() !== '');
  return index < 0 ? null : { text: lines[index], line: index + 1 };
}

/** HWT-COMPLIANCE findings of one page. */
export function complianceFindings(text, lang, file) {
  const findings = [];
  const opening = referenceOpening(text);
  if (!opening || !opening.text.startsWith(`${COMPLIANCE[lang]} `)) {
    findings.push({ code: 'HWT-COMPLIANCE', file, line: opening?.line ?? 1, message: 'the section Platforms Code reference opens with the compliance sentence of src/app/i18n/compliance.json, word for word, followed by the sentence that introduces the sources' });
  }
  const rest = text.split(COMPLIANCE[lang]).join('');
  for (const marker of MARKERS[lang]) {
    const at = rest.split('\n').findIndex((line) => marker.test(line));
    if (at >= 0) findings.push({ code: 'HWT-COMPLIANCE', file, line: 1, message: `"${marker.source}" stands outside the compliance sentence; only that sentence words the claim` });
  }
  return findings;
}

/** HWT-GLOSSARY findings of an Arabic page. */
export function glossaryFindings(text, file) {
  return excludedLines(text).map((item) => ({ code: 'HWT-GLOSSARY', file, line: item.line, message: `"${item.text}" has a form the Arabic glossary excludes; use ${item.use}` }));
}

/** HWP-LATIN findings of the reader text of an Arabic page (Markdown, not the examples). */
export function latinFindings(text, file, id, allowlist = readAllowlist(LATIN_ALLOWLIST_FILE)) {
  const findings = [];
  const listed = (run) => allowlist.some((entry) => run === entry.text && (!entry.pages || entry.pages.some((page) => page.includes(`components/${id}/`))));
  for (const unit of textUnits(parseMarkdown(text, file).tree)) {
    for (const run of latinRuns(unit.text)) {
      if (!listed(run)) findings.push({ code: 'HWP-LATIN', file, line: unit.line, message: `the Latin-script run "${run.slice(0, 80)}" stands in Arabic reader text; write it in Arabic or as code, or propose a latin-allowlist.json entry` });
    }
  }
  return findings;
}

/** The three rules on the sources of one page: { en?: text, ar?: text } with their files. */
export function pageRuleFindings({ id, en, ar }) {
  const findings = [];
  if (en) findings.push(...complianceFindings(en.text, 'en', en.file));
  if (ar) findings.push(...complianceFindings(ar.text, 'ar', ar.file), ...glossaryFindings(ar.text, ar.file), ...latinFindings(ar.text, ar.file, id));
  return findings;
}
