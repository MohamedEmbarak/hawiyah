import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { ContentLang, PageEvidence } from '../../content/model';
import { ARABIC_SCRIPT } from '../../i18n/text';
import { EVIDENCE_IDS, EvidencePanel } from './evidence-panel';
import headings from '../../i18n/evidence-headings.json';

@Component({
  selector: 'guide-test-evidence',
  imports: [EvidencePanel],
  template: `<article class="hw-prose"><guide-evidence-panel [evidence]="evidence()" [lang]="lang()" [name]="name()" /></article>`,
})
class TestHost {
  readonly evidence = input.required<PageEvidence>();
  readonly lang = input.required<ContentLang>();
  readonly name = input.required<string>();
}

const TABS: PageEvidence = {
  name: 'Tabs',
  built: ['vanilla', 'react', 'vue', 'angular'],
  verified: ['vanilla', 'react'],
  entries: [{ adapter: 'react', kind: 'behavior', tests: ['follows RTL arrow direction'], scope: 'RTL navigation.', command: 'pnpm test', result: 'passed', date: '2026-10-28', source: 'tests/example.interaction.test.tsx' }],
  gaps: [{ kind: 'behavior', adapters: ['vanilla', 'vue', 'angular'] }],
  notes: ['Horizontal key behavior follows direction.'],
  version: '0.3.0',
  open: [
    {
      kind: 'defect', text: [{ type: 'text', value: 'The bar lacks the attribute.' }],
      differences: [{ kind: 'difference', id: 'tabs-bar-orientation', aspect: 'structure', text: [{ type: 'text', value: 'The bar lacks ' }, { type: 'inlineCode', value: 'data-orientation' }, { type: 'text', value: '.' }] }],
    },
    { kind: 'defect', text: [{ type: 'text', value: 'Tabs (Vue) declares no slot types.' }], differences: [] },
    { kind: 'difference', id: 'tabs-other', aspect: 'aria', text: [{ type: 'text', value: 'A difference that cites no entry.' }] },
  ],
};
const NONE: PageEvidence = { name: 'PageHeader', built: ['vanilla', 'react', 'vue', 'angular'], verified: [], entries: [], gaps: [], notes: [], version: '0.3.0', open: [] };

async function render(evidence: PageEvidence, lang: ContentLang, name: string): Promise<HTMLElement> {
  TestBed.configureTestingModule({});
  const fixture = TestBed.createComponent(TestHost);
  fixture.componentRef.setInput('evidence', evidence);
  fixture.componentRef.setInput('lang', lang);
  fixture.componentRef.setInput('name', name);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture.nativeElement.querySelector('guide-evidence-panel') as HTMLElement;
}

describe('EvidencePanel (5a.11)', () => {
  it('lists each evidence entry as a description list with its source as code, never as a link, the kinds of evidence missing in some adapters, and what is open', async () => {
    const panel = await render(TABS, 'en', 'Tabs');
    expect(Array.from(panel.querySelectorAll('h3')).map((h3) => [h3.id, h3.textContent, h3.getAttribute('tabindex')])).toEqual([
      [EVIDENCE_IDS.evidence, headings.en.evidence, '-1'],
      [EVIDENCE_IDS.open, headings.en.open, '-1'],
    ]);
    expect(panel.querySelector('p')?.textContent).toBe('Built in JavaScript, React, Vue and Angular. Recorded as verified in components.json: JavaScript and React.');
    const [entries, notes, open] = Array.from(panel.querySelectorAll(':scope > ul'));
    expect(entries?.querySelectorAll(':scope > li')).toHaveLength(1);
    // One field per line (G22 of the 5a fix round).
    const fields = Array.from(entries?.querySelectorAll('li > dl > dt') ?? []).map((dt) => [dt.textContent, dt.nextElementSibling?.localName === 'dd' ? dt.nextElementSibling.textContent : null]);
    expect(fields).toEqual([
      ['Adapter', 'React'], ['Kind', 'behavior'], ['Scope', 'RTL navigation.'], ['Tests', 'follows RTL arrow direction'],
      ['Result', 'passed'], ['Date', '2026-10-28'], ['Command', 'pnpm test'], ['Source', 'tests/example.interaction.test.tsx'],
    ]);
    expect(Array.from(entries?.querySelectorAll('code') ?? []).map((code) => code.className)).toEqual(['hw-code', 'hw-code', 'hw-code', 'hw-code']);
    expect(panel.querySelectorAll('a')).toHaveLength(0);
    // The kinds of evidence that some built adapters have and others do not (G23).
    expect(Array.from(panel.querySelectorAll(':scope > p')).map((p) => p.textContent)).toContain('Kinds of evidence that components.json records for some adapters and not for others, with the adapters that have none: behavior: JavaScript, Vue and Angular.');
    expect(notes?.textContent).toBe('Horizontal key behavior follows direction.');
    // A documented difference stands under the Known defects entry it cites, not as a second item (G23).
    expect(Array.from(open?.querySelectorAll(':scope > li') ?? []).map((li) => li.textContent)).toEqual([
      'The bar lacks the attribute. (CHANGELOG.md, Known defects in 0.3.0)Documented difference of the equivalence check tabs-bar-orientation: The bar lacks data-orientation.',
      'Tabs (Vue) declares no slot types. (CHANGELOG.md, Known defects in 0.3.0)',
      'A difference that cites no entry. (documented difference tabs-other)',
    ]);
    expect(open?.querySelectorAll(':scope > li > ul > li')).toHaveLength(1);
    // On an English page the evidence carries no language of its own.
    expect(panel.querySelectorAll('[lang]')).toHaveLength(0);
  });

  it('marks the English evidence on an Arabic page with lang="en" and dir="ltr"; every label is Arabic, with Arabic punctuation and و before each further name', async () => {
    const panel = await render(TABS, 'ar', 'تبويبات');
    const foreign = Array.from(panel.querySelectorAll('span[lang]'));
    expect(foreign.map((span) => [span.getAttribute('lang'), span.getAttribute('dir')])).toEqual(Array(7).fill(['en', 'ltr']));
    expect(Array.from(panel.querySelectorAll('h3, :scope > p, dt')).every((node) => ARABIC_SCRIPT.test(node.textContent ?? ''))).toBe(true);
    expect(panel.querySelector('p')?.textContent).toBe('المكوّن مبني في المحوّلات: JavaScript وReact وVue وAngular. المحوّلات المسجّلة بوصفها متحقَّقًا منها في components.json: JavaScript وReact.');
    expect(Array.from(panel.querySelectorAll(':scope > p')).map((p) => p.textContent)).toContain('فئات الأدلة التي يسجّلها components.json لبعض المحوّلات دون غيرها، مع المحوّلات التي لا دليل لها منها: behavior: JavaScript وVue وAngular.');
    expect(panel.textContent).not.toMatch(/[\u0600-\u06FF][,;]|[,;] [\u0600-\u06FF]/);
  });

  // The owner's decision for the launch: an entry of keyboard-exceptions.json leaves the keyboard
  // outcomes of a component unchecked; the panel says so in the page's language, as guide text.
  const UNCHECKED: PageEvidence = { ...NONE, name: 'Dialog', open: [{ kind: 'keyboard' }] };
  const KEYBOARD_TEXT = {
    en: {
      intro: 'Each entry of Known defects in 0.3.0 in CHANGELOG.md that names this component, each documented difference of the equivalence check, and the keyboard behaviour that the checks of the guide do not verify yet:',
      item: 'The keyboard behaviour in the keyboard table of this page is documented from the READMEs of the installed packages and is not yet verified by the keyboard checks of the guide.',
    },
    ar: {
      intro: 'كل بند من العيوب المعروفة في الإصدار 0.3.0 في CHANGELOG.md يذكر هذا المكوّن، وكل اختلاف موثّق في فحص التكافؤ، وسلوك لوحة المفاتيح الذي لم تتحقق منه فحوص الدليل بعد:',
      item: 'سلوك لوحة المفاتيح في جدول التفاعل من لوحة المفاتيح في هذه الصفحة موثّق من ملفات README للحزم المثبّتة، ولم تتحقق منه فحوص لوحة المفاتيح في الدليل بعد.',
    },
  } as const;
  for (const lang of ['en', 'ar'] as const) {
    it(`shows one open item when the keyboard outcomes are not checked, in the page's language (${lang})`, async () => {
      const panel = await render(UNCHECKED, lang, lang === 'en' ? 'Dialog' : 'مربع الحوار');
      const lists = Array.from(panel.querySelectorAll(':scope > ul'));
      expect(lists).toHaveLength(1);
      expect(Array.from(lists[0]?.querySelectorAll(':scope > li') ?? []).map((li) => li.textContent)).toEqual([KEYBOARD_TEXT[lang].item]);
      expect(Array.from(panel.querySelectorAll(':scope > p')).map((p) => p.textContent).at(-1)).toBe(KEYBOARD_TEXT[lang].intro);
      // Guide text: no language of its own, no code, no link.
      expect(lists[0]?.querySelectorAll('[lang], code, a')).toHaveLength(0);
      if (lang === 'ar') expect(ARABIC_SCRIPT.test(lists[0]?.textContent ?? '')).toBe(true);
    });
  }

  it('keeps the keyboard item after the defects and the documented differences', async () => {
    const panel = await render({ ...TABS, open: [...TABS.open, { kind: 'keyboard' }] }, 'en', 'Tabs');
    const open = Array.from(panel.querySelectorAll(':scope > ul')).at(-1);
    const items = Array.from(open?.querySelectorAll(':scope > li') ?? []).map((li) => li.textContent);
    expect(items).toHaveLength(4);
    expect(items.at(-1)).toBe(KEYBOARD_TEXT.en.item);
  });

  it('keeps the wording of the introduction of the open items without the keyboard item', async () => {
    const plain = await render(TABS, 'en', 'Tabs');
    expect(Array.from(plain.querySelectorAll(':scope > p')).map((p) => p.textContent)).toContain('Each entry of Known defects in 0.3.0 in CHANGELOG.md that names this component, and each documented difference of the equivalence check:');
  });

  for (const lang of ['en', 'ar'] as const) {
    it(`states that no verification evidence and nothing open is recorded (${lang})`, async () => {
      const panel = await render(NONE, lang, lang === 'en' ? 'PageHeader' : 'عنوان الصفحة');
      const texts = Array.from(panel.querySelectorAll(':scope > p')).map((p) => p.textContent);
      expect(texts).toEqual(lang === 'en'
        ? ['Built in JavaScript, React, Vue and Angular. No adapter is recorded as verified in components.json.', 'No verification evidence is recorded for PageHeader in components.json.', 'No entry of Known defects in 0.3.0 in CHANGELOG.md and no documented difference of the equivalence check names PageHeader.']
        : ['المكوّن مبني في المحوّلات: JavaScript وReact وVue وAngular. لا يسجّل components.json أي محوّل بوصفه متحقَّقًا منه.', 'لا يسجّل components.json أي دليل تحقق للمكوّن: عنوان الصفحة.', 'لا بند مفتوحًا للمكوّن: عنوان الصفحة، فلا يذكره أي بند من العيوب المعروفة في الإصدار 0.3.0 في CHANGELOG.md، ولا أي اختلاف موثّق في فحص التكافؤ.']);
      expect(panel.querySelectorAll('ul')).toHaveLength(0);
    });
  }
});
