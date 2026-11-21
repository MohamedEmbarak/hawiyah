import { readFileSync } from 'node:fs';
import { test, expect, axe, hydrated } from '../support/fixtures';
import { navigation, pageModel } from '../support/routes';

// The evidence panel at the end of the section Platforms Code reference (5a.11), on
// every component page of the build in both languages. The expectation is read here
// from the sources themselves, not from the page model that the same build wrote
// (G23 of the 5a fix round): components.json (built and verified adapters, each
// evidence entry with its fields, the notes), the Known defects of the pinned version
// in CHANGELOG.md that name the component, and its entries of known-differences.json.
// Each evidence entry is a description list, one field per line; the kinds of
// evidence that some built adapters have and others do not are said in one line; a
// documented difference stands under the Known defects entry its source cites. A
// component without an evidence entry shows the sentence that no verification
// evidence is recorded (the frame fixture builds PageHeader, which has none;
// scripts/test/frame/generate.mjs). English evidence text on an Arabic page carries
// lang="en" and dir="ltr". axe is clean.

type Lang = 'en' | 'ar';
interface Entry { adapter: string; kind: string; source: string; scope: string; tests: string[]; date: string; command: string; result: string }
interface Component { id: string; name: string; built?: string[]; verified?: string[]; evidence?: Entry[]; notes?: string[] }
interface Difference { id: string; component: string; description: string; source: string }

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const catalogue = JSON.parse(read('../../../../components.json')) as { components: Component[] };
const changelog = read('../../../../CHANGELOG.md');
const differences = JSON.parse(read('../../../scripts/equivalence/known-differences.json')) as Difference[];
const version = (JSON.parse(read('../../../package.json')) as { dependencies: Record<string, string> }).dependencies['@hawiyah/styles'] ?? '';

/** The list items of "Known defects in <version>" under "## <version>", each joined from its lines. */
function knownDefects(): string[] {
  const lines = changelog.split('\n');
  const start = lines.findIndex((line) => line === `## ${version}` || line.startsWith(`## ${version} `));
  const heading = lines.findIndex((line, index) => index > start && start >= 0 && line.startsWith('#### Known defects in ') && line.endsWith(` ${version}`));
  const items: string[] = [];
  if (heading < 0) return items;
  for (const line of lines.slice(heading + 1)) {
    if (line.startsWith('#')) break;
    if (line.startsWith('- ')) items.push(line.slice(2).trim());
    else if (/^\s+\S/.test(line) && items.length > 0) items[items.length - 1] += ` ${line.trim()}`;
  }
  return items;
}
const defects = knownDefects();
const plain = (text: string) => text.replaceAll('`', '');
const namesComponent = (text: string, name: string) => [name, name.split(/\s+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('')]
  .some((form) => new RegExp(`(?<![A-Za-z0-9])${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9])`).test(text));
const cited = (source: string) => /^CHANGELOG\.md, [^,]+, [^:]+: (.+)$/s.exec(source)?.[1]?.trim() ?? null;

const ADAPTERS: Record<string, string> = { vanilla: 'JavaScript', react: 'React', vue: 'Vue', angular: 'Angular' };
const TEXT = {
  en: {
    evidence: 'Verification evidence', open: 'Open items',
    list: (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`),
    built: (list: string) => `Built in ${list}.`,
    verified: (list: string) => `Recorded as verified in components.json: ${list}.`,
    noneVerified: 'No adapter is recorded as verified in components.json.',
    none: (name: string) => `No verification evidence is recorded for ${name} in components.json.`,
    fields: ['Adapter', 'Kind', 'Scope', 'Tests', 'Result', 'Date', 'Command', 'Source'],
    gaps: 'Kinds of evidence that components.json records for some adapters and not for others, with the adapters that have none:',
    separator: '; ',
    defect: `(CHANGELOG.md, Known defects in ${version})`,
    difference: 'documented difference',
    differenceOf: 'Documented difference of the equivalence check',
  },
  ar: {
    evidence: 'أدلة التحقق', open: 'البنود المفتوحة',
    list: (items: string[]) => [items[0] ?? '', ...items.slice(1).map((item) => ` و${item}`)].join(''),
    built: (list: string) => `المكوّن مبني في المحوّلات: ${list}.`,
    verified: (list: string) => `المحوّلات المسجّلة بوصفها متحقَّقًا منها في components.json: ${list}.`,
    noneVerified: 'لا يسجّل components.json أي محوّل بوصفه متحقَّقًا منه.',
    none: (name: string) => `لا يسجّل components.json أي دليل تحقق للمكوّن: ${name}.`,
    fields: ['المحوّل', 'الفئة', 'النطاق', 'الاختبارات', 'النتيجة', 'التاريخ', 'الأمر', 'المصدر'],
    gaps: 'فئات الأدلة التي يسجّلها components.json لبعض المحوّلات دون غيرها، مع المحوّلات التي لا دليل لها منها:',
    separator: '؛ ',
    defect: `(CHANGELOG.md، العيوب المعروفة في الإصدار ${version})`,
    difference: 'اختلاف موثّق',
    differenceOf: 'اختلاف موثّق في فحص التكافؤ',
  },
} as const;

for (const entry of navigation.pages) {
  for (const lang of entry.langs as Lang[]) {
    test(`evidence panel of ${entry.id} (${lang}): components.json, CHANGELOG.md and known-differences.json as they stand`, async ({ page }) => {
      const t = TEXT[lang];
      const component = catalogue.components.find((item) => item.id === entry.id);
      expect(component, `${entry.id} is in components.json`).toBeDefined();
      if (!component) return;
      const names = (list: string[] = []) => t.list(list.map((name) => ADAPTERS[name] ?? name));
      const title = pageModel(entry.id, lang).title;
      await page.goto(`${lang}/components/${entry.id}/reference/`);
      await hydrated(page);
      const panel = page.locator('main article guide-evidence-panel');
      await expect(panel).toHaveCount(1);
      // It ends the section Platforms Code reference: no h2 follows it.
      expect(await panel.evaluate((node) => { let next = node.nextElementSibling; while (next && next.localName !== 'h2') next = next.nextElementSibling; return next === null; })).toBe(true);
      await expect(panel.locator('h3')).toHaveText([t.evidence, t.open]);
      expect(await panel.locator('h3').evaluateAll((nodes) => nodes.map((node) => [node.id, node.getAttribute('tabindex')]))).toEqual([['evidence-recorded', '-1'], ['evidence-open', '-1']]);
      const paragraphs = await panel.locator(':scope > p').allTextContents();
      const lists = panel.locator(':scope > ul');

      // Built and verified adapters.
      expect(paragraphs[0]).toBe(`${t.built(names(component.built))} ${component.verified?.length ? t.verified(names(component.verified)) : t.noneVerified}`);

      // Each evidence entry, one field per line; a source is a path, never a link.
      const evidence = component.evidence ?? [];
      let next = 0;
      if (evidence.length === 0) {
        expect(paragraphs).toContain(t.none(title));
      } else {
        const items = lists.nth(next).locator(':scope > li');
        next += 1;
        await expect(items).toHaveCount(evidence.length);
        for (const [index, item] of evidence.entries()) {
          const fields = await items.nth(index).locator('dl > dt').evaluateAll((nodes) => nodes.map((dt) => [dt.textContent, dt.nextElementSibling?.localName === 'dd' ? dt.nextElementSibling.textContent : null]));
          const values = [ADAPTERS[item.adapter] ?? item.adapter, item.kind, item.scope, item.tests.join('; '), item.result, item.date, item.command, item.source];
          expect(fields).toEqual(t.fields.map((label, field) => [label, values[field]]));
        }
        await expect(lists.first().locator('a')).toHaveCount(0);
        // The kinds of evidence that some built adapters have and others do not, in one line.
        const built = component.built ?? [];
        const gaps = [...new Set(evidence.map((item) => item.kind))].flatMap((kind) => {
          const missing = built.filter((adapter) => !evidence.some((item) => item.kind === kind && item.adapter === adapter));
          return missing.length > 0 ? [`${kind}: ${names(missing)}`] : [];
        });
        if (gaps.length > 0) expect(paragraphs).toContain(`${t.gaps} ${gaps.join(t.separator)}.`);
        else expect(paragraphs.some((text) => text.startsWith(t.gaps))).toBe(false);
      }

      // The notes.
      const notes = component.notes ?? [];
      if (notes.length > 0) {
        await expect(lists.nth(next).locator(':scope > li')).toHaveText(notes);
        next += 1;
      }

      // What is open: each Known defects entry that names the component, with the documented
      // differences that cite it under it, then each documented difference that cites none.
      const own = differences.filter((item) => item.component === entry.id);
      const named = defects.filter((text) => namesComponent(text, component.name));
      const under = (text: string) => own.filter((item) => { const quote = cited(item.source); return quote !== null && text.includes(quote); });
      const expected = [
        ...named.map((text) => `${plain(text)} ${t.defect}${under(text).map((item) => `${t.differenceOf} ${item.id}: ${plain(item.description)}`).join('')}`),
        ...own.filter((item) => !named.some((text) => under(text).includes(item))).map((item) => `${plain(item.description)} (${t.difference} ${item.id})`),
      ];
      if (expected.length > 0) await expect(lists.nth(next).locator(':scope > li')).toHaveText(expected);
      else await expect(lists).toHaveCount(next);

      if (lang === 'ar') {
        // English evidence text carries its own language and direction (and the Latin-script guard of step 72 passes).
        const foreign = panel.locator('span[lang="en"]');
        const nested = named.reduce((sum, text) => sum + under(text).length, 0);
        expect(await foreign.count()).toBe(evidence.length * 2 + notes.length + expected.length + nested);
        expect(await foreign.evaluateAll((nodes) => nodes.every((node) => node.getAttribute('dir') === 'ltr'))).toBe(true);
      } else {
        await expect(panel.locator('[lang]')).toHaveCount(0);
      }
      expect(await axe(page)).toEqual([]);
    });
  }
}
