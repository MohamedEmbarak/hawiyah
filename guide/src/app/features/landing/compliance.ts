import { Component, computed, inject } from '@angular/core';
import { HwCardComponent, HwLinkDirective } from '@hawiyah/angular';
import { contentTexts } from '../../content/i18n';
import { PROJECT_LINKS, external } from '../../core/links';
import { LocaleService } from '../../core/locale';
import { pick } from '../../i18n/text';
import { landingTexts } from './i18n';

const DOCS = `${PROJECT_LINKS.repository}/blob/main/docs`;

/** Section 5: the compliance statement and the links to its evidence. */
@Component({
  selector: 'guide-landing-compliance',
  imports: [HwCardComponent, HwLinkDirective],
  template: `<section class="band" aria-labelledby="compliance-title"><div class="band-head"><h2 id="compliance-title" class="hw-type" data-scale="display-xs">{{ t().compliance.heading }}</h2></div><div class="band-body"><hw-card variant="outlined"><div class="statement"><p class="hw-type" data-scale="body-md">{{ t().compliance.statement }}</p><p class="hw-type" data-scale="body-md">{{ t().compliance.evidence }}</p><ul class="links">@for (link of links(); track link.href) {<li><a hwLink [external]="true" [href]="link.href">{{ link.text }}<span class="hw-sr-only"> {{ c().opensInNewTab }}</span></a></li>}</ul></div></hw-card></div></section>`,
  styleUrls: ['./landing.css', './compliance.css'],
})
export class LandingCompliance {
  private readonly lang = inject(LocaleService).lang;
  protected readonly t = computed(() => pick(landingTexts, this.lang()));
  protected readonly c = computed(() => pick(contentTexts, this.lang()));
  protected readonly links = computed(() => {
    const t = this.t().compliance;
    return [
      { href: external(`${DOCS}/alignment.md`), text: t.alignment },
      { href: external(`${DOCS}/coverage.md`), text: t.coverage },
      { href: external(`${DOCS}/validation.md`), text: t.validation },
      { href: external('https://design.dga.gov.sa/'), text: t.dga },
    ];
  });
}
