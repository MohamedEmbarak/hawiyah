import { Component, computed, input } from '@angular/core';
import { InlineContent } from '../../content/inline';
import type { ContentLang, PageEvidence } from '../../content/model';
import { pick } from '../../i18n/text';
import { evidenceTexts } from './i18n';

/** Ids of the two headings of the panel; step 20 adds the same ids to the page headings (scripts/content/evidence.mjs). */
export const EVIDENCE_IDS = { evidence: 'evidence-recorded', open: 'evidence-open' } as const;

/**
 * The evidence panel at the end of the section Platforms Code reference (5a.11):
 * generated from the component's entry in components.json (built and verified
 * adapters, each evidence entry, the notes) and from what is open (the entries of
 * Known defects in the pinned version of CHANGELOG.md that name the component, and
 * its documented differences of the equivalence check, each under the Known defects
 * entry it cites). Each evidence entry is a description list, one field per line,
 * readable at 390 px; the kinds of evidence that some built adapters have and others
 * do not are said in one generated line (G22 and G23 of the 5a fix round). The labels
 * are guide text; the evidence is English and carries lang="en" and dir="ltr" on an
 * Arabic page. A source is a repository path shown as code, not a link. It states
 * what is recorded and what is open, and claims nothing else.
 */
@Component({
  selector: 'guide-evidence-panel',
  imports: [InlineContent],
  styleUrl: './evidence-panel.css',
  template: `@if (evidence(); as e) {<h3 [id]="ids.evidence" tabindex="-1">{{ t().evidence }}</h3><p>{{ t().built(adapters(e.built)) }} @if (e.verified.length) {{{ t().verified(adapters(e.verified)) }}} @else {{{ t().noneVerified }}}</p>@if (e.entries.length) {<p>{{ t().entriesIntro }}</p><ul>@for (item of e.entries; track $index) {<li><dl><dt>{{ t().fields.adapter }}</dt><dd>{{ adapter(item.adapter) }}</dd><dt>{{ t().fields.kind }}</dt><dd><code class="hw-code" dir="ltr" translate="no">{{ item.kind }}</code></dd><dt>{{ t().fields.scope }}</dt><dd><span [attr.lang]="foreign()" [attr.dir]="foreignDir()">{{ item.scope }}</span></dd><dt>{{ t().fields.tests }}</dt><dd><span [attr.lang]="foreign()" [attr.dir]="foreignDir()">{{ item.tests.join('; ') }}</span></dd><dt>{{ t().fields.result }}</dt><dd><code class="hw-code" dir="ltr" translate="no">{{ item.result }}</code></dd><dt>{{ t().fields.date }}</dt><dd><bdi dir="ltr">{{ item.date }}</bdi></dd><dt>{{ t().fields.command }}</dt><dd><code class="hw-code" dir="ltr" translate="no">{{ item.command }}</code></dd><dt>{{ t().fields.source }}</dt><dd><code class="hw-code" dir="ltr" translate="no">{{ item.source }}</code></dd></dl></li>}</ul>@if (e.gaps.length) {<p>{{ t().gapsIntro }} @for (gap of e.gaps; track gap.kind) {<code class="hw-code" dir="ltr" translate="no">{{ gap.kind }}</code>: {{ adapters(gap.adapters) }}{{ $last ? '.' : t().separator }}}</p>}} @else {<p>{{ t().noEvidence(name()) }}</p>}@if (e.notes.length) {<p>{{ t().notesIntro }}</p><ul>@for (note of e.notes; track $index) {<li><span [attr.lang]="foreign()" [attr.dir]="foreignDir()">{{ note }}</span></li>}</ul>}<h3 [id]="ids.open" tabindex="-1">{{ t().open }}</h3>@if (e.open.length) {<p>{{ t().openIntro(e.version) }}</p><ul>@for (item of e.open; track $index) {<li>@if (item.kind === 'defect') {<span [attr.lang]="foreign()" [attr.dir]="foreignDir()"><guide-inline [inlines]="item.text" /></span> ({{ t().defect(e.version) }})@if (item.differences.length) {<ul>@for (difference of item.differences; track difference.id) {<li>{{ t().differenceOf }} <code class="hw-code" dir="ltr" translate="no">{{ difference.id }}</code>: <span [attr.lang]="foreign()" [attr.dir]="foreignDir()"><guide-inline [inlines]="difference.text" /></span></li>}</ul>}} @else {<span [attr.lang]="foreign()" [attr.dir]="foreignDir()"><guide-inline [inlines]="item.text" /></span> ({{ t().difference }} <code class="hw-code" dir="ltr" translate="no">{{ item.id }}</code>)}</li>}</ul>} @else {<p>{{ t().noOpen(name(), e.version) }}</p>}}`,
})
export class EvidencePanel {
  readonly evidence = input.required<PageEvidence | undefined>();
  readonly lang = input.required<ContentLang>();
  /** The component's name as the page writes it (the h1). */
  readonly name = input.required<string>();
  protected readonly ids = EVIDENCE_IDS;
  protected readonly t = computed(() => pick(evidenceTexts, this.lang()));
  /** English evidence text on an Arabic page carries its own language and direction. */
  protected readonly foreign = computed(() => (this.lang() === 'en' ? null : 'en'));
  protected readonly foreignDir = computed(() => (this.lang() === 'en' ? null : 'ltr'));

  protected adapter(name: string): string {
    return this.t().adapters[name] ?? name;
  }

  protected adapters(names: readonly string[]): string {
    return this.t().list(names.map((name) => this.adapter(name)));
  }
}
