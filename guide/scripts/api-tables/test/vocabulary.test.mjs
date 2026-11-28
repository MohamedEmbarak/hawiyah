// The vocabulary pass of step 30 (HWC-VOCAB): the pilots pass without an exception, and each kind
// of invented name fails with one finding. Fixtures are the pilot pages with
// one code value changed.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { memberCache } from '../cli.mjs';
import { coverageLines, coverageOf } from '../coverage.mjs';
import { checkVocabulary, comparedValues, componentVocabulary, createVocabularyContext, documentedAttributes, judge, markupTerms, readVocabularyExceptions, readmeBlocks, terms, textInputBlocks } from '../vocabulary.mjs';
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
      'HWC-VOCAB docs/components/tabs.md: live example basic (html): `data-hw-sticky`: data-hw-sticky is neither selected by the installed stylesheet, read by a published module, documented by an installed README for this component or a linked one, nor an attribute of vocabulary-allow.json',
    ]);
  });
  it('a scoped package the guide does not install', () => {
    const input = fixture('tabs', (text) => once(text, 'for every element with `data-hw="tabs"`', 'for every element with `data-hw="tabs"` (`@angular/forms` is installed, `@acme/tabs` is not)'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/javascript: `@acme/tabs`: @acme/tabs is not a package the guide installs (guide/package.json)',
    ]);
  });
  it('an invented package path and a missing file', () => {
    // The evidence panel replaced the hand-kept open items: the file name stands in the opening paragraph of the section.
    const input = fixture('tabs', (text) => once(once(text, '`enhance()` from `@hawiyah/vanilla`', '`enhance()` from `@hawiyah/vanilla/tabs`'), 'verification evidence that components.json records', 'verification evidence that `component-list.json` records'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/javascript: `@hawiyah/vanilla/tabs`: @hawiyah/vanilla/tabs is not an installed @hawiyah package or export path',
      'HWC-VOCAB docs/components/tabs.md: platforms-code-reference: `component-list.json`: component-list.json is not a file of the repository root',
    ]);
  });
});

describe('framework scope', () => {
  it('a member of another framework under a framework heading is a finding', () => {
    const input = fixture('tabs', (text) => once(text, 'A `TabItem` is `{ value, label, content, disabled? }`;', 'A `TabItem` is `{ value, label, content, disabled? }`; bind `modelValue`;'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/react: `modelValue`: modelValue is a member of vue only, and the paragraph is scoped to react (the check cannot decide)',
    ]);
  });
  it('a paragraph that names a framework is scoped to it, outside a framework heading as well', () => {
    const input = fixture('tabs', (text) => once(text, '- Only one tab is in the tab order at a time;', '- In Angular, `defaultValue` sets the first tab. Only one tab is in the tab order at a time;'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility: `defaultValue`: defaultValue is a member of react, vue only, and the paragraph is scoped to angular (the check cannot decide)',
    ]);
  });
  it('an export of another adapter under a framework heading is a finding', () => {
    const input = fixture('tabs', (text) => once(text, 'A `TabItem` is `{ value, label, content, disabled? }`;', 'A `TabItem` is `{ value, label, content, disabled? }`; see `HwTabsComponent`;'));
    expect(messages(run(input))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: api/react: `HwTabsComponent`: HwTabsComponent is an export of angular only, and the paragraph is scoped to react (the check cannot decide)',
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

// The ways through that an earlier verification found
// (a caption, framework heading outside API, literal of another attribute, data-*
// value and aria-* name of an html block, a name split across formatting, plain prose)
// and the true statements the review found rejected (a row name of the page's own
// Angular table, the type words).
describe('what the vocabulary pass reads and accepts', () => {
  const ACCESSIBILITY = '## Accessibility\n\n';
  const insert = (block) => fixture('tabs', (text) => once(text, ACCESSIBILITY, `${ACCESSIBILITY}${block}\n\n`));
  it('reads the caption of a table outside the API section', () => {
    expect(messages(run(insert('Table: Tabs and `bogusCaption`\n\n| Item | Note |\n| --- | --- |\n| One | Two |')))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility: `bogusCaption`: bogusCaption is not a member of this component in any adapter, of a component the sentence links to, an export, a value of this component or a name of vocabulary-allow.json',
    ]);
  });
  it('scopes a paragraph under a framework heading in any section', () => {
    expect(messages(run(insert('### Angular\n\nListen to `onValueChange` to follow the selection.')))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility/angular-1: `onValueChange`: onValueChange is a member of vanilla, react only, and the paragraph is scoped to angular (the check cannot decide)',
    ]);
  });
  it('takes the value of name="value" from that attribute or member only', () => {
    expect(messages(run(insert('Write `orientation="manual"` on the list.')))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility: `orientation="manual"`: "manual" is not a value of a member type or of an enumerated attribute of this component (attribute orientation)',
    ]);
    expect(messages(run(insert('Write `orientation="vertical"` on the list.')))).toEqual([]);
  });
  it('reads the value of a data-* attribute and the name of an aria-* attribute of an html block', () => {
    const value = fixture('tabs', (text) => once(text, '<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll">', '<div class="hw-tabs" data-hw="tabs" data-hw-overflow="sideways">'));
    expect(messages(run(value))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: live example basic (html): `data-hw-overflow="sideways"`: "sideways" is not a value of data-hw-overflow ("menu", "scroll")',
    ]);
    const aria = fixture('tabs', (text) => once(text, 'aria-label="Request details" aria-orientation="horizontal">', 'aria-label="Request details" aria-orientation="horizontal" aria-bogus="x">'));
    expect(messages(run(aria))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: live example basic (html): `aria-bogus`: aria-bogus is neither selected by the installed stylesheet, read by a published module, nor an attribute of vocabulary-allow.json',
    ]);
  });
  it('fails on a name split across formatting; a name in plain prose is not read', () => {
    expect(messages(run(insert('Set `orientation`*Mode* to change it.')))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility: `orientation`: the name continues outside the code formatting ("orientationMode"); write the whole name as code',
    ]);
    expect(messages(run(insert('Set the orientationMode option to change it.')))).toEqual([]);
  });
  it('accepts the row names of the page\'s own API tables in their scope, and the type words', () => {
    const row = (prose) => fixture('tabs', (text) => once(once(text, '| `hw-tab *` | content | — | `false` | — |', '| `hw-tab *` | content | — | `false` | — |\n| `[hwTabsIcon]` | content | — | `false` | — |'), ACCESSIBILITY, `${ACCESSIBILITY}${prose}\n\n`));
    expect(messages(run(row('### Angular\n\nThe content row `[hwTabsIcon]` places an icon; `hwTabsIcon` names it.')))).toEqual([]);
    expect(messages(run(row('### React\n\nThe content row `[hwTabsIcon]` places an icon.')))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility/react-1: `[hwTabsIcon]`: hwTabsIcon is not a member of this component in any adapter, of a component the sentence links to, an export, a value of this component or a name of vocabulary-allow.json',
    ]);
    expect(messages(run(insert('The value is a `string` or `undefined`, never a `number`; `disabled` is `true` or `false`, and `null` clears it; a `boolean`.')))).toEqual([]);
  });
});

// The three kinds of real names that the review of the pilot pages found refused: the
// custom properties of @hawiyah/styles, the elements of the HTML Standard and the
// exports and selectors of an installed package that belong to another component.
describe('names that the installed packages or the HTML Standard define', () => {
  const ACCESSIBILITY = '## Accessibility\n\n';
  const insert = (block, id = 'tabs') => fixture(id, (text) => once(text, ACCESSIBILITY, `${ACCESSIBILITY}${block}\n\n`));
  it('accepts a custom property that the stylesheet defines or the styles README documents, and refuses an invented one', () => {
    expect(messages(run(insert('The panel keeps `--hw-gap`; `--hw-space-4` and `var(--hw-gap)` set it, as `--hw-gap: 2rem` does.')))).toEqual([]);
    expect(messages(run(insert('The panel keeps `--hw-tab-gutter`.')))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility: `--hw-tab-gutter`: --hw-tab-gutter is neither a custom property that the installed stylesheet defines nor one that the @hawiyah/styles README documents',
    ]);
    // A prefix that the README writes (--hw-*) names no property.
    expect(messages(run(insert('The panel keeps `--hw-color`.')))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility: `--hw-color`: --hw-color is neither a custom property that the installed stylesheet defines nor one that the @hawiyah/styles README documents',
    ]);
  });
  it('accepts the elements of the HTML Standard, and refuses an invented element', () => {
    expect(messages(run(insert('Place the tabs below an `h2` or an `h3`; a `dl`, a `figure`, a `time` and a `blockquote` stand in a panel.')))).toEqual([]);
    expect(messages(run(insert('Place the tabs below an `h7` or a `tabset`.')))).toEqual([
      'HWC-VOCAB docs/components/tabs.md: accessibility: `h7`: h7 is not a member of this component in any adapter, of a component the sentence links to, an export, a value of this component or a name of vocabulary-allow.json',
      'HWC-VOCAB docs/components/tabs.md: accessibility: `tabset`: tabset is not a member of this component in any adapter, of a component the sentence links to, an export, a value of this component or a name of vocabulary-allow.json',
    ]);
  });
  it('accepts an export or a selector of another component, in its framework scope, and refuses an invented export or selector', () => {
    expect(messages(run(insert('### Angular\n\nThe action may be a `button` with `hwButton` or `[hwButton]`; `HwButtonDirective` applies to it, and `Button` is the React export.', 'service-card')))).toEqual([]);
    expect(messages(run(insert('### Angular\n\nThe action may be a `button` with `hwCardButton`.', 'service-card')))).toEqual([
      'HWC-VOCAB docs/components/service-card.md: accessibility/angular-1: `hwCardButton`: hwCardButton is not a member of this component in any adapter, of a component the sentence links to, an export, a value of this component or a name of vocabulary-allow.json',
    ]);
    expect(messages(run(insert('### React\n\nThe action may be a `hwButton` element.', 'service-card')))).toEqual([
      'HWC-VOCAB docs/components/service-card.md: accessibility/react-1: `hwButton`: hwButton is a selector of angular only, and the paragraph is scoped to react (the check cannot decide)',
    ]);
    expect(messages(run(insert('The action may be a `HwServiceButton`.', 'service-card')))).toEqual([
      'HWC-VOCAB docs/components/service-card.md: accessibility: `HwServiceButton`: HwServiceButton is not an export of an installed @hawiyah package',
    ]);
  });
  it('keeps the per-component rule for the members of another component', () => {
    expect(messages(run(insert('The card takes no `loading`.', 'service-card')))).toEqual([
      'HWC-VOCAB docs/components/service-card.md: accessibility: `loading`: loading is not a member of this component in any adapter, of a component the sentence links to, an export, a value of this component or a name of vocabulary-allow.json',
    ]);
  });
});

// A vanilla controller may build a hook name at run time from an option (createRangeSlider
// reads data-hw-range-label through getRangeLabel), so no published module holds the name;
// the vanilla README documents it in the row of createRangeSlider.
describe('data-hw-* attributes that an installed README documents for the component', () => {
  const name = (text) => ({ kind: 'name', name: text, text });
  const where = (id, scope = []) => ({ scope, vocabulary: componentVocabulary(vocab, id, declared(id)), linked: [] });

  it('accepts data-hw-range-label on the RangeSlider page, in prose and in an html block', () => {
    expect(componentVocabulary(vocab, 'range-slider', declared('range-slider')).documented.has('data-hw-range-label')).toBe(true);
    expect(judge(vocab, name('data-hw-range-label'), where('range-slider'))).toBeNull();
    expect(judge(vocab, { kind: 'attribute', name: 'data-hw-range-label', text: 'data-hw-range-label' }, where('range-slider', ['vanilla']))).toBeNull();
  });

  it('still refuses it on the page of another component, and refuses an invented attribute', () => {
    expect(judge(vocab, name('data-hw-range-label'), where('tabs'))).toBe(
      'data-hw-range-label is neither selected by the installed stylesheet, read by a published module, documented by an installed README for this component or a linked one, nor an attribute of vocabulary-allow.json',
    );
    expect(judge(vocab, name('data-hw-range-labels'), where('range-slider'))).toMatch(/^data-hw-range-labels is neither selected/);
    expect(judge(vocab, name('data-hw-range-caption'), where('range-slider'))).toMatch(/^data-hw-range-caption is neither selected/);
  });

  // The live markup of a template composes components; checkVocabulary passes the components whose hook the markup holds as linked.
  it('accepts it for a page that composes the component, through the linked vocabularies', () => {
    const composed = { scope: ['vanilla'], vocabulary: where('tabs').vocabulary, linked: [componentVocabulary(vocab, 'range-slider', declared('range-slider'))] };
    expect(judge(vocab, { kind: 'attribute', name: 'data-hw-range-label', text: 'data-hw-range-label' }, composed)).toBeNull();
    expect(judge(vocab, { kind: 'attribute', name: 'data-hw-range-caption', text: 'data-hw-range-caption' }, composed)).toMatch(/^data-hw-range-caption is neither selected/);
  });

  it('reads a README by its blocks and takes an attribute only from a block that names the component', () => {
    const readme = [
      '# Package', '', 'Intro with `data-hw-intro` and no component.', '',
      '| Controller | Template |', '| --- | --- |', '| `createRangeSlider` | `data-hw-range-label="{lower} – {upper}"` |', '| `createSlider` | `data-hw-slider-label` |', '',
      '- `hw-range-slider` takes `data-hw-lower`', '- Slider takes `data-hw-step-label`', '',
      '```html', '<fieldset class="hw-range-slider" data-hw-upper-name="x"></fieldset>', '```',
    ].join('\n');
    const blocks = readmeBlocks(readme);
    expect(blocks).toContain('| `createRangeSlider` | `data-hw-range-label="{lower} – {upper}"` |');
    expect(blocks).toContain('- Slider takes `data-hw-step-label`');
    expect([...documentedAttributes(blocks, ['RangeSlider', 'createRangeSlider', 'hw-range-slider'])].sort()).toEqual(['data-hw-lower', 'data-hw-range-label', 'data-hw-upper-name']);
    // A longer name that starts with an identifier is not that identifier.
    expect([...documentedAttributes(['`hw-range-slider-value` with `data-hw-x`', '`createRangeSliders` with `data-hw-y`'], ['hw-range-slider', 'createRangeSlider'])]).toEqual([]);
  });

  // The vanilla README states the rule once ("Text is supplied by the application", item 3:
  // data-hw-<kebab-name> for a string input, the name without get for a function input) and
  // lists the text inputs of each controller in one table, so the attributes are not written out.
  it('derives the root attributes of the text inputs of the vanilla README table by its rule', () => {
    const readme = [
      '| Controller | Text inputs (required unless noted) |', '| --- | --- |',
      '| `createCalendar` | `label`, `previousLabel`, `nextLabel`, `rangeLabel`; `unsupportedMessage` while the calendar is `islamic-umalqura`; optional `getDayLabel(value)`; `locale` is required |',
      '| `createCarousel` | `label`, `getSlideLabel(position, total)` (one-based), `emptyLabel`; optional `carouselDescription` |',
      '| `createDatePicker` | `openLabel`; `unavailableMessage` when `isDateDisabled` is given |',
      '| `createFileUploadList` | `labels` (core `FileUploadLabels`, including `getProgressLabel(name)` and `getRemoveLabel(name)`) |',
      '', '| Controller | Other |', '| --- | --- |', '| `createTabs` | `overflowLabel` |',
    ].join('\n');
    expect(textInputBlocks(readme)).toEqual([
      '`createCalendar` data-hw-label data-hw-previous-label data-hw-next-label data-hw-range-label data-hw-unsupported-message data-hw-day-label',
      '`createCarousel` data-hw-label data-hw-slide-label data-hw-empty-label data-hw-carousel-description',
      '`createDatePicker` data-hw-open-label data-hw-unavailable-message',
    ]);
    expect([...documentedAttributes(textInputBlocks(readme), ['Calendar', 'createCalendar'])]).toContain('data-hw-previous-label');
    expect([...documentedAttributes(textInputBlocks(readme), ['Tabs', 'createTabs'])]).toEqual([]);
  });

  it('accepts the text attributes of the installed vanilla table on their own page only', () => {
    expect(judge(vocab, { kind: 'attribute', name: 'data-hw-previous-label', text: 'data-hw-previous-label' }, where('calendar', ['vanilla']))).toBeNull();
    expect(judge(vocab, { kind: 'attribute', name: 'data-hw-empty-label', text: 'data-hw-empty-label' }, where('carousel', ['vanilla']))).toBeNull();
    expect(judge(vocab, { kind: 'attribute', name: 'data-hw-success-message', text: 'data-hw-success-message' }, where('feedback', ['vanilla']))).toBeNull();
    expect(judge(vocab, name('data-hw-previous-label'), where('tabs'))).toMatch(/^data-hw-previous-label is neither selected/);
    // createDatePicker has no closeLabel, so the table gives no data-hw-close-label.
    expect(judge(vocab, name('data-hw-close-label'), where('date-picker'))).toMatch(/^data-hw-close-label is neither selected/);
  });
});

// The English pages of ToggleGroup and DataTable: createToggleGroup reads
// root.dataset.hwMultiple === 'true', and data-hw-sort holds the key of a column, which the
// prefix rule took for a value of sortDirection.
describe('the values of data-* attributes that the published modules read', () => {
  const where = (id, scope = []) => ({ scope, vocabulary: componentVocabulary(vocab, id, declared(id)), linked: [] });
  const attribute = (text) => terms(text)[0];

  it('accepts a value that a published module compares the attribute with, and no other', () => {
    expect(comparedValues(vocab, 'data-hw-multiple')).toEqual(new Set(['true']));
    expect(judge(vocab, attribute('data-hw-multiple="true"'), where('toggle-group', ['vanilla']))).toBeNull();
    expect(judge(vocab, attribute('data-hw-multiple="yes"'), where('toggle-group', ['vanilla']))).toBe(
      '"yes" is not a value of a member type or of an enumerated attribute of this component (attribute data-hw-multiple)',
    );
    expect(judge(vocab, attribute('orientation="true"'), where('tabs'))).toMatch(/^"true" is not a value/);
  });

  it('takes the values of a member that starts with the hook only when no adapter has a member of the hook\'s name', () => {
    // The html block of one live group on an otherwise empty page of the component.
    const markup = (id, code) => messages(run({ pages: [{ id, lang: 'en', page: { summary: [], sections: [] } }], liveGroups: [{ id, lang: 'en', example: 'probe', blocks: { vanilla: { code } } }] }))
      .map((message) => message.replace(`HWC-VOCAB docs/components/${id}.md: live example probe (html): `, ''));
    expect(markup('data-table', '<table class="hw-table" data-hw="data-table"><tr><th data-hw-key="reference"><button type="button" data-hw-sort="reference">Reference</button></th></tr></table>')).toEqual([]);
    // data-hw-activation still takes the values of activationMode: Tabs has no member activation.
    expect(markup('tabs', '<div class="hw-tabs" data-hw="tabs" data-hw-activation="manual"></div>')).toEqual([]);
    expect(markup('tabs', '<div class="hw-tabs" data-hw="tabs" data-hw-activation="sideways"></div>')).toEqual([
      '`data-hw-activation="sideways"`: "sideways" is not a value of data-hw-activation ("automatic", "manual")',
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
    expect(terms('--hw-gap')).toEqual([{ kind: 'custom-property', name: '--hw-gap' }]);
    expect(terms('--hw-gap: 2rem;')).toEqual([{ kind: 'custom-property', name: '--hw-gap' }]);
    expect(terms('var(--hw-gap)')).toEqual([{ kind: 'custom-property', name: '--hw-gap' }, { kind: 'name', name: 'var', call: true, member: false }]);
    expect(terms('tab:<value>')).toEqual([{ kind: 'name', name: 'tab:<value>', call: false, member: false }]);
    expect(terms("'primary'")).toEqual([{ kind: 'literal', value: 'primary' }]);
  });
  it('reads classes, hooks, data attributes with their values and aria names of html', () => {
    expect(markupTerms('<div class="hw-tabs x" data-hw="tabs" data-hw-overflow="scroll" aria-label="A"><p>t</p></div>')).toEqual([
      { kind: 'class', name: 'hw-tabs', text: 'class="hw-tabs x"' },
      { kind: 'class', name: 'x', text: 'class="hw-tabs x"' },
      { kind: 'hook', name: 'tabs', text: 'data-hw="tabs"' },
      { kind: 'attribute', name: 'data-hw-overflow', text: 'data-hw-overflow' },
      { kind: 'data-value', name: 'data-hw-overflow', value: 'scroll', text: 'data-hw-overflow="scroll"' },
      { kind: 'attribute', name: 'aria-label', text: 'aria-label' },
    ]);
  });
});

describe('the coverage report', () => {
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
