import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HwLinkDirective } from '@hawiyah/angular';
import { BlocksContent } from '../../content/blocks';
import { CodeBlockIds } from '../../content/code-block';
import { InlineContent } from '../../content/inline';
import { HeadService } from '../../core/head';
import { page as pageHref } from '../../core/links';
import { PageExamples } from '../../examples/page-examples';
import { pick } from '../../i18n/text';
import { componentPageTexts } from './i18n';
import type { ComponentPageData } from './page-data.resolver';

/** Route <lang>/components/:id/: the h1, the summary, the Example section and a link to the reference view. */
@Component({
  selector: 'guide-brief-page',
  imports: [BlocksContent, HwLinkDirective, InlineContent],
  providers: [PageExamples, CodeBlockIds],
  template: `@if (data(); as d) {<article class="hw-prose" [attr.lang]="d.page.lang" [attr.dir]="d.page.dir"><h1 tabindex="-1">{{ d.page.title }}</h1><p><guide-inline [inlines]="d.page.summary" /></p>@if (example(); as section) {<h2 [id]="section.id" tabindex="-1"><guide-inline [inlines]="section.title" /></h2><guide-blocks [blocks]="section.blocks" />}<p><a hwLink [href]="referenceHref()">{{ t().fullReference }}</a></p></article>}`,
  styleUrl: './brief-page.css',
})
export class BriefPage {
  private readonly head = inject(HeadService);
  private readonly examples = inject(PageExamples);
  protected readonly data = signal<ComponentPageData | null>(null);
  protected readonly t = computed(() => pick(componentPageTexts, this.data()?.page.lang ?? 'en'));
  protected readonly example = computed(() => this.data()?.page.sections.find((section) => section.id === 'example') ?? null);
  protected readonly referenceHref = computed(() => {
    const data = this.data();
    return data ? pageHref(data.page.lang, `components/${data.page.id}/reference`) : '';
  });

  constructor() {
    inject(ActivatedRoute)
      .data.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((routeData) => this.show(routeData['page'] as ComponentPageData));
  }

  private show(data: ComponentPageData): void {
    this.examples.set(data.groups);
    this.data.set(data);
    const t = pick(componentPageTexts, data.page.lang);
    this.head.set({
      title: t.briefTitle(data.page.title),
      description: data.manifest.summaryText[data.page.lang],
      page: { lang: data.page.lang, path: `components/${data.page.id}/` },
    });
  }
}
