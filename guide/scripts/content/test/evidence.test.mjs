// The data of the evidence panel (5a.11, leadAmendments A13): components.json, the
// Known defects of the pinned version in CHANGELOG.md that name the component, and
// its documented differences.
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { entryInlines, evidenceOf, knownDefects, namesComponent, pinnedVersion } from '../evidence.mjs';

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
    expect(none).toMatchObject({ entries: [], notes: [], open: [], built: [], verified: [] });
  });

  it('reads the pinned version and the repository CHANGELOG for Button and Tabs', () => {
    expect(pinnedVersion()).toBe('0.3.0');
    const componentsFile = fileURLToPath(new URL('../../../../components.json', import.meta.url));
    const repoDir = dirname(componentsFile);
    const catalogue = JSON.parse(readFileSync(componentsFile, 'utf8')).components;
    const tabs = evidenceOf({ id: 'tabs', entry: catalogue.find((item) => item.id === 'tabs'), repoDir });
    expect(tabs.entries).toHaveLength(7);
    expect(tabs.open.filter((item) => item.kind === 'defect')).toHaveLength(4);
    expect(tabs.open.filter((item) => item.kind === 'difference').map((item) => item.id)).toEqual(['tabs-bar-orientation']);
    const button = evidenceOf({ id: 'button', entry: catalogue.find((item) => item.id === 'button'), repoDir });
    expect(button.open.map((item) => item.text.map((node) => node.value).join(''))).toEqual(['@hawiyah/vue does not export the types ButtonVariant and Orientation that its Button and Tabs props use.']);
  });
});
