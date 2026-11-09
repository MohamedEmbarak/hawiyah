import type { Locale } from './data';

type Destination = { label: string; href: string; current?: boolean };
type Branch = Destination & { groups?: { label?: string; links: Destination[] }[] };

// The example owns its routes. The header receives the current page explicitly.
export function portalMenuItems(locale: Locale): Branch[] {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  return [
    { label: t('Services', 'الخدمات'), href: '#all-services', groups: [
      { label: t('For individuals', 'للأفراد'), links: [
        { label: t('Request a permit', 'طلب تصريح'), href: '#permit', current: true },
        { label: t('Track a request', 'متابعة طلب'), href: '#track' },
      ] },
      { label: t('For businesses', 'للمنشآت'), links: [
        { label: t('Register a business', 'تسجيل منشأة'), href: '#register-business' },
      ] },
    ] },
    { label: t('Support', 'الدعم'), href: '#support', groups: [{ links: [
      { label: t('Common questions', 'الأسئلة الشائعة'), href: '#questions' },
      { label: t('Contact us', 'اتصل بنا'), href: '#contact' },
    ] }] },
    { label: t('About the platform', 'عن المنصة'), href: '#about' },
  ];
}

export function portalMenuList(locale: Locale) {
  const anchor = (item: Destination, extra = '') =>
    `<a class="hw-link${extra}" href="${item.href}"${item.current ? ' aria-current="page"' : ''}>${item.label}</a>`;
  return portalMenuItems(locale).map(item => {
    if (!item.groups) return `<li>${anchor(item)}</li>`;
    const groups = item.groups.map(group =>
      `<section class="hw-portal-branch-group">${group.label ? `<h2>${group.label}</h2>` : ''}<ul>${group.links.map(child => `<li>${anchor(child)}</li>`).join('')}</ul></section>`
    ).join('');
    const current = item.groups.some(group => group.links.some(link => link.current));
    return `<li><details class="hw-portal-branch" data-hw-portal-branch${current ? ' data-current="true"' : ''}>
      <summary>${item.label}</summary>
      <div class="hw-portal-branch-panel">${anchor(item, ' hw-portal-branch-overview')}${groups}</div>
    </details></li>`;
  }).join('');
}

export function portalMenuMarkup(locale: Locale) {
  const ar = locale === 'ar';
  return `<header class="hw-portal-header" data-hw="portal-header"><div class="hw-portal-header-inner">
    <a class="hw-portal-brand" href="#home"><span class="hw-portal-wordmark" role="img" aria-label="هوية"></span></a>
    <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle>${ar ? 'القائمة' : 'Menu'}</button>
    <nav aria-label="${ar ? 'التنقل الرئيسي' : 'Main navigation'}" data-hw-portal-navigation><ul>${portalMenuList(locale)}</ul></nav>
  </div></header>`;
}

export function portalMenuRecipe(locale: Locale) {
  const ar = locale === 'ar';
  const links = JSON.stringify(portalMenuItems(locale), null, 2);
  const label = ar ? 'التنقل الرئيسي' : 'Main navigation';
  const menu = ar ? 'القائمة' : 'Menu';
  return {
    title: ar ? 'روابط تنقل مجمّعة' : 'Grouped navigation links',
    markup: portalMenuMarkup(locale),
    vanillaScript: `import { createPortalHeader } from '@hawiyah/vanilla';\nconst header = createPortalHeader(document.querySelector('[data-hw="portal-header"]'));\nwindow.addEventListener('pagehide', () => header.destroy(), { once: true });`,
    react: `import { PortalHeader } from '@hawiyah/react';\nconst links = ${links};\nexport default function SiteHeader() {\n  return <PortalHeader brand="هوية" brandHref="#home" navigation={links} navigationLabel="${label}" menuLabel="${menu}" />;\n}`,
    vue: `<script setup>\nimport { PortalHeader } from '@hawiyah/vue';\nconst links = ${links};\n</script>\n<template><PortalHeader brand="هوية" home-href="#home" :links="links" nav-label="${label}" menu-label="${menu}" /></template>`,
    angular: `import { Component } from '@angular/core';\nimport { HwPortalHeaderComponent } from '@hawiyah/angular';\n@Component({ selector: 'app-site-header', standalone: true, imports: [HwPortalHeaderComponent], template: \`<hw-portal-header brand="هوية" homeHref="#home" mainId="" [links]="links" navigationLabel="${label}" menuLabel="${menu}" />\` })\nexport class SiteHeader { readonly links = ${links}; }`,
  };
}
