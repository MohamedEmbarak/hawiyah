import { Component, computed, inject } from '@angular/core';
import { HwPortalFooterComponent, HwPortalFooterGroup, HwPortalFooterLink } from '@hawiyah/angular';
import { features } from '../../generated/features';
import { buildInfo } from '../core/build-info';
import { NOTICES_HREF, PROJECT_LINKS, page } from '../core/links';
import { LocaleService } from '../core/locale';
import { shellTexts } from '../i18n/shell';
import { pick } from '../i18n/text';
import { Wordmark } from './wordmark';

/** hw-portal-footer with the guide and project link groups and the legal links. */
@Component({
  selector: 'guide-site-footer',
  imports: [HwPortalFooterComponent, Wordmark],
  template: `<hw-portal-footer [brandLabel]="t().footerBrandLabel" [description]="t().footerDescription" [copyright]="t().footerVersion(pin)" [groups]="groups()" [legalLinks]="legalLinks()" [legalLinksLabel]="t().legalLinksLabel" [externalLabel]="t().externalLabel"><guide-wordmark reverse hwFooterBrand /></hw-portal-footer>`,
  styleUrl: './site-footer.css',
})
export class SiteFooter {
  private readonly locale = inject(LocaleService);
  protected readonly pin = buildInfo.pin;
  protected readonly t = computed(() => pick(shellTexts, this.locale.lang()));
  protected readonly groups = computed<HwPortalFooterGroup[]>(() => {
    const lang = this.locale.lang();
    const t = this.t();
    const guide = features
      .filter((feature) => feature.nav?.footer)
      .map((feature) => ({ label: feature.nav!.label[lang], href: page(lang, feature.nav!.path) }));
    return [
      { title: t.footerGuide, links: guide },
      {
        title: t.footerProject,
        links: [
          { label: t.repository, href: PROJECT_LINKS.repository, external: true },
          { label: t.packagesOnNpm, href: PROJECT_LINKS.packages, external: true },
          { label: t.changelog, href: PROJECT_LINKS.changelog, external: true },
        ],
      },
    ];
  });
  protected readonly legalLinks = computed<HwPortalFooterLink[]>(() => [
    { label: this.t().licence, href: PROJECT_LINKS.licence, external: true },
    { label: this.t().notices, href: NOTICES_HREF },
  ]);
}
