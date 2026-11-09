import { Component, Input } from '@angular/core';
import { HwPortalFooterComponent, HwPortalHeaderComponent } from './content';
import type { HwLinkItem, HwPortalNavItem } from './content';
import { HwBreadcrumbComponent } from './navigation';
import type { HwBreadcrumbItem } from './navigation';

export interface HwSecondaryNavItem extends HwLinkItem { icon?: string }
@Component({selector: 'hw-secondary-nav', standalone: true, template: `<nav class="hw-secondary-nav" [attr.aria-label]="label" [attr.data-variant]="variant"><ul>@for (item of items; track $index) {<li><a [href]="item.href" [attr.aria-current]="item.current ? 'page' : null">@if (variant === 'mobile' && item.icon) {<span class="hw-icon" [attr.data-icon]="item.icon" aria-hidden="true"></span>}<span>{{ item.label }}</span></a></li>}</ul></nav>`})
export class HwSecondaryNavComponent { @Input() variant: 'default' | 'mobile' = 'default'; @Input() items: readonly HwSecondaryNavItem[] = []; @Input() label = 'التنقل الثانوي'; }
let nextLayoutId = 0;
@Component({selector: 'hw-portal-layout', standalone: true, imports: [HwPortalHeaderComponent, HwPortalFooterComponent, HwBreadcrumbComponent, HwSecondaryNavComponent], template: `
  <div class="hw-portal-layout" [attr.lang]="lang" [attr.dir]="dir">
    <hw-portal-header [brand]="brand" [homeHref]="homeHref" [links]="links" [mainId]="mainId" [skipLabel]="skipLabel" [menuLabel]="menuLabel" [navigationLabel]="navigationLabel"><ng-content select="[hwBrand]" ngProjectAs="[hwBrand]" /><ng-content select="[hwPortalActions]" /></hw-portal-header>
    @if (secondaryNavigation.length) {<hw-secondary-nav [items]="secondaryNavigation" [label]="secondaryLabel" />}
    <main [id]="mainId" tabindex="-1" class="hw-portal-layout-main hw-container">@if (breadcrumbs.length) {<hw-breadcrumb [items]="breadcrumbs" [label]="breadcrumbLabel" />}<ng-content /></main>
    <hw-portal-footer [brand]="brand" [links]="footerLinks" [copyright]="copyright" [navigationLabel]="footerLabel"><ng-content select="[hwPortalFooter]" /></hw-portal-footer>
  </div>`})
export class HwPortalLayoutComponent {
  @Input({required: true}) brand = ''; @Input() homeHref = '/'; @Input() lang = 'ar'; @Input() dir: 'rtl' | 'ltr' = 'rtl';
  @Input() mainId = `hw-portal-main-${++nextLayoutId}`; @Input() links: readonly HwPortalNavItem[] = [];
  @Input() secondaryNavigation: readonly HwLinkItem[] = []; @Input() footerLinks: readonly HwLinkItem[] = []; @Input() breadcrumbs: readonly HwBreadcrumbItem[] = []; @Input() copyright = '';
  @Input() skipLabel = 'انتقل إلى المحتوى'; @Input() menuLabel = 'القائمة'; @Input() navigationLabel = 'التنقل الرئيسي';
  @Input() secondaryLabel = 'التنقل الثانوي'; @Input() breadcrumbLabel = 'مسار التنقل'; @Input() footerLabel = 'روابط التذييل';
}
