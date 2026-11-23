// Tests of the runner's pure parts: known differences, failure lines, the harness
// server and bundle, the interaction checks' key choice.
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import tabsClick from '../checks/tabs-click.mjs';
import tabsKeyboard from '../checks/tabs-keyboard.mjs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { FRAMEWORKS } from '../compare.mjs';
import { generatedNamePattern } from '../generated-names.mjs';
import { normalize } from '../normalize.js';
import { bundleHarness, capture, hostsIn, changelogSourceError, checkNames, compareCapture, comparisonFailures, differenceOf, differencesOf, englishPages, failureLine, harnessUrl, mountSelector, runEquivalence, scopeErrors, startHarnessServer, summaryLine, validateKnownDifferences as validateWith } from '../run.mjs';
import { styledAttributes } from '../styled-attributes.mjs';

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
  it('hold the entries the lead approved, valid, each with its CHANGELOG.md source', () => {
    expect(validateWith(known).errors).toEqual([]);
    expect(known.map((item) => item.id)).toEqual([
      'tabs-bar-orientation', 'text-field-adapter-attributes', 'service-card-angular-variant-icon', 'stack-vue-layout-attributes', 'progress-adapter-max', 'icon-button-adapter-markup',
      'field-adapter-markup', 'textarea-adapter-attributes', 'number-field-adapter-attributes', 'input-group-adapter-attributes', 'switch-adapter-attributes',
      'checkbox-adapter-attributes', 'radio-adapter-markup', 'select-adapter-attributes', 'slider-adapter-attributes', 'file-upload-adapter-labelledby',
      'chip-adapter-tone', 'secondary-nav-adapter-variant', 'spacer-vue-layout-attributes', 'center-vue-layout-attributes',
      'collapsible-adapter-markup', 'container-vue-layout-attributes', 'inline-vue-layout-attributes', 'grid-vue-layout-attributes', 'columns-vue-layout-attributes',
      'section-vue-layout-attributes', 'sidebar-adapter-layout-attributes', 'aspect-ratio-adapter-attributes', 'app-shell-adapter-side', 'mobile-top-bar-adapter-variant',
      'portal-footer-adapter-markup', 'portal-layout-adapter-markup',
      'tooltip-adapter-markup', 'popover-adapter-markup', 'menu-adapter-markup', 'dialog-adapter-markup', 'drawer-adapter-markup', 'toast-region-adapter-markup',
      'cookie-consent-adapter-markup', 'password-field-adapter-markup', 'search-field-adapter-markup', 'pin-input-adapter-markup', 'rating-adapter-markup',
      'rating-angular-radio-names', 'rating-react-error-height', 'combobox-adapter-markup', 'multi-select-adapter-markup', 'tag-input-adapter-markup',
      'range-slider-adapter-markup', 'portal-layout-footer-brand-tree', 'portal-layout-footer-brand-weight',
    ]);
    const [orientation, textField, serviceCard, , progress, iconButton] = known;
    const byId = (id) => known.find((item) => item.id === id);
    expect(orientation).toMatchObject({ component: 'tabs', aspect: 'structure', approvedBy: 'lead', ignore: [{ class: 'hw-tab-bar', attribute: 'data-orientation' }] });
    expect(orientation.source).toMatch(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: The vanilla Tabs controller/);
    // A difference of one framework adapter cannot use `ignore` (it compares the three
    // framework results with each other in full), so these two leave the structure
    // aspect out of their groups; the accessibility tree and the rendering stay compared.
    expect(textField).toMatchObject({ component: 'text-field', aspect: 'structure', approvedBy: 'lead' });
    expect(textField.ignore).toBeUndefined();
    expect(textField.source).toMatch(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: TextField: React and Vue write/);
    expect(serviceCard).toMatchObject({ component: 'service-card', aspect: 'structure', approvedBy: 'lead' });
    expect(serviceCard.ignore).toBeUndefined();
    expect(serviceCard.source).toMatch(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: ServiceCard \(Angular\) always writes/);
    // The three framework adapters write the same max, which the vanilla markup lacks: ignore applies.
    expect(progress).toMatchObject({ component: 'progress', aspect: 'structure', approvedBy: 'lead', ignore: [{ class: 'hw-progress', attribute: 'max' }] });
    expect(progress.source).toMatch(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: Progress \(React, Vue, Angular\) writes/);
    // The three framework adapters add an element against the vanilla markup: no ignore can express it.
    expect(iconButton).toMatchObject({ component: 'icon-button', aspect: 'structure', approvedBy: 'lead' });
    expect(iconButton.ignore).toBeUndefined();
    expect(iconButton.source).toMatch(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: IconButton \(React, Vue, Angular\) renders the icon inside a wrapper/);
    // The three framework adapters write the same default, which the vanilla markup lacks: ignore applies.
    expect(byId('chip-adapter-tone')).toMatchObject({ component: 'chip', aspect: 'structure', approvedBy: 'lead', ignore: [{ class: 'hw-chip', attribute: 'data-tone' }] });
    expect(byId('chip-adapter-tone').source).toMatch(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: Chip \(React, Vue, Angular\) writes/);
    expect(byId('secondary-nav-adapter-variant')).toMatchObject({ component: 'secondary-nav', aspect: 'structure', approvedBy: 'lead', ignore: [{ class: 'hw-secondary-nav', attribute: 'data-variant' }] });
    expect(byId('secondary-nav-adapter-variant').source).toMatch(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: SecondaryNav: React, Vue and Angular write/);
    expect(byId('mobile-top-bar-adapter-variant')).toMatchObject({ component: 'mobile-top-bar', aspect: 'structure', approvedBy: 'lead', ignore: [{ class: 'hw-mobile-top-bar', attribute: 'data-variant' }] });
    expect(byId('mobile-top-bar-adapter-variant').source).toMatch(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: MobileTopBar: React, Vue and Angular always write/);
    // One or two adapters differ, or the vanilla result writes the attribute (data-hw-filled):
    // no ignore can express it, so these leave the structure aspect out of the groups that name them.
    const whole = {
      'field-adapter-markup': ['field', /Field: in Angular a value control/],
      'textarea-adapter-attributes': ['textarea', /Textarea: React and Vue write/],
      'number-field-adapter-attributes': ['number-field', /NumberField: React and Vue write/],
      'input-group-adapter-attributes': ['input-group', /InputGroup \(Angular\) always writes/],
      'switch-adapter-attributes': ['switch', /Switch \(Vue\) writes/],
      'checkbox-adapter-attributes': ['checkbox', /Checkbox \(Vue\) writes/],
      'radio-adapter-markup': ['radio', /Radio \(Vue\) writes/],
      'select-adapter-attributes': ['select', /Select: React and Vue write/],
      'slider-adapter-attributes': ['slider', /Slider: React and Vue write/],
      'file-upload-adapter-labelledby': ['file-upload', /FileUpload: React and Vue write/],
      'spacer-vue-layout-attributes': ['spacer', /Spacer \(Vue\) always writes/],
      'center-vue-layout-attributes': ['center', /Center \(Vue\) always writes/],
      'collapsible-adapter-markup': ['collapsible', /Collapsible \(React\) writes `aria-controls`/],
      'container-vue-layout-attributes': ['container', /Container \(Vue\) always writes/],
      'inline-vue-layout-attributes': ['inline', /Inline \(Vue\) always writes/],
      'grid-vue-layout-attributes': ['grid', /Grid \(Vue\) always writes/],
      'columns-vue-layout-attributes': ['columns', /Columns \(Vue\) always writes/],
      'section-vue-layout-attributes': ['section', /Section \(Vue\) always writes/],
      'sidebar-adapter-layout-attributes': ['sidebar', /Sidebar \(Vue\) always writes/],
      'aspect-ratio-adapter-attributes': ['aspect-ratio', /AspectRatio \(Vue\) always writes/],
      'app-shell-adapter-side': ['app-shell', /AppShell \(Vue\) always writes/],
      'portal-footer-adapter-markup': ['portal-footer', /PortalFooter \(Angular\): `hw-portal-footer` always renders/],
      'portal-layout-adapter-markup': ['portal-layout', /PortalHeader \(Angular\) always renders `div\.hw-portal-notice`/],
      'tooltip-adapter-markup': ['tooltip', /Tooltip \(Angular\) gives its host element `hw-tooltip`/],
      'popover-adapter-markup': ['popover', /Popover and Menu \(Vue, Angular\) render their packaged trigger/],
      'menu-adapter-markup': ['menu', /Menu \(React, Vue\) gives the first enabled item/],
      'dialog-adapter-markup': ['dialog', /Dialog and Drawer \(React\) set `aria-haspopup="dialog"`/],
      'drawer-adapter-markup': ['drawer', /Drawer \(Vue\) renders a `side` attribute/],
      'toast-region-adapter-markup': ['toast-region', /ToastRegion \(Angular\) writes `data-variant="default"`/],
      'cookie-consent-adapter-markup': ['cookie-consent', /CookieConsent \(Angular\): the host element `hw-cookie-consent`/],
      'password-field-adapter-markup': ['password-field', /PasswordField \(Vue\) writes `hw-password-field`/],
      'search-field-adapter-markup': ['search-field', /SearchField \(Angular\) writes `autocomplete="off"`/],
      'pin-input-adapter-markup': ['pin-input', /PinInput \(Vue\) writes `hw-pin-input`/],
      'rating-adapter-markup': ['rating', /Rating \(React\) renders `fieldset\.hw-rating` without `hw-field`/],
      'combobox-adapter-markup': ['combobox', /Combobox: React and Vue write `aria-labelledby`/],
      'multi-select-adapter-markup': ['multi-select', /MultiSelect \(React, Vue\) writes `value=""`/],
      'tag-input-adapter-markup': ['tag-input', /TagInput: React and Vue write `aria-labelledby`/],
      'range-slider-adapter-markup': ['range-slider', /RangeSlider \(Vue, Angular\) always writes `step="1"`/],
    };
    for (const [id, [component, text]] of Object.entries(whole)) {
      expect(byId(id)).toMatchObject({ component, aspect: 'structure', approvedBy: 'lead' });
      expect(byId(id).ignore).toBeUndefined();
      expect(byId(id).source.replace(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: /, '')).toMatch(new RegExp(`^${text.source}`));
    }
    // A difference of the accessibility tree or of the rendering leaves that aspect out; the
    // groups that name one also name the structure entry of their component.
    const aspects = {
      'rating-angular-radio-names': ['rating', 'aria', /Rating \(Angular\) names each radio/],
      'rating-react-error-height': ['rating', 'screenshot', /Rating \(React\) renders `fieldset\.hw-rating` without `hw-field`/],
      'portal-layout-footer-brand-tree': ['portal-layout', 'aria', /PortalFooter: a text `brand` renders as plain text in React/],
      'portal-layout-footer-brand-weight': ['portal-layout', 'screenshot', /PortalFooter: a text `brand` renders as plain text in React/],
    };
    for (const [id, [component, aspect, text]] of Object.entries(aspects)) {
      expect(byId(id)).toMatchObject({ component, aspect, approvedBy: 'lead' });
      expect(byId(id).ignore).toBeUndefined();
      expect(byId(id).source.replace(/^CHANGELOG\.md, 0\.3\.0, Known defects in 0\.3\.0: /, '')).toMatch(new RegExp(`^${text.source}`));
    }
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

  // A group of Portal layout differs in several aspects: the structure, the accessibility tree and the rendering.
  it('judge each id of a list as one, in the order written', () => {
    const aria = { ...entry, id: 'tabs-aria', aspect: 'aria' };
    const { entries } = validateKnownDifferences([entry, aria, { ...entry, id: 'button-x', component: 'button' }]);
    expect(differencesOf({ ...group, differences: 'tabs-bar,tabs-aria' }, entries)).toEqual({ entries: [entry, aria], errors: [] });
    expect(differencesOf(group, entries)).toEqual({ entries: [], errors: [] });
    expect(differencesOf({ ...group, differences: 'tabs-bar,missing,button-x' }, entries)).toEqual({
      entries: [entry],
      errors: [
        'HWE-KD docs/components/tabs.ar.md:19: differences=missing names no entry of scripts/equivalence/known-differences.json',
        'HWE-KD docs/components/tabs.ar.md:19: differences=button-x documents component button, not tabs',
      ],
    });
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

  // The pilot of the Stack page: only the first difference of a pair was printed.
  it('prints one HWE-STRUCT line for each difference of a pair, with the wording of the first', () => {
    const other = [bar({ 'data-orientation': 'horizontal', 'data-side': 'start' }, 1)];
    const rows = compareCapture({ trees: { vanilla, vue: other }, snapshots: { vanilla: 'a', vue: 'a' }, images: {} }).filter((row) => row.result === 'different');
    expect(rows.map((row) => row.pair)).toEqual(['vanilla-vue']);
    expect(comparisonFailures(group, 'rest', rows[0])).toEqual([
      'HWE-STRUCT docs/components/tabs.ar.md:19: basic (ar, rest) vanilla and vue differ at $[0].children[0].attrs["data-orientation"]: vanilla (absent), vue "horizontal"',
      'HWE-STRUCT docs/components/tabs.ar.md:19: basic (ar, rest) vanilla and vue differ at $[0].children[0].attrs["data-side"]: vanilla (absent), vue "start"',
      'HWE-STRUCT docs/components/tabs.ar.md:19: basic (ar, rest) vanilla and vue differ at $[0].children[0].children[1]: vanilla {"tag":"button","attrs":{"class":"hw-tab","role":"tab"},"children":["t1"]}, vue (absent)',
    ]);
    // An aria row keeps its one line.
    const aria = compareCapture({ trees: { vanilla, vue: vanilla }, snapshots: { vanilla: 'a\nb', vue: 'a\nc' }, images: {} }).filter((row) => row.result === 'different');
    expect(aria.flatMap((row) => comparisonFailures(group, 'rest', row))).toEqual(['HWE-ARIA docs/components/tabs.ar.md:19: basic (ar, rest) vanilla and vue aria snapshots differ at line 2: vanilla "b", vue "c"']);
  });

  it('skips the whole aspect for an entry without ignore, as before', () => {
    const rows = structure(compareCapture(capture([bar({}, 1)]), entry));
    expect(rows.map((row) => row.result)).toEqual(['skipped', 'skipped', 'skipped']);
  });

  it('applies every entry of a list: each aspect without ignore is skipped, and the other aspects are compared', () => {
    const aria = { ...entry, id: 'tabs-aria', aspect: 'aria' };
    const captured = capture([bar({}, 1)]);
    captured.snapshots.angular = 'b';
    // Without the list both aspects fail; with it neither is compared, and the screenshots still are.
    expect(compareCapture(captured).filter((row) => row.result === 'different').map((row) => `${row.aspect} ${row.pair}`)).toEqual(expect.arrayContaining(['structure vanilla-react', 'aria vanilla-angular']));
    const rows = compareCapture(captured, [entry, aria]);
    expect(rows.filter((row) => row.aspect !== 'screenshot').every((row) => row.result === 'skipped')).toBe(true);
    expect(rows.filter((row) => row.aspect === 'aria').map((row) => row.pair)).toEqual(['vanilla-react', 'vanilla-vue', 'vanilla-angular']);
    // One entry of the list leaves the other aspect compared in full.
    expect(compareCapture(captured, [aria]).filter((row) => row.result === 'different').every((row) => row.aspect === 'structure')).toBe(true);
    expect(compareCapture(captured, [entry]).filter((row) => row.result === 'different').map((row) => `${row.aspect} ${row.pair}`)).toEqual(['aria vanilla-angular']);
  });

  it('joins the ignore lists of several structure entries and still fails what none of them names', () => {
    const side = { ...orientation, id: 'tabs-bar-side', ignore: [{ class: 'hw-tab-bar', attribute: 'data-side' }] };
    const both = [bar({ 'data-orientation': 'horizontal', 'data-side': 'start' })];
    expect(structure(compareCapture(capture(both), [orientation])).every((row) => row.result === 'different')).toBe(true);
    expect(structure(compareCapture(capture(both), [side])).every((row) => row.result === 'different')).toBe(true);
    const rows = structure(compareCapture(capture(both), [orientation, side]));
    expect(rows.map((row) => row.result)).toEqual(['equal', 'equal', 'equal']);
    expect(rows[0].ignored).toEqual([...orientation.ignore, ...side.ignore]);
    const more = structure(compareCapture(capture([bar({ 'data-orientation': 'horizontal', 'data-side': 'start', 'data-x': 'y' })]), [orientation, side]));
    expect(more.every((row) => row.result === 'different')).toBe(true);
    expect(more[0].message).toMatch(/\["data-x"\]/);
    // A structure entry without ignore skips the comparison, whatever another entry ignores.
    expect(structure(compareCapture(capture(both), [orientation, entry])).map((row) => row.result)).toEqual(['skipped', 'skipped', 'skipped']);
  });

  it('counts one documented difference in the summary line', () => {
    expect(summaryLine({ groups: 9, languages: 2, frameworks: 4, interactionChecks: 14, afterInteraction: 4, restOnly: 5, documented: 1 })).toBe(
      'equivalence: 9 groups x 2 languages x 4 frameworks equal (4 compared after interaction, 5 at rest only; 14 interaction checks, 0 asserted steps, 1 documented difference; axe clean in 0 frame documents)',
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

  it('reads several checks from check=', () => {
    expect(checkNames({ check: 'tabs-keyboard,tabs-disabled' })).toEqual(['tabs-keyboard', 'tabs-disabled']);
    expect(checkNames({})).toEqual([]);
  });

  it('every Tabs group names the checks its text describes, in both languages', async () => {
    const { parseMarkdown } = await import('../../content/parse.mjs');
    const { groupLive } = await import('../../content/live.mjs');
    for (const file of ['tabs.md', 'tabs.ar.md']) {
      const text = readFileSync(new URL(`../../../../docs/components/${file}`, import.meta.url), 'utf8');
      const { groups } = groupLive(parseMarkdown(text, file).tree.children, file);
      expect(Object.fromEntries(groups.map((item) => [item.example, checkNames(item)])), file).toEqual({
        basic: ['tabs-keyboard'],
        vertical: ['tabs-click', 'tabs-keyboard-vertical'],
        manual: ['tabs-activate'],
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

  it('names the steps of the Tabs checks', () => {
    // G24 of the 5a fix round added the unhandled Down Arrow and Up Arrow of a horizontal list.
    expect(tabsKeyboard.steps.map((step) => step.name)).toEqual(['tab-into-list', 'right-arrow', 'down-arrow-unhandled', 'up-arrow-unhandled', 'left-arrow', 'left-arrow-again', 'end', 'right-arrow-again', 'home', 'tab-to-panel']);
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
        `${served.origin}/hawiyah/__harness/?id=tabs&lang=ar&example=basic&pin=0.3.0&frameworks=vanilla%2Creact%2Cvue%2Cangular&width=720`,
      );
      // A framed group (5a.9) is compared in frames 1280 px wide, and its second pass at 390 px.
      expect(harnessUrl(served.origin, '/hawiyah/', { ...group, frame: true }, '0.3.0')).toMatch(/&width=1280$/);
      expect(harnessUrl(served.origin, '/hawiyah/', { ...group, frame: true }, '0.3.0', undefined, 390)).toMatch(/&width=390$/);
    } finally {
      await served.close();
    }
  });
});

// runEquivalence fails before a browser starts when the scope or the checks are
// wrong (HWE-SCOPE, HWE-CHECK). A fixture guide directory holds only what that part reads.
describe('runEquivalence before the browser', () => {
  const root = mkdtempSync(join(tmpdir(), 'hw-equivalence-run-'));
  afterAll(() => rmSync(root, { recursive: true, force: true }));
  let count = 0;
  const live = (id, example, extra = {}) => ['ar', 'en'].map((lang) => ({ id, lang, example, blocks: { vanilla: { line: 7 } }, ...extra }));
  /** A guide directory with the given live groups, manifest pages and catalogue. */
  const fixture = ({ groups, pages, components }) => {
    const dir = join(root, `case-${(count += 1)}`);
    mkdirSync(join(dir, 'dist', 'browser', 'runtime'), { recursive: true });
    mkdirSync(join(dir, '.cache', 'content'), { recursive: true });
    mkdirSync(join(dir, 'src', 'generated', 'content'), { recursive: true });
    writeFileSync(join(dir, 'dist', 'browser', 'runtime', 'import-map.json'), '{"imports":{}}\n');
    writeFileSync(join(dir, '.cache', 'content', 'live-groups.json'), JSON.stringify(groups));
    writeFileSync(join(dir, 'src', 'generated', 'content', 'manifest.json'), JSON.stringify({ pages }));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { '@hawiyah/styles': '0.3.0' } }));
    writeFileSync(join(dir, 'components.json'), JSON.stringify({ components }));
    // The fixture has no installed packages to check the references of the designed differences against.
    return { guideDir: dir, componentsFile: join(dir, 'components.json'), log: () => {}, designedDifferences: { empty: [], hooks: [], hosts: [], errors: [] } };
  };
  const tabsPage = (examples) => ({ id: 'tabs', langs: ['ar', 'en'], liveGroups: examples.map((example) => ({ example })) });
  const interactive = [{ id: 'tabs', sourceType: 'interactive' }];

  it('HWE-SCOPE: a group of a built page that the live groups file lacks', async () => {
    const options = fixture({ groups: live('tabs', 'basic', { check: 'tabs-keyboard' }), pages: [tabsPage(['basic', 'manual'])], components: interactive });
    await expect(runEquivalence(options)).rejects.toThrow('HWE-SCOPE .cache/content/live-groups.json:1: the built pages have the groups tabs/ar/manual, tabs/en/manual, which the live groups file lacks');
  });

  it('HWE-SCOPE: an --only key that names no group', async () => {
    const options = fixture({ groups: live('tabs', 'basic', { check: 'tabs-keyboard' }), pages: [tabsPage(['basic'])], components: interactive });
    await expect(runEquivalence({ ...options, only: ['tabs/en/nothing'] })).rejects.toThrow('HWE-SCOPE --only:1: tabs/en/nothing names no live group');
  });

  it('HWE-CHECK: a group of a component with a controller that names no check and is not static', async () => {
    const options = fixture({ groups: live('tabs', 'basic'), pages: [tabsPage(['basic'])], components: interactive });
    await expect(runEquivalence(options)).rejects.toThrow('HWE-CHECK docs/components/tabs.ar.md:7: basic: tabs has a controller, so the group names at least one check (check=<name>[,<name>]) or declares itself static');
  });

  // G19 of the 5a fix round: one definition of a component with a controller, a controller
  // factory of the installed @hawiyah/vanilla, also where components.json does not mark it interactive.
  it('HWE-CHECK: a group of a component whose page targets a controller factory, whatever its sourceType', async () => {
    const accordion = { id: 'accordion', langs: ['ar', 'en'], liveGroups: [{ example: 'basic' }] };
    const options = fixture({ groups: live('accordion', 'basic'), pages: [accordion], components: [{ id: 'accordion', sourceType: 'native' }] });
    await expect(runEquivalence(options)).rejects.toThrow('HWE-CHECK docs/components/accordion.ar.md:7: basic: accordion has a controller, so the group names at least one check (check=<name>[,<name>]) or declares itself static');
  });

  it('HWE-CHECK: a check without a script', async () => {
    const options = fixture({ groups: live('tabs', 'basic', { check: 'tabs-nothing' }), pages: [tabsPage(['basic'])], components: interactive });
    await expect(runEquivalence(options)).rejects.toThrow('HWE-CHECK docs/components/tabs.ar.md:7: check=tabs-nothing has no scripts/equivalence/checks/tabs-nothing.mjs');
  });

  // The owner's decision for the launch: a component with a controller other than Tabs may have a
  // keyboard table written from the package READMEs, its outcomes not checked.
  it('prints one line per page whose keyboard outcomes keyboard-exceptions.json leaves unchecked, and fails a wrong entry', async () => {
    const table = { caption: 'Keyboard interaction of Accordion', line: 30, rows: [{ keys: ['Enter', 'Space'], action: 'Opens or closes the section.' }] };
    const accordion = { id: 'accordion', langs: ['ar', 'en'], liveGroups: [{ example: 'basic', static: true }], keyboard: { en: table, ar: table } };
    // The check that does not exist stops the run before the browser starts.
    const groups = [...live('accordion', 'basic', { static: true }), ...live('tabs', 'basic', { check: 'tabs-nothing' })];
    const options = fixture({ groups, pages: [accordion, { ...tabsPage(['basic']), liveGroups: [{ example: 'basic', check: 'tabs-nothing' }] }], components: [{ id: 'accordion', sourceType: 'native' }, ...interactive] });
    mkdirSync(join(options.guideDir, 'node_modules', '@hawiyah', 'vanilla'), { recursive: true });
    writeFileSync(join(options.guideDir, 'node_modules', '@hawiyah', 'vanilla', 'README.md'), 'Enter and Space open or close the section.\n');
    const entry = { component: 'accordion', reason: 'Keyboard outcome checks of Accordion follow the launch.', reference: '@hawiyah/vanilla README.md: "Enter and Space open or close the section."', approvedBy: 'lead' };
    const lines = [];
    const run = (exceptions) => runEquivalence({ ...options, keyboardExceptions: exceptions, log: (line) => lines.push(line) }).then(() => '', (error) => error.message);
    let message = await run([entry]);
    expect(lines).toEqual(['keyboard outcomes not checked: accordion']);
    // The failures of the run are those of the Tabs fixture alone (no keyboard table, a check without a script).
    expect(message).toContain('HWE-CHECK docs/components/tabs.md:7: check=tabs-nothing has no scripts/equivalence/checks/tabs-nothing.mjs');
    expect(message.split('\n').filter((line) => line.includes('accordion'))).toEqual([]);
    lines.length = 0;
    message = await run([]);
    expect(lines).toEqual([]);
    expect(message).toMatch(/HWE-KEYS docs\/components\/accordion\.md:30: the keyboard table documents Enter/);
    // An entry for a page whose groups name checks, for a page that does not exist, and with a sentence the README lacks.
    message = await run([{ ...entry, component: 'tabs' }, { ...entry, component: 'combobox' }, { ...entry, reference: '@hawiyah/vanilla README.md: "Escape closes the section."' }]);
    expect(message).toContain('HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 1 (tabs) leaves the keyboard outcomes of tabs unchecked, but its groups name the checks tabs-nothing; a component with checks is bound to them, so remove the entry');
    expect(message).toContain('HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 2 (combobox) matches no page: docs/components/ has no page combobox; remove it');
    expect(message).toContain('HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 3 (accordion): the reference quotes a sentence that the README of the installed @hawiyah/vanilla does not hold');
  });

  // The full build reads the manifest, which has no page pending translation (no route until the
  // Arabic page exists): an entry for such a page matches its English file of docs/components/.
  it('matches an entry of keyboard-exceptions.json with an English page of docs/components/ that is pending translation', async () => {
    const options = fixture({ groups: live('tabs', 'basic', { check: 'tabs-nothing' }), pages: [{ ...tabsPage(['basic']), liveGroups: [{ example: 'basic', check: 'tabs-nothing' }] }], components: interactive });
    const docs = join(options.guideDir, '..', 'docs', 'components');
    mkdirSync(docs, { recursive: true });
    writeFileSync(join(docs, 'dialog.md'), '# Dialog\n');
    writeFileSync(join(docs, 'README.md'), '# Contract\n');
    mkdirSync(join(options.guideDir, 'node_modules', '@hawiyah', 'vanilla'), { recursive: true });
    writeFileSync(join(options.guideDir, 'node_modules', '@hawiyah', 'vanilla', 'README.md'), 'Escape closes the dialog.\n');
    const entry = (component) => ({ component, reason: 'Not yet checked.', reference: '@hawiyah/vanilla README.md: "Escape closes the dialog."', approvedBy: 'lead' });
    const message = await runEquivalence({ ...options, keyboardExceptions: [entry('dialog'), entry('drawer')] }).then(() => '', (error) => error.message);
    expect(message).toContain('HWE-CHECK docs/components/tabs.md:7: check=tabs-nothing has no scripts/equivalence/checks/tabs-nothing.mjs');
    expect(message.split('\n').filter((line) => line.includes('(dialog)'))).toEqual([]);
    expect(message).toContain('HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 2 (drawer) matches no page: docs/components/ has no page drawer; remove it');
    expect(englishPages(docs)).toEqual(['dialog']);
    expect(englishPages(join(docs, 'none'))).toEqual([]);
    rmSync(join(options.guideDir, '..', 'docs'), { recursive: true, force: true });
  });
});

describe('the harness hands the Angular host elements of angular-hosts.json to the Angular normaliser only', () => {
  it('capture() passes angularHosts to normalize() in the Angular frame, an empty map elsewhere, and records the listed elements the Angular result holds', async () => {
    const received = {};
    let current = null;
    const frames = Object.fromEntries(FRAMEWORKS.map((framework) => [framework, {
      evaluate: async (fn, arg) => {
        if (fn === normalize) {
          received[framework] = arg;
          return [];
        }
        if (fn === hostsIn) return framework === 'angular' ? ['hw-avatar'] : ['wrong'];
        return undefined;
      },
      waitForFunction: async () => undefined,
    }]));
    const locator = {
      elementHandle: async () => ({ contentFrame: async () => frames[current] }),
      locator: () => locator,
      ariaSnapshot: async () => '',
      screenshot: async () => Buffer.alloc(0),
      scrollIntoViewIfNeeded: async () => undefined,
      boundingBox: async () => ({ x: 16, y: 40, width: 720, height: 160 }),
    };
    const page = {
      locator: (selector) => {
        current = /data-framework="([a-z]+)"/.exec(selector)?.[1] ?? current;
        return locator;
      },
      frameLocator: () => locator,
      waitForFunction: async () => undefined,
      mouse: { move: async () => undefined },
    };
    const captured = await capture(page, FRAMEWORKS, null, { angularHosts: { 'hw-avatar': 'span' } });
    expect(received.angular.hosts).toEqual({ 'hw-avatar': 'span' });
    for (const framework of ['vanilla', 'react', 'vue']) expect(received[framework].hosts).toEqual({});
    expect(captured.hosts).toEqual(['hw-avatar']);
    expect((await capture(page)).hosts).toEqual([]);
    expect(received.angular.hosts).toEqual({});
  });

  it('hostsIn() finds a listed element below the mount only with an hw- class', () => {
    const dom = new JSDOM('<!doctype html><div id="app"><hw-avatar class="hw-avatar"></hw-avatar><hw-badge></hw-badge></div><hw-skeleton class="hw-skeleton"></hw-skeleton>', { runScripts: 'outside-only' });
    const evaluated = dom.window.eval(`(${hostsIn.toString()})`);
    expect(evaluated({ target: '#app', elements: ['hw-avatar', 'hw-badge', 'hw-skeleton'] })).toEqual(['hw-avatar']);
  });
});

describe('the harness hands the normaliser its inputs (verification W2: styled {} passed every test)', () => {
  it('capture() passes the generated-name pattern and the styled data-hw-* attributes read from the installed packages to normalize()', async () => {
    const guideDir = fileURLToPath(new URL('../../../', import.meta.url));
    const received = [];
    // A page with four result frames, enough of Playwright's surface for capture().
    const frame = {
      evaluate: async (fn, arg) => {
        if (fn === normalize) received.push(arg);
        return fn === normalize ? [] : undefined;
      },
      waitForFunction: async () => undefined,
    };
    const locator = {
      elementHandle: async () => ({ contentFrame: async () => frame }),
      locator: () => locator,
      ariaSnapshot: async () => '',
      screenshot: async () => Buffer.alloc(0),
      scrollIntoViewIfNeeded: async () => undefined,
      boundingBox: async () => ({ x: 16, y: 40, width: 720, height: 160 }),
    };
    const page = { locator: () => locator, frameLocator: () => locator, waitForFunction: async () => undefined, mouse: { move: async () => undefined } };
    await capture(page);
    expect(received).toHaveLength(4);
    const styled = styledAttributes(guideDir);
    expect(Object.keys(styled)).toEqual(expect.arrayContaining(['data-hw-mode', 'data-hw-theme', 'data-hw-density']));
    for (const arg of received) {
      expect(arg.generatedName).toBe(generatedNamePattern(guideDir));
      expect(arg.styled).toEqual(styled);
    }
  });
});
