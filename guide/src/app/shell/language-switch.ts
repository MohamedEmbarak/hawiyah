import { Component, computed, inject } from '@angular/core';
import { HwButtonDirective } from '@hawiyah/angular';
import { injectCurrentUrl } from '../core/current-url';
import { otherLanguage } from '../core/links';
import { LocaleService } from '../core/locale';
import { shellTexts } from '../i18n/shell';
import { Lang, dirOf } from '../i18n/text';

/** A link to the same page in the other language: the language is a route, not a setting. */
@Component({
  selector: 'guide-language-switch',
  imports: [HwButtonDirective],
  template: `<a hwButton variant="ghost" size="sm" [href]="otherHref()" [attr.hreflang]="other()" [attr.lang]="other()" [attr.dir]="otherDir()"><span class="hw-icon" data-icon="translate" aria-hidden="true"></span>{{ otherName() }}</a>`,
})
export class LanguageSwitch {
  private readonly locale = inject(LocaleService);
  private readonly url = injectCurrentUrl();
  protected readonly other = computed<Lang>(() => (this.locale.lang() === 'ar' ? 'en' : 'ar'));
  protected readonly otherDir = computed(() => dirOf(this.other()));
  protected readonly otherName = computed(() => shellTexts[this.other()].languageName);
  protected readonly otherHref = computed(() => otherLanguage(this.url()));
}
