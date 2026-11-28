import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LANGS, Lang } from '../i18n/text';
import { buildInfo } from './build-info';
import { pagePath } from './links';

export interface HeadData {
  /** The whole document title, already composed with ' · '. */
  readonly title: string;
  /** Plain text for meta description; omitted on the root and 404 documents. */
  readonly description?: string;
  /** Language and page path for canonical and hreflang links; omitted on the root and 404 documents. */
  readonly page?: { readonly lang: Lang; readonly path: string };
}

const MARK = 'data-guide-head';

/**
 * Writes the title, meta description, canonical link and hreflang alternates
 * through Title, Meta and DOCUMENT, on the server and in the browser.
 */
@Injectable({ providedIn: 'root' })
export class HeadService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  set(data: HeadData): void {
    this.title.setTitle(data.title);
    if (data.description) this.meta.updateTag({ name: 'description', content: data.description });
    else this.meta.removeTag("name='description'");
    for (const link of Array.from(this.document.head.querySelectorAll(`link[${MARK}]`))) link.remove();
    if (!data.page) return;
    const path = pagePath(data.page.path);
    this.link('canonical', absolute(`${data.page.lang}/${path}`));
    for (const lang of LANGS) this.link('alternate', absolute(`${lang}/${path}`), lang);
    this.link('alternate', absolute(''), 'x-default');
  }

  private link(rel: string, href: string, hreflang?: string): void {
    const link = this.document.createElement('link');
    link.setAttribute('rel', rel);
    if (hreflang) link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    link.setAttribute(MARK, '');
    this.document.head.appendChild(link);
  }
}

/** Absolute address of a base-relative path: <siteOrigin><base><path>. */
export function absolute(path: string): string {
  return `${buildInfo.siteOrigin}${buildInfo.basePath}${path}`;
}

/** Joins title parts with the guide's separator. */
export function documentTitle(...parts: string[]): string {
  return parts.filter(Boolean).join(' · ');
}
