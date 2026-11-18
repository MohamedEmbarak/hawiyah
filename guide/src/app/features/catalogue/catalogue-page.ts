import { Component, computed, inject } from '@angular/core';
import { HwCardComponent, HwPageHeaderComponent } from '@hawiyah/angular';
import pages from '../../../generated/pages.json';
import { HeadService } from '../../core/head';
import { page } from '../../core/links';
import { LocaleService } from '../../core/locale';
import { pick } from '../../i18n/text';
import { catalogueTexts } from './i18n';

interface CatalogueEntry {
  readonly id: string;
  readonly name: string;
  readonly labelAr: string;
}

const entries: readonly CatalogueEntry[] = pages.components;

/** Route <lang>/components/: one card per component page the build produced. */
@Component({
  selector: 'guide-catalogue-page',
  imports: [HwCardComponent, HwPageHeaderComponent],
  template: `<div class="catalogue"><hw-page-header [title]="t().title" [description]="t().summary" />@if (cards().length) {<ul class="cards">@for (card of cards(); track card.id) {<li><hw-card [href]="card.href"><span class="hw-type" data-scale="heading-sm">{{ card.label }}</span></hw-card></li>}</ul>} @else {<p>{{ t().empty }}</p>}</div>`,
  styleUrl: './catalogue-page.css',
})
export class CataloguePage {
  private readonly locale = inject(LocaleService);
  private readonly head = inject(HeadService);
  protected readonly t = computed(() => pick(catalogueTexts, this.locale.lang()));
  protected readonly cards = computed(() => {
    const lang = this.locale.lang();
    return entries.map((entry) => ({
      id: entry.id,
      href: page(lang, `components/${entry.id}`),
      label: lang === 'ar' ? entry.labelAr : entry.name,
    }));
  });

  constructor() {
    const lang = this.locale.lang();
    const t = pick(catalogueTexts, lang);
    this.head.set({ title: t.documentTitle, description: t.summary, page: { lang, path: 'components/' } });
  }
}
