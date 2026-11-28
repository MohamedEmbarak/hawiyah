import { useState } from 'react';
import { Accordion, Button, MobileTopBar, NavigationDrawer, PortalLayout, SecondaryNav, ServiceCard } from '@hawiyah/react';
import logo from '../../../brand/assets/hawiyah-wordmark.svg';
import footerLogo from '../../../brand/assets/hawiyah-wordmark-white.svg';

export function PortalExample() {
  const [english, setEnglish] = useState(false); const t = (ar: string, en: string) => english ? en : ar;
  const links = [{ label: t('الخدمات', 'Services'), href: '#services', current: true }, { label: t('تواصل معنا', 'Contact us'), href: '#contact' }];
  return <PortalLayout brand={<img src={logo} alt="هوية" width="96" height="40" />} lang={english ? 'en' : 'ar'} dir={english ? 'ltr' : 'rtl'}
    mainId="portal-content" menuLabel={t('القائمة', 'Menu')} navigationLabel={t('التنقل الرئيسي', 'Main navigation')} footerLabel={t('روابط التذييل', 'Footer links')} skipLabel={t('انتقل إلى المحتوى', 'Skip to content')} breadcrumbLabel={t('مسار التنقل', 'Breadcrumb')} secondaryLabel={t('التنقل الثانوي', 'Secondary navigation')}
    headerProps={{ homeHref: '/', links, actions: <Button variant="ghost" onClick={() => setEnglish(!english)}>{english ? 'العربية' : 'English'}</Button> }}
    secondaryNavigation={[links[0]!]} breadcrumbs={[{ label: t('الرئيسية', 'Home'), href: '/' }, { label: t('الخدمات', 'Services'), current: true }]}
    footerProps={{ brand: <img src={footerLogo} alt="هوية" width="96" height="40" />, externalLabel: t('يفتح في نافذة جديدة', 'opens in a new window'), links: [{ label: t('الخصوصية', 'Privacy'), href: '#privacy' }], legal: t('نموذج محلي لهيكل البوابة', 'Local portal shell example') }}>
    <section id="services" className="hw-stack"><h1>{t('الخدمات', 'Services')}</h1><h2>{t('الخدمات المتاحة', 'Available services')}</h2><ServiceCard title={t('دليل الخدمات', 'Service directory')} description={t('اكتشف خدمات الجهة ومتطلبات التقديم.', 'Explore services and application requirements.')} href="#contact" actionLabel={t('عرض الخدمة', 'View service')} /></section>
    <section id="contact"><h2>{t('تواصل معنا', 'Contact us')}</h2><p>{t('مثال توضيحي بدون إرسال بيانات.', 'Demonstration only; no data is submitted.')}</p></section>
    <section data-testid="mobile-top-bar-showcase"><MobileTopBar headingLevel={2} title={t('طلباتي','My requests')} subtitle={t('تابع طلباتك','Track your applications')} backHref="#services" backLabel={t('رجوع','Back')} actions={<a className="hw-button" data-variant="ghost" href="#contact" aria-label={t('بحث','Search')}><span className="hw-icon" data-icon="search-01" aria-hidden="true" /></a>} /></section>
    <section data-testid="navigation-drawer-showcase"><NavigationDrawer title={t('التنقل','Navigation')} navigationLabel={t('التنقل الرئيسي','Main navigation')} closeLabel={t('إغلاق القائمة','Close navigation')} trigger={<Button data-testid="navigation-drawer-trigger">{t('فتح التنقل','Open navigation')}</Button>} userContent={<p>{t('مرحبًا بك في هوية','Welcome to Hawiyah')}</p>} items={[
      {id:'home',label:t('الرئيسية','Home'),href:'#portal-content',current:true,icon:'home-01'},
      {id:'services',label:t('الخدمات','Services'),children:[{id:'directory',label:t('دليل الخدمات','Service directory'),href:'#services'},{id:'contact',label:t('تواصل معنا','Contact us'),href:'#contact'}]},
      {id:'disabled',label:t('قريبًا','Coming soon'),href:'#disabled',disabled:true}]} /></section>
    <SecondaryNav variant="mobile" label={t('تنقل الجوال', 'Mobile navigation')} items={[
      {label:t('الرئيسية','Home'),href:'#portal-content',current:true,icon:'home-01'},
      {label:t('الخدمات','Services'),href:'#services',icon:'search-01'},
      {label:t('المزيد','More'),href:'#contact',icon:'menu-01'}]} />
    <section data-testid="accordion-showcase"><h2>{t('أسئلة شائعة','Frequently asked questions')}</h2><Accordion exclusive items={[
      {value:'one',title:t('كيف أبدأ؟','How do I start?'),content:<p>{t('اختر الخدمة وراجع المتطلبات ثم ابدأ الطلب.','Choose a service, review the requirements, then start your application.')}</p>},
      {value:'two',title:t('هل يمكنني حفظ الطلب؟','Can I save my application?'),content:<p>{t('نعم، يدير التطبيق حفظ مسودة الطلب.','Yes, draft saving is managed by your application.')}</p>}]} /></section>
  </PortalLayout>;
}
