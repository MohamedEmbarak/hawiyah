import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HwCardComponent, HwLinkDirective } from '@hawiyah/angular';
import { navigationDocuments } from '../content/content-loader';
import { KIND_ROUTES, type DocumentKind } from '../content/kinds';
import type { NavigationIndex } from '../content/model';
import { HeadService } from '../core/head';
import { page } from '../core/links';
import { LocaleService } from '../core/locale';
import { pick, type Lang } from '../i18n/text';
import { documentTexts } from './i18n';

export interface DocumentCard {
  readonly id: string;
  readonly href: string;
  readonly label: string;
  readonly summary: string;
}

/** The cards of the index of a kind: every built page of this language, in the order of its index.json. */
export function documentCards(kind: DocumentKind, lang: Lang, index?: NavigationIndex): DocumentCard[] {
  return navigationDocuments(kind, index)
    .filter((entry) => entry.langs.includes(lang))
    .map((entry) => ({ id: entry.slug, href: page(lang, `${KIND_ROUTES[kind]}/${entry.slug}`), label: entry.title[lang], summary: entry.summary[lang] }));
}

/**
 * Routes <lang>/guides/ and <lang>/templates/ (the kind is the route's data): the h1,
 * one introduction paragraph from the guide's text sources and a card per built page,
 * named by its heading, which links to the page, with the page's summary.
 */
@Component({
  selector: 'guide-document-index-page',
  imports: [HwCardComponent, HwLinkDirective],
  template: `<div class="documents"><div class="hw-prose"><h1 tabindex="-1">{{ t().title }}</h1><p>{{ t().intro }}</p></div>@if (cards().length) {<ul class="cards" [attr.aria-label]="t().listLabel">@for (card of cards(); track card.id) {<li><hw-card [aria-labelledby]="'card-' + card.id"><div hwCardHeader><h2 class="hw-type" data-scale="heading-sm" [id]="'card-' + card.id"><a hwLink [href]="card.href">{{ card.label }}</a></h2></div><p>{{ card.summary }}</p></hw-card></li>}</ul>} @else {<p class="hw-type" data-tone="muted">{{ t().empty }}</p>}</div>`,
  styleUrl: './document-index-page.css',
})
export class DocumentIndexPage {
  private readonly locale = inject(LocaleService);
  private readonly head = inject(HeadService);
  private readonly kind = inject(ActivatedRoute).snapshot.data['kind'] as DocumentKind;
  protected readonly t = computed(() => pick(documentTexts, this.locale.lang()).kinds[this.kind]);
  protected readonly cards = computed(() => documentCards(this.kind, this.locale.lang()));

  constructor() {
    const lang = this.locale.lang();
    const t = pick(documentTexts, lang).kinds[this.kind];
    this.head.set({ title: t.documentTitle, description: t.intro, page: { lang, path: `${KIND_ROUTES[this.kind]}/` } });
  }
}
