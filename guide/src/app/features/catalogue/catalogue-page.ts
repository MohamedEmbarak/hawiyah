import { Component, computed, inject } from '@angular/core';
import { HwCardComponent, HwLinkDirective, HwPageHeaderComponent } from '@hawiyah/angular';
import { navigationIndex } from '../../content/content-loader';
import type { NavigationIndex } from '../../content/model';
import { HeadService } from '../../core/head';
import { page } from '../../core/links';
import { LocaleService } from '../../core/locale';
import { categoryLabel } from '../../i18n/categories';
import { pick, type Lang } from '../../i18n/text';
import { catalogueTexts } from './i18n';

export interface CatalogueCard {
  readonly id: string;
  readonly href: string;
  readonly label: string;
  readonly summary: string;
}

export interface CatalogueSection {
  /** Category id of components.json. */
  readonly id: string;
  readonly label: string;
  readonly cards: readonly CatalogueCard[];
}

/**
 * One section per category of components.json that has a built page in this language,
 * in the order of the navigation index (category order, then components.json order);
 * each card carries the page's name and its Markdown summary.
 */
export function catalogueSections(lang: Lang, index: NavigationIndex = navigationIndex): CatalogueSection[] {
  return index.categories
    .map((category) => ({
      id: category,
      label: categoryLabel(category, lang),
      cards: index.pages
        .filter((entry) => entry.category === category && entry.langs.includes(lang))
        .map((entry) => ({ id: entry.id, href: page(lang, `components/${entry.id}`), label: entry.title[lang], summary: entry.summary[lang] })),
    }))
    .filter((section) => section.cards.length > 0);
}

/**
 * Route <lang>/components/: the built component pages grouped by category. A card is
 * an article named by its heading, which links to the page; the summary is a paragraph
 * of the card body as the package styles it. The link's name is the visible component
 * name (a whole-card link would read the summary as part of its name).
 */
@Component({
  selector: 'guide-catalogue-page',
  imports: [HwCardComponent, HwLinkDirective, HwPageHeaderComponent],
  template: `<div class="catalogue"><hw-page-header [title]="t().title" [description]="t().summary" />@if (sections().length) {@for (section of sections(); track section.id) {<section class="category" [attr.aria-labelledby]="'category-' + section.id"><h2 class="hw-type" data-scale="heading-md" [id]="'category-' + section.id">{{ section.label }}</h2><ul class="cards">@for (card of section.cards; track card.id) {<li><hw-card [aria-labelledby]="'card-' + card.id"><div hwCardHeader><h3 class="hw-type" data-scale="heading-sm" [id]="'card-' + card.id"><a hwLink [href]="card.href">{{ card.label }}</a></h3></div><p>{{ card.summary }}</p></hw-card></li>}</ul></section>}} @else {<p>{{ t().empty }}</p>}</div>`,
  styleUrl: './catalogue-page.css',
})
export class CataloguePage {
  private readonly locale = inject(LocaleService);
  private readonly head = inject(HeadService);
  protected readonly t = computed(() => pick(catalogueTexts, this.locale.lang()));
  protected readonly sections = computed(() => catalogueSections(this.locale.lang()));

  constructor() {
    const lang = this.locale.lang();
    const t = pick(catalogueTexts, lang);
    this.head.set({ title: t.documentTitle, description: t.summary, page: { lang, path: 'components/' } });
  }
}
