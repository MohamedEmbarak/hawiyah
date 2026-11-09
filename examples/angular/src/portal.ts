import { Component } from '@angular/core';
import { HwAccordionComponent, HwButtonDirective, HwMobileTopBarComponent, HwNavigationDrawerComponent, HwPortalLayoutComponent, HwSecondaryNavComponent, HwServiceCardComponent } from '@hawiyah/angular';
import logo from '../../../brand/assets/hawiyah-wordmark.svg';

@Component({selector: 'app-root', standalone: true, imports: [HwAccordionComponent, HwButtonDirective, HwMobileTopBarComponent, HwNavigationDrawerComponent, HwPortalLayoutComponent, HwSecondaryNavComponent, HwServiceCardComponent], template: `
  <hw-portal-layout brand="هوية" [lang]="english ? 'en' : 'ar'" [dir]="english ? 'ltr' : 'rtl'" [links]="links" [secondaryNavigation]="[links[0]]" mainId="portal-content"
    [skipLabel]="t('انتقل إلى المحتوى', 'Skip to content')" [menuLabel]="t('القائمة', 'Menu')" [navigationLabel]="t('التنقل الرئيسي', 'Main navigation')" [secondaryLabel]="t('التنقل الثانوي', 'Secondary navigation')" [breadcrumbLabel]="t('مسار التنقل', 'Breadcrumb')" [footerLabel]="t('روابط التذييل', 'Footer links')"
    [breadcrumbs]="[{ label: t('الرئيسية', 'Home'), href: '/' }, { label: t('الخدمات', 'Services') }]" [footerLinks]="[{ label: t('الخصوصية', 'Privacy'), href: '#privacy' }]">
    <img hwBrand [src]="logo" alt="" width="96" height="40" />
    <button hwPortalActions hwButton variant="ghost" type="button" (click)="english = !english">{{ english ? 'العربية' : 'English' }}</button>
    <section id="services" class="hw-stack"><h1>{{ t('الخدمات', 'Services') }}</h1><h2>{{ t('الخدمات المتاحة', 'Available services') }}</h2><hw-service-card [title]="t('دليل الخدمات', 'Service directory')" [description]="t('اكتشف خدمات الجهة ومتطلبات التقديم.', 'Explore services and application requirements.')" href="#contact" [actionLabel]="t('عرض الخدمة', 'View service')" /></section>
    <section id="contact"><h2>{{ t('تواصل معنا', 'Contact us') }}</h2><p>{{ t('مثال توضيحي بدون إرسال بيانات.', 'Demonstration only; no data is submitted.') }}</p></section>
    <section data-testid="mobile-top-bar-showcase"><hw-mobile-top-bar [headingLevel]="2" [title]="t('طلباتي','My requests')" [subtitle]="t('تابع طلباتك','Track your applications')" backHref="#services" [backLabel]="t('رجوع','Back')"><a hwTopBarActions class="hw-button" data-variant="ghost" href="#contact" [attr.aria-label]="t('بحث','Search')"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span></a></hw-mobile-top-bar></section>
    <section data-testid="navigation-drawer-showcase"><button #drawerTrigger hwButton data-testid="navigation-drawer-trigger" type="button" (click)="navigation.show(drawerTrigger)">{{ t('فتح التنقل','Open navigation') }}</button><hw-navigation-drawer #navigation [title]="t('التنقل','Navigation')" [navigationLabel]="t('التنقل الرئيسي','Main navigation')" [closeLabel]="t('إغلاق القائمة','Close navigation')" [items]="[
      {id:'home',label:t('الرئيسية','Home'),href:'#portal-content',current:true,icon:'home-01'},
      {id:'services',label:t('الخدمات','Services'),children:[{id:'directory',label:t('دليل الخدمات','Service directory'),href:'#services'},{id:'contact',label:t('تواصل معنا','Contact us'),href:'#contact'}]},
      {id:'disabled',label:t('قريبًا','Coming soon'),href:'#disabled',disabled:true}]"><p hwNavigationDrawerUser>{{ t('مرحبًا بك في هوية','Welcome to Hawiyah') }}</p></hw-navigation-drawer></section>
    <hw-secondary-nav variant="mobile" [label]="t('تنقل الجوال','Mobile navigation')" [items]="[
      {label:t('الرئيسية','Home'),href:'#portal-content',current:true,icon:'home-01'},
      {label:t('الخدمات','Services'),href:'#services',icon:'search-01'},
      {label:t('المزيد','More'),href:'#contact',icon:'menu-01'}]" />
    <section data-testid="accordion-showcase"><h2>{{ t('أسئلة شائعة','Frequently asked questions') }}</h2><hw-accordion [exclusive]="true" [items]="[
      {id:'one',title:t('كيف أبدأ؟','How do I start?'),content:t('اختر الخدمة وراجع المتطلبات ثم ابدأ الطلب.','Choose a service, review the requirements, then start your application.')},
      {id:'two',title:t('هل يمكنني حفظ الطلب؟','Can I save my application?'),content:t('نعم، يدير التطبيق حفظ مسودة الطلب.','Yes, draft saving is managed by your application.')}]" /></section>
    <p hwPortalFooter>{{ t('نموذج محلي لهيكل البوابة', 'Local portal shell example') }}</p>
  </hw-portal-layout>`})
export class PortalExampleComponent {
  english = false; logo = logo;
  t(ar: string, en: string) { return this.english ? en : ar; }
  get links() { return [{ label: this.t('الخدمات', 'Services'), href: '#services', current: true }, { label: this.t('تواصل معنا', 'Contact us'), href: '#contact' }]; }
}
