import { Component, inject } from '@angular/core';
import { HwLinkDirective } from '@hawiyah/angular';
import { documentTitle, HeadService } from '../core/head';
import { LocaleService } from '../core/locale';
import { shellTexts } from '../i18n/shell';
import { DEFAULT_LANG } from '../i18n/text';
import { Wordmark } from '../shell/wordmark';

/**
 * The bilingual not-found page: prerendered at route 404 and moved to 404.html,
 * which GitHub Pages serves for every missing path; also the client route '**'.
 */
@Component({
  selector: 'guide-not-found-page',
  imports: [HwLinkDirective, Wordmark],
  template: `<div class="not-found"><guide-wordmark /><h1 tabindex="-1"><span lang="ar" dir="rtl">{{ ar.notFoundTitle }}</span><span aria-hidden="true"> · </span><span lang="en" dir="ltr">{{ en.notFoundTitle }}</span></h1><p lang="ar" dir="rtl">{{ ar.notFoundBody }}</p><p lang="en" dir="ltr">{{ en.notFoundBody }}</p><ul class="languages"><li><a hwLink href="ar/" hreflang="ar" lang="ar" dir="rtl">{{ ar.languageName }}</a></li><li><a hwLink href="en/" hreflang="en" lang="en" dir="ltr">{{ en.languageName }}</a></li></ul></div>`,
  styleUrl: './not-found-page.css',
})
export class NotFoundPage {
  protected readonly ar = shellTexts.ar;
  protected readonly en = shellTexts.en;

  constructor() {
    inject(LocaleService).apply(DEFAULT_LANG);
    inject(HeadService).set({ title: documentTitle(this.ar.notFoundTitle, this.en.notFoundTitle) });
  }
}
