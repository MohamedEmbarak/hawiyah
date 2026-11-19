// Tests of the runner's pure parts: known differences, failure lines, the harness
// server and bundle, the interaction checks' key choice.
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import tabsClick from '../checks/tabs-click.mjs';
import tabsKeyboard, { nextTabKey } from '../checks/tabs-keyboard.mjs';
import { bundleHarness, changelogSourceError, checkNames, compareCapture, controllerComponents, differenceOf, failureLine, harnessUrl, mountSelector, scopeErrors, startHarnessServer, summaryLine, validateKnownDifferences as validateWith } from '../run.mjs';

const known = JSON.parse(readFileSync(new URL('../known-differences.json', import.meta.url), 'utf8'));
const group = { id: 'tabs', lang: 'ar', example: 'basic', blocks: { vanilla: { line: 19 } } };
// A fixture CHANGELOG for the synthetic entries; the real entries are checked against the repository file.
const CHANGELOG = '# Changelog\n\n## 0.4.0 — 2026-12-01\n\n### Fixed\n\n- Other.\n\n#### Known defects in 0.4.0\n\n- The tab bar lacks an attribute in one adapter.\n\n#### Left for a later release\n\n- Something else.\n\n## 0.3.0 — 2026-11-18\n';
const validateKnownDifferences = (value) => validateWith(value, { changelog: CHANGELOG });
const entry = {
  id: 'tabs-bar',
  component: 'tabs',
  aspect: 'structure',
  description: 'Example.',
  source: 'CHANGELOG.md, 0.4.0, Known defects in 0.4.0: The tab bar lacks an attribute',
  approvedBy: 'lead',
};

describe('known differences', () => {
  it('hold only tabs-bar-orientation, valid, with its CHANGELOG.md source (leadAmendments A8)', () => {
    expect(validateWith(known).errors).toEqual([]);
    expect(known.map((item) => item.id)).toEqual(['tabs-bar-orientation']);
    const [orientation] = known;
    expect(orientation).toMatchObject({ component: 'tabs', aspect: 'structure', approvedBy: 'lead', ignore: [{ class: 'hw-tab-bar', attribute: 'data-orientation' }] });
    expect(orientation.source).toMatch(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: The vanilla Tabs controller/);
  });

  it('check each source against the CHANGELOG text: version, section and the quoted entry', () => {
    expect(changelogSourceError(entry.source, CHANGELOG)).toBeNull();
    expect(changelogSourceError('CHANGELOG.md, 0.4.0, Known defects in 0.4.0, line 9', CHANGELOG)).toMatch(/source must read/);
    expect(changelogSourceError('https://github.com/example/example/issues/1', CHANGELOG)).toMatch(/source must read/);
    expect(changelogSourceError('CHANGELOG.md, 0.5.0, Known defects in 0.5.0: The tab bar', CHANGELOG)).toBe('CHANGELOG.md has no section ## 0.5.0');
    expect(changelogSourceError('CHANGELOG.md, 0.3.0, Known defects in 0.4.0: The tab bar', CHANGELOG)).toBe('CHANGELOG.md ## 0.3.0 has no heading "Known defects in 0.4.0"');
    // The quoted text must be in that subsection, not in the next one.
    expect(changelogSourceError('CHANGELOG.md, 0.4.0, Known defects in 0.4.0: Something else', CHANGELOG)).toMatch(/is not in CHANGELOG\.md ## 0\.4\.0 Known defects in 0\.4\.0/);
    expect(changelogSourceError(entry.source, null)).toBe('CHANGELOG.md cannot be read');
  });

  it('accept an ignore list on a structure entry and reject a malformed one', () => {
    const rule = { class: 'hw-tab-bar', attribute: 'data-orientation' };
    expect(validateKnownDifferences([{ ...entry, ignore: [rule] }]).errors).toEqual([]);
    const { errors } = validateKnownDifferences([
      { ...entry, id: 'a', aspect: 'aria', ignore: [rule] },
      { ...entry, id: 'b', ignore: [] },
      { ...entry, id: 'c', ignore: [{ ...rule, extra: 'x' }] },
      { ...entry, id: 'd', ignore: [{ class: '', attribute: 'data-orientation' }] },
      { ...entry, id: 'e', ignore: [{ class: 'hw-tab-bar', attribute: ' ' }] },
      { ...entry, id: 'f', ignore: [{ class: '.hw-tab-bar', attribute: 'data-orientation' }] },
      { ...entry, id: 'g', ignore: 'hw-tab-bar' },
      { ...entry, id: 'h', ignore: [null] },
    ]);
    const text = errors.join('\n');
    expect(errors.every((line) => line.startsWith('HWE-KD '))).toBe(true);
    expect(text).toMatch(/entry 1: ignore is allowed only on an entry of aspect structure/);
    expect(text).toMatch(/entry 2: ignore must be a non-empty array/);
    expect(text).toMatch(/entry 3 ignore 1 has unknown fields extra/);
    expect(text).toMatch(/entry 4 ignore 1 needs a non-empty class/);
    expect(text).toMatch(/entry 5 ignore 1 needs a non-empty attribute/);
    expect(text).toMatch(/entry 6 ignore 1: class must be one hw- class name/);
    expect(text).toMatch(/entry 7: ignore must be a non-empty array/);
    expect(text).toMatch(/entry 8 ignore 1 is not an object/);
  });

  it('accept a complete entry approved by the lead', () => {
    const { entries, errors } = validateKnownDifferences([entry]);
    expect(errors).toEqual([]);
    expect(differenceOf({ ...group, differences: 'tabs-bar' }, entries)).toEqual({ entry });
  });

  it('reject incomplete, unapproved, unsourced and repeated entries', () => {
    const { errors } = validateKnownDifferences([
      { ...entry, approvedBy: 'builder' },
      { ...entry, aspect: 'focus', id: 'b' },
      { ...entry, source: 'see notes', id: 'c' },
      { ...entry, description: '', id: 'd', extra: 1 },
      entry,
      entry,
    ]);
    expect(errors.join('\n')).toMatch(/entry 1: approvedBy must be 'lead'/);
    expect(errors.join('\n')).toMatch(/entry 2: aspect must be structure, aria or screenshot/);
    expect(errors.join('\n')).toMatch(/entry 3: source must read "CHANGELOG\.md, <version>, <section>: <text of the entry>"/);
    expect(errors.join('\n')).toMatch(/entry 4 has unknown fields extra/);
    expect(errors.join('\n')).toMatch(/entry 4 needs a non-empty description/);
    expect(errors.join('\n')).toMatch(/entry 6: id tabs-bar is repeated/);
    expect(validateKnownDifferences({}).errors).toHaveLength(1);
  });

  it('fail a group that names no entry or an entry of another component', () => {
    const { entries } = validateKnownDifferences([{ ...entry, component: 'button' }]);
    expect(differenceOf({ ...group, differences: 'missing' }, entries).error).toBe(
      'HWE-KD docs/components/tabs.ar.md:19: differences=missing names no entry of scripts/equivalence/known-differences.json',
    );
    expect(differenceOf({ ...group, differences: 'tabs-bar' }, entries).error).toMatch(/documents component button, not tabs/);
  });
});

describe('a structure entry with ignore (self-test, leadAmendments A8)', () => {
  const [orientation] = known;
  const bar = (attrs, tabs = 2) => ({
    tag: 'div',
    attrs: { class: 'hw-tabs' },
    children: [
      { tag: 'div', attrs: { class: 'hw-tab-bar', ...attrs }, children: Array.from({ length: tabs }, (_, i) => ({ tag: 'button', attrs: { class: 'hw-tab', role: 'tab' }, children: [`t${i}`] })) },
      { tag: 'div', attrs: { class: 'hw-tab-panel', role: 'tabpanel' }, children: ['p'] },
    ],
  });
  const vanilla = [bar({})];
  const written = [bar({ 'data-orientation': 'horizontal' })];
  const capture = (other) => ({ trees: { vanilla, react: other, vue: other, angular: other }, snapshots: { vanilla: 'a', react: 'a', vue: 'a', angular: 'a' }, images: {} });
  const all = (rows) => rows.filter((row) => row.aspect === 'structure');
  // Pairs with the reference; with an ignore list the adapters are also compared with each other.
  const structure = (rows) => all(rows).filter((row) => row.pair.startsWith('vanilla-'));

  it('fails without the entry and passes with it when only data-orientation on .hw-tab-bar differs', () => {
    expect(structure(compareCapture(capture(written))).every((row) => row.result === 'different')).toBe(true);
    const rows = structure(compareCapture(capture(written), orientation));
    expect(rows.map((row) => row.result)).toEqual(['equal', 'equal', 'equal']);
    expect(rows[0].ignored).toEqual(orientation.ignore);
    expect(all(compareCapture(capture(written), orientation)).map((row) => `${row.pair} ${row.result}`)).toEqual([
      'vanilla-react equal', 'vanilla-vue equal', 'vanilla-angular equal', 'react-vue equal', 'react-angular equal',
    ]);
    expect(compareCapture(capture(written), orientation).filter((row) => row.aspect === 'aria').every((row) => row.result === 'equal')).toBe(true);
  });

  it('still fails a wrong value of the ignored attribute in one adapter', () => {
    const wrong = [bar({ 'data-orientation': 'vertical' })];
    const captured = capture(written);
    captured.trees.angular = wrong;
    const rows = all(compareCapture(captured, orientation));
    expect(rows.filter((row) => row.result === 'different').map((row) => row.pair)).toEqual(['react-angular']);
    expect(rows.at(-1).message).toMatch(/react and angular differ at .*\["data-orientation"\]/);
  });

  it('fails as a stale entry once the reference writes the attribute', () => {
    const captured = capture(written);
    captured.trees.vanilla = written;
    const rows = structure(compareCapture(captured, orientation));
    expect(rows.every((row) => row.result === 'different')).toBe(true);
    expect(rows[0].message).toBe('the documented difference no longer applies: vanilla writes data-orientation on .hw-tab-bar; remove the entry');
  });

  it('still fails another attribute on .hw-tab-bar', () => {
    const rows = structure(compareCapture(capture([bar({ 'data-orientation': 'horizontal', 'aria-orientation': 'horizontal' })]), orientation));
    expect(rows.every((row) => row.result === 'different')).toBe(true);
    expect(rows[0].message).toMatch(/\["aria-orientation"\]/);
  });

  it('still fails the same attribute on another class', () => {
    const other = structuredClone(written);
    other[0].children[1].attrs['data-orientation'] = 'horizontal';
    const rows = structure(compareCapture(capture(other), orientation));
    expect(rows.every((row) => row.result === 'different')).toBe(true);
    expect(rows[0].path).toBe('$[0].children[1].attrs["data-orientation"]');
  });

  it('still fails a missing element', () => {
    const rows = structure(compareCapture(capture([bar({ 'data-orientation': 'horizontal' }, 1)]), orientation));
    expect(rows.every((row) => row.result === 'different')).toBe(true);
    expect(rows[0].path).toBe('$[0].children[0].children[1]');
  });

  it('reports each remaining difference as HWE-STRUCT', () => {
    const rows = structure(compareCapture(capture([bar({ 'data-orientation': 'horizontal' }, 1)]), orientation));
    const lines = rows.filter((row) => row.result === 'different').map((row) => failureLine('HWE-STRUCT', group, row.message));
    expect(lines).toHaveLength(3);
    expect(lines.every((line) => line.startsWith('HWE-STRUCT docs/components/tabs.ar.md:19: vanilla and '))).toBe(true);
  });

  it('skips the whole aspect for an entry without ignore, as before', () => {
    const rows = structure(compareCapture(capture([bar({}, 1)]), entry));
    expect(rows.map((row) => row.result)).toEqual(['skipped', 'skipped', 'skipped']);
  });

  it('counts one documented difference in the summary line', () => {
    expect(summaryLine({ groups: 9, languages: 2, frameworks: 4, interactionChecks: 14, afterInteraction: 4, restOnly: 5, documented: 1 })).toBe(
      'equivalence: 9 groups x 2 languages x 4 frameworks equal (4 compared after interaction, 5 at rest only; 14 interaction checks, 1 documented difference)',
    );
  });
});

describe('scope of a run and required checks (review finding R2[3], R2[11])', () => {
  const manifest = { pages: [{ id: 'tabs', langs: ['en', 'ar'], liveGroups: [{ example: 'basic' }, { example: 'manual' }] }] };
  const groups = ['en', 'ar'].flatMap((lang) => ['basic', 'manual'].map((example) => ({ id: 'tabs', lang, example })));

  it('accepts the groups of the built pages and an --only key that names one', () => {
    expect(scopeErrors(groups, manifest, null)).toEqual([]);
    expect(scopeErrors(groups, manifest, ['tabs/ar/manual'])).toEqual([]);
  });

  it('fails on zero groups, an --only key that names none, and groups that differ from the manifest', () => {
    expect(scopeErrors([], { pages: [] }, null)).toEqual(['HWE-SCOPE .cache/content/live-groups.json:1: no live group to compare']);
    expect(scopeErrors(groups, manifest, ['button/en/nothing'])).toEqual(['HWE-SCOPE --only:1: button/en/nothing names no live group (keys are <id>/<lang>/<example>)']);
    expect(scopeErrors(groups.filter((item) => item.example !== 'manual'), manifest, null)).toEqual([
      'HWE-SCOPE .cache/content/live-groups.json:1: the built pages have the groups tabs/ar/manual, tabs/en/manual, which the live groups file lacks',
    ]);
    expect(scopeErrors([...groups, { id: 'tabs', lang: 'en', example: 'extra' }], manifest, null)).toEqual([
      'HWE-SCOPE .cache/content/live-groups.json:1: the groups tabs/en/extra belong to no built page',
    ]);
    expect(scopeErrors(groups, null, null)).toEqual(['HWE-SCOPE src/generated/content/manifest.json:1: the content manifest does not exist; build step 20-content writes it']);
  });

  it('reads several checks from check= and the components with a controller from components.json', () => {
    expect(checkNames({ check: 'tabs-keyboard,tabs-disabled' })).toEqual(['tabs-keyboard', 'tabs-disabled']);
    expect(checkNames({})).toEqual([]);
    const ids = controllerComponents(new URL('../../../../components.json', import.meta.url).pathname);
    expect(ids.has('tabs')).toBe(true);
    expect(ids.has('button')).toBe(false);
  });

  it('every Tabs group names the checks its text describes, in both languages', async () => {
    const { parseMarkdown } = await import('../../content/parse.mjs');
    const { groupLive } = await import('../../content/live.mjs');
    for (const file of ['tabs.md', 'tabs.ar.md']) {
      const text = readFileSync(new URL(`../../../../docs/components/${file}`, import.meta.url), 'utf8');
      const { groups } = groupLive(parseMarkdown(text, file).tree.children, file);
      expect(Object.fromEntries(groups.map((item) => [item.example, checkNames(item)])), file).toEqual({
        basic: ['tabs-keyboard'],
        vertical: ['tabs-click', 'tabs-keyboard'],
        manual: ['tabs-keyboard', 'tabs-activate'],
        'disabled-tab': ['tabs-keyboard', 'tabs-disabled'],
      });
    }
  });
});

describe('runner', () => {
  it('formats failures as <code> <file>:<line>: <message>', () => {
    expect(failureLine('HWE-STRUCT', group, 'x')).toBe('HWE-STRUCT docs/components/tabs.ar.md:19: x');
    expect(failureLine('HWE-ARIA', { ...group, lang: 'en' }, 'y')).toBe('HWE-ARIA docs/components/tabs.md:19: y');
  });

  it('reads the mount of each framework', () => {
    expect(mountSelector('angular')).toBe('#hawiyah-preview-root > guide-example');
    expect(mountSelector('vue')).toBe('#hawiyah-preview-root > #app');
  });

  it('chooses the next-tab key by direction and orientation', () => {
    expect(nextTabKey('ltr', 'horizontal')).toBe('ArrowRight');
    expect(nextTabKey('rtl', 'horizontal')).toBe('ArrowLeft');
    expect(nextTabKey('rtl', 'vertical')).toBe('ArrowDown');
    expect(tabsKeyboard.steps.map((step) => step.name)).toEqual(['focus-selected-tab', 'next-tab-key', 'end', 'home']);
    expect(tabsClick.steps.map((step) => step.name)).toEqual(['click-second-tab']);
  });

  const scratch = mkdtempSync(join(tmpdir(), 'hawiyah-equivalence-'));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));

  it('bundles the harness with the frame sources inlined as text', async () => {
    const file = join(scratch, 'harness.js');
    await bundleHarness(file);
    const code = readFileSync(file, 'utf8');
    expect(code).toContain('hawiyahFrameBootstrap');
    expect(code).toContain('hawiyah-guide-frame');
    expect(code).not.toMatch(/^\s*import\s/m);
  });

  it('serves the harness under the base path and dist files beside it, never writing into dist', async () => {
    const dist = join(scratch, 'dist');
    mkdirSync(dist);
    writeFileSync(join(dist, 'index.html'), '<p>dist</p>');
    const script = join(scratch, 'h.js');
    writeFileSync(script, 'export {};');
    const served = await startHarnessServer({ dir: dist, base: '/hawiyah/', harnessFile: script });
    try {
      const page = await fetch(`${served.origin}/hawiyah/__harness/`);
      const html = await page.text();
      expect(html).toContain('<base href="/hawiyah/">');
      expect(html).toContain('src="__harness/harness.js"');
      expect(await (await fetch(`${served.origin}/hawiyah/__harness/harness.js`)).text()).toBe('export {};');
      expect(await (await fetch(`${served.origin}/hawiyah/`)).text()).toBe('<p>dist</p>');
      expect(harnessUrl(served.origin, '/hawiyah/', group, '0.3.0')).toBe(
        `${served.origin}/hawiyah/__harness/?id=tabs&lang=ar&example=basic&pin=0.3.0&frameworks=vanilla%2Creact%2Cvue%2Cangular`,
      );
    } finally {
      await served.close();
    }
  });
});
