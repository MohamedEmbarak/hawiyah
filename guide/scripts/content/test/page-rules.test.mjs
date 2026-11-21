// The rules of one page that check:page runs besides the steps of the build (G8 of
// the 5a fix round): the glossary and compliance assertions of the script tests and
// the Latin-script guard of step 72 on the page's own Markdown. The cases are those
// of the verification of 07763ce (r17, r18, r19), which passed check:page there.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pageRuleFindings } from '../page-rules.mjs';
import { repoDir } from './helpers.mjs';

const docs = join(repoDir, 'docs', 'components');
const read = (name) => readFileSync(join(docs, name), 'utf8');
const pageOf = (id, change = {}) => ({
  id,
  en: { text: (change.en ?? ((text) => text))(read(`${id}.md`)), file: `docs/components/${id}.md` },
  ar: { text: (change.ar ?? ((text) => text))(read(`${id}.ar.md`)), file: `docs/components/${id}.ar.md` },
});
const swap = (from, to) => (text) => {
  if (!text.includes(from)) throw new Error(`fixture text not found: ${from}`);
  return text.replace(from, to);
};
const lines = (page) => pageRuleFindings(page).map((item) => `${item.code} ${item.file}:${item.line}: ${item.message}`);

describe('the page rules of check:page', () => {
  it.each(['button', 'tabs'])('%s passes them', (id) => {
    expect(lines(pageOf(id))).toEqual([]);
  });

  it('fails a reworded compliance sentence (r17)', () => {
    const page = pageOf('tabs', {
      en: swap('Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification.', 'Hawiyah is a UI component library that complies with the DGA Platforms Code.'),
      ar: swap('هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد.', 'هوية مكتبة مكوّنات واجهات ممتثلة لكود المنصات.'),
    });
    expect(lines(page).filter((line) => line.startsWith('HWT-COMPLIANCE')).map((line) => line.split(':')[0])).toEqual([
      'HWT-COMPLIANCE docs/components/tabs.md', 'HWT-COMPLIANCE docs/components/tabs.ar.md',
    ]);
  });

  it('fails a run of Latin-script words in Arabic prose (r18) and a form the glossary excludes (r19)', () => {
    const latin = pageOf('tabs', { ar: swap('- قيم التبويبات معرّفات لا نصوص، وتبقى نفسها في كل لغة.', '- قيم التبويبات معرّفات identifiers not texts and they stay the same.') });
    expect(lines(latin)).toEqual([expect.stringMatching(/^HWP-LATIN docs\/components\/tabs\.ar\.md:\d+: the Latin-script run "identifiers not texts and they stay the same" /)]);
    const glossary = pageOf('tabs', { ar: swap('- قيم التبويبات معرّفات لا نصوص، وتبقى نفسها في كل لغة.', '- قيم التبويبات معرّفات لا نصوص، وتبقى نفسها في كل لغة، كما في الكود.') });
    expect(lines(glossary)).toEqual([expect.stringMatching(/^HWT-GLOSSARY docs\/components\/tabs\.ar\.md:\d+: ".*" has a form the Arabic glossary excludes; use الشيفرة/)]);
  });
});
