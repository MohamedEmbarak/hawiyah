// The lead's exception and override lists: every entry has
// approvedBy and a reason, and one page has at most MAX_ENTRIES_PER_PAGE entries
// over all lists together.
import { describe, expect, it } from 'vitest';
import { MAX_ENTRIES_PER_PAGE, checkLeadLists, readLeadLists } from '../lists.mjs';
import { DEFAULT_DEFAULTS, defaultsWithoutLiteral, readDefaults } from '../members.mjs';
import { guideDir } from './helpers.mjs';

const empty = { exclusions: { components: {} }, defaults: { entries: [] }, targetOverrides: {}, slotPatterns: {}, arabic: [], latin: [] };

describe('the lists of the guide', () => {
  it('pass, and the pilots stay within the cap', () => {
    const result = checkLeadLists(readLeadLists(guideDir));
    expect(result.problems).toEqual([]);
    expect(MAX_ENTRIES_PER_PAGE).toBe(5);
    expect(result.perPage.get('button')?.count ?? 0).toBeLessThanOrEqual(MAX_ENTRIES_PER_PAGE);
    expect(result.perPage.get('tabs')?.count ?? 0).toBeLessThanOrEqual(MAX_ENTRIES_PER_PAGE);
  });
});

// The quoted line of a defaults.json entry
// states the default literal. Two entries the lead approved quote a line in other words
// ('medium' for 'md'; "=== 'manual'" for 'automatic'): no installed 0.3.0 file states them as
// literals. They stay named here for the lead's decision; any other entry without its literal fails.
describe('defaults.json entries quote the default literal', () => {
  it('every entry but the two that the lead decides on', () => {
    const entries = readDefaults(DEFAULT_DEFAULTS);
    expect(defaultsWithoutLiteral(entries).map((entry) => `${entry.id}.${entry.name} ${entry.default}`)).toEqual(['button.data-size \'md\'', 'tabs.activationMode \'automatic\'']);
    expect(defaultsWithoutLiteral([{ id: 'x', name: 'n', default: "'scroll'", evidence: { file: 'f', text: 'export' } }])).toHaveLength(1);
    expect(defaultsWithoutLiteral([{ id: 'x', name: 'n', default: "'menu'", evidence: { file: 'f', text: "=== 'scroll' ? 'scroll' : 'menu'" } }])).toEqual([]);
  });
});

describe('an entry without approvedBy or reason fails, in every list', () => {
  const cases = [
    ['exclusions.json', { ...empty, exclusions: { components: { x: { vanilla: { rule: 'stylesheet-contract', reason: 'r', nativeAttributes: { type: 'r' } } } } } }, 'scripts/api-tables/exclusions.json x.vanilla has no approvedBy'],
    ['exclusions.json attribute', { ...empty, exclusions: { components: { x: { vanilla: { approvedBy: 'lead', reason: 'r', nativeAttributes: { type: '' } } } } } }, 'scripts/api-tables/exclusions.json x.vanilla.nativeAttributes.type has no reason'],
    ['defaults.json', { ...empty, defaults: { entries: [{ id: 'x', framework: 'vanilla', name: 'n', approvedBy: 'lead' }] } }, 'scripts/api-tables/defaults.json entry 1 (x.n) has no reason'],
    ['TARGET_OVERRIDES', { ...empty, targetOverrides: { x: { angular: ['HwX'], reason: 'r' } } }, 'scripts/api-tables/targets.mjs TARGET_OVERRIDES.x has no approvedBy'],
    ['UNOWNED_EXPORTS', { ...empty, unowned: [{ framework: 'vue', name: 'X', reason: 'r' }] }, 'scripts/api-tables/targets.mjs UNOWNED_EXPORTS[0] (vue X) has no approvedBy'],
    ['vocabulary-exceptions.json', { ...empty, vocabulary: [{ file: 'docs/components/x.md', text: 't', reason: 'r' }] }, 'scripts/api-tables/vocabulary-exceptions.json entry 1 has no approvedBy'],
    ['VUE_SLOT_PATTERNS', { ...empty, slotPatterns: { x: [{ name: '<v>', expression: 'item.v', approvedBy: 'lead' }] } }, 'scripts/api-tables/targets.mjs VUE_SLOT_PATTERNS.x[0] has no reason'],
    ['arabic-exceptions.json', { ...empty, arabic: [{ file: 'docs/components/x.ar.md', text: 't', reason: 'r' }] }, 'scripts/content/arabic-exceptions.json entry 1 has no approvedBy'],
    ['latin-allowlist.json', { ...empty, latin: [{ text: 't', approvedBy: 'lead' }] }, 'scripts/page-guards/latin-allowlist.json entry 1 has no reason'],
    ['keyboard-exceptions.json', { ...empty, keyboard: [{ component: 'x', key: 'F10', approvedBy: 'lead' }] }, 'scripts/equivalence/keyboard-exceptions.json entry 1 has no reason'],
    ['claim-exceptions.json', { ...empty, claims: [{ file: 'docs/components/x.md', text: 'Fixture X is not certified by any body.', reason: 'r' }] }, 'scripts/content/claim-exceptions.json entry 1 has no approvedBy'],
    ['live-component-exceptions.json', { ...empty, liveComponents: [{ file: 'docs/components/x.md', example: 'e', approvedBy: 'lead' }] }, 'scripts/content/live-component-exceptions.json entry 1 has no reason'],
    ['marketing-terms.json', { ...empty, marketing: [{ lang: 'en', term: 'stunning', reason: 'r' }] }, 'scripts/content/marketing-terms.json entry 1 (stunning) has no approvedBy'],
    ['empty-elements.json', { ...empty, emptyElements: [{ component: 'stat', class: 'hw-stat-trend', reference: 'x', approvedBy: 'lead' }] }, 'scripts/equivalence/empty-elements.json entry 1 has no reason'],
    ['vanilla-hooks.json', { ...empty, vanillaHooks: [{ component: 'accordion', attribute: 'data-hw-value', reference: 'x', reason: 'r' }] }, 'scripts/equivalence/vanilla-hooks.json entry 1 has no approvedBy'],
    ['angular-hosts.json', { ...empty, angularHosts: [{ component: 'avatar', element: 'hw-avatar', tag: 'span', reference: 'x', approvedBy: 'lead' }] }, 'scripts/equivalence/angular-hosts.json entry 1 has no reason'],
  ];
  it.each(cases)('%s', (_label, lists, problem) => {
    expect(checkLeadLists(lists).problems).toEqual([problem]);
  });
});

describe('the cap per page', () => {
  it('fails above five entries over all lists of one page', () => {
    const native = Object.fromEntries(['a', 'b', 'c', 'd'].map((name) => [name, 'r']));
    const lists = {
      ...empty,
      exclusions: { components: { x: { vanilla: { approvedBy: 'lead', reason: 'r', nativeAttributes: native } } } },
      targetOverrides: { x: { angular: ['HwX'], approvedBy: 'lead', reason: 'r' } },
    };
    expect(checkLeadLists(lists).problems).toEqual([]);
    lists.arabic = [{ file: 'docs/components/x.ar.md', text: 't', reason: 'r', approvedBy: 'lead' }];
    expect(checkLeadLists(lists).problems).toEqual([
      'page x has 6 entries in the lead\'s exception and override lists (exclusions.json vanilla.nativeAttributes.a; exclusions.json vanilla.nativeAttributes.b; exclusions.json vanilla.nativeAttributes.c; exclusions.json vanilla.nativeAttributes.d; TARGET_OVERRIDES; arabic-exceptions.json "t"); at most 5 are allowed',
    ]);
  });
  it('counts an allow-list entry without pages for every page', () => {
    const lists = { ...empty, targetOverrides: Object.fromEntries(['x'].map((id) => [id, { approvedBy: 'lead', reason: 'r' }])) };
    lists.latin = Array.from({ length: 5 }, (_, index) => ({ text: `t${index}`, reason: 'r', approvedBy: 'lead' }));
    expect(checkLeadLists(lists).problems).toEqual([
      'page x has 6 entries in the lead\'s exception and override lists (TARGET_OVERRIDES); at most 5 are allowed',
    ]);
  });
});
