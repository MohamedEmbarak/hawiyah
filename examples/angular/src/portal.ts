import { Component } from '@angular/core';
import { NqButtonDirective, NqPortalLayoutComponent, NqSecondaryNavComponent, NqServiceCardComponent } from '@nasaq/angular';
import logo from '../../../brand/assets/nasaq-wordmark.svg';

@Component({selector: 'app-root', standalone: true, imports: [NqButtonDirective, NqPortalLayoutComponent, NqSecondaryNavComponent, NqServiceCardComponent], template: `
  <nq-portal-layout brand="نسق" [lang]="english ? 'en' : 'ar'" [dir]="english ? 'ltr' : 'rtl'" [links]="links" [secondaryNavigation]="[links[0]]" mainId="portal-content"
    [skipLabel]="t('انتقل إلى المحتوى', 'Skip to content')" [menuLabel]="t('القائمة', 'Menu')" [navigationLabel]="t('التنقل الرئيسي', 'Main navigation')" [secondaryLabel]="t('التنقل الثانوي', 'Secondary navigation')" [breadcrumbLabel]="t('مسار التنقل', 'Breadcrumb')" [footerLabel]="t('روابط التذييل', 'Footer links')"
    [breadcrumbs]="[{ label: t('الرئيسية', 'Home'), href: '/' }, { label: t('الخدمات', 'Services') }]" [footerLinks]="[{ label: t('الخصوصية', 'Privacy'), href: '#privacy' }]">
    <img nqBrand [src]="logo" alt="" width="96" height="40" />
    <button nqPortalActions nqButton variant="ghost" type="button" (click)="english = !english">{{ english ? 'العربية' : 'English' }}</button>
    <section id="services" class="nq-stack"><h1>{{ t('الخدمات', 'Services') }}</h1><h2>{{ t('الخدمات المتاحة', 'Available services') }}</h2><nq-service-card [title]="t('دليل الخدمات', 'Service directory')" [description]="t('اكتشف خدمات الجهة ومتطلبات التقديم.', 'Explore services and application requirements.')" href="#contact" [actionLabel]="t('عرض الخدمة', 'View service')" /></section>
    <section id="contact"><h2>{{ t('تواصل معنا', 'Contact us') }}</h2><p>{{ t('مثال توضيحي بدون إرسال بيانات.', 'Demonstration only; no data is submitted.') }}</p></section>
    <nq-secondary-nav variant="mobile" [label]="t('تنقل الجوال','Mobile navigation')" [items]="[
      {label:t('الرئيسية','Home'),href:'#portal-content',current:true,icon:'home-01'},
      {label:t('الخدمات','Services'),href:'#services',icon:'search-01'},
      {label:t('المزيد','More'),href:'#contact',icon:'menu-01'}]" />
    <p nqPortalFooter>{{ t('نموذج محلي لهيكل البوابة', 'Local portal shell example') }}</p>
  </nq-portal-layout>`})
export class PortalExampleComponent {
  english = false; logo = logo;
  t(ar: string, en: string) { return this.english ? en : ar; }
  get links() { return [{ label: this.t('الخدمات', 'Services'), href: '#services', current: true }, { label: this.t('تواصل معنا', 'Contact us'), href: '#contact' }]; }
}
