import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HwContentNavigationComponent } from '@hawiyah/angular';
import { BlocksContent } from '../content/blocks';
import { CodeBlockIds } from '../content/code-block';
import { InlineContent, inlineText } from '../content/inline';
import { HeadService, documentTitle } from '../core/head';
import { documentTexts } from '../documents/i18n';
import { navigationItems } from '../features/component-pages/reference-page';
import { shellTexts } from '../i18n/shell';
import { pick } from '../i18n/text';
import { IconList } from './brand-blocks';
import type { FoundationsPageModel } from './model';

/**
 * Route <lang>/foundations/: the tokens of the installed @hawiyah/tokens (colour in the
 * light and the dark mode of the default theme; spacing, type, radius and motion) as
 * tables, and the icons of the installed @hawiyah/styles, each the package's
 * span.hw-icon with its name.
 */
@Component({
  selector: 'guide-foundations-page',
  imports: [BlocksContent, HwContentNavigationComponent, IconList, InlineContent],
  providers: [CodeBlockIds],
  template: `<div class="page"><article class="hw-prose" [attr.lang]="model.lang" [attr.dir]="model.dir"><h1 tabindex="-1">{{ model.title }}</h1><p><guide-inline [inlines]="model.summary" /></p><div class="toc"><hw-content-navigation [label]="t().onThisPage" [items]="items()" [showHeading]="true" [sticky]="false" [updateHash]="true" /></div>@for (section of model.sections; track section.id) {<h2 [id]="section.id" tabindex="-1"><guide-inline [inlines]="section.title" /></h2>@if (section.id === 'icons') {<guide-icon-list [names]="model.icons.names" [label]="model.icons.label" />} @else {<guide-blocks [blocks]="section.blocks" />}}</article></div>`,
  styleUrl: './package-page.css',
})
export class FoundationsPage {
  private readonly head = inject(HeadService);
  protected readonly model = inject(ActivatedRoute).snapshot.data['model'] as FoundationsPageModel;
  protected readonly t = computed(() => pick(documentTexts, this.model.lang));
  protected readonly items = computed(() => navigationItems(this.model.headings));

  constructor() {
    this.head.set({ title: documentTitle(this.model.title, pick(shellTexts, this.model.lang).rootTitle), description: inlineText(this.model.summary), page: { lang: this.model.lang, path: 'foundations/' } });
  }
}
