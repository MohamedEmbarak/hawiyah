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
    `<a class="nq-link${extra}" href="${item.href}"${item.current ? ' aria-current="page"' : ''}>${item.label}</a>`;
  return portalMenuItems(locale).map(item => {
    if (!item.groups) return `<li>${anchor(item)}</li>`;
    const groups = item.groups.map(group =>
      `<section class="nq-portal-branch-group">${group.label ? `<h2>${group.label}</h2>` : ''}<ul>${group.links.map(child => `<li>${anchor(child)}</li>`).join('')}</ul></section>`
    ).join('');
    const current = item.groups.some(group => group.links.some(link => link.current));
    return `<li><details class="nq-portal-branch" data-nq-portal-branch${current ? ' data-current="true"' : ''}>
      <summary>${item.label}</summary>
      <div class="nq-portal-branch-panel">${anchor(item, ' nq-portal-branch-overview')}${groups}</div>
    </details></li>`;
  }).join('');
}

export function portalMenuMarkup(locale: Locale) {
  const ar = locale === 'ar';
  return `<header class="nq-portal-header" data-nq="portal-header"><div class="nq-portal-header-inner">
    <a class="nq-portal-brand" href="#home"><span class="nq-portal-wordmark" role="img" aria-label="نسق"></span></a>
    <button class="nq-button nq-portal-menu-toggle" type="button" data-nq-portal-toggle>${ar ? 'القائمة' : 'Menu'}</button>
    <nav aria-label="${ar ? 'التنقل الرئيسي' : 'Main navigation'}" data-nq-portal-navigation><ul>${portalMenuList(locale)}</ul></nav>
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
    vanillaScript: `import { createPortalHeader } from '@nasaq/vanilla';\nconst header = createPortalHeader(document.querySelector('[data-nq="portal-header"]'));\nwindow.addEventListener('pagehide', () => header.destroy(), { once: true });`,
    react: `import { PortalHeader } from '@nasaq/react';\nconst links = ${links};\nexport default function SiteHeader() {\n  return <PortalHeader brand="نسق" brandHref="#home" navigation={links} navigationLabel="${label}" menuLabel="${menu}" />;\n}`,
    vue: `<script setup>\nimport { PortalHeader } from '@nasaq/vue';\nconst links = ${links};\n</script>\n<template><PortalHeader brand="نسق" home-href="#home" :links="links" nav-label="${label}" menu-label="${menu}" /></template>`,
    angular: `import { Component } from '@angular/core';\nimport { NqPortalHeaderComponent } from '@nasaq/angular';\n@Component({ selector: 'app-site-header', standalone: true, imports: [NqPortalHeaderComponent], template: \`<nq-portal-header brand="نسق" homeHref="#home" mainId="" [links]="links" navigationLabel="${label}" menuLabel="${menu}" />\` })\nexport class SiteHeader { readonly links = ${links}; }`,
  };
}
