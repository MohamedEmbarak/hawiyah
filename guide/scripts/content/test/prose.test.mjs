// The text gates of step 20 from the fix round of stage 5a (prose.mjs): claims
// (HWC-CLAIM), hollow sections and API prose (HWC-EMPTY), placeholders (HWC-TODO),
// marketing terms (HWC-TONE), install text in running text (HWC-MD) and the page's
// component in every live group (HWC-LIVE7). The sentences of the attacks are those
// of the adversarial review of 07763ce (09a to 09d, 06b, 10, 22b, 22e, 23a to 23d, 25c).

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { processPair, readComponents, readFixture, runContent } from '../pipeline.mjs';
import {
  CLAIM_PATTERNS, angularSelectors, blockShows, componentNames, normaliseArabic, readClaimExceptions, readLiveComponentExceptions, readMarketingTerms,
} from '../prose.mjs';
import { components, componentsDir, fixtureNames, guideDir, repoDir, runPair, validAr, validEn } from './helpers.mjs';

const swap = (text, from, to) => {
  if (!text.includes(from)) throw new Error(`fixture text not found: ${from}`);
  return text.replace(from, to);
};
const EN_ANCHOR = 'The layout uses logical properties only.';
const AR_ANCHOR = 'يستخدم التخطيط الخصائص المنطقية فقط.';
const withEn = (sentence) => swap(validEn(), EN_ANCHOR, `${EN_ANCHOR} ${sentence}`);
const withAr = (sentence) => swap(validAr(), AR_ANCHOR, `${AR_ANCHOR} ${sentence}`);
const found = (result, code) => result.findings.filter((item) => item.code === code);
const claims = (sides) => found(runPair(sides), 'HWC-CLAIM').map((item) => item.message.split('"')[1]);

describe('HWC-CLAIM: claims of a status Hawiyah does not have', () => {
  it.each([
    ['09a', 'Hawiyah is certified by the Digital Government Authority.', 'certified'],
    ['09b', 'Fixture A is an official DGA component.', 'is an official'],
    ['09c', 'Fixture A shows one value for government platforms.', 'for government'],
    ['06b', 'Fixture A conforms to WCAG 2.2 level AAA and needs no further testing.', 'conforms'],
    ['endorsed', 'The DGA endorses this library.', 'endorses'],
    ['approved', 'The component is approved for use on portals.', 'approved'],
    ['accredited', 'An accredited design system.', 'accredited'],
    ['licensed', 'It is licensed by the authority.', 'licensed'],
    ['officially', 'It is officially supported.', 'officially'],
    ['compliant', 'Every example is compliant.', 'compliant'],
  ])('%s fails in English', (_name, sentence, match) => {
    expect(claims({ en: withEn(sentence) })).toEqual([match]);
  });

  it.each([
    ['09d', 'وهوية معتمدة رسميًا من هيئة الحكومة الرقمية ومطابقة لكود المنصات.'],
    ['مصدّق', 'والمكوّن مصدّق من الهيئة.'],
    ['مرخّص', 'والمكوّن مرخّص للاستخدام.'],
    ['منتج رسمي', 'هوية منتج رسمي.'],
    ['رسميًا', 'يُدعم رسميًا.'],
    ['للمنصات الحكومية', 'المكوّن مخصص للمنصات الحكومية.'],
    ['للجهات الحكومية', 'وهو مخصص للجهات الحكومية.'],
    ['مطابقة', 'والمكوّن مطابق لمعايير WCAG.'],
    ['شهادة', 'وتحمل المكتبة شهادة من الهيئة.'],
  ])('%s fails in Arabic, with or without diacritics', (_name, sentence) => {
    expect(claims({ ar: withAr(sentence) })).toHaveLength(1);
  });

  it('accepts the compliance sentence and the words of the pilots in another sense', () => {
    expect(found(runPair({ en: withEn('The notes record the source style sheet without its official font files; they do not establish parity with live government sites.') }), 'HWC-CLAIM')).toEqual([]);
    expect(found(runPair({ ar: withAr('دون ملفات خطوطها الرسمية، ولا تثبت تطابقًا مرئيًا كاملًا مع المواقع الحكومية الحية.') }), 'HWC-CLAIM')).toEqual([]);
    expect(normaliseArabic('مُعتمَدة رسميًّا')).toBe('معتمدة رسميا');
    expect(CLAIM_PATTERNS.ar.some((pattern) => pattern.test(normaliseArabic('مُعتمَدة')))).toBe(true);
  });

  it('a negated form passes only through an entry of claim-exceptions.json, and an entry that matches nothing fails', () => {
    const sentence = 'Fixture A is not certified by any body.';
    expect(claims({ en: withEn(sentence) })).toEqual(['certified']);
    const file = 'guide/scripts/content/test/fixtures/docs/components/fixture-a.md';
    const paragraph = `${EN_ANCHOR} ${sentence} Read the Platforms Code and the component list.`;
    const entry = { file, text: paragraph, reason: 'negated', approvedBy: 'lead' };
    expect(found(runPair({ en: withEn(sentence), claimExceptions: [entry] }), 'HWC-CLAIM')).toEqual([]);
    expect(readClaimExceptions()).toEqual([]);

    const dir = mkdtempSync(join(tmpdir(), 'hawiyah-claims-'));
    try {
      const docs = join(dir, 'components');
      mkdirSync(docs);
      writeFileSync(join(docs, 'fixture-a.md'), validEn());
      writeFileSync(join(docs, 'fixture-a.ar.md'), validAr());
      const label = relative(repoDir, join(docs, 'fixture-a.md'));
      const run = (claimExceptions) => runContent({
        guideDir, repoDir, componentsDir: docs, componentsFile: join(componentsDir, '..', 'components.json'), outDir: join(dir, 'out'),
        liveGroupsFile: join(dir, 'out', 'live-groups.json'), pending: new Set(), names: () => fixtureNames, claimExceptions, liveExceptions: [],
      });
      const stale = run([{ ...entry, file: label.split('\\').join('/') }]);
      // The copy lies outside the repository, so its relative links fail too (HWC-LINK); only the list is judged here.
      expect(found(stale, 'HWC-CLAIM').map((item) => `${item.code} ${item.message}`)).toEqual([
        expect.stringMatching(/^HWC-CLAIM entry 1 \(.*fixture-a\.md: .*Fixture A is not certified.*\) matches nothing; remove it$/),
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('HWC-TONE, HWC-TODO and install text', () => {
  it('fails on the marketing terms of the lead list in both languages', () => {
    const terms = readMarketingTerms();
    expect(terms.map((entry) => entry.term)).toEqual(expect.arrayContaining(['beautiful', 'blazing', 'best-in-class', 'stunning', 'delight', 'seamless', 'powerful', 'effortless', 'world-class', 'cutting-edge', 'رائع', 'مذهل', 'الأفضل', 'فائق السرعة']));
    const tone = (sides) => found(runPair(sides), 'HWC-TONE').map((item) => item.message.split('"')[1]);
    expect(tone({ en: withEn('A beautiful, blazing-fast and best-in-class way to delight your users with stunning numbers.') })).toEqual(['beautiful', 'stunning', 'blazing', 'best-in-class', 'delight']);
    expect(tone({ ar: withAr('وهو المكوّن الأفضل وتصميمه رائع.') })).toEqual(['رائع', 'الأفضل']);
  });

  it('fails on TODO, TBD and lorem ipsum everywhere, and on the scaffold placeholder in docs/components only', () => {
    const todo = (sides) => found(runPair(sides), 'HWC-TODO').map((item) => item.message.split('"')[1] ?? item.message);
    expect(todo({ en: withEn('TODO: write this section.') })).toEqual(['TODO']);
    expect(todo({ en: withEn('TBD.') })).toEqual(['TBD']);
    expect(todo({ en: withEn('Lorem ipsum dolor sit amet.') })).toEqual(['Lorem ipsum']);
    const placeholder = withAr('نص مؤقت إلى حين الترجمة.');
    expect(todo({ ar: placeholder })).toEqual([]);
    const inDocs = processPair({
      id: 'fixture-a', entry: components.get('fixture-a'), enText: validEn(), arText: placeholder,
      enPath: join(repoDir, 'docs', 'components', 'fixture-a.md'), arPath: join(repoDir, 'docs', 'components', 'fixture-a.ar.md'),
      repoDir, componentsDir: join(repoDir, 'docs', 'components'), built: new Set(['fixture-a']), names: fixtureNames, fixture: null, liveExceptions: [], claimExceptions: [],
    });
    expect(found(inDocs, 'HWC-TODO').map((item) => item.message)).toEqual([expect.stringMatching(/^the text is the placeholder of content:scaffold-ar --placeholder/)]);
  });

  it('fails on an install command or a pinned address in running text, as code or plain (22b, 22e)', () => {
    const md = (sides) => found(runPair(sides), 'HWC-MD').map((item) => item.message.split('"')[1]);
    expect(md({ en: withEn('Install it with `npm install @hawiyah/react@0.2.0`.') })).toEqual(['npm install']);
    expect(md({ en: withEn('Install it with npm install @hawiyah/react@0.2.0 --force.') })).toEqual(['npm install']);
    expect(md({ en: withEn('The version `@hawiyah/react@0.2.0` is older.') })).toEqual(['@hawiyah/react@0']);
    expect(md({ en: withEn('The package `@hawiyah/react` renders it.') })).toEqual([]);
  });
});

describe('HWC-EMPTY: a required section beyond its fixed text, and prose after each API table', () => {
  it('fails on an empty required section, a section of fixed text only, and an API table without prose (23a, 23b, 23d)', () => {
    const empty = (en) => found(runPair({ en }), 'HWC-EMPTY').map((item) => item.message);
    expect(empty(swap(validEn(), 'The layout uses logical properties only. Read the [Platforms Code](https://www.dga.gov.sa/) and the [component list](../components.json).\n\n---\n\n- Text follows the page direction.\n- Numbers keep their own direction.\n', ''))).toEqual([
      'the section "RTL and localisation" has no paragraph or list of its own beyond the fixed text (captions, the generated note, the compliance sentence); write it',
    ]);
    expect(empty(swap(validEn(), 'The label input names the control; the content selector places an icon.\n', ''))).toEqual([
      'the Angular table has no prose after it; describe its members after the table',
    ]);
  });
});

describe('HWC-LIVE7: every live group contains the page\'s component', () => {
  it('names every component of components.json by a class and an Angular selector of the installed packages', () => {
    const all = readComponents(join(repoDir, 'components.json'));
    expect(all.size).toBe(85);
    const nodeModules = join(guideDir, 'node_modules');
    expect(angularSelectors(nodeModules).size).toBeGreaterThan(80);
    for (const [id, entry] of all) {
      const names = componentNames(id, entry, nodeModules);
      expect(names.vanilla.classes.length, id).toBeGreaterThan(0);
      expect(names.angular.selectors.length, id).toBeGreaterThan(0);
      expect(names.react.length * names.vue.length, id).toBeGreaterThan(0);
    }
    const tabs = componentNames('tabs', all.get('tabs'), nodeModules);
    expect(tabs.angular.selectors).toEqual(['hw-tabs', 'hw-tab']);
    const button = componentNames('button', all.get('button'), nodeModules);
    expect(button.angular.selectors).toEqual(['button[hwButton]', 'a[hwButton]']);
    expect(blockShows('angular', 'template: `<button hwButton variant="primary">Go</button>`', button)).toBe(true);
    expect(blockShows('angular', 'template: `<button class="hw-button">Go</button>`', button)).toBe(false);
    expect(blockShows('vanilla', '<div class="hw-tab-list-x hw-stack"></div>', tabs)).toBe(false);
    expect(blockShows('vanilla', '<div class="hw-stack hw-tabs" data-hw="tabs"></div>', tabs)).toBe(true);
    expect(blockShows('react', '<Tabs label="x" items={[]} />', tabs)).toBe(true);
    expect(blockShows('react', '<TabsList />', tabs)).toBe(false);
  });

  it('fails on a group of another component (25c), unless the lead list names the group', () => {
    const foreign = swap(validEn(), '```tsx live example=primary\n<Button variant="primary">Continue</Button>', '```tsx live example=primary\n<Link href="#api">Continue</Link>');
    expect(found(runPair({ en: foreign }), 'HWC-LIVE7').map((item) => item.message)).toEqual([expect.stringMatching(/^the live group "primary" does not show the page's component in react: /)]);
    const file = 'guide/scripts/content/test/fixtures/docs/components/fixture-a.md';
    expect(found(runPair({ en: foreign, liveExceptions: [{ file, example: 'primary', reason: 'r', approvedBy: 'lead' }] }), 'HWC-LIVE7')).toEqual([]);
    // The lead's list holds one entry: the RatingDisplay group of the Rating page.
    expect(readLiveComponentExceptions().map((entry) => `${entry.file} ${entry.example} ${entry.approvedBy}`)).toEqual(['docs/components/rating.md display lead', 'docs/components/rating.ar.md display lead']);
  });

  it('reads fixture.json beside a docs copy outside docs/components only', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hawiyah-fixture-'));
    try {
      mkdirSync(join(dir, 'components'));
      expect(readFixture(join(dir, 'components'), repoDir)).toBe(null);
      writeFileSync(join(dir, 'fixture.json'), JSON.stringify({ fixture: 'scale', showsComponent: 'button', reason: 'generic groups' }));
      expect(readFixture(join(dir, 'components'), repoDir)).toMatchObject({ showsComponent: 'button' });
      writeFileSync(join(dir, 'fixture.json'), JSON.stringify({ fixture: 'scale', showsComponent: 'button' }));
      expect(() => readFixture(join(dir, 'components'), repoDir)).toThrow(/must be \{ "fixture", "showsComponent", "reason" \}/);
      expect(readFixture(join(repoDir, 'docs', 'components'), repoDir)).toBe(null);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
