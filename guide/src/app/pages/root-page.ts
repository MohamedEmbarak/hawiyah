import { Component, inject } from '@angular/core';
import { HwButtonDirective } from '@hawiyah/angular';
import { documentTitle, HeadService } from '../core/head';
import { LocaleService } from '../core/locale';
import { shellTexts } from '../i18n/shell';
import { DEFAULT_LANG } from '../i18n/text';
import { Wordmark } from '../shell/wordmark';

/**
 * The root document (index.html): the inline pre-paint script replaces the address
 * with a language page before Angular starts; readers without script see this
 * bilingual language choice.
 */
@Component({
  selector: 'guide-root-page',
  imports: [HwButtonDirective, Wordmark],
  template: `<div class="root"><h1 tabindex="-1"><guide-wordmark [label]="ar.rootTitle" labelLang="ar" /><span class="hw-sr-only" lang="en">{{ en.rootTitle }}</span></h1><nav aria-labelledby="choose-language"><p id="choose-language" class="choose"><span lang="ar" dir="rtl">{{ ar.chooseLanguage }}</span><span aria-hidden="true"> · </span><span lang="en" dir="ltr">{{ en.chooseLanguage }}</span></p><ul class="languages"><li><a hwButton variant="primary" href="ar/" hreflang="ar" lang="ar" dir="rtl">{{ ar.languageName }}</a></li><li><a hwButton variant="secondary" href="en/" hreflang="en" lang="en" dir="ltr">{{ en.languageName }}</a></li></ul></nav></div>`,
  styleUrl: './root-page.css',
})
export class RootPage {
  protected readonly ar = shellTexts.ar;
  protected readonly en = shellTexts.en;

  constructor() {
    inject(LocaleService).apply(DEFAULT_LANG);
    inject(HeadService).set({ title: documentTitle(this.ar.rootTitle, this.en.rootTitle) });
  }
}
