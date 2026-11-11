import { Component, Input } from '@angular/core';
import { HwPortalFooterComponent, HwPortalHeaderComponent } from './content';
import type { HwLinkItem, HwPortalFooterLink, HwPortalNavItem } from './content';
import { HwBreadcrumbComponent } from './navigation';
import type { HwBreadcrumbItem } from './navigation';
import { injectId } from './ids';
import { HwTexts } from './text';

export interface HwSecondaryNavItem extends HwLinkItem { icon?: string }
@Component({selector: 'hw-secondary-nav', standalone: true, template: `<nav class="hw-secondary-nav" [attr.aria-label]="texts.need('label', label)" [attr.data-variant]="variant"><ul>@for (item of items; track $index) {<li><a [href]="item.href" [attr.aria-current]="item.current ? 'page' : null">@if (variant === 'mobile' && item.icon) {<span class="hw-icon" [attr.data-icon]="item.icon" aria-hidden="true"></span>}<span>{{ item.label }}</span></a></li>}</ul></nav>`})
export class HwSecondaryNavComponent { @Input() variant: 'default' | 'mobile' = 'default'; @Input() items: readonly HwSecondaryNavItem[] = []; /** Accessible name of the navigation landmark. */ @Input({required: true}) label = ''; protected readonly texts = new HwTexts('hw-secondary-nav'); }
@Component({selector: 'hw-portal-layout', standalone: true, imports: [HwPortalHeaderComponent, HwPortalFooterComponent, HwBreadcrumbComponent, HwSecondaryNavComponent], template: `
  <div class="hw-portal-layout" [attr.dir]="dir || null">
    <hw-portal-header [brand]="brand" [brandLabel]="brandLabel" [homeHref]="homeHref" [links]="links" [mainId]="mainId" [navigationId]="navigationId" [skipLabel]="skipLabel" [menuLabel]="menuLabel" [navigationLabel]="navigationLabel"><ng-content select="[hwBrand]" ngProjectAs="[hwBrand]" /><ng-content select="[hwPortalActions]" /></hw-portal-header>
    @if (secondaryNavigation.length) {<hw-secondary-nav [items]="secondaryNavigation" [label]="texts.need('secondaryLabel', secondaryLabel, 'secondaryNavigation items are given') ?? ''" />}
    <main [id]="mainId" tabindex="-1" class="hw-portal-layout-main hw-container">@if (breadcrumbs.length) {<hw-breadcrumb [items]="breadcrumbs" [label]="texts.need('breadcrumbLabel', breadcrumbLabel, 'breadcrumbs are given') ?? ''" />}<ng-content /></main>
    <hw-portal-footer [brand]="brand" [links]="footerLinks" [copyright]="copyright" [navigationLabel]="footerLinks.length ? texts.need('footerLabel', footerLabel, 'footerLinks are given') ?? '' : ''" [externalLabel]="externalLabel"><ng-content select="[hwPortalFooter]" /></hw-portal-footer>
  </div>`})
export class HwPortalLayoutComponent {
  /** Plain brand text for the header and the footer. Optional: projected [hwBrand] artwork can stand alone, and brandLabel then names it. */
  @Input() brand = ''; @Input() brandLabel = ''; @Input() homeHref = '/';
  /** Rendered only when supplied; the language is an ordinary lang attribute that the application sets on the host. */
  @Input() dir?: 'rtl' | 'ltr';
  @Input() mainId = injectId('hw-portal-main'); @Input() links: readonly HwPortalNavItem[] = [];
  /** Id of the header navigation, which the menu toggle controls. Generated when omitted. */
  @Input() navigationId = injectId('hw-portal-navigation');
  @Input() secondaryNavigation: readonly HwLinkItem[] = []; @Input() footerLinks: readonly HwPortalFooterLink[] = []; @Input() breadcrumbs: readonly HwBreadcrumbItem[] = []; @Input() copyright = '';
  @Input({required: true}) skipLabel = ''; @Input({required: true}) menuLabel = ''; @Input({required: true}) navigationLabel = '';
  /** Required when secondaryNavigation, breadcrumbs or footerLinks are given, in that order. */
  @Input() secondaryLabel = ''; @Input() breadcrumbLabel = ''; @Input() footerLabel = '';
  /** Screen-reader text appended to footer links marked external. */
  @Input({required: true}) externalLabel = '';
  protected readonly texts = new HwTexts('hw-portal-layout');
}
