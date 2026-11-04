import { Component, Input } from '@angular/core';
import { NqPortalFooterComponent, NqPortalHeaderComponent } from './content';
import type { NqLinkItem, NqPortalNavItem } from './content';
import { NqBreadcrumbComponent } from './navigation';
import type { NqBreadcrumbItem } from './navigation';

export interface NqSecondaryNavItem extends NqLinkItem { icon?: string }
@Component({selector: 'nq-secondary-nav', standalone: true, template: `<nav class="nq-secondary-nav" [attr.aria-label]="label" [attr.data-variant]="variant"><ul>@for (item of items; track $index) {<li><a [href]="item.href" [attr.aria-current]="item.current ? 'page' : null">@if (variant === 'mobile' && item.icon) {<span class="nq-icon" [attr.data-icon]="item.icon" aria-hidden="true"></span>}<span>{{ item.label }}</span></a></li>}</ul></nav>`})
export class NqSecondaryNavComponent { @Input() variant: 'default' | 'mobile' = 'default'; @Input() items: readonly NqSecondaryNavItem[] = []; @Input() label = 'التنقل الثانوي'; }
let nextLayoutId = 0;
@Component({selector: 'nq-portal-layout', standalone: true, imports: [NqPortalHeaderComponent, NqPortalFooterComponent, NqBreadcrumbComponent, NqSecondaryNavComponent], template: `
  <div class="nq-portal-layout" [attr.lang]="lang" [attr.dir]="dir">
    <nq-portal-header [brand]="brand" [homeHref]="homeHref" [links]="links" [mainId]="mainId" [skipLabel]="skipLabel" [menuLabel]="menuLabel" [navigationLabel]="navigationLabel"><ng-content select="[nqBrand]" ngProjectAs="[nqBrand]" /><ng-content select="[nqPortalActions]" /></nq-portal-header>
    @if (secondaryNavigation.length) {<nq-secondary-nav [items]="secondaryNavigation" [label]="secondaryLabel" />}
    <main [id]="mainId" tabindex="-1" class="nq-portal-layout-main nq-container">@if (breadcrumbs.length) {<nq-breadcrumb [items]="breadcrumbs" [label]="breadcrumbLabel" />}<ng-content /></main>
    <nq-portal-footer [brand]="brand" [links]="footerLinks" [copyright]="copyright" [navigationLabel]="footerLabel"><ng-content select="[nqPortalFooter]" /></nq-portal-footer>
  </div>`})
export class NqPortalLayoutComponent {
  @Input({required: true}) brand = ''; @Input() homeHref = '/'; @Input() lang = 'ar'; @Input() dir: 'rtl' | 'ltr' = 'rtl';
  @Input() mainId = `nq-portal-main-${++nextLayoutId}`; @Input() links: readonly NqPortalNavItem[] = [];
  @Input() secondaryNavigation: readonly NqLinkItem[] = []; @Input() footerLinks: readonly NqLinkItem[] = []; @Input() breadcrumbs: readonly NqBreadcrumbItem[] = []; @Input() copyright = '';
  @Input() skipLabel = 'انتقل إلى المحتوى'; @Input() menuLabel = 'القائمة'; @Input() navigationLabel = 'التنقل الرئيسي';
  @Input() secondaryLabel = 'التنقل الثانوي'; @Input() breadcrumbLabel = 'مسار التنقل'; @Input() footerLabel = 'روابط التذييل';
}
