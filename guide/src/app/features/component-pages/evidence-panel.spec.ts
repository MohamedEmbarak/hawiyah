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
  notes: ['Horizontal key behavior follows direction.'],
  version: '0.3.0',
  open: [
    { kind: 'defect', text: [{ type: 'text', value: 'Tabs (Vue) declares no slot types.' }] },
    { kind: 'difference', id: 'tabs-bar-orientation', aspect: 'structure', text: [{ type: 'text', value: 'The bar lacks ' }, { type: 'inlineCode', value: 'data-orientation' }, { type: 'text', value: '.' }] },
  ],
};
const NONE: PageEvidence = { name: 'PageHeader', built: ['vanilla', 'react', 'vue', 'angular'], verified: [], entries: [], notes: [], version: '0.3.0', open: [] };

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
  it('lists each evidence entry with its source as code, never as a link, and what is open', async () => {
    const panel = await render(TABS, 'en', 'Tabs');
    expect(Array.from(panel.querySelectorAll('h3')).map((h3) => [h3.id, h3.textContent, h3.getAttribute('tabindex')])).toEqual([
      [EVIDENCE_IDS.evidence, headings.en.evidence, '-1'],
      [EVIDENCE_IDS.open, headings.en.open, '-1'],
    ]);
    expect(panel.querySelector('p')?.textContent).toBe('Built in JavaScript, React, Vue and Angular. Recorded as verified in components.json: JavaScript and React.');
    const [entries, notes, open] = Array.from(panel.querySelectorAll(':scope > ul'));
    expect(entries?.querySelectorAll('li')).toHaveLength(1);
    expect(entries?.textContent).toContain('React, behavior: RTL navigation. Tests: follows RTL arrow direction. Result: passed, 2026-10-28; command pnpm test, source tests/example.interaction.test.tsx.');
    expect(Array.from(entries?.querySelectorAll('code') ?? []).map((code) => code.className)).toEqual(['hw-code', 'hw-code', 'hw-code', 'hw-code']);
    expect(panel.querySelectorAll('a')).toHaveLength(0);
    expect(notes?.textContent).toBe('Horizontal key behavior follows direction.');
    expect(Array.from(open?.querySelectorAll('li') ?? []).map((li) => li.textContent)).toEqual([
      'Tabs (Vue) declares no slot types. (CHANGELOG.md, Known defects in 0.3.0)',
      'The bar lacks data-orientation. (documented difference tabs-bar-orientation)',
    ]);
    // On an English page the evidence carries no language of its own.
    expect(panel.querySelectorAll('[lang]')).toHaveLength(0);
  });

  it('marks the English evidence on an Arabic page with lang="en" and dir="ltr"; every label is Arabic', async () => {
    const panel = await render(TABS, 'ar', 'تبويبات');
    const foreign = Array.from(panel.querySelectorAll('span[lang]'));
    expect(foreign.map((span) => [span.getAttribute('lang'), span.getAttribute('dir')])).toEqual(Array(5).fill(['en', 'ltr']));
    expect(Array.from(panel.querySelectorAll('h3, :scope > p')).every((node) => ARABIC_SCRIPT.test(node.textContent ?? ''))).toBe(true);
  });

  for (const lang of ['en', 'ar'] as const) {
    it(`states that no verification evidence and nothing open is recorded (${lang})`, async () => {
      const panel = await render(NONE, lang, lang === 'en' ? 'PageHeader' : 'عنوان الصفحة');
      const texts = Array.from(panel.querySelectorAll(':scope > p')).map((p) => p.textContent);
      expect(texts).toEqual(lang === 'en'
        ? ['Built in JavaScript, React, Vue and Angular. No adapter is recorded as verified in components.json.', 'No verification evidence is recorded for PageHeader in components.json.', 'No entry of Known defects in 0.3.0 in CHANGELOG.md and no documented difference of the equivalence check names PageHeader.']
        : ['المكوّن مبني في المحوّلات: JavaScript، React، Vue وAngular. لا يسجّل components.json أي محوّل بوصفه متحقَّقًا منه.', 'لا يسجّل components.json أي دليل تحقق للمكوّن: عنوان الصفحة.', 'لا بند مفتوحًا للمكوّن: عنوان الصفحة، فلا يذكره أي بند من العيوب المعروفة في الإصدار 0.3.0 في CHANGELOG.md، ولا أي اختلاف موثّق في فحص التكافؤ.']);
      expect(panel.querySelectorAll('ul')).toHaveLength(0);
    });
  }
});
