// The data of the evidence panel (5a.11, leadAmendments A13): components.json, the
// Known defects of the pinned version in CHANGELOG.md that name the component, and
// its documented differences.
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { citedText, entryInlines, evidenceGaps, evidenceOf, knownDefects, namesComponent, pinnedVersion } from '../evidence.mjs';

const CHANGELOG = [
  '# Changelog', '', '## 0.4.0 — 2026-12-01', '', '#### Known defects in 0.4.0', '',
  '- The vanilla Tabs controller (`createTabs`) creates the tab bar', '  without an attribute.', '- Tabs (Vue) declares no slot types.',
  '- `@hawiyah/vue` does not export `ButtonVariant` that its Button and Tabs props use.', '- IconButton and TabsList are other names.', '',
  '#### Left for a later release', '', '- Tabs again, but not a defect.', '', '## 0.3.0 — 2026-11-18', '', '#### Known defects in 0.3.0', '', '- Tabs of an earlier version.', '',
].join('\n');

describe('the evidence of a page', () => {
  it('reads the Known defects entries of one version, each joined from its lines', () => {
    expect(knownDefects(CHANGELOG, '0.4.0')).toEqual([
      'The vanilla Tabs controller (`createTabs`) creates the tab bar without an attribute.',
      'Tabs (Vue) declares no slot types.',
      '`@hawiyah/vue` does not export `ButtonVariant` that its Button and Tabs props use.',
      'IconButton and TabsList are other names.',
    ]);
    expect(knownDefects(CHANGELOG, '0.3.0')).toEqual(['Tabs of an earlier version.']);
    expect(knownDefects(CHANGELOG, '0.5.0')).toEqual([]);
  });

  it('matches the components.json name as a whole word, also without its spaces', () => {
    expect(namesComponent('The vanilla Tabs controller', 'Tabs')).toBe(true);
    expect(namesComponent('IconButton and TabsList', 'Tabs')).toBe(false);
    expect(namesComponent('IconButton and TabsList', 'Button')).toBe(false);
    expect(namesComponent('ContentNavigation (Angular) leaves focus', 'Content navigation')).toBe(true);
  });

  it('writes the entries, notes and open items, the text of an entry as text and inline code', () => {
    const entry = { name: 'Tabs', built: ['vanilla', 'react'], verified: ['react'], evidence: [{ adapter: 'react', kind: 'behavior', source: 'a.test.tsx', tests: ['t'], scope: 's', command: 'pnpm test', result: 'passed', date: '2026-10-28' }], notes: ['n'] };
    const differences = [{ id: 'tabs-bar', component: 'tabs', aspect: 'structure', description: 'The bar lacks `data-orientation`.' }, { id: 'other', component: 'button', aspect: 'aria', description: 'x' }];
    const result = evidenceOf({ id: 'tabs', entry, version: '0.4.0', changelog: CHANGELOG, differences });
    expect(result).toMatchObject({ name: 'Tabs', built: ['vanilla', 'react'], verified: ['react'], notes: ['n'], version: '0.4.0' });
    expect(result.entries).toEqual([{ adapter: 'react', kind: 'behavior', tests: ['t'], scope: 's', command: 'pnpm test', result: 'passed', date: '2026-10-28', source: 'a.test.tsx' }]);
    expect(result.open.map((item) => item.kind)).toEqual(['defect', 'defect', 'defect', 'difference']);
    expect(result.open[0].text).toEqual([{ type: 'text', value: 'The vanilla Tabs controller (' }, { type: 'inlineCode', value: 'createTabs' }, { type: 'text', value: ') creates the tab bar without an attribute.' }]);
    expect(result.open[3]).toEqual({ kind: 'difference', id: 'tabs-bar', aspect: 'structure', text: entryInlines('The bar lacks `data-orientation`.') });
    const none = evidenceOf({ id: 'stack', entry: { name: 'Stack' }, version: '0.4.0', changelog: CHANGELOG, differences });
    expect(none).toMatchObject({ entries: [], gaps: [], notes: [], open: [], built: [], verified: [] });
  });

  // G23 of the 5a fix round: a documented difference stands under the Known defects entry it cites.
  it('shows a documented difference under the Known defects entry its source cites, and as an item of its own otherwise', () => {
    expect(citedText('CHANGELOG.md, 0.4.0, Known defects in 0.4.0: The vanilla Tabs controller (`createTabs`) creates the tab bar')).toBe('The vanilla Tabs controller (`createTabs`) creates the tab bar');
    expect(citedText('elsewhere')).toBe(null);
    const differences = [
      { id: 'tabs-bar', component: 'tabs', aspect: 'structure', description: 'The bar lacks `data-orientation`.', source: 'CHANGELOG.md, 0.4.0, Known defects in 0.4.0: The vanilla Tabs controller (`createTabs`) creates the tab bar' },
      { id: 'tabs-other', component: 'tabs', aspect: 'aria', description: 'Other.', source: 'CHANGELOG.md, 0.4.0, Known defects in 0.4.0: A defect of another component' },
    ];
    const result = evidenceOf({ id: 'tabs', entry: { name: 'Tabs' }, version: '0.4.0', changelog: CHANGELOG, differences });
    expect(result.open.map((item) => `${item.kind}${item.kind === 'defect' ? `:${item.differences.map((d) => d.id).join(',')}` : `:${item.id}`}`)).toEqual(['defect:tabs-bar', 'defect:', 'defect:', 'difference:tabs-other']);
  });

  // G23 of the 5a fix round: the kinds of evidence some built adapters have and others do not.
  it('finds the kinds of evidence that some built adapters have and others do not', () => {
    const entries = [{ adapter: 'vanilla', kind: 'behavior' }, { adapter: 'react', kind: 'behavior' }, { adapter: 'react', kind: 'hydration' }, { adapter: 'vue', kind: 'hydration' }, { adapter: 'svelte', kind: 'behavior' }];
    expect(evidenceGaps(['vanilla', 'react', 'vue', 'angular'], entries)).toEqual([{ kind: 'behavior', adapters: ['vue', 'angular'] }, { kind: 'hydration', adapters: ['vanilla', 'angular'] }]);
    expect(evidenceGaps(['react'], [{ adapter: 'react', kind: 'behavior' }])).toEqual([]);
    expect(evidenceGaps(['react', 'vue'], [])).toEqual([]);
  });

  it('reads the pinned version and the repository CHANGELOG for Button and Tabs', () => {
    expect(pinnedVersion()).toBe('0.3.0');
    const componentsFile = fileURLToPath(new URL('../../../../components.json', import.meta.url));
    const repoDir = dirname(componentsFile);
    const catalogue = JSON.parse(readFileSync(componentsFile, 'utf8')).components;
    const tabs = evidenceOf({ id: 'tabs', entry: catalogue.find((item) => item.id === 'tabs'), repoDir });
    expect(tabs.entries).toHaveLength(7);
    expect(tabs.open.filter((item) => item.kind === 'defect')).toHaveLength(4);
    // The documented difference cites the first defect and stands under it (G23).
    expect(tabs.open.filter((item) => item.kind === 'difference')).toEqual([]);
    expect(tabs.open[0].differences.map((item) => item.id)).toEqual(['tabs-bar-orientation']);
    // The Angular hydration statement, generated (G23): React and Vue record hydration evidence, JavaScript and Angular do not.
    expect(tabs.gaps).toContainEqual({ kind: 'hydration', adapters: ['vanilla', 'angular'] });
    const button = evidenceOf({ id: 'button', entry: catalogue.find((item) => item.id === 'button'), repoDir });
    expect(button.open.map((item) => item.text.map((node) => node.value).join(''))).toEqual(['@hawiyah/vue does not export the types ButtonVariant and Orientation that its Button and Tabs props use.']);
  });
});
