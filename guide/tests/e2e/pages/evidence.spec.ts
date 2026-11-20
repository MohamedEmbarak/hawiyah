import { readFileSync } from 'node:fs';
import { test, expect, axe, hydrated } from '../support/fixtures';
import { inlineText, navigation, pageModel } from '../support/routes';

// The evidence panel at the end of the section Platforms Code reference (5a.11), on
// every component page of the build in both languages: it lists exactly the evidence
// entries of the component in components.json (each with its adapter, kind, scope,
// tests, result, date, command and source path, the path as code and never as a link),
// the notes, and what is open: each Known defects entry of CHANGELOG.md that names
// the component and each documented difference. A component without an evidence
// entry shows the sentence that no verification evidence is recorded (the frame
// fixture builds PageHeader, which has none; scripts/test/frame/generate.mjs). English
// evidence text on an Arabic page carries lang="en" and dir="ltr". axe is clean.

const catalogue = JSON.parse(readFileSync(new URL('../../../../components.json', import.meta.url), 'utf8')) as {
  components: { id: string; name: string; built: string[]; verified: string[]; evidence?: { adapter: string; source: string; scope: string; tests: string[]; date: string }[]; notes?: string[] }[];
};
const TEXT = {
  en: { evidence: 'Verification evidence', open: 'Open items', none: (name: string) => `No verification evidence is recorded for ${name} in components.json.` },
  ar: { evidence: 'أدلة التحقق', open: 'البنود المفتوحة', none: (name: string) => `لا يسجّل components.json أي دليل تحقق للمكوّن: ${name}.` },
} as const;

for (const entry of navigation.pages) {
  for (const lang of entry.langs) {
    test(`evidence panel of ${entry.id} (${lang}): the entries of components.json and what is open`, async ({ page }) => {
      const model = pageModel(entry.id, lang);
      const component = catalogue.components.find((item) => item.id === entry.id);
      expect(component, `${entry.id} is in components.json`).toBeDefined();
      expect(model.evidence, 'the page model carries the evidence').toBeDefined();
      await page.goto(`${lang}/components/${entry.id}/reference/`);
      await hydrated(page);
      const panel = page.locator('main article guide-evidence-panel');
      await expect(panel).toHaveCount(1);
      // It ends the section Platforms Code reference: no h2 follows it.
      expect(await panel.evaluate((node) => { let next = node.nextElementSibling; while (next && next.localName !== 'h2') next = next.nextElementSibling; return next === null; })).toBe(true);
      await expect(panel.locator('h3')).toHaveText([TEXT[lang].evidence, TEXT[lang].open]);
      expect(await panel.locator('h3').evaluateAll((nodes) => nodes.map((node) => [node.id, node.getAttribute('tabindex')]))).toEqual([['evidence-recorded', '-1'], ['evidence-open', '-1']]);

      const evidence = component?.evidence ?? [];
      const lists = panel.locator(':scope > ul');
      const [first] = await panel.locator(':scope > *').evaluateAll((nodes) => nodes.map((node) => node.localName));
      expect(first).toBe('h3');
      if (evidence.length === 0) {
        await expect(panel.locator(':scope > p').filter({ hasText: TEXT[lang].none(model.title) })).toHaveCount(1);
      } else {
        const items = lists.first().locator(':scope > li');
        await expect(items).toHaveCount(evidence.length);
        for (const [index, item] of evidence.entries()) {
          const shown = items.nth(index);
          await expect(shown).toContainText(item.scope);
          await expect(shown).toContainText(item.date);
          await expect(shown.locator('code', { hasText: item.source })).toHaveCount(1);
          for (const test of item.tests) await expect(shown).toContainText(test);
        }
        // A source is a path, never a link: the sparse build cannot check it (a root test does).
        await expect(lists.first().locator('a')).toHaveCount(0);
      }
      const open = model.evidence?.open ?? [];
      const openList = panel.locator('h3 ~ ul').last();
      if (open.length > 0) {
        await expect(openList.locator(':scope > li')).toHaveCount(open.length);
        for (const [index, item] of open.entries()) await expect(openList.locator(':scope > li').nth(index)).toContainText(inlineText(item.text));
      }
      if (lang === 'ar') {
        // English evidence text carries its own language and direction (and the Latin-script guard of step 72 passes).
        const foreign = panel.locator('span[lang="en"]');
        expect(await foreign.count()).toBe(evidence.length * 2 + (component?.notes?.length ?? 0) + open.length);
        await expect(foreign.first()).toHaveAttribute('dir', 'ltr');
      } else {
        await expect(panel.locator('[lang]')).toHaveCount(0);
      }
      expect(await axe(page)).toEqual([]);
    });
  }
}
