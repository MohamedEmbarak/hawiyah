import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HwPortalHeaderComponent, HwPortalNavItem } from '@hawiyah/angular';
import { afterRenderEffect } from '@angular/core';
import { filter } from 'rxjs';
import { features } from '../../generated/features';
import { injectCurrentUrl } from '../core/current-url';
import { page, parseUrl } from '../core/links';
import { LocaleService } from '../core/locale';
import { shellTexts } from '../i18n/shell';
import { pick } from '../i18n/text';
import { Attribution } from './attribution';
import { LanguageSwitch } from './language-switch';
import { ModeSwitch } from './mode-switch';
import { PreviewNotice } from './preview-notice';
import { Wordmark } from './wordmark';

/** hw-portal-header with the attribution notice, the wordmark, the language link and the mode switch. */
@Component({
  selector: 'guide-site-header',
  imports: [HwPortalHeaderComponent, Attribution, LanguageSwitch, ModeSwitch, PreviewNotice, Wordmark],
  template: `<hw-portal-header [homeHref]="home()" [brandLabel]="t().brandLabel" mainId="main" [skipLabel]="t().skipLabel" [menuLabel]="t().menuLabel" [navigationLabel]="t().navigationLabel" navigationId="site-navigation" [links]="navLinks()" [(open)]="menuOpen"><guide-preview-notice hwPortalNotice /><guide-attribution hwPortalNotice /><guide-wordmark hwBrand /><guide-language-switch /><guide-mode-switch /></hw-portal-header>`,
  styleUrl: './site-header.css',
})
export class SiteHeader {
  private readonly locale = inject(LocaleService);
  private readonly url = injectCurrentUrl();
  private readonly header = viewChild.required(HwPortalHeaderComponent);
  protected readonly menuOpen = signal(false);
  protected readonly t = computed(() => pick(shellTexts, this.locale.lang()));
  protected readonly home = computed(() => page(this.locale.lang()));
  protected readonly navLinks = computed<HwPortalNavItem[]>(() => {
    const lang = this.locale.lang();
    const current = parseUrl(this.url()).path;
    return features
      .filter((feature) => feature.nav?.header)
      .map((feature) => {
        const nav = feature.nav!;
        return { label: nav.label[lang], href: page(lang, nav.path), current: current === nav.path };
      });
  });

  constructor() {
    inject(Router)
      .events.pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.menuOpen.set(false);
        this.header().close();
      });
    afterRenderEffect(() => this.locale.remember(this.locale.lang()));
  }
}
