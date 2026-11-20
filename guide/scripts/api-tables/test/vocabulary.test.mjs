// The vocabulary pass of step 30 (HWC-VOCAB, 5a.5 of milestone 5, with
// leadAmendments A5 and A9): the pilots pass without an exception, and each kind
// of invented name fails with one finding. Fixtures are the pilot pages with
// one code value changed.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { memberCache } from '../cli.mjs';
import { coverageLines, coverageOf } from '../coverage.mjs';
import { checkVocabulary, createVocabularyContext, markupTerms, readVocabularyExceptions, terms } from '../vocabulary.mjs';
import { processPair } from '../../content/pipeline.mjs';
import { repoDir, testReaders } from './helpers.mjs';

const docs = join(repoDir, 'docs', 'components');
const source = (name) => readFileSync(join(docs, name), 'utf8');

let readers;
let vocab;
let declared;
beforeAll(() => {
  readers = testReaders();
  vocab = createVocabularyContext(readers, { repoDir });
  declared = memberCache(readers);
}, 120000);

/** The English page of `id` with `replace` applied, as a page model and its live groups. */
function fixture(id, replace = (text) => text) {
  const enText = replace(source(`${id}.md`));
  const pair = processPair({
    id, entry: readers.components.get(id), enText, arText: source(`${id}.ar.md`), enPath: join(docs, `${id}.md`), arPath: join(docs, `${id}.ar.md`),
    repoDir, componentsDir: docs, built: new Set(['button', 'tabs']), exceptions: [],
  });
  return { pages: [{ id, lang: 'en', page: pair.models.en }], liveGroups: pair.groupEntries.en, pair };
}

const run = (input, exceptions = []) => checkVocabulary({ ...input, vocab, declared, exceptions });
const messages = (result) => result.findings.map((item) => `${item.code} ${item.message}`);
const once = (text, from, to) => {
  if (!text.includes(from)) throw new Error(`fixture: ${from} not in the page`);
  return text.replace(from, to);
};

describe('the pilots', () => {
  it.each(['button', 'tabs'])('%s passes in both languages without an exception', (id) => {
    const pair = fixture(id).pair;
    const result = run({ pages: [{ id, lang: 'en', page: pair.models.en }, { id, lang: 'ar', page: pair.models.ar }], liveGroups: [...pair.groupEntries.en, ...pair.groupEntries.ar] });
    expect(messages(result)).toEqual([]);
    expect(result.stats.codes).toBeGreaterThan(50);
    expect(result.stats.markup).toBeGreaterThan(20);
    expect(result.stats.excepted).toBe(0);
  });
  it('the repository list has no entry', () => {
    expect(readVocabularyExceptions()).toEqual([]);
  });
});

describe('each kind of invented name fails with HWC-VOCAB', () => {
  it('an invented prop', () => {
    const input = fixture('tabs', (text) => once(text, 'A `TabItem` is `{ value, label, content, disabled? }`;', 'A `TabItem` is `{ value, label, content, disabled? }`; `closeLabel` names the close button;'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/react: `closeLabel`: closeLabel is not a member of this component in any adapter, of a component the sentence links to, an export, a value of this component or a name of vocabulary-allow.json',
    ]);
  });
  it('an invented class', () => {
    const input = fixture('tabs', (text) => once(text, 'not the `div.hw-tabs`', 'not the `div.hw-tab-strip`'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/react: `div.hw-tab-strip`: hw-tab-strip is not a class of the installed stylesheet',
    ]);
  });
  it('an invented export', () => {
    const input = fixture('tabs', (text) => once(text, 'A `TabItem` is `{ value, label, content, disabled? }`;', 'A `TabsItem` is `{ value, label, content, disabled? }`;'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/react: `TabsItem`: TabsItem is not an export of an installed @hawiyah package',
    ]);
  });
  it('a wrong literal', () => {
    const input = fixture('tabs', (text) => once(text, '`aria-orientation="vertical"` on the tab list', '`aria-orientation="diagonal"` on the tab list'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/javascript: `aria-orientation="diagonal"`: "diagonal" is not a value of a member type or of an enumerated attribute of this component (attribute aria-orientation)',
    ]);
    const quoted = fixture('button', (text) => text.replace('The variant sets the visual family.', "The variant `'huge'` sets the visual family."));
    expect(messages(run(quoted))).toEqual([
      'HWC-VOCAB docs/components/button.md: variants-and-states/variants: `\'huge\'`: "huge" is not a value of a member type or of an enumerated attribute of this component',
    ]);
  });
  it('an invented data-hw hook in an html live block, and in prose', () => {
    const input = fixture('tabs', (text) => once(text, '<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll">', '<div class="hw-tabs" data-hw="tab-set" data-hw-overflow="scroll">'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: live example basic (html): `data-hw="tab-set"`: "tab-set" is not a hook that enhance() of @hawiyah/vanilla registers',
    ]);
    const prose = fixture('tabs', (text) => once(text, 'for every element with `data-hw="tabs"`', 'for every element with `data-hw="tabset"`'));
    expect(messages(run(prose))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/javascript: `data-hw="tabset"`: "tabset" is not a hook that enhance() of @hawiyah/vanilla registers',
    ]);
  });
  it('an invented class and data attribute in an html live block', () => {
    const input = fixture('tabs', (text) => once(text, '<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll">', '<div class="hw-tabs hw-tabs-wide" data-hw="tabs" data-hw-overflow="scroll" data-hw-sticky="true">'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: live example basic (html): `class="hw-tabs hw-tabs-wide"`: hw-tabs-wide is not a class of the installed stylesheet',
      'HWC-VOCAB docs/components/tabs.md: live example basic (html): `data-hw-sticky`: data-hw-sticky is neither selected by the installed stylesheet, read by a published module, nor an attribute of vocabulary-allow.json',
    ]);
  });
  it('a scoped package the guide does not install', () => {
    const input = fixture('tabs', (text) => once(text, 'for every element with `data-hw="tabs"`', 'for every element with `data-hw="tabs"` (`@angular/forms` is installed, `@acme/tabs` is not)'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/javascript: `@acme/tabs`: @acme/tabs is not a package the guide installs (guide/package.json)',
    ]);
  });
  it('an invented package path and a missing file', () => {
    // The evidence panel replaced the hand-kept open items (5a.11): the file name stands in the opening paragraph of the section.
    const input = fixture('tabs', (text) => once(once(text, '`enhance()` from `@hawiyah/vanilla`', '`enhance()` from `@hawiyah/vanilla/tabs`'), 'verification evidence that components.json records', 'verification evidence that `component-list.json` records'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/javascript: `@hawiyah/vanilla/tabs`: @hawiyah/vanilla/tabs is not an installed @hawiyah package or export path',
      'HWC-VOCAB docs/components/tabs.md: platforms-code-reference: `component-list.json`: component-list.json is not a file of the repository root',
    ]);
  });
});

describe('framework scope (leadAmendments A9)', () => {
  it('a member of another framework under a framework heading is a finding', () => {
    const input = fixture('tabs', (text) => once(text, 'A `TabItem` is `{ value, label, content, disabled? }`;', 'A `TabItem` is `{ value, label, content, disabled? }`; bind `modelValue`;'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/react: `modelValue`: modelValue is a member of vue only, and the paragraph is scoped to react (leadAmendments A9: the check cannot decide)',
    ]);
  });
  it('a paragraph that names a framework is scoped to it, outside a framework heading as well', () => {
    const input = fixture('tabs', (text) => once(text, '- Only one tab is in the tab order at a time;', '- In Angular, `defaultValue` sets the first tab. Only one tab is in the tab order at a time;'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility: `defaultValue`: defaultValue is a member of react, vue only, and the paragraph is scoped to angular (leadAmendments A9: the check cannot decide)',
    ]);
  });
  it('an export of another adapter under a framework heading is a finding', () => {
    const input = fixture('tabs', (text) => once(text, 'A `TabItem` is `{ value, label, content, disabled? }`;', 'A `TabItem` is `{ value, label, content, disabled? }`; see `HwTabsComponent`;'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/react: `HwTabsComponent`: HwTabsComponent is an export of angular only, and the paragraph is scoped to react (leadAmendments A9: the check cannot decide)',
    ]);
  });
  it('a member of a component the sentence links to is accepted', () => {
    const add = '- The tab buttons are not [Button](button.md) elements and take no `data-variant`; only one tab is in the tab order at a time;';
    const linked = fixture('tabs', (text) => once(text, '- Only one tab is in the tab order at a time;', add));
    expect(messages(run(linked))).toEqual([]);
    const unlinked = fixture('tabs', (text) => once(text, '- Only one tab is in the tab order at a time;', '- The tab buttons take no `loading`; only one tab is in the tab order at a time;'));
    expect(messages(run(unlinked))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility: `loading`: loading is not a member of this component in any adapter, of a component the sentence links to, an export, a value of this component or a name of vocabulary-allow.json',
    ]);
  });
});

describe('vocabulary-exceptions.json', () => {
  const entry = { file: 'docs/components/tabs.md', text: 'closeLabel', reason: 'test', approvedBy: 'test' };
  it('an entry covers its finding', () => {
    const input = fixture('tabs', (text) => once(text, 'A `TabItem` is `{ value, label, content, disabled? }`;', 'A `TabItem` is `{ value, label, content, disabled? }`; `closeLabel` names the close button;'));
    const result = run(input, [entry]);
    expect(messages(result)).toEqual([]);
    expect(result.stats.excepted).toBe(1);
  });
  it('an entry that matches nothing fails', () => {
    expect(messages(run(fixture('tabs'), [entry]))).toEqual([
      'HWC-VOCAB scripts/api-tables/vocabulary-exceptions.json: the entry for `closeLabel` in docs/components/tabs.md matches no finding; remove it',
    ]);
  });
  it('an entry of a page that is not checked is not judged (check:page)', () => {
    expect(messages(run(fixture('button'), [entry]))).toEqual([]);
  });
});

describe('reading code values', () => {
  it('splits a value into terms', () => {
    expect(terms('createTabs(root, options)').map((term) => `${term.kind}:${term.name}`)).toEqual(['name:createTabs', 'name:root', 'name:options']);
    expect(terms('[role="tablist"]')).toEqual([{ kind: 'attribute', name: 'role', value: 'tablist' }]);
    expect(terms('[loading]="saving"')).toEqual([{ kind: 'binding', name: 'loading' }]);
    expect(terms('[attr.aria-busy]')).toEqual([{ kind: 'attribute', name: 'aria-busy' }]);
    expect(terms('div.hw-tabs')).toEqual([{ kind: 'name', name: 'div', call: false, member: false }, { kind: 'class', name: 'hw-tabs' }]);
    expect(terms('display: contents')).toEqual([{ kind: 'css', name: 'display', value: 'contents' }]);
    expect(terms('@hawiyah/styles')).toEqual([{ kind: 'package', name: '@hawiyah/styles' }]);
    expect(terms('@click')).toEqual([{ kind: 'event', name: 'click' }]);
    expect(terms('tab:<value>')).toEqual([{ kind: 'name', name: 'tab:<value>', call: false, member: false }]);
    expect(terms("'primary'")).toEqual([{ kind: 'literal', value: 'primary' }]);
  });
  it('reads classes, hooks and data attributes of html', () => {
    expect(markupTerms('<div class="hw-tabs x" data-hw="tabs" data-hw-overflow="scroll" aria-label="A"><p>t</p></div>')).toEqual([
      { kind: 'class', name: 'hw-tabs', text: 'class="hw-tabs x"' },
      { kind: 'class', name: 'x', text: 'class="hw-tabs x"' },
      { kind: 'hook', name: 'tabs', text: 'data-hw="tabs"' },
      { kind: 'attribute', name: 'data-hw-overflow', text: 'data-hw-overflow' },
    ]);
  });
});

describe('the coverage report (leadAmendments A5)', () => {
  it('lists the enumerated values and boolean members that no group shows and Variants and states does not list', () => {
    const { pair } = fixture('tabs');
    const result = coverageOf({ id: 'tabs', page: pair.models.en, groups: pair.groupEntries.en, declared: declared('tabs') });
    expect(result.missing).toEqual([
      { framework: 'angular', member: 'direction', kind: 'value', value: 'ltr' },
      { framework: 'angular', member: 'direction', kind: 'value', value: 'rtl' },
    ]);
    expect(coverageLines(result)[0]).toBe(`coverage: tabs: 2 of ${result.counted} enumerated values and boolean members of the API are shown by no live group and not listed in Variants and states (a report, not a gate)`);
  });
  it('a value no group shows and Variants and states does not name is reported', () => {
    const { pair } = fixture('tabs');
    const page = { ...pair.models.en, sections: pair.models.en.sections.filter((section) => section.id !== 'variants-and-states') };
    const groups = pair.groupEntries.en.filter((group) => group.example !== 'manual');
    const result = coverageOf({ id: 'tabs', page, groups, declared: declared('tabs') });
    expect(result.missing.filter((item) => item.value === 'manual').map((item) => item.framework)).toEqual(['vanilla', 'react', 'vue', 'angular']);
  });
});
