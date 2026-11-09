import type { LayoutProps } from '@hawiyah/core';
import type { Locale } from './data';

export const layoutComponents = {
  container: 'Container', stack: 'Stack', inline: 'Inline', grid: 'Grid',
  columns: 'Columns', sidebar: 'Sidebar', center: 'Center', spacer: 'Spacer',
  'aspect-ratio': 'AspectRatio', section: 'Section', 'app-shell': 'AppShell',
  'page-header': 'PageHeader',
} as const;

export type LayoutId = keyof typeof layoutComponents;
type Framework = 'react' | 'vue' | 'angular';

export function isLayoutId(id: string): id is LayoutId {
  return Object.hasOwn(layoutComponents, id);
}

export const layoutProjectCss = `
.layout-panel {
  min-inline-size: 0;
  padding: var(--hw-space-4);
  border: 1px solid var(--hw-color-border);
  border-radius: var(--hw-radius-md);
  background: var(--hw-color-surface);
  color: var(--hw-color-text);
  overflow-wrap: anywhere;
}
.layout-panel > :first-child { margin-block-start: 0; }
.layout-panel > :last-child { margin-block-end: 0; }
.demo .hw-center { min-block-size: 10rem; }
.demo .hw-aspect-ratio > svg { display: block; inline-size: 100%; block-size: 100%; background: var(--hw-color-surface-muted); color: var(--hw-color-primary-text); }
.demo .hw-app-shell { min-block-size: 24rem; }
.demo .hw-app-shell-header, .demo .hw-app-shell-footer { padding: var(--hw-space-4); }
`;

function nativeAttributes(framework: Framework, options: LayoutProps) {
  return Object.entries(options).map(([key, value]) => {
    const name = framework === 'vue' ? key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`) : key;
    if (typeof value === 'string') return `${name}="${value}"`;
    const expression = JSON.stringify(value);
    if (framework === 'react') return `${name}={${expression}}`;
    return framework === 'vue' ? `:${name}='${expression}'` : `[${name}]='${expression}'`;
  }).join(' ');
}

/** Generate the app's composition using the selected adapter's public template syntax. */
export function layoutProjectMarkup(id: LayoutId, framework: Framework, locale: Locale) {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const classAttr = framework === 'react' ? 'className' : 'class';
  const name = framework === 'angular' ? `hw-${id}` : layoutComponents[id];
  const panel = (heading: string, description: string) =>
    `<article ${classAttr}="layout-panel"><h2>${heading}</h2><p>${description}</p></article>`;
  const render = (props: LayoutProps, children: string, extra = '') => {
    const attributes = [nativeAttributes(framework, props), extra].filter(Boolean).join(' ');
    const tag = `<${name}${attributes ? ` ${attributes}` : ''}`;
    return children ? `${tag}>\n  ${children}\n</${name}>` : `${tag} />`;
  };

  const requests = t('My requests', 'طلباتي');
  const summary = panel(t('Request summary', 'ملخص الطلب'), t('2 requests are ready for review.', 'يوجد طلبان جاهزان للمراجعة.'));
  const documents = panel(t('Supporting documents', 'المستندات الداعمة'), t('Review the documents attached to the request.', 'راجع المستندات المرفقة بالطلب.'));
  const contact = panel(t('Contact details', 'بيانات التواصل'), t('Check the preferred contact channel before submitting.', 'تحقق من وسيلة التواصل المفضلة قبل الإرسال.'));
  const responsiveGap = { base: 2, md: 4 } as const;

  switch (id) {
    case 'container':
      return render({ maxWidth: '36rem', padding: { base: 2, md: 4 } }, summary);
    case 'stack':
      return render({ gap: responsiveGap, align: 'stretch' }, [summary, documents, contact].join('\n  '));
    case 'inline': {
      const badges = [
        ['success', t('Complete', 'مكتمل')], ['info', t('In review', 'قيد المراجعة')], ['neutral', t('Draft', 'مسودة')],
      ].map(([tone, text]) => `<span ${classAttr}="hw-badge" data-tone="${tone}">${text}</span>`);
      return render({ gap: 2, wrap: true, align: 'center' }, badges.join('\n  '));
    }
    case 'grid':
      return render({ columns: { base: 1, sm: 2, lg: 3 }, gap: responsiveGap }, [summary, documents, contact].join('\n  '));
    case 'columns':
      return render({ columns: { base: 1, md: 2 }, gap: 4 }, [summary, contact].join('\n  '));
    case 'sidebar': {
      const aside = t('Request tools', 'أدوات الطلب');
      const support = t('Service hours and contact information', 'أوقات الخدمة ومعلومات التواصل');
      const asideContent = `<h2>${aside}</h2><p>${support}</p>`;
      const rail = framework === 'angular'
        ? `<div hwSidebar data-layout-slot="sidebar" ${classAttr}="layout-panel">${asideContent}</div>`
        : `<aside data-layout-slot="sidebar" ${classAttr}="layout-panel">${asideContent}</aside>`;
      return render({ side: 'end', collapseAt: 'md', sidebarWidth: '10rem', gap: 3 }, `${rail}\n  <div data-layout-slot="content">${summary}</div>`);
    }
    case 'center':
      return render({ padding: 4 }, panel(t('No pending requests', 'لا توجد طلبات معلقة'), t('New requests will appear here.', 'ستظهر الطلبات الجديدة هنا.')));
    case 'spacer':
      return `<div ${classAttr}="hw-inline">\n  <strong>${requests}</strong>\n  ${render({ gap: 2 }, '', 'aria-hidden="true"')}\n  <span>${t('2 total', 'الإجمالي 2')}</span>\n</div>`;
    case 'aspect-ratio': {
      const label = t('Sample document illustration', 'رسم توضيحي لمستند');
      const illustration = `<svg viewBox="0 0 160 90" role="img" aria-label="${label}"><rect x="54" y="10" width="52" height="70" rx="4" fill="none" stroke="currentColor" /><path d="M64 30h32M64 40h32M64 50h24M64 60h28" stroke="currentColor" /></svg>`;
      return render({ ratio: 16 / 9 }, illustration);
    }
    case 'section': {
      const title = t('Before you apply', 'قبل التقديم');
      const text = t('Prepare your identity details and supporting documents.', 'جهّز بيانات الهوية والمستندات الداعمة.');
      return render({ padding: { base: 3, md: 6 } }, `<h2>${title}</h2><p>${text}</p>`, `${framework === 'angular' ? 'label' : 'aria-label'}="${title}"`);
    }
    case 'app-shell': {
      const skip = t('Skip to workspace', 'انتقل إلى مساحة العمل');
      const header = t('Service workspace', 'مساحة الخدمات');
      const aside = t('Request overview', 'نظرة عامة على الطلبات');
      const footer = t('Service support', 'دعم الخدمات');
      const main = `<section data-layout-slot="content"><h1>${requests}</h1><p>${t('Track the progress of your requests here.', 'تابع تقدم طلباتك هنا.')}</p></section>`;
      if (framework === 'react') return `<AppShell\n  mainId="service-workspace"\n  skipLabel="${skip}"\n  header={<header data-layout-slot="header"><strong>${header}</strong></header>}\n  sidebar={<p data-layout-slot="sidebar">${aside}</p>}\n  footer={<footer data-layout-slot="footer"><small>${footer}</small></footer>}\n>\n  ${main}\n</AppShell>`;
      if (framework === 'vue') return `<AppShell main-id="service-workspace" skip-label="${skip}">\n  <template #header><header data-layout-slot="header"><strong>${header}</strong></header></template>\n  <template #sidebar><p data-layout-slot="sidebar">${aside}</p></template>\n  ${main}\n  <template #footer><footer data-layout-slot="footer"><small>${footer}</small></footer></template>\n</AppShell>`;
      return `<hw-app-shell mainId="service-workspace" skipLabel="${skip}">\n  <strong hwShellHeader data-layout-slot="header">${header}</strong>\n  <p hwShellSidebar data-layout-slot="sidebar">${aside}</p>\n  ${main}\n  <small hwShellFooter data-layout-slot="footer">${footer}</small>\n</hw-app-shell>`;
    }
    case 'page-header': {
      const description = t('Track submitted requests and review their status.', 'تابع الطلبات المقدمة وراجع حالتها.');
      const button = t('Request details', 'تفاصيل الطلب');
      const breadcrumb = `<nav aria-label="${t('Breadcrumb', 'مسار التنقل')}" data-layout-slot="breadcrumb"><ol ${classAttr}="hw-breadcrumb"><li>${t('Services', 'الخدمات')}</li><li aria-current="page">${requests}</li></ol></nav>`;
      const details = t('Your latest request is in review.', 'طلبك الأخير قيد المراجعة.');
      if (framework === 'react') return `<PageHeader\n  title="${requests}"\n  description="${description}"\n  breadcrumb={${breadcrumb}}\n  actions={<button type="button" className="hw-button" aria-controls="request-details" aria-expanded={value} onClick={() => setValue(!value)}>${button}</button>}\n/>\n<p id="request-details" data-layout-details hidden={!value}>${details}</p>`;
      if (framework === 'vue') return `<PageHeader title="${requests}" description="${description}">\n  <template #breadcrumb>${breadcrumb}</template>\n  <template #actions><button type="button" class="hw-button" aria-controls="request-details" :aria-expanded="value" @click="value = !value">${button}</button></template>\n</PageHeader>\n<p id="request-details" data-layout-details :hidden="!value">${details}</p>`;
      return `<hw-page-header title="${requests}" description="${description}">\n  ${breadcrumb.replace('<nav ', '<nav hwBreadcrumb ')}\n  <button type="button" class="hw-button" aria-controls="request-details" [attr.aria-expanded]="value" (click)="value = !value">${button}</button>\n</hw-page-header>\n<p id="request-details" data-layout-details [hidden]="!value">${details}</p>`;
    }
  }
}
