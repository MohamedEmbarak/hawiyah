// Self-tests of the comparisons (contentPipeline.equivalence.selfTest): structure
// paths, aria snapshots and pixelmatch screenshots, with negative controls.
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { compareAria, compareScreenshot, compareScreenshots, compareStructure, differences, firstDifference, PIXEL_THRESHOLD, PRINTED_DIFFERENCES, pixelLimit, structureMessages, withoutDesigned } from '../compare.mjs';
import { compareCapture, designedOf, unmatchedHosts, validateDesignedDifferences } from '../run.mjs';

/** A white PNG with a dark bar of 40x12 pixels at x (a stand-in for rendered text). */
function image(x, { width = 200, height = 50, extra = 0 } = {}) {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let i = 0; i < width; i += 1) {
      const dark = (i >= x && i < x + 40 && y >= 20 && y < 32) || (y === 0 && i < extra);
      const at = (y * width + i) * 4;
      png.data[at] = png.data[at + 1] = png.data[at + 2] = dark ? 20 : 255;
      png.data[at + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

describe('firstDifference', () => {
  it('returns null for deep-equal values and the first path otherwise', () => {
    expect(firstDifference({ a: [1, { b: 'x' }] }, { a: [1, { b: 'x' }] })).toBeNull();
    expect(firstDifference({ a: [1, { b: 'x' }] }, { a: [1, { b: 'y' }] })).toEqual({ path: '$.a[1].b', a: 'x', b: 'y' });
    expect(firstDifference([1, 2], [1, 2, 3])).toEqual({ path: '$[2]', a: undefined, b: 3 });
    expect(firstDifference({ 'aria-x': 1 }, {})).toEqual({ path: '$["aria-x"]', a: 1, b: undefined });
  });
});

describe('compareStructure', () => {
  it('compares each framework with vanilla and names the first differing path', () => {
    const results = compareStructure({ vanilla: ['a'], react: ['a'], vue: ['b'], angular: ['a'] });
    expect(results.map((r) => [r.pair, r.equal])).toEqual([
      ['vanilla-react', true],
      ['vanilla-vue', false],
      ['vanilla-angular', true],
    ]);
    expect(results[1].message).toBe('vanilla and vue differ at $[0]: vanilla "a", vue "b"');
  });

  // The pilot of the Stack page: the second difference of a pair appeared only once the first was excused.
  it('lists every difference of a pair, the first with the message of the pair, and prints one line for each', () => {
    const stack = (attrs) => [{ tag: 'div', attrs: { class: 'hw-stack', ...attrs }, children: [{ tag: 'p', attrs: {}, children: ['x'] }] }];
    const vue = stack({ 'data-collapse-at': 'md', 'data-side': 'start' });
    vue[0].children[0].children = ['y'];
    const [react, pair] = compareStructure({ vanilla: stack({}), react: stack({}), vue });
    expect(react).toEqual({ pair: 'vanilla-react', equal: true });
    expect(pair).toMatchObject({ pair: 'vanilla-vue', equal: false, path: '$[0].attrs["data-collapse-at"]', message: 'vanilla and vue differ at $[0].attrs["data-collapse-at"]: vanilla (absent), vue "md"', more: 0 });
    expect(structureMessages(pair)).toEqual([
      'vanilla and vue differ at $[0].attrs["data-collapse-at"]: vanilla (absent), vue "md"',
      'vanilla and vue differ at $[0].attrs["data-side"]: vanilla (absent), vue "start"',
      'vanilla and vue differ at $[0].children[0].children[0]: vanilla "x", vue "y"',
    ]);
    expect(differences(stack({}), vue)[0]).toEqual(firstDifference(stack({}), vue));
    // A longer array: each index beyond the shorter one is a difference of its own.
    expect(differences(['a', 'b'], ['a', 'c', 'd', 'e']).map((item) => item.path)).toEqual(['$[1]', '$[2]', '$[3]']);
    expect(differences({ a: 1 }, { a: 1 })).toEqual([]);
  });

  it('prints at most 20 differences of a pair and counts the rest', () => {
    const tree = (value) => [{ tag: 'ul', attrs: {}, children: Array.from({ length: 23 }, (_, i) => ({ tag: 'li', attrs: {}, children: [`${value} ${i}`] })) }];
    const [pair] = compareStructure({ vanilla: tree('a'), react: tree('b') });
    expect(pair.differences).toHaveLength(PRINTED_DIFFERENCES);
    expect(pair.more).toBe(3);
    const lines = structureMessages(pair);
    expect(lines).toHaveLength(21);
    expect(lines[0]).toBe('vanilla and react differ at $[0].children[0].children[0]: vanilla "a 0", react "b 0"');
    expect(lines[19]).toBe('vanilla and react differ at $[0].children[19].children[0]: vanilla "a 19", react "b 19"');
    expect(lines[20]).toBe('vanilla and react: 3 further differences not printed (at most 20 per pair)');
    const [one] = compareStructure({ vanilla: tree('a').map((ul) => ({ ...ul, children: ul.children.slice(0, 21) })), react: tree('b').map((ul) => ({ ...ul, children: ul.children.slice(0, 21) })) });
    expect(structureMessages(one).at(-1)).toBe('vanilla and react: 1 further difference not printed (at most 20 per pair)');
    // A stale entry has no list of differences: its message alone.
    expect(structureMessages({ pair: 'vanilla-react', equal: false, path: '$', message: 'm' })).toEqual(['m']);
  });
});

// The two narrow forms of a designed difference between the
// adapters (the lists empty-elements.json and vanilla-hooks.json). Neither switches off
// the structure comparison: a difference outside the listed element or attribute fails.
describe('designed differences', () => {
  const stat = (trend) => [{ tag: 'div', attrs: { class: 'hw-stat' }, children: [
    { tag: 'span', attrs: { class: 'hw-stat-label' }, children: ['Requests'] },
    { tag: 'span', attrs: { class: 'hw-stat-value' }, children: ['128'] },
    ...(trend === undefined ? [] : [{ tag: 'span', attrs: { class: 'hw-stat-trend' }, children: trend }]),
  ] }];
  const structure = (trees, designed) => compareCapture({ trees, snapshots: {}, images: {} }, null, designed).filter((row) => row.aspect === 'structure' && row.result === 'different').map((row) => row.message);
  const none = { emptyClasses: [], vanillaAttributes: [] };
  const empty = { emptyClasses: ['hw-stat-trend'], vanillaAttributes: [] };
  it('leaves out an element of a listed class while it is empty, in every result', () => {
    const trees = { vanilla: stat(), react: stat(), vue: stat(), angular: stat([]) };
    expect(structure(trees, none)).toEqual(['vanilla and angular differ at $[0].children[2]: vanilla (absent), angular {"tag":"span","attrs":{"class":"hw-stat-trend"},"children":[]}']);
    expect(structure(trees, empty)).toEqual([]);
  });
  it('still fails the same element with content, another element, and another class', () => {
    expect(structure({ vanilla: stat(), react: stat(), vue: stat(), angular: stat(['12 more']) }, empty)).toHaveLength(1);
    const other = stat();
    other[0].children.push({ tag: 'span', attrs: { class: 'hw-stat-description' }, children: [] });
    expect(structure({ vanilla: stat(), react: stat(), vue: stat(), angular: other }, empty)).toEqual([expect.stringMatching(/^vanilla and angular differ at \$\[0\]\.children\[2\]: vanilla \(absent\), angular .*hw-stat-description/)]);
  });
  const item = (attrs) => [{ tag: 'details', attrs: { class: 'hw-accordion-item', ...attrs }, children: [{ tag: 'summary', attrs: {}, children: ['Fees'] }] }];
  const hook = { emptyClasses: [], vanillaAttributes: ['data-hw-value'] };
  it('leaves out a listed vanilla configuration attribute of the vanilla result only', () => {
    const trees = { vanilla: item({ 'data-hw-value': 'fees' }), react: item({}), vue: item({}), angular: item({}) };
    expect(structure(trees, none)).toHaveLength(3);
    expect(structure(trees, hook)).toEqual([]);
    expect(withoutDesigned(trees.vanilla, hook, 'vanilla')[0].attrs).toEqual({ class: 'hw-accordion-item' });
  });
  it('still fails the attribute in another result, and another attribute', () => {
    expect(structure({ vanilla: item({ 'data-hw-value': 'fees' }), react: item({ 'data-hw-value': 'fees' }), vue: item({}), angular: item({}) }, hook)).toEqual([
      'vanilla and react differ at $[0].attrs["data-hw-value"]: vanilla (absent), react "fees"',
    ]);
    expect(structure({ vanilla: item({ 'data-hw-value': 'fees', 'data-hw-open': '' }), react: item({}), vue: item({}), angular: item({}) }, hook)).toHaveLength(3);
  });
  it('validates both lists: fields, forms, references and the attribute read by @hawiyah/vanilla and not by the stylesheet', () => {
    const entry = { component: 'stat', class: 'hw-stat-trend', reason: 'r', reference: '@hawiyah/styles README.md: "Regions that an adapter always renders"', approvedBy: 'lead' };
    const options = { changelog: '# Changelog\n', readme: () => 'Regions that an adapter always renders take no space.', vanillaText: "item.dataset.hwValue", styled: new Map([['data-hw-mode', []]]) };
    expect(validateDesignedDifferences({ empty: [entry], hooks: [] }, options).errors).toEqual([]);
    const errors = validateDesignedDifferences({
      empty: [{ ...entry, class: 'stat-trend' }, { ...entry, reference: 'the styles README' }, { component: 'stat', class: 'hw-x' }],
      hooks: [{ component: 'accordion', attribute: 'data-hw-value', reason: 'r', reference: entry.reference, approvedBy: 'lead' }, { component: 'x', attribute: 'data-hw-mode', reason: 'r', reference: entry.reference, approvedBy: 'lead' }],
    }, options).errors;
    expect(errors).toEqual([
      'HWE-KD scripts/equivalence/empty-elements.json:1: entry 1: class stat-trend is not one hw- class name',
      'HWE-KD scripts/equivalence/empty-elements.json:1: entry 2: reference must be a CHANGELOG.md entry (source must read "CHANGELOG.md, <version>, <section>: <text of the entry>") or \'@hawiyah/<name> README.md: "<sentence>"\'',
      'HWE-KD scripts/equivalence/empty-elements.json:1: entry 3 must be { component, class, reason, reference, approvedBy } with non-empty values',
      'HWE-KD scripts/equivalence/vanilla-hooks.json:1: entry 2: the installed @hawiyah/vanilla does not read data-hw-mode',
      'HWE-KD scripts/equivalence/vanilla-hooks.json:1: entry 2: the stylesheet selects data-hw-mode, so the structure comparison keeps it',
    ]);
  });
});

describe('angular-hosts.json', () => {
  const entry = { component: 'avatar', element: 'hw-avatar', tag: 'span', reason: 'r', reference: '@hawiyah/angular README.md: "The host is the avatar (`hw-avatar.hw-avatar`)."', approvedBy: 'lead' };
  const options = { changelog: '# Changelog\n\n## 0.3.0 — 2026-11-18\n\n#### Parity fixes\n\n- Badge (Angular): the host carries the class.\n', readme: (name) => (name === 'angular' ? 'The host is the avatar (`hw-avatar.hw-avatar`).' : null) };
  it('is validated like the other two lists: fields, forms and a reference found in the cited README or CHANGELOG.md (HWE-KD)', () => {
    const changelogEntry = { ...entry, component: 'badge', element: 'hw-badge', reference: 'CHANGELOG.md, 0.3.0, Parity fixes: the host carries the class' };
    const valid = validateDesignedDifferences({ empty: [], hooks: [], hosts: [entry, changelogEntry] }, options);
    expect(valid.errors).toEqual([]);
    expect(valid.hosts).toEqual([entry, changelogEntry]);
    const errors = validateDesignedDifferences({ empty: [], hooks: [], hosts: [
      { ...entry, element: 'avatar' },
      { ...entry, tag: 'my-span' },
      { ...entry, reference: '@hawiyah/angular README.md: "The host is the badge."' },
      { ...entry, reference: 'CHANGELOG.md, 0.3.0, Parity fixes: the host is a div' },
      { component: 'avatar', element: 'hw-avatar', reason: 'r', reference: entry.reference, approvedBy: 'lead' },
    ] }, options).errors;
    expect(errors).toEqual([
      'HWE-KD scripts/equivalence/angular-hosts.json:1: entry 1: element avatar is not one hw- element name',
      'HWE-KD scripts/equivalence/angular-hosts.json:1: entry 2: tag my-span is not one HTML element name without a hyphen',
      'HWE-KD scripts/equivalence/angular-hosts.json:1: entry 3: the sentence is not in the README of the installed @hawiyah/angular',
      'HWE-KD scripts/equivalence/angular-hosts.json:1: entry 4: reference must be a CHANGELOG.md entry (the text "the host is a div" is not in CHANGELOG.md ## 0.3.0 Parity fixes) or \'@hawiyah/<name> README.md: "<sentence>"\'',
      'HWE-KD scripts/equivalence/angular-hosts.json:1: entry 5 must be { component, element, tag, reason, reference, approvedBy } with non-empty values',
    ]);
    expect(validateDesignedDifferences({ empty: [], hooks: [], hosts: {} }, options).errors).toEqual(['HWE-KD scripts/equivalence/angular-hosts.json:1: the file must hold an array']);
  });
  it('gives each component its own elements and tags', () => {
    const lists = { empty: [], hooks: [], hosts: [entry, { ...entry, component: 'avatar-group' }, { ...entry, component: 'badge', element: 'hw-badge' }] };
    expect(designedOf('avatar-group', lists).angularHosts).toEqual({ 'hw-avatar': 'span' });
    expect(designedOf('badge', lists).angularHosts).toEqual({ 'hw-badge': 'span' });
    expect(designedOf('card', lists).angularHosts).toEqual({});
  });
  it('refuses one element compared with two tags, since a guide or a template takes the hosts of every component', () => {
    const errors = validateDesignedDifferences({ empty: [], hooks: [], hosts: [entry, { ...entry, component: 'avatar-group', tag: 'div' }] }, options).errors;
    expect(errors).toEqual(['HWE-KD scripts/equivalence/angular-hosts.json:1: entry 2: hw-avatar is compared with div here and with span in entry 1; one element takes one tag']);
  });
  it('gives a guide or a template the elements and tags of every component, since its examples compose them', () => {
    const lists = { empty: [{ component: 'stat', class: 'hw-stat-trend' }, { component: 'empty-state', class: 'hw-empty-icon' }], hooks: [], hosts: [entry, { ...entry, component: 'badge', element: 'hw-badge' }] };
    expect(designedOf('template:home', lists)).toEqual({ emptyClasses: ['hw-stat-trend', 'hw-empty-icon'], vanillaAttributes: [], angularHosts: { 'hw-avatar': 'span', 'hw-badge': 'span' } });
    expect(designedOf('stat', lists).emptyClasses).toEqual(['hw-stat-trend']);
  });
  it('fails an entry that matches nothing in the groups of its component, once every group of the component was compared', () => {
    const groups = [{ id: 'avatar', lang: 'en', example: 'basic' }, { id: 'avatar', lang: 'en', example: 'sizes' }, { id: 'badge', lang: 'en', example: 'basic' }];
    const all = new Set(groups.map((group) => `${group.id}/${group.lang}/${group.example}`));
    const hosts = [entry, { ...entry, component: 'badge', element: 'hw-badge' }, { ...entry, component: 'chip', element: 'hw-chip' }];
    const matched = new Map([['avatar', new Set(['hw-avatar'])], ['badge', new Set()]]);
    expect(unmatchedHosts(hosts, { groups, compared: all, matched, whole: true })).toEqual([
      'HWE-KD scripts/equivalence/angular-hosts.json:1: entry 2 (badge, hw-badge) matches nothing: the Angular result of the groups of badge has no element hw-badge with an hw- class; remove it',
      'HWE-KD scripts/equivalence/angular-hosts.json:1: entry 3 (chip, hw-chip) matches nothing: docs/components/ has no page chip; remove it',
    ]);
    // A component whose page exists without a group in the build (a page pending translation) is not judged.
    expect(unmatchedHosts(hosts, { groups, compared: all, matched, whole: true, pageExists: (id) => id === 'chip' })).toHaveLength(1);
    // Nor is a component without a group in a run of part of the groups.
    expect(unmatchedHosts([hosts[2]], { groups, compared: all, matched, whole: false })).toEqual([]);
    // A run of part of the groups judges only the components whose groups it compared in full.
    expect(unmatchedHosts(hosts, { groups, compared: new Set(['avatar/en/basic', 'badge/en/basic']), matched: new Map(), whole: false })).toEqual([
      'HWE-KD scripts/equivalence/angular-hosts.json:1: entry 2 (badge, hw-badge) matches nothing: the Angular result of the groups of badge has no element hw-badge with an hw- class; remove it',
    ]);
  });
});

describe('compareAria', () => {
  const snapshot = '- tablist "Request details":\n  - tab "Overview" [selected]\n  - tab "History"\n- tabpanel "Overview"';
  it('passes equal snapshots', () => {
    expect(compareAria({ vanilla: snapshot, react: snapshot }).every((r) => r.equal)).toBe(true);
  });
  it('fails on a different role and reports the line', () => {
    const [result] = compareAria({ vanilla: snapshot, react: snapshot.replace('- tab "History"', '- button "History"') });
    expect(result.equal).toBe(false);
    expect(result.line).toBe(3);
  });
});

describe('compareScreenshot', () => {
  it('passes identical images and differences within the limit', () => {
    expect(compareScreenshot(image(10), image(10))).toMatchObject({ equal: true, differing: 0, limit: 16 });
    expect(compareScreenshot(image(10), image(10, { extra: 10 }))).toMatchObject({ equal: true, differing: 10 });
  });

  it('fails a 3-pixel shifted screenshot and returns the diff image', () => {
    const result = compareScreenshot(image(10), image(13));
    expect(result.equal).toBe(false);
    expect(result.differing).toBeGreaterThan(result.limit);
    expect(PNG.sync.read(result.diff).width).toBe(200);
  });

  it('fails an adjacent colour step over a large area (threshold 0.005)', () => {
    // The fill of the reference is rgb(27, 131, 84); the other one is the
    // pressed green rgb(20, 87, 58) or a lighter neutral, which threshold 0.1 let through.
    const fill = (rgb) => {
      const png = new PNG({ width: 200, height: 50 });
      for (let at = 0; at < png.data.length; at += 4) {
        [png.data[at], png.data[at + 1], png.data[at + 2]] = rgb;
        png.data[at + 3] = 255;
      }
      return PNG.sync.write(png);
    };
    expect(compareScreenshot(fill([27, 131, 84]), fill([20, 87, 58])).equal).toBe(false);
    expect(compareScreenshot(fill([249, 250, 251]), fill([224, 225, 226])).equal).toBe(false);
    expect(compareScreenshot(fill([22, 22, 22]), fill([42, 42, 42])).equal).toBe(false);
    expect(compareScreenshot(fill([27, 131, 84]), fill([27, 131, 84])).equal).toBe(true);
    // What was measured for 0.005 (compare.mjs): canvas and surface, surface-muted and
    // danger-subtle (equal at 0.02) differ; a grey lowered by 2 differs, by 1 passes.
    expect(compareScreenshot(fill([249, 250, 251]), fill([255, 255, 255])).equal).toBe(false);
    expect(compareScreenshot(fill([243, 244, 246]), fill([254, 243, 242])).equal).toBe(false);
    expect(compareScreenshot(fill([249, 250, 251]), fill([247, 248, 249])).equal).toBe(false);
    expect(compareScreenshot(fill([249, 250, 251]), fill([248, 249, 250])).equal).toBe(true);
    expect(PIXEL_THRESHOLD).toBe(0.005);
  });

  it('fails a different size', () => {
    const result = compareScreenshot(image(10), image(10, { height: 51 }));
    expect(result).toMatchObject({ equal: false, message: 'size 200x51 differs from 200x50' });
  });

  it('uses max(16, floor(0.0005 x width x height))', () => {
    expect(pixelLimit(200, 50)).toBe(16);
    expect(pixelLimit(680, 400)).toBe(136);
  });

  it('compares each framework with vanilla', () => {
    const results = compareScreenshots({ vanilla: image(10), react: image(10), vue: image(13), angular: image(10) });
    expect(results.map((r) => [r.framework, r.equal])).toEqual([
      ['react', true],
      ['vue', false],
      ['angular', true],
    ]);
  });
});
