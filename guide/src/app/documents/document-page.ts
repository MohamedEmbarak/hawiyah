import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HwContentNavigationComponent } from '@hawiyah/angular';
import { BlocksContent } from '../content/blocks';
import { CodeBlockIds } from '../content/code-block';
import { InlineContent } from '../content/inline';
import { HeadService } from '../core/head';
import { PageExamples } from '../examples/page-examples';
import { navigationItems } from '../features/component-pages/reference-page';
import { pick } from '../i18n/text';
import type { DocumentPageData } from './document-data.resolver';
import { documentTexts } from './i18n';

/**
 * Routes <lang>/guides/:id/ and <lang>/templates/:id/: the whole page of a guide or a
 * template, rendered from its content model as a reference page is: the h1, the
 * summary, the content navigation of its h2 and h3 headings, then every section with
 * its live groups (a template's groups carry frame, so their four results stand in
 * sandboxed frames). A guide or a template has no evidence panel.
 */
@Component({
  selector: 'guide-document-page',
  imports: [BlocksContent, HwContentNavigationComponent, InlineContent],
  providers: [PageExamples, CodeBlockIds],
  template: `@if (data(); as d) {<div class="document"><article class="hw-prose" [attr.lang]="d.page.lang" [attr.dir]="d.page.dir"><h1 tabindex="-1">{{ d.page.title }}</h1><p><guide-inline [inlines]="d.page.summary" /></p><div class="toc"><hw-content-navigation [label]="t().onThisPage" [items]="items()" [showHeading]="true" [sticky]="false" [updateHash]="true" /></div>@for (section of d.page.sections; track section.id) {<h2 [id]="section.id" tabindex="-1"><guide-inline [inlines]="section.title" /></h2><guide-blocks [blocks]="section.blocks" />}</article></div>}`,
  styleUrl: './document-page.css',
})
export class DocumentPage {
  private readonly head = inject(HeadService);
  private readonly examples = inject(PageExamples);
  protected readonly data = signal<DocumentPageData | null>(null);
  protected readonly t = computed(() => pick(documentTexts, this.data()?.page.lang ?? 'en'));
  protected readonly items = computed(() => navigationItems(this.data()?.page.headings ?? []));

  constructor() {
    inject(ActivatedRoute)
      .data.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((routeData) => this.show(routeData['page'] as DocumentPageData));
  }

  private show(data: DocumentPageData): void {
    this.examples.set(data.groups);
    this.data.set(data);
    const t = pick(documentTexts, data.page.lang).kinds[data.kind];
    this.head.set({
      title: t.pageTitle(data.page.title),
      description: data.entry.summary[data.page.lang],
      page: { lang: data.page.lang, path: `${data.kind === 'guide' ? 'guides' : 'templates'}/${data.entry.slug}/` },
    });
  }
}
