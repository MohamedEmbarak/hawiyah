<script setup lang="ts">
import { computed, ref } from 'vue';
import { Accordion, Button, MobileTopBar, PortalLayout, SecondaryNav, ServiceCard } from '@nasaq/vue';
import logo from '../../../brand/assets/nasaq-wordmark.svg';
const english = ref(false); const t = (ar: string, en: string) => english.value ? en : ar;
const links = computed(() => [{ label: t('الخدمات', 'Services'), href: '#services', current: true }, { label: t('تواصل معنا', 'Contact us'), href: '#contact' }]);
</script>
<template>
  <PortalLayout brand="نسق" :lang="english ? 'en' : 'ar'" :dir="english ? 'ltr' : 'rtl'" :links="links" :secondary-navigation="[links[0]!]" main-id="portal-content"
    :skip-label="t('انتقل إلى المحتوى', 'Skip to content')" :menu-label="t('القائمة', 'Menu')" :navigation-label="t('التنقل الرئيسي', 'Main navigation')" :secondary-label="t('التنقل الثانوي', 'Secondary navigation')" :breadcrumb-label="t('مسار التنقل', 'Breadcrumb')" :footer-label="t('روابط التذييل', 'Footer links')"
    :breadcrumbs="[{ label: t('الرئيسية', 'Home'), href: '/' }, { label: t('الخدمات', 'Services'), current: true }]" :footer-links="[{ label: t('الخصوصية', 'Privacy'), href: '#privacy' }]">
    <template #logo><img :src="logo" alt="نسق" width="96" height="40" /></template>
    <template #actions><Button variant="ghost" @click="english = !english">{{ english ? 'العربية' : 'English' }}</Button></template>
    <section id="services" class="nq-stack"><h1>{{ t('الخدمات', 'Services') }}</h1><h2>{{ t('الخدمات المتاحة', 'Available services') }}</h2><ServiceCard :title="t('دليل الخدمات', 'Service directory')" :description="t('اكتشف خدمات الجهة ومتطلبات التقديم.', 'Explore services and application requirements.')" href="#contact" :action-label="t('عرض الخدمة', 'View service')" /></section>
    <section id="contact"><h2>{{ t('تواصل معنا', 'Contact us') }}</h2><p>{{ t('مثال توضيحي بدون إرسال بيانات.', 'Demonstration only; no data is submitted.') }}</p></section>
    <section data-testid="mobile-top-bar-showcase"><MobileTopBar :heading-level="2" :title="t('طلباتي','My requests')" :subtitle="t('تابع طلباتك','Track your applications')" back-href="#services" :back-label="t('رجوع','Back')"><template #actions><a class="nq-button" data-variant="ghost" href="#contact" :aria-label="t('بحث','Search')"><span class="nq-icon" data-icon="search-01" aria-hidden="true" /></a></template></MobileTopBar></section>
    <SecondaryNav variant="mobile" :label="t('تنقل الجوال', 'Mobile navigation')" :items="[
      {label:t('الرئيسية','Home'),href:'#portal-content',current:true,icon:'home-01'},
      {label:t('الخدمات','Services'),href:'#services',icon:'search-01'},
      {label:t('المزيد','More'),href:'#contact',icon:'menu-01'}]" />
    <section data-testid="accordion-showcase"><h2>{{ t('أسئلة شائعة','Frequently asked questions') }}</h2><Accordion exclusive :items="[
      {value:'one',title:t('كيف أبدأ؟','How do I start?'),content:t('اختر الخدمة وراجع المتطلبات ثم ابدأ الطلب.','Choose a service, review the requirements, then start your application.')},
      {value:'two',title:t('هل يمكنني حفظ الطلب؟','Can I save my application?'),content:t('نعم، يدير التطبيق حفظ مسودة الطلب.','Yes, draft saving is managed by your application.')}]" /></section>
    <template #footer><p>{{ t('نموذج محلي لهيكل البوابة', 'Local portal shell example') }}</p></template>
  </PortalLayout>
</template>
