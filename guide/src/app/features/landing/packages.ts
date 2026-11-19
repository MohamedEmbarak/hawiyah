import { Component, computed, inject } from '@angular/core';
import { HwDescriptionListComponent, HwLinkDirective } from '@hawiyah/angular';
import { contentTexts } from '../../content/i18n';
import { PROJECT_LINKS } from '../../core/links';
import { LocaleService } from '../../core/locale';
import { pick } from '../../i18n/text';
import { landingTexts, type PackageKey } from './i18n';
import { INSTALL } from './state';

const LRI = '⁦';
const PDI = '⁩';

/** Section 4: the seven packages, their version and the number of catalogued components. */
@Component({
  selector: 'guide-landing-packages',
  imports: [HwDescriptionListComponent, HwLinkDirective],
  template: `<section class="band" aria-labelledby="packages-title"><div class="band-head"><h2 id="packages-title" class="hw-type" data-scale="display-xs">{{ t().packages.heading }}</h2><p class="hw-type" data-scale="body-md">{{ t().packages.intro(pin, count) }}</p><p class="hw-type" data-scale="body-md"><a hwLink [external]="true" [href]="npm">{{ t().packages.npmLink }}<span class="hw-sr-only"> {{ c().opensInNewTab }}</span></a></p></div><div class="band-body"><hw-description-list variant="horizontal" [items]="items()" /></div></section>`,
  styleUrl: './landing.css',
})
export class LandingPackages {
  private readonly lang = inject(LocaleService).lang;
  protected readonly t = computed(() => pick(landingTexts, this.lang()));
  protected readonly c = computed(() => pick(contentTexts, this.lang()));
  protected readonly pin = INSTALL.pin;
  protected readonly count = INSTALL.componentCount;
  /** The one npm address of the guide (the footer link has the same). */
  protected readonly npm = PROJECT_LINKS.packages;
  protected readonly items = computed(() =>
    INSTALL.packages.map((entry) => ({
      term: `${LRI}${entry.name}${PDI}`,
      description: this.t().packages.descriptions[entry.name.replace('@hawiyah/', '') as PackageKey],
    })),
  );
}
