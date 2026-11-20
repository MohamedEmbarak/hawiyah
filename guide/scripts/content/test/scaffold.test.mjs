// The page tools of 5a.4: content:scaffold (round trip over all components),
// content:scaffold-ar (reproduction of the two pilots), content:sync-ar, the
// string map (leadAmendments A10) and the fact sheet schema.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { checkPages } from '../../api-tables/cli.mjs';
import { declaredMembers } from '../../api-tables/members.mjs';
import { stylesVersion } from '../../api-tables/notes.mjs';
import { testReaders } from '../../api-tables/test/helpers.mjs';
import { factSheet, readSources } from '../../facts/facts.mjs';
import { locateApiTables, rewriteApiTables } from '../api-tables.mjs';
import { processPair } from '../pipeline.mjs';
import { scaffoldArabic } from '../scaffold-ar.mjs';
import { scaffoldPage, tableProblems } from '../scaffold.mjs';
import { applyStringMap, deriveStringMap, liveBlocks } from '../string-map.mjs';
import { syncArabic } from '../sync-ar.mjs';
import { guideDir, repoDir } from './helpers.mjs';

const docs = join(repoDir, 'docs', 'components');
const page = (name) => readFileSync(join(docs, name), 'utf8');
const TABLE_CODES = new Set(['HWC-H1', 'HWC-H2', 'HWC-API', 'HWC-TAB1', 'HWC-MD', 'HWC-FM2', 'HWC-PAR1', 'HWC-PAR5', 'HWC-PAR6', 'HWC-PAR7', 'HWC-STALE']);

let readers;
let version;
beforeAll(() => {
  readers = testReaders();
  version = stylesVersion(readers.nodeModules);
}, 120000);

/** The API section of a page as text: each caption, table and the note after it. */
function apiParts(text) {
  return locateApiTables(text).map(({ h3, table, next }) => {
    const before = text.slice(0, table.position.start.offset).trimEnd();
    const caption = before.slice(before.lastIndexOf('\n') + 1);
    const note = next?.type === 'blockquote' ? text.slice(next.position.start.offset, next.position.end.offset) : '';
    return `${h3}\n${caption}\n${text.slice(table.position.start.offset, table.position.end.offset)}\n${note}`;
  });
}

describe('content:scaffold round trip over every component of components.json', () => {
  it('the tables of each scaffold pass step 20 and step 30 in both languages, or the id has a list gap the lead decides', () => {
    const gaps = [];
    let pages = 0;
    for (const [id, entry] of readers.components) {
      const declared = declaredMembers(readers, id);
      const problems = tableProblems(declared);
      if (problems.length) {
        expect(problems.every((problem) => problem.includes('has no entry for it')), `${id}: ${problems.join('; ')}`).toBe(true);
        gaps.push(id);
        continue;
      }
      const en = scaffoldPage(declared, entry, version);
      const ar = scaffoldArabic(en, { entry, declared, map: {}, version }).text;
      const pair = processPair({
        id, entry, enText: en, arText: ar, enPath: join(docs, `${id}.md`), arPath: join(docs, `${id}.ar.md`),
        repoDir, componentsDir: docs, built: new Set([id]), exceptions: [],
      });
      expect(pair.findings.filter((item) => TABLE_CODES.has(item.code)).map((item) => `${item.code} ${item.message}`), id).toEqual([]);
      const result = checkPages({ readers, pages: [{ id, lang: 'en', page: pair.models.en }, { id, lang: 'ar', page: pair.models.ar }] });
      expect(result.findings.map((item) => item.message), id).toEqual([]);
      expect(result.tables).toBe(8);
      pages += 1;
    }
    expect(pages + gaps.length).toBe(85);
    expect(gaps.length).toBeLessThanOrEqual(6); // the dynamic Vue slots without a VUE_SLOT_PATTERNS entry on 0.3.0
  });
  it('writes no prose and no example', () => {
    const declared = declaredMembers(readers, 'tabs');
    const text = scaffoldPage(declared, readers.components.get('tabs'), version);
    expect(text).not.toMatch(/```/);
    const prose = text.split('\n').filter((line) => line && !/^(#|\||Table: |> )/.test(line));
    expect(prose).toEqual([JSON.parse(readFileSync(join(guideDir, 'src', 'app', 'i18n', 'compliance.json'), 'utf8')).en]);
  });
});

describe('content:scaffold-ar', () => {
  it.each(['button', 'tabs'])('reproduces the live blocks and API tables of %s.ar.md byte for byte from its string map', (id) => {
    const english = page(`${id}.md`);
    const arabic = page(`${id}.ar.md`);
    const derived = deriveStringMap(english, arabic);
    expect(derived.conflicts).toEqual([]);
    expect(derived.unaligned).toEqual([]);
    const result = scaffoldArabic(english, { entry: readers.components.get(id), declared: declaredMembers(readers, id), map: derived.map, version });
    expect(result.missing).toEqual([]);
    expect(result.unused).toEqual([]);
    expect(liveBlocks(result.text).map((block) => block.code)).toEqual(liveBlocks(arabic).map((block) => block.code));
    expect(apiParts(result.text)).toEqual(apiParts(arabic));
    expect(result.text.split('\n---\n')[0]).toBe(arabic.split('\n---\n')[0]);
  });
});

describe('the string map (A10)', () => {
  const map = { Overview: 'نظرة عامة', 'Request details': 'تفاصيل الطلب' };
  it('replaces text and reader attributes, never value, id, name, slot or option values', () => {
    const html = '<select name="Overview" aria-label="Request details"><option value="Overview">Overview</option></select><div id="Overview" slot="Overview" title="Overview"></div>';
    expect(applyStringMap('html', html, map).code).toBe('<select name="Overview" aria-label="تفاصيل الطلب"><option value="Overview">نظرة عامة</option></select><div id="Overview" slot="Overview" title="نظرة عامة"></div>');
    const vue = '<Tabs label="Request details" :items="[{ value: \'Overview\', label: \'Overview\' }]"><template #Overview><p>Overview</p></template></Tabs>';
    expect(applyStringMap('vue', vue, map).code).toBe('<Tabs label="تفاصيل الطلب" :items="[{ value: \'Overview\', label: \'نظرة عامة\' }]"><template #Overview><p>نظرة عامة</p></template></Tabs>');
    const tsx = '<Tabs label="Request details" items={[{ value: "Overview", label: "Overview", content: <p>Overview</p> }]} />';
    expect(applyStringMap('tsx', tsx, map).code).toBe('<Tabs label="تفاصيل الطلب" items={[{ value: "Overview", label: "نظرة عامة", content: <p>نظرة عامة</p> }]} />');
    const angular = 'template: `<hw-tabs label="Request details">\n  <hw-tab value="Overview" label="Overview"><p>Overview</p></hw-tab>\n</hw-tabs>`';
    expect(applyStringMap('ts', angular, map).code).toBe('template: `<hw-tabs label="تفاصيل الطلب">\n  <hw-tab value="Overview" label="نظرة عامة"><p>نظرة عامة</p></hw-tab>\n</hw-tabs>`');
  });
  it('lists the reader strings it cannot translate', () => {
    expect(applyStringMap('html', '<button class="hw-button" type="button">Save draft</button>', map).missing).toEqual(['Save draft']);
  });
});

describe('content:sync-ar', () => {
  const sync = (id, english, arabic) => syncArabic(english, arabic, { entry: readers.components.get(id), declared: declaredMembers(readers, id), version });
  it.each(['button', 'tabs'])('leaves %s.ar.md as it is', (id) => {
    const result = sync(id, page(`${id}.md`), page(`${id}.ar.md`));
    expect(result.text).toBe(page(`${id}.ar.md`));
    expect([...result.missing, ...result.review, ...result.unmatched, ...result.conflicts, ...result.unaligned, ...result.stale]).toEqual([]);
  });
  it('rewrites a changed English block in Arabic and keeps the translated prose', () => {
    const english = page('button.md').replace('<Button variant="primary">Continue</Button>', '<Button variant="secondary">Continue</Button>');
    const arabic = page('button.ar.md');
    const result = sync('button', english, arabic);
    expect(result.text).toContain('<Button variant="secondary">متابعة</Button>');
    expect(result.text.replace('<Button variant="secondary">متابعة</Button>', '<Button variant="primary">متابعة</Button>')).toBe(arabic);
    expect(result.stale).toEqual(['example']);
  });
  it('reports a new English string it has no translation for', () => {
    const vanilla = '<button class="hw-button" type="button" data-variant="primary" data-size="md">Continue</button>';
    const english = page('button.md').replace(vanilla, `<div class="hw-inline">${vanilla}<button class="hw-button" type="button">Send request</button></div>`);
    const result = sync('button', english, page('button.ar.md'));
    expect(result.missing).toEqual(['Send request']);
    expect(result.text).toContain('data-size="md">متابعة</button><button class="hw-button" type="button">Send request</button></div>');
  });
  it('asks for a review of a translation read only from a section whose English changed', () => {
    const english = page('button.md').replace('<Button variant="primary">Continue</Button>', '<Button variant="primary">Send request</Button>');
    const result = sync('button', english, page('button.ar.md'));
    expect(result.review).toEqual(['"Send request" as "متابعة"']);
    expect(result.stale).toEqual(['example']);
  });
  it('content:api-tables leaves the four tables of both pilots as they are', () => {
    for (const id of ['button', 'tabs']) {
      for (const [lang, name] of [['en', `${id}.md`], ['ar', `${id}.ar.md`]]) {
        expect(rewriteApiTables(page(name), lang, declaredMembers(readers, id), version).changed).toEqual([]);
      }
    }
  });
});

describe('content:facts', () => {
  it('writes a sheet with the documented fields for every component', () => {
    const sources = readSources(guideDir, repoDir, version);
    for (const id of readers.components.keys()) {
      const sheet = factSheet(readers, id, sources);
      expect(Object.keys(sheet)).toEqual(['id', 'generated', 'component', 'frameworks', 'readerText', 'captions', 'knownDefects', 'knownDifferences', 'problems', 'listGaps']);
      expect(Object.keys(sheet.frameworks)).toEqual(['vanilla', 'react', 'vue', 'angular']);
      expect(sheet.problems, id).toEqual([]);
      for (const framework of Object.values(sheet.frameworks)) {
        for (const member of framework.members) expect(Object.keys(member).slice(0, 5)).toEqual(['name', 'kind', 'type', 'required', 'default']);
      }
      expect(Boolean(sheet.frameworks.vanilla.controller) !== Boolean(sheet.frameworks.vanilla.stylesheet), id).toBe(true);
    }
  });
  it('names the hooks, slots, defects and differences of Tabs', () => {
    const sheet = factSheet(readers, 'tabs', readSources(guideDir, repoDir, version));
    expect(sheet.frameworks.vanilla.controller).toMatchObject({ name: 'createTabs', enhance: 'data-hw="tabs"' });
    expect(sheet.frameworks.vanilla.controller.hooks).toEqual(expect.arrayContaining(['data-hw-activation', 'data-hw-overflow', 'data-hw-overflow-label', 'data-hw-value']));
    expect(sheet.frameworks.vue.slots.dynamic.sort()).toEqual(['`tab:${item.value}`', 'item.value']);
    expect(sheet.knownDifferences.map((item) => item.id)).toEqual(['tabs-bar-orientation']);
    expect(sheet.knownDefects.some((text) => text.includes('createTabs'))).toBe(true);
    expect(sheet.frameworks.react.members.find((item) => item.name === 'orientation').defaultFrom).toMatchObject({ file: '@hawiyah/react/dist/interactive.js' });
  });
});
