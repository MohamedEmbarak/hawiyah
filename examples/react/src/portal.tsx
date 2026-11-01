import { useState } from 'react';
import { Button, PortalLayout, ServiceCard } from '@nasaq/react';
import logo from '../../../brand/assets/nasaq-wordmark.svg';
import footerLogo from '../../../brand/assets/nasaq-wordmark-white.svg';

export function PortalExample() {
  const [english, setEnglish] = useState(false); const t = (ar: string, en: string) => english ? en : ar;
  const links = [{ label: t('الخدمات', 'Services'), href: '#services', current: true }, { label: t('تواصل معنا', 'Contact us'), href: '#contact' }];
  return <PortalLayout brand={<img src={logo} alt="نسق" width="96" height="40" />} lang={english ? 'en' : 'ar'} dir={english ? 'ltr' : 'rtl'}
    mainId="portal-content" skipLabel={t('انتقل إلى المحتوى', 'Skip to content')} breadcrumbLabel={t('مسار التنقل', 'Breadcrumb')} secondaryLabel={t('التنقل الثانوي', 'Secondary navigation')}
    headerProps={{ brandHref: '/', navigation: links, menuLabel: t('القائمة', 'Menu'), navigationLabel: t('التنقل الرئيسي', 'Main navigation'), actions: <Button variant="ghost" onClick={() => setEnglish(!english)}>{english ? 'العربية' : 'English'}</Button> }}
    secondaryNavigation={[links[0]!]} breadcrumbs={[{ label: t('الرئيسية', 'Home'), href: '/' }, { label: t('الخدمات', 'Services'), current: true }]}
    footerProps={{ brand: <img src={footerLogo} alt="نسق" width="96" height="40" />, linksLabel: t('روابط التذييل', 'Footer links'), links: [{ label: t('الخصوصية', 'Privacy'), href: '#privacy' }], legal: t('نموذج محلي لهيكل البوابة', 'Local portal shell example') }}>
    <section id="services" className="nq-stack"><h1>{t('الخدمات', 'Services')}</h1><h2>{t('الخدمات المتاحة', 'Available services')}</h2><ServiceCard title={t('دليل الخدمات', 'Service directory')} description={t('اكتشف خدمات الجهة ومتطلبات التقديم.', 'Explore services and application requirements.')} href="#contact" actionLabel={t('عرض الخدمة', 'View service')} /></section>
    <section id="contact"><h2>{t('تواصل معنا', 'Contact us')}</h2><p>{t('مثال توضيحي بدون إرسال بيانات.', 'Demonstration only; no data is submitted.')}</p></section>
  </PortalLayout>;
}
