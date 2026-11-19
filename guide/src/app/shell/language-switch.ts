import { Component, computed, inject } from '@angular/core';
import { HwButtonDirective } from '@hawiyah/angular';
import { injectCurrentUrl } from '../core/current-url';
import { otherLanguage } from '../core/links';
import { LocaleService } from '../core/locale';
import { shellTexts } from '../i18n/shell';
import { Lang, dirOf } from '../i18n/text';

/**
 * A link to the same page in the other language: the language is a route, not a
 * setting. The link shows the language name alone, written in that language: with an
 * icon beside it, the header row at 390 px fitted the web font by one pixel and wrapped
 * with the fallback font, so the page moved down by a row when the fonts arrived.
 */
@Component({
  selector: 'guide-language-switch',
  imports: [HwButtonDirective],
  template: `<a hwButton variant="ghost" size="sm" [href]="otherHref()" [attr.hreflang]="other()" [attr.lang]="other()" [attr.dir]="otherDir()">{{ otherName() }}</a>`,
})
export class LanguageSwitch {
  private readonly locale = inject(LocaleService);
  private readonly url = injectCurrentUrl();
  protected readonly other = computed<Lang>(() => (this.locale.lang() === 'ar' ? 'en' : 'ar'));
  protected readonly otherDir = computed(() => dirOf(this.other()));
  protected readonly otherName = computed(() => shellTexts[this.other()].languageName);
  protected readonly otherHref = computed(() => otherLanguage(this.url()));
}
