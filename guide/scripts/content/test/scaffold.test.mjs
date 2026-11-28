// The page tools: content:scaffold (round trip over all components),
// content:scaffold-ar (reproduction of the two pilots), content:sync-ar, the
// string map and the fact sheet schema.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { checkPages } from '../../api-tables/cli.mjs';
import { declaredMembers } from '../../api-tables/members.mjs';
import { stylesVersion } from '../../api-tables/notes.mjs';
import { testReaders } from '../../api-tables/test/helpers.mjs';
import { factSheet, factSheetMarkdown, readSources } from '../../facts/facts.mjs';
import { locateApiTables, rewriteApiTables } from '../api-tables.mjs';
import { processPair } from '../pipeline.mjs';
import { scaffoldArabic } from '../scaffold-ar.mjs';
import { scaffoldPage, tableProblems } from '../scaffold.mjs';
import { applyStringMap, candidates, deriveStringMap, groupContext, liveBlocks } from '../string-map.mjs';
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
  it('the tables of each of the 85 scaffolds pass step 20 and step 30 in both languages', () => {
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
    // Every id scaffolds since the lead added the six VUE_SLOT_PATTERNS entries.
    expect(gaps).toEqual([]);
    expect(pages).toBe(85);
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

// The review of the Arabic pilot pages: the map replaced neither a shown value nor a
// one-word reader string of the framework blocks (a category, a term), and said nothing.
describe('content:scaffold-ar and content:sync-ar replace every reader string that HWC-PAR8 reads', () => {
  const scaffold = (id, english, map) => scaffoldArabic(english, { entry: readers.components.get(id), declared: declaredMembers(readers, id), map, version });
  it.each(['text-field', 'service-card'])('reproduces the live blocks of %s.ar.md byte for byte from its string map', (id) => {
    const english = page(`${id}.md`);
    const arabic = page(`${id}.ar.md`);
    const derived = deriveStringMap(english, arabic);
    expect(derived.conflicts).toEqual([]);
    expect(derived.unaligned).toEqual([]);
    const result = scaffold(id, english, derived.map);
    expect(result.missing).toEqual([]);
    expect(result.left).toEqual([]);
    expect(result.unused).toEqual([]);
    expect(liveBlocks(result.text).map((block) => block.code)).toEqual(liveBlocks(arabic).map((block) => block.code));
  });
  it.each(['text-field', 'service-card'])('content:sync-ar leaves %s.ar.md as it is and keeps no string by hand', (id) => {
    const result = syncArabic(page(`${id}.md`), page(`${id}.ar.md`), { entry: readers.components.get(id), declared: declaredMembers(readers, id), version });
    expect(result.text).toBe(page(`${id}.ar.md`));
    expect([...result.missing, ...result.left, ...result.kept, ...result.dropped, ...result.review, ...result.unmatched, ...result.stale]).toEqual([]);
  });
  it('replaces a shown value and a one-word category and term in the four forms, and keeps an email value in Latin', () => {
    const derived = deriveStringMap(page('service-card.md'), page('service-card.ar.md')).map;
    expect(derived).toMatchObject({ Documents: 'المستندات', Duration: 'المدة', Fee: 'الرسوم' });
    const field = deriveStringMap(page('text-field.md'), page('text-field.ar.md')).map;
    expect(Object.keys(field)).not.toContain('applicant@example.com');
    const result = scaffold('text-field', page('text-field.md'), field);
    const disabled = liveBlocks(result.text).filter((block) => block.example === 'disabled').map((block) => block.code);
    expect(disabled.every((code) => code.includes('applicant@example.com'))).toBe(true);
    expect(field['Example Trading Company']).toBe('شركة المثال التجارية');
    const readonly = liveBlocks(result.text).filter((block) => block.example === 'readonly').map((block) => block.code);
    expect(readonly).toHaveLength(4);
    expect(readonly.every((code) => code.includes('شركة المثال التجارية') && !code.includes('Example Trading Company'))).toBe(true);
  });
  it('prints one line for each reader string of the English blocks that the map does not translate, a one-word category and a shown value among them', () => {
    const map = deriveStringMap(page('service-card.md'), page('service-card.ar.md')).map;
    const { Documents, Fee, ...rest } = map;
    expect([Documents, Fee].every(Boolean)).toBe(true);
    const result = scaffold('service-card', page('service-card.md'), rest);
    expect(result.missing).toEqual(['Documents', 'Fee']);
    // The category stays English in every form, and is listed once.
    expect(liveBlocks(result.text).filter((block) => block.example === 'basic' && block.framework !== 'vanilla').every((block) => /category="Documents"/.test(block.code))).toBe(true);
    const field = deriveStringMap(page('text-field.md'), page('text-field.ar.md')).map;
    const shown = Object.keys(field).find((key) => /\bCompany\b/.test(key));
    expect(shown).toBeTruthy();
    const { [shown]: dropped, ...withoutValue } = field;
    expect(dropped).toBeTruthy();
    expect(scaffold('text-field', page('text-field.md'), withoutValue).missing).toEqual([shown]);
  });
  it('reads the element of a value and the group of a string (applyStringMap with a group)', () => {
    const blocks = [
      { lang: 'html', code: '<span class="hw-badge">Documents</span><input class="hw-input" value="Example Company"><input class="hw-input" type="email" value="a@example.com"><select><option value="Riyadh">Riyadh</option></select>' },
      { lang: 'tsx', code: '<ServiceCard category="Documents" metadata={[{ term: \'Documents\', value: \'Riyadh\' }]} />' },
    ];
    const group = groupContext(blocks);
    const map = { Documents: 'المستندات', 'Example Company': 'شركة المثال', 'a@example.com': 'x', Riyadh: 'الرياض' };
    expect(applyStringMap('html', blocks[0].code, map, undefined, { group }).code).toBe('<span class="hw-badge">المستندات</span><input class="hw-input" value="شركة المثال"><input class="hw-input" type="email" value="a@example.com"><select><option value="Riyadh">الرياض</option></select>');
    expect(applyStringMap('tsx', blocks[1].code, map, undefined, { group }).code).toBe('<ServiceCard category="المستندات" metadata={[{ term: \'المستندات\', value: \'Riyadh\' }]} />');
    expect(applyStringMap('tsx', '<TextField defaultValue="Example Company" /><TextField type="email" defaultValue="a@example.com" /><Tabs defaultValue="Riyadh" />', map, undefined, { group }).code)
      .toBe('<TextField defaultValue="شركة المثال" /><TextField type="email" defaultValue="a@example.com" /><Tabs defaultValue="Riyadh" />');
    expect(applyStringMap('vue', '<TextField default-value="Example Company" :items="[{ name: \'Riyadh\' }]" />', map, undefined, { group }).code).toBe('<TextField default-value="شركة المثال" :items="[{ name: \'الرياض\' }]" />');
    expect(applyStringMap('ts', 'template: `<hw-text-field value="Example Company" /><hw-text-field type="email" value="a@example.com" [value]="\'Example Company\'" />`', map, undefined, { group }).code)
      .toBe('template: `<hw-text-field value="شركة المثال" /><hw-text-field type="email" value="a@example.com" [value]="\'Example Company\'" />`');
    // Without its group a block keeps the category, and the component value, as before.
    expect(applyStringMap('tsx', blocks[1].code, map).code).toBe(blocks[1].code);
  });
});

// The intake of the first Arabic component pages: the map left the name of an Avatar,
// the strings of an Angular class field and the text of a textarea in English without a
// word, reported the control flow of an Angular template and a styling hook as strings
// to translate, and skipped a string under the key selected of a labels object.
describe('content:scaffold-ar and content:sync-ar replace and report what HWC-PAR8 judges', () => {
  const scaffold = (id, english, map) => scaffoldArabic(english, { entry: readers.components.get(id), declared: declaredMembers(readers, id), map, version });
  it.each(['avatar', 'avatar-group', 'textarea', 'alert'])('reproduces the live blocks of %s.ar.md byte for byte from its string map, and content:sync-ar leaves it as it is', (id) => {
    const english = page(`${id}.md`);
    const arabic = page(`${id}.ar.md`);
    const derived = deriveStringMap(english, arabic);
    expect(derived.conflicts).toEqual([]);
    expect(derived.unaligned).toEqual([]);
    const result = scaffold(id, english, derived.map);
    expect([...result.missing, ...result.left, ...result.unused]).toEqual([]);
    expect(liveBlocks(result.text).map((block) => block.code)).toEqual(liveBlocks(arabic).map((block) => block.code));
    const synced = syncArabic(english, arabic, { entry: readers.components.get(id), declared: declaredMembers(readers, id), version });
    expect(synced.text).toBe(arabic);
    expect([...synced.missing, ...synced.left, ...synced.kept, ...synced.dropped, ...synced.review, ...synced.unmatched, ...synced.stale]).toEqual([]);
  });
  it('replaces the name of a component that the group reads as reader text, and keeps a field name', () => {
    const blocks = [
      { lang: 'html', code: '<span class="hw-avatar" role="img" aria-label="Rana Cole"><span aria-hidden="true">RC</span></span>' },
      { lang: 'tsx', code: '<><Avatar name="Rana Cole" /><TextField label="Applicant" name="applicant" /></>' },
    ];
    const group = groupContext(blocks);
    const map = { 'Rana Cole': 'رنا كمال', Applicant: 'مقدّم الطلب', applicant: 'x' };
    expect(applyStringMap('tsx', blocks[1].code, map, undefined, { group }).code).toBe('<><Avatar name="رنا كمال" /><TextField label="مقدّم الطلب" name="applicant" /></>');
    expect(applyStringMap('vue', '<Avatar name="Rana Cole" />', {}, undefined, { group }).missing).toEqual(['Rana Cole']);
    expect(applyStringMap('ts', 'template: `<hw-avatar name="Rana Cole" />`', map, undefined, { group }).code).toBe('template: `<hw-avatar name="رنا كمال" />`');
  });
  it('replaces the strings of an Angular class field and of an object key that names an element value', () => {
    const angular = 'export class Example {\n  overflowLabel = (count: number) => (count === 1 ? \'1 more person\' : `${count} more people`);\n}';
    expect(applyStringMap('ts', angular, { '1 more person': 'شخص واحد آخر', '${count} more people': '${count} من الأشخاص الآخرين' }).code)
      .toBe('export class Example {\n  overflowLabel = (count: number) => (count === 1 ? \'شخص واحد آخر\' : `${count} من الأشخاص الآخرين`);\n}');
    expect(applyStringMap('ts', angular, {}).missing).toEqual(['1 more person', '${count} more people']);
    const group = groupContext([{ lang: 'html', code: '<span class="hw-upload-status" role="status">Ready to send</span>' }]);
    const labels = 'export class Example {\n  labels = { selected: \'Ready to send\', complete: \'Sent\' };\n}';
    expect(applyStringMap('ts', labels, { 'Ready to send': 'جاهز للإرسال' }, undefined, { group }).code).toBe('export class Example {\n  labels = { selected: \'جاهز للإرسال\', complete: \'Sent\' };\n}');
    expect(applyStringMap('ts', labels, {}).left).toEqual(['selected: Ready to send']);
  });
  it('replaces the text of a textarea and the value of the component that shows it', () => {
    const blocks = [
      { lang: 'html', code: '<textarea class="hw-textarea" id="note" name="note" readonly>The request was received.</textarea>' },
      { lang: 'tsx', code: '<Textarea label="Note" name="note" defaultValue="The request was received." readOnly />' },
    ];
    const group = groupContext(blocks);
    const map = { 'The request was received.': 'استُلم الطلب.', Note: 'ملاحظة' };
    expect(applyStringMap('html', blocks[0].code, map, undefined, { group }).code).toBe('<textarea class="hw-textarea" id="note" name="note" readonly>استُلم الطلب.</textarea>');
    expect(applyStringMap('tsx', blocks[1].code, map, undefined, { group }).code).toBe('<Textarea label="ملاحظة" name="note" defaultValue="استُلم الطلب." readOnly />');
    expect(applyStringMap('html', blocks[0].code, {}, undefined, { group }).missing).toEqual(['The request was received.']);
  });
  it('reports neither the control flow of an Angular template nor the value of a styling hook', () => {
    const angular = 'template: `\n  @if (open()) {\n    <p>Your draft was saved.</p>\n  } @else {\n    <p>{{ count }} drafts</p>\n  }\n`';
    expect(candidates('ts', angular).map((item) => item.key)).toEqual(['Your draft was saved.', '{{ count }} drafts']);
    expect(applyStringMap('ts', angular, { 'Your draft was saved.': 'حُفظت المسودة.' }).missing).toEqual(['{{ count }} drafts']);
    expect(applyStringMap('html', '<li class="hw-upload-item" data-status="error" data-message="true">خطأ</li>', {}).missing).toEqual([]);
    expect(applyStringMap('html', '<li class="hw-upload-item" data-copied-message="Copied">خطأ</li>', {}).missing).toEqual(['Copied']);
  });
});

describe('content:scaffold-ar and the keyboard table', () => {
  it('writes the fixed Arabic caption and headers and the Arabic names of the arrow keys; other keys stay as printed', () => {
    const english = page('tabs.md');
    const result = scaffoldArabic(english, { entry: readers.components.get('tabs'), declared: declaredMembers(readers, 'tabs'), map: {}, version, placeholder: true });
    const lines = result.text.split('\n');
    const caption = lines.findIndex((line) => line.startsWith('جدول: التفاعل من لوحة المفاتيح'));
    expect(lines[caption]).toBe('جدول: التفاعل من لوحة المفاتيح مع المكوّن: تبويبات');
    expect(lines[caption + 2]).toBe('| المفتاح | الإجراء |');
    expect(lines[caption + 5].startsWith('| <kbd>السهم الأيمن</kbd>, <kbd>السهم الأيسر</kbd> | ')).toBe(true);
    expect(lines[caption + 4].startsWith('| <kbd>Tab</kbd> | ')).toBe(true);
    expect(result.text).not.toContain('<kbd>Right Arrow</kbd>');
  });
});

describe('the string map', () => {
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
  // A string that renders as text under a name
  // the map does not replace was left in English without a word, and a Vue or Angular
  // wrapper of self-closing components gave the text "/div>".
  it('lists every other string left in English that renders as reader text', () => {
    const result = applyStringMap('tsx', '<Stat label="Requests" value="128" trend="12 more than last month" />', { Requests: 'الطلبات' });
    expect(result.code).toBe('<Stat label="الطلبات" value="128" trend="12 more than last month" />');
    expect(result.missing).toEqual([]);
    expect(result.left).toEqual(['trend: 12 more than last month']);
    const items = applyStringMap('vue', '<Accordion :items="[{ value: \'a\', title: \'Fees\', content: \'The fee is paid online.\' }]" />', { Fees: 'الرسوم' });
    expect(items.left).toEqual(['content: The fee is paid online.']);
  });
  it('reads self-closing components inside a wrapper in Vue and Angular templates', () => {
    const vue = '<div class="hw-inline"><Stat label="Requests" value="1" /><Stat label="Visits" value="2" /></div>';
    expect(candidates('vue', vue).map((item) => item.key)).toEqual(['hw-inline', 'Requests', '1', 'Visits', '2']);
    expect(applyStringMap('vue', vue, {}).missing).toEqual(['Requests', 'Visits']);
    const angular = 'template: `<div class="hw-inline"><hw-stat label="Requests" value="1" /><hw-stat label="Visits" value="2" /></div>`';
    expect(candidates('ts', angular).filter((item) => item.kind === 'text')).toEqual([]);
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
  it('never replaces an Arabic string by an English one: a hand translation stays, from the map or in its place', () => {
    const add = (text, from, to) => text.replace(from, to);
    const enBlock = '<Button variant="primary">Continue</Button>';
    const arBlock = '<Button variant="primary">متابعة</Button>';
    // A phrase under a name the map does not list: the pair gives its translation.
    const english = add(page('button.md'), enBlock, '<Button variant="secondary" data-trend="Sends the form now">Continue</Button>');
    const arabic = add(page('button.ar.md'), arBlock, '<Button variant="primary" data-trend="يرسل النموذج الآن">متابعة</Button>');
    expect(sync('button', english, arabic).text).toContain('<Button variant="secondary" data-trend="يرسل النموذج الآن">متابعة</Button>');
    // One word, which HWC-PAR8 does not read as reader text: the Arabic string keeps its place.
    const word = sync('button', add(page('button.md'), enBlock, '<Button variant="secondary" data-trend="Rising">Continue</Button>'), add(page('button.ar.md'), arBlock, '<Button variant="primary" data-trend="صاعد">متابعة</Button>'));
    expect(word.text).toContain('<Button variant="secondary" data-trend="صاعد">متابعة</Button>');
    expect(word.kept).toEqual(['"صاعد" (primary, react) for the English "Rising", which the map does not translate']);
    // Without an Arabic string at that place, a phrase is reported as left in English.
    const fresh = sync('button', english, page('button.ar.md'));
    expect(fresh.left).toEqual(['data-trend: Sends the form now']);
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
  // The vanilla markup of a component and the fields of its item types.
  it('names the vanilla markup and the fields of the item types of each adapter', () => {
    const sources = readSources(guideDir, repoDir, version);
    const stat = factSheet(readers, 'stat', sources);
    expect(stat.frameworks.vanilla.markup.parts).toEqual(['hw-stat-description', 'hw-stat-label', 'hw-stat-trend', 'hw-stat-value']);
    expect(stat.frameworks.vanilla.markup.readme).toMatch(/^#### Stat\n[\s\S]*<span class="hw-stat-label">/);
    const button = factSheet(readers, 'button', sources);
    expect(button.frameworks.vanilla.markup.parts).not.toContain('hw-button-group');
    const accordion = factSheet(readers, 'accordion', sources);
    expect(accordion.frameworks.react.typeFields.AccordionItem.map((field) => field.name)).toEqual(expect.arrayContaining(['value', 'title', 'content']));
    expect(Object.keys(accordion.frameworks.angular.typeFields)).toContain('HwAccordionItem');
    expect(factSheetMarkdown(stat)).toContain('Markup: the classes hw-stat; the classes of its parts in the installed stylesheet: hw-stat-description, hw-stat-label, hw-stat-trend, hw-stat-value');
    expect(factSheetMarkdown(accordion)).toMatch(/Fields of AccordionItem: value: string; /);
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
