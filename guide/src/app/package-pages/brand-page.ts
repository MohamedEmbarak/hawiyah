import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HwContentNavigationComponent } from '@hawiyah/angular';
import { BlocksContent } from '../content/blocks';
import { CodeBlockIds } from '../content/code-block';
import { InlineContent, inlineText } from '../content/inline';
import { shellTexts } from '../i18n/shell';
import { HeadService, documentTitle } from '../core/head';
import { navigationItems } from '../features/component-pages/reference-page';
import { pick } from '../i18n/text';
import { documentTexts } from '../documents/i18n';
import { Artworks, Loader } from './brand-blocks';
import type { BrandPageModel } from './model';

/**
 * Route <lang>/brand/: the wordmark artwork and the loader of the installed
 * @hawiyah/styles, with the usage notes of its README. The artwork for light and for
 * dark surfaces stands on a surface of that colour mode (data-hw-mode on the guide's
 * surface); the loader is the package's .hw-brand-loader, which follows the page's
 * colour mode and shows the static wordmark under reduced motion. The notes are
 * English text of the README and are marked so on the Arabic page.
 */
@Component({
  selector: 'guide-brand-page',
  imports: [Artworks, BlocksContent, HwContentNavigationComponent, InlineContent, Loader],
  providers: [CodeBlockIds],
  template: `@if (model(); as m) {<div class="page"><article class="hw-prose" [attr.lang]="m.lang" [attr.dir]="m.dir"><h1 tabindex="-1">{{ m.title }}</h1><p><guide-inline [inlines]="m.summary" /></p><div class="toc"><hw-content-navigation [label]="t().onThisPage" [items]="items()" [showHeading]="true" [sticky]="false" [updateHash]="true" /></div><h2 id="wordmark" tabindex="-1">{{ heading('wordmark') }}</h2><guide-artworks [brand]="m.brand" [lang]="m.lang" /><h2 id="loader" tabindex="-1">{{ heading('loader') }}</h2><guide-loader [brand]="m.brand" /><h2 id="usage" tabindex="-1">{{ heading('usage') }}</h2><p>{{ m.brand.labels.source }} <code class="hw-code" dir="ltr" translate="no">{{ m.brand.source.package }}</code> <bdi dir="ltr">{{ m.brand.source.version }}</bdi>: <bdi lang="en" dir="ltr">{{ m.brand.source.section }}</bdi></p><div class="notes" lang="en" dir="ltr"><guide-blocks [blocks]="m.brand.notes" /></div></article></div>}`,
  styleUrl: './package-page.css',
})
export class BrandPage {
  private readonly head = inject(HeadService);
  private readonly data = inject(ActivatedRoute).snapshot.data['model'] as BrandPageModel;
  protected readonly model = computed(() => this.data);
  protected readonly t = computed(() => pick(documentTexts, this.data.lang));
  protected readonly items = computed(() => navigationItems(this.data.headings));

  constructor() {
    this.head.set({ title: documentTitle(this.data.title, pick(shellTexts, this.data.lang).rootTitle), description: inlineText(this.data.summary), page: { lang: this.data.lang, path: 'brand/' } });
  }

  protected heading(id: string): string {
    return this.data.headings.find((item) => item.id === id)?.text ?? '';
  }
}
