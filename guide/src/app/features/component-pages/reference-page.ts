import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HwContentNavigationComponent } from '@hawiyah/angular';
import type { ContentNavigationItem } from '@hawiyah/core';
import { BlocksContent } from '../../content/blocks';
import { CodeBlockIds } from '../../content/code-block';
import { InlineContent } from '../../content/inline';
import type { ContentHeading } from '../../content/model';
import { HeadService } from '../../core/head';
import { PageExamples } from '../../examples/page-examples';
import { pick } from '../../i18n/text';
import { componentPageTexts } from './i18n';
import type { ComponentPageData } from './page-data.resolver';

/** Content navigation entries: each h2 with the h3 headings under it. */
export function navigationItems(headings: readonly ContentHeading[]): ContentNavigationItem[] {
  const items: { id: string; label: string; children: ContentNavigationItem[] }[] = [];
  for (const heading of headings) {
    if (heading.level === 2) items.push({ id: heading.id, label: heading.text, children: [] });
    else if (heading.level === 3) items[items.length - 1]?.children.push({ id: heading.id, label: heading.text });
  }
  return items.map((item) => (item.children.length ? item : { id: item.id, label: item.label }));
}

/** Route <lang>/components/:id/reference/: the whole page with its content navigation and every live group. */
@Component({
  selector: 'guide-reference-page',
  imports: [BlocksContent, HwContentNavigationComponent, InlineContent],
  providers: [PageExamples, CodeBlockIds],
  template: `@if (data(); as d) {<article class="hw-prose" [attr.lang]="d.page.lang" [attr.dir]="d.page.dir"><h1 tabindex="-1">{{ d.page.title }}</h1><p><guide-inline [inlines]="d.page.summary" /></p><div class="toc"><hw-content-navigation [label]="t().onThisPage" [items]="items()" [showHeading]="true" [sticky]="false" [updateHash]="true" /></div>@for (section of d.page.sections; track section.id) {<h2 [id]="section.id" tabindex="-1"><guide-inline [inlines]="section.title" /></h2><guide-blocks class="section" [blocks]="section.blocks" />}</article>}`,
  styleUrl: './reference-page.css',
})
export class ReferencePage {
  private readonly head = inject(HeadService);
  private readonly examples = inject(PageExamples);
  protected readonly data = signal<ComponentPageData | null>(null);
  protected readonly t = computed(() => pick(componentPageTexts, this.data()?.page.lang ?? 'en'));
  protected readonly items = computed(() => navigationItems(this.data()?.page.headings ?? []));

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
      title: t.referenceTitle(data.page.title),
      description: data.entry.summary[data.page.lang],
      page: { lang: data.page.lang, path: `components/${data.page.id}/reference/` },
    });
  }
}
