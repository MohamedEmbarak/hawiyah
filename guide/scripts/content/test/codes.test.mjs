// One failing fixture per failure code of the content step: each fixture in
// fixtures/invalid/ replaces one side of the valid fixture-a pair and must be
// reported with its code, file, line and message.

import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CODES } from '../config.mjs';
import { listSources } from '../pipeline.mjs';
import { components, invalidDir, runInvalid, runPair } from './helpers.mjs';

const CASES = [
  ['HWC-FM1', 'hwc-fm1.md', 1, /^an English page has no front matter; remove the block$/],
  ['HWC-FM2', 'hwc-fm2.ar.md', 1, /^unknown front matter key "author"; the only key is source$/],
  ['HWC-H1', 'hwc-h1.md', 1, /^the h1 is "Fixture B"; components\.json gives "Fixture A" \(name\)$/],
  ['HWC-SUM', 'hwc-sum.md', 3, /^the summary has 3 sentences; write one or two$/],
  ['HWC-H2', 'hwc-h2.md', 47, /^the h2 "Usage" is not one of "Example", "Variants and states", "API"/],
  ['HWC-API', 'hwc-api.md', 64, /^the React table header is "\| Property \| Type \| Required \| Default \|"; expected "\| Prop \| Type \| Required \| Default \|"$/],
  ['HWC-H5', 'hwc-h5.md', 102, /^h5 is not allowed; use h3 and h4 only$/],
  ['HWC-TAB1', 'hwc-tab1.md', 90, /^the table has no caption; write a paragraph that starts with "Table: " directly above it$/],
  ['HWC-LINK', 'hwc-link.md', 88, /^the link "missing-page\.md" points to .*missing-page\.md, which does not exist$/],
  ['HWC-MD', 'hwc-md.md', 111, /^raw HTML is not allowed; write Markdown$/],
  ['HWC-LIVE1', 'hwc-live1.md', 13, /^unknown key "size"; allowed keys are example, framework, check, differences$/],
  ['HWC-LIVE2', 'hwc-live2.md', 9, /^example "primary" has the frameworks vanilla, react, angular; a group is exactly vanilla \(html\), react \(tsx or jsx\), vue \(vue\), angular \(ts framework=angular\), in that order$/],
  ['HWC-LIVE3', 'hwc-live3.md', 31, /^the example name "primary" is used more than once in this file$/],
  ['HWC-PAR1', 'hwc-par1.ar.md', 119, /^heading 13 is h3 in Arabic and h2 "rtl-and-localisation" in English; both pages have the same heading tree$/],
  ['HWC-PAR2', 'hwc-par2.ar.md', 132, /^code block 1 differs from the English page/],
  ['HWC-PAR3', 'hwc-par3.ar.md', 19, /^the live groups are primary \(example\), language \(variants-and-states, h3\) in Arabic and primary \(example\), direction \(variants-and-states, h3\) in English/],
  ['HWC-PAR4', 'hwc-par4.ar.md', 23, /^live block "primary" \(react\) differs from the English block at token 5: ""secondary"" in Arabic, ""primary"" in English/],
  ['HWC-PAR5', 'hwc-par5.ar.md', 102, /^table 5 has 2 columns and 1 rows in section accessibility in Arabic; English has 2 columns and 2 rows in section accessibility$/],
  ['HWC-PAR6', 'hwc-par6.ar.md', 107, /^the alerts are tip@accessibility in Arabic and note@accessibility in English/],
  ['HWC-PAR7', 'hwc-par7.ar.md', 17, /^section "example" has code as block 1 in Arabic and paragraph in English; both pages have the same paragraphs, lists, items and other blocks in the same order$/],
  ['HWC-PAR8', 'hwc-par8.ar.md', 17, /^the paragraph has no Arabic script: "The example shows one primary action\."; translate it, or list it in scripts\/content\/arabic-exceptions\.json with a reason$/],
  ['HWC-STALE', 'hwc-stale.ar.md', 96, /^section "accessibility" was translated from an earlier English text \(000000000000, now 29c24403f585\); update the translation, then run npm run content:hash -- fixture-a$/],
];

describe('failure codes of step 20', () => {
  it('accepts the valid fixture pair', () => {
    expect(runPair().findings).toEqual([]);
  });

  it('has one invalid fixture for every code', () => {
    const files = readdirSync(invalidDir).sort();
    const named = CODES.map((code) => code.toLowerCase());
    expect(files.map((file) => file.replace(/(\.ar)?\.md$/, '')).sort()).toEqual([...named].sort());
    expect(CASES.map(([code]) => code).concat('HWC-FILE').sort()).toEqual([...CODES].sort());
  });

  it.each(CASES)('%s from %s', (code, file, line, message) => {
    const { findings } = runInvalid(file);
    const match = findings.find((item) => item.code === code && item.file === `invalid/${file}`);
    expect(match, `${code} in ${JSON.stringify(findings, null, 1)}`).toBeDefined();
    expect(match.line).toBe(line);
    expect(match.message).toMatch(message);
  });

  it('HWC-FILE from hwc-file.md (an id that is not in components.json) and from a missing sibling', () => {
    const { ids, findings } = listSources(['fixture-a.md', 'fixture-a.ar.md', 'hwc-file.md', 'README.md'], components, 'docs/components');
    expect(ids).toEqual(['fixture-a']);
    expect(findings).toEqual([
      { code: 'HWC-FILE', file: 'docs/components/hwc-file.md', line: 1, message: '"hwc-file" is not a component id in components.json' },
    ]);
    const lonely = listSources(['fixture-a.md'], components, 'docs/components');
    expect(lonely.ids).toEqual([]);
    expect(lonely.findings.map((item) => [item.code, item.message])).toEqual([
      ['HWC-FILE', 'the English page has no Arabic sibling fixture-a.ar.md'],
    ]);
    const bad = listSources(['Fixture_A.md'], components, 'docs/components');
    expect(bad.findings.map((item) => item.code)).toEqual(['HWC-FILE']);
  });
});
